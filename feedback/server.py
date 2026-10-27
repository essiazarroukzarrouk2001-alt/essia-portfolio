#!/usr/bin/env python3
"""Local review server for the portfolio.

Serves the site exactly as it is, but injects a click-to-comment overlay into
every HTML page. Comments and inspiration images are saved to feedback/data/
so Claude can read them and apply the changes.

    python3 feedback/server.py            # http://localhost:4321
    python3 feedback/server.py --port 8080

Only stdlib is used, so there is nothing to install.
"""
import argparse
import base64
import json
import os
import re
import threading
import time
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "feedback", "data")
INSPO_DIR = os.path.join(DATA_DIR, "inspo")
COMMENTS_FILE = os.path.join(DATA_DIR, "comments.json")
API = "/__feedback/api/comments"
SNIPPET = b'<script src="/feedback/overlay.js" defer></script>'
EXTENSIONS = {
    "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif",
    "image/webp": "webp", "image/svg+xml": "svg", "image/avif": "avif",
    "image/heic": "heic",
}

lock = threading.Lock()


def load():
    if not os.path.exists(COMMENTS_FILE):
        return {"comments": []}
    with open(COMMENTS_FILE, encoding="utf-8") as f:
        return json.load(f)


def save(db):
    os.makedirs(DATA_DIR, exist_ok=True)
    tmp = COMMENTS_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    os.replace(tmp, COMMENTS_FILE)


def store_images(comment_id, images):
    """Write data-URL images to disk and return their site paths."""
    os.makedirs(INSPO_DIR, exist_ok=True)
    paths = []
    for img in images or []:
        m = re.match(r"data:([\w/+.-]+);base64,(.*)", img.get("dataUrl", ""), re.S)
        if not m:
            continue
        ext = EXTENSIONS.get(m.group(1), "bin")
        stem = re.sub(r"[^\w-]+", "-", os.path.splitext(img.get("name") or "image")[0]).strip("-")[:40] or "image"
        name = f"{comment_id}-{uuid.uuid4().hex[:6]}-{stem}.{ext}"
        with open(os.path.join(INSPO_DIR, name), "wb") as f:
            f.write(base64.b64decode(m.group(2)))
        paths.append(f"/feedback/data/inspo/{name}")
    return paths


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        if "/__feedback/" in str(args[0] if args else ""):
            super().log_message(fmt, *args)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # ── helpers ────────────────────────────────────────────
    def send_json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(length) or b"{}")

    def comment_id(self):
        path = urlparse(self.path).path
        return path[len(API) + 1:] if path.startswith(API + "/") else None

    # ── routes ─────────────────────────────────────────────
    def do_GET(self):
        path = urlparse(self.path).path
        if path == API:
            with lock:
                return self.send_json(load())
        fs_path = self.translate_path(self.path)
        if os.path.isdir(fs_path):
            fs_path = os.path.join(fs_path, "index.html")
        if fs_path.endswith(".html") and os.path.isfile(fs_path):
            return self.serve_html(fs_path)
        return super().do_GET()

    def serve_html(self, fs_path):
        with open(fs_path, "rb") as f:
            html = f.read()
        idx = html.lower().rfind(b"</body>")
        html = html[:idx] + SNIPPET + html[idx:] if idx != -1 else html + SNIPPET
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(html)))
        self.end_headers()
        self.wfile.write(html)

    def do_POST(self):
        if urlparse(self.path).path != API:
            return self.send_json({"error": "not found"}, 404)
        data = self.read_json()
        with lock:
            db = load()
            cid = uuid.uuid4().hex[:8]
            now = time.strftime("%Y-%m-%dT%H:%M:%S")
            comment = {
                "id": cid,
                "n": max([c.get("n", 0) for c in db["comments"]] + [0]) + 1,
                "status": "open",
                "createdAt": now,
                "updatedAt": now,
                "page": data.get("page", "/"),
                "category": data.get("category", ""),
                "text": data.get("text", ""),
                "target": data.get("target"),
                "images": store_images(cid, data.get("images")),
                "claudeNote": "",
            }
            db["comments"].append(comment)
            save(db)
        self.send_json(comment, 201)

    def do_PUT(self):
        cid = self.comment_id()
        data = self.read_json()
        with lock:
            db = load()
            comment = next((c for c in db["comments"] if c["id"] == cid), None)
            if not comment:
                return self.send_json({"error": "not found"}, 404)
            for key in ("text", "category", "status"):
                if key in data:
                    comment[key] = data[key]
            for gone in data.get("removeImages", []):
                if gone in comment["images"]:
                    comment["images"].remove(gone)
                    try:
                        os.remove(os.path.join(ROOT, unquote(gone).lstrip("/")))
                    except OSError:
                        pass
            comment["images"] += store_images(cid, data.get("images"))
            comment["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%S")
            save(db)
        self.send_json(comment)

    def do_DELETE(self):
        cid = self.comment_id()
        with lock:
            db = load()
            comment = next((c for c in db["comments"] if c["id"] == cid), None)
            if not comment:
                return self.send_json({"error": "not found"}, 404)
            for img in comment["images"]:
                try:
                    os.remove(os.path.join(ROOT, unquote(img).lstrip("/")))
                except OSError:
                    pass
            db["comments"].remove(comment)
            save(db)
        self.send_json({"ok": True})


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 4321)))
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"Review mode running → http://localhost:{args.port}")
    print(f"Comments save to {os.path.relpath(COMMENTS_FILE, ROOT)}")
    server.serve_forever()
