---
name: apply-feedback
description: Read Essia's on-page review comments and inspo images from feedback/data/comments.json, interpret her brain dumps into concrete design/content/interface changes, apply them to the site, and push to GitHub. Use when she says "apply feedback", "go through my comments", "I left notes", "do my changes", or similar.
---

# Apply review feedback

Essia reviews the site in review mode (`python3 feedback/server.py` → http://localhost:4321), clicks elements, and brain-dumps what she wants. Your job is to turn that into finished changes on the site, then push.

## 1. Read everything first

- `feedback/data/comments.json` — work only on comments with `"status": "open"`.
- Each comment has:
  - `page` — which HTML file (e.g. `/Portfolio Detail.html`).
  - `target` — what she clicked: `selector`, `label`, `text`, an `html` snippet, `src` for images, and `rect` (where it sat on the page at her viewport size). `null` means it's a page-wide or site-wide note.
  - `text` — the brain dump. `category` (Design / Content / Interface / Other) is a hint, often blank.
  - `images` — inspo uploads under `feedback/data/inspo/`. **Open every one with the Read tool and actually look at it** before deciding anything.
- Read all open comments before touching code. Later comments often refine, contradict, or explain earlier ones, and several comments may be about the same thing.
- Find the element in source by its `text`/`html` snippet first (selectors are generated from the live DOM and can shift). Check `design/Brand Guideline.md` before any visual change.

## 2. Interpret generously — she brain-dumps

She writes fast and messy on purpose. Do not ask her to clarify things you can reasonably infer. Read for the intent behind the words:

- **Translate feelings into specifics.** "feels cramped" → more padding/line-height/whitespace around that block. "too corporate" → warmer, more personal copy and less rigid structure. "doesn't pop" → contrast, scale, or the acid-green accent, used per the brand guide. "too much" → cut copy, remove a decoration, or simplify. "make it flow" → better transitions, spacing rhythm, or reordering.
- **Typos, shorthand, voice-to-text noise, run-ons are normal.** Read past them. "hte heor txt shud b biger n less wrds" = make the hero text bigger and shorter.
- **"Like this" + an image** means: take the *specific quality* that image has (layout, density, type scale, colour use, motion, tone) and apply it in this site's Terminal Strike system. Don't copy the image wholesale or break the brand unless she explicitly says to change the brand. In your note, name what you took from it ("took the oversized numbered section labels from your inspo").
- **Half-thoughts and "idk maybe…"** are still requests. Make a tasteful call and say what you chose.
- **Content comments:** rewrite in her voice — confident, plain, specific, a bit warm; no buzzword soup. When she says "say something like…", treat her words as a draft to polish, not final copy, unless she says "exactly" or uses quotes.
- **Scope:** a comment on one element that describes a pattern ("all the buttons feel weak") applies everywhere that pattern appears, across pages. A site-wide note (`target: null`) applies site-wide.
- **Fix the cause, not the pixel.** If she clicks one card and says the spacing is off, it's probably the shared card style.
- **Only stop and ask** when two readings would lead to very different, hard-to-undo outcomes (e.g. deleting a whole section or project, changing the brand colour, rewriting the bio's facts). Do everything else and ask about just that one.

## 3. Make the changes

- The live files are the compiled `.html` files in the repo root. If a `design/*.dc.html` source or `design/content.js` holds the same content, update it too so they don't drift.
- Keep the brand rules (fonts, colours, motion timings, no bounce) unless the feedback explicitly overrides them.
- Group related comments into one coherent change rather than patching each one separately.
- Check the result in the browser pane via the `review` launch config (http://localhost:4321) — at desktop width and at phone width (375px) — before pushing.

## 4. Report back on each comment

For every comment you handled, update `feedback/data/comments.json`: set `"status": "done"` and write `"claudeNote"` — one or two plain sentences saying how you read it and what you changed ("Read this as 'too dense' — bumped the line-height and cut the paragraph to two sentences."). She sees these notes in the overlay's List panel, so this is how she checks your interpretation. For anything you skipped or need her call on, leave it `open` and explain why in `claudeNote`.

Edit the JSON with a small Python script (load → modify → dump with `indent=2, ensure_ascii=False`) rather than hand-editing.

## 5. Push to GitHub

The repo's history uses a branch + PR per change set (`origin` = essiazarroukzarrouk2001-alt/essia-portfolio).

1. `git checkout -b feedback/<short-topic>` from an up-to-date `main`.
2. Commit only site files. `feedback/data/` is gitignored and must never be committed.
3. Push and open a PR with `gh pr create`. In the body, list each comment number → what changed.
4. Don't merge unless she tells you to. If she says "just push it live" / "merge it", merge the PR.
