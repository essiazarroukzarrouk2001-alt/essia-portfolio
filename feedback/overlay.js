/* Review overlay — injected by feedback/server.py, never by the live site.
 * Click anything on the page, brain-dump what to change, drop inspo images.
 * Everything saves to feedback/data/comments.json for Claude to pick up. */
(function () {
  if (window.__fbOverlay) return;
  window.__fbOverlay = true;

  const API = '/__feedback/api/comments';
  const PAGE = decodeURIComponent(location.pathname) === '/' ? '/index.html' : decodeURIComponent(location.pathname);
  const CATEGORIES = ['Design', 'Content', 'Interface', 'Other'];

  let comments = [];
  let mode = false;          // comment mode on/off
  let hoverEl = null;        // element under the cursor
  let narrowStack = [];      // for ↑/↓ widening the selection
  let composer = null;       // open composer state
  let panelOpen = false;
  let panelScope = 'page';   // 'page' | 'all'
  let showDone = false;

  // ── Shadow root so site CSS can't touch the overlay ─────────────────
  const host = document.createElement('div');
  host.id = 'fb-host';
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483646;';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>
    :host, *{cursor:auto;box-sizing:border-box;margin:0;padding:0}
    :host{all:initial}
    .ui{font:13px/1.45 -apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;color:#eee;-webkit-font-smoothing:antialiased}
    button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
    button *{cursor:pointer}
    textarea,input{font:inherit;color:#fff}
    .bar{position:fixed;right:16px;bottom:16px;display:flex;gap:4px;padding:4px;background:#111;border:1px solid #333;border-radius:999px;pointer-events:auto;box-shadow:0 8px 30px rgba(0,0,0,.5)}
    .bar button{padding:8px 14px;border-radius:999px;font-weight:600;letter-spacing:.01em;white-space:nowrap}
    .bar button:hover{background:#222}
    .bar button.on{background:#C6FF00;color:#000}
    .bar .count{display:inline-block;min-width:18px;padding:0 5px;margin-left:6px;border-radius:9px;background:#C6FF00;color:#000;font-size:11px;line-height:18px;text-align:center}
    .bar button.on .count{background:#000;color:#C6FF00}
    .hint{position:fixed;left:50%;top:14px;transform:translateX(-50%);background:#C6FF00;color:#000;padding:8px 14px;border-radius:999px;font-weight:600;pointer-events:none;box-shadow:0 6px 20px rgba(0,0,0,.4)}
    .hint kbd{font:600 11px ui-monospace,monospace;background:rgba(0,0,0,.12);padding:1px 5px;border-radius:4px}
    .hl{position:fixed;border:2px solid #C6FF00;background:rgba(198,255,0,.08);pointer-events:none;border-radius:3px;transition:all .06s linear}
    .hl span{position:absolute;left:-2px;top:-22px;background:#C6FF00;color:#000;font:600 11px ui-monospace,monospace;padding:2px 6px;border-radius:3px 3px 3px 0;white-space:nowrap;max-width:320px;overflow:hidden;text-overflow:ellipsis}
    .hl.below span{top:auto;bottom:-22px;border-radius:0 3px 3px 3px}
    .pin{position:fixed;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50% 50% 50% 2px;background:#C6FF00;color:#000;font:700 12px/26px -apple-system,Helvetica,sans-serif;text-align:center;pointer-events:auto;box-shadow:0 0 0 2px #000,0 4px 12px rgba(0,0,0,.5);transition:transform .15s}
    .pin:hover{transform:scale(1.15)}
    .pin.done{background:#555;color:#ddd}
    .pin.flash{animation:flash 1s ease 2}
    @keyframes flash{50%{box-shadow:0 0 0 2px #000,0 0 0 10px rgba(198,255,0,.5)}}
    .card{position:fixed;z-index:3;width:360px;max-width:calc(100vw - 32px);background:#111;border:1px solid #333;border-radius:12px;padding:14px;pointer-events:auto;box-shadow:0 18px 50px rgba(0,0,0,.6)}
    .card h4{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#888;margin-bottom:8px;display:flex;justify-content:space-between;gap:8px}
    .card h4 code{font:11px ui-monospace,monospace;color:#C6FF00;text-transform:none;letter-spacing:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    textarea{width:100%;min-height:120px;resize:vertical;background:#000;border:1px solid #333;border-radius:8px;padding:10px;outline:none}
    textarea:focus{border-color:#C6FF00}
    .chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
    .chip{padding:4px 10px;border:1px solid #333;border-radius:999px;font-size:12px;color:#bbb}
    .chip.on{border-color:#C6FF00;color:#000;background:#C6FF00}
    .drop{border:1px dashed #444;border-radius:8px;padding:12px;text-align:center;color:#888;font-size:12px}
    .drop.over{border-color:#C6FF00;color:#C6FF00;background:rgba(198,255,0,.05)}
    .drop u{color:#ccc}
    .thumbs{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
    .thumb{position:relative;width:64px;height:64px;border-radius:6px;overflow:hidden;border:1px solid #333;background:#000}
    .thumb img{width:100%;height:100%;object-fit:cover;display:block}
    .thumb button{position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,.8);color:#fff;font-size:11px;line-height:18px}
    .row{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:12px}
    .row .meta{font-size:11px;color:#666}
    .btn{padding:7px 14px;border-radius:999px;border:1px solid #333;font-weight:600}
    .btn:hover{border-color:#666}
    .btn.primary{background:#C6FF00;color:#000;border-color:#C6FF00}
    .btn.primary:disabled{opacity:.4}
    .panel{position:fixed;z-index:2;right:16px;bottom:72px;width:400px;max-width:calc(100vw - 32px);max-height:calc(100vh - 100px);display:flex;flex-direction:column;background:#111;border:1px solid #333;border-radius:12px;pointer-events:auto;box-shadow:0 18px 50px rgba(0,0,0,.6)}
    .panel header{padding:12px 14px;border-bottom:1px solid #222;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .panel header b{font-size:14px;margin-right:auto}
    .seg{display:flex;border:1px solid #333;border-radius:999px;overflow:hidden}
    .seg button{padding:4px 10px;font-size:12px;color:#aaa}
    .seg button.on{background:#C6FF00;color:#000}
    .toggle{font-size:12px;color:#aaa;display:flex;align-items:center;gap:4px}
    .list{overflow:auto;padding:6px}
    .empty{padding:30px 14px;text-align:center;color:#666}
    .item{padding:10px;border-radius:8px;border:1px solid transparent}
    .item:hover{border-color:#2a2a2a;background:#151515}
    .item .top{display:flex;gap:8px;align-items:baseline;font-size:11px;color:#777}
    .item .num{flex:none;width:22px;height:22px;border-radius:50% 50% 50% 2px;background:#C6FF00;color:#000;font-weight:700;font-size:11px;line-height:22px;text-align:center}
    .item.done .num{background:#555;color:#ddd}
    .item .where{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .item .tag{padding:1px 7px;border:1px solid #333;border-radius:999px;flex:none}
    .item .text{margin:6px 0 0 30px;white-space:pre-wrap;color:#ddd;word-break:break-word}
    .item.done .text{color:#888}
    .item .thumbs{margin-left:30px}
    .item .note{margin:8px 0 0 30px;padding:8px 10px;border-left:2px solid #C6FF00;background:#0b0b0b;color:#bbb;font-size:12px;white-space:pre-wrap}
    .item .note b{color:#C6FF00;font-weight:600}
    .item .acts{display:flex;gap:12px;margin:8px 0 0 30px;font-size:12px;color:#777}
    .item .acts button:hover{color:#fff}
    .lightbox{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;pointer-events:auto}
    .lightbox img{max-width:90vw;max-height:90vh;border-radius:6px}
    .toast{position:fixed;left:50%;bottom:76px;transform:translateX(-50%);background:#C6FF00;color:#000;font-weight:600;padding:8px 14px;border-radius:999px;pointer-events:none}
  </style><div class="ui">
    <div class="layer pins"></div>
    <div class="layer hlw"></div>
    <div class="layer floats"></div>
    <div class="bar">
      <button data-a="mode" title="Click anything to comment on it (C)">＋ Comment</button>
      <button data-a="note" title="A note about the whole page or site — good for inspo dumps (N)">Note / inspo</button>
      <button data-a="panel" title="All comments (L)">List<span class="count">0</span></button>
      <button data-a="hide" title="Hide pins to see the page clean (H)">Hide</button>
    </div>
  </div>`;
  document.documentElement.appendChild(host);

  const $ = (s) => root.querySelector(s);
  const pinsEl = $('.pins'), hlWrap = $('.hlw'), floats = $('.floats'), bar = $('.bar');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // The site hides the native cursor; give a crosshair back while picking.
  const pageStyle = document.createElement('style');
  pageStyle.textContent = `
    html.fb-mode, html.fb-mode *{cursor:crosshair!important}
    html.fb-mode #cursor{display:none!important}`;
  document.head.appendChild(pageStyle);

  // ── API ────────────────────────────────────────────────────────────
  async function api(method, url, body) {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  async function refresh() {
    try { comments = (await api('GET', API)).comments || []; } catch (e) { toast('Can’t reach the review server'); }
    renderPins(); renderPanel(); renderCount();
  }

  // ── Element description ────────────────────────────────────────────
  function selectorFor(el) {
    if (!(el instanceof Element)) return '';
    const parts = [];
    while (el && el.nodeType === 1 && el !== document.documentElement) {
      if (el.id && document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) {
        parts.unshift('#' + CSS.escape(el.id));
        break;
      }
      let part = el.tagName.toLowerCase();
      const parent = el.parentElement;
      if (parent) {
        const same = [...parent.children].filter((c) => c.tagName === el.tagName);
        if (same.length > 1) part += `:nth-of-type(${same.indexOf(el) + 1})`;
      }
      parts.unshift(part);
      el = parent;
    }
    return parts.join(' > ');
  }
  function labelFor(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    const cls = [...el.classList].filter((c) => !c.startsWith('fb-')).slice(0, 2);
    if (cls.length) s += '.' + cls.join('.');
    const t = (el.innerText || el.alt || '').trim().replace(/\s+/g, ' ');
    if (t) s += ` “${t.slice(0, 40)}${t.length > 40 ? '…' : ''}”`;
    else if (el.tagName === 'IMG') s += ' ' + (el.getAttribute('src') || '').split('/').pop();
    return s;
  }
  function describe(el, clientX, clientY) {
    const r = el.getBoundingClientRect();
    const html = el.outerHTML.replace(/\s+/g, ' ');
    return {
      selector: selectorFor(el),
      label: labelFor(el),
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || el.alt || '').trim().replace(/\s+/g, ' ').slice(0, 400),
      html: html.length > 800 ? html.slice(0, 800) + '…' : html,
      src: el.currentSrc || el.getAttribute('src') || undefined,
      offset: { x: r.width ? (clientX - r.left) / r.width : 0, y: r.height ? (clientY - r.top) / r.height : 0 },
      pagePoint: { x: clientX + scrollX, y: clientY + scrollY },
      rect: { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      viewport: { w: innerWidth, h: innerHeight },
    };
  }
  function pinPoint(t) {
    let el = null;
    try { el = t.selector && document.querySelector(t.selector); } catch (e) {}
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.width || r.height) return { x: r.left + t.offset.x * r.width, y: r.top + t.offset.y * r.height, el };
    }
    return { x: t.pagePoint.x - scrollX, y: t.pagePoint.y - scrollY, el: null };
  }

  // ── Comment mode ───────────────────────────────────────────────────
  const hint = document.createElement('div');
  function setMode(on) {
    mode = on;
    document.documentElement.classList.toggle('fb-mode', on);
    bar.querySelector('[data-a=mode]').classList.toggle('on', on);
    if (on) {
      hint.className = 'hint';
      hint.innerHTML = 'Click anything to comment · <kbd>↑</kbd> select bigger area · <kbd>↓</kbd> smaller · <kbd>Esc</kbd> exit';
      floats.appendChild(hint);
    } else {
      hint.remove();
      hoverEl = null; narrowStack = [];
      hlWrap.innerHTML = '';
    }
  }
  function isOurs(e) { return e.composedPath().includes(host); }
  function drawHighlight() {
    hlWrap.innerHTML = '';
    if (!mode || !hoverEl || composer) return;
    const r = hoverEl.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = 'hl' + (r.top < 26 ? ' below' : '');
    Object.assign(d.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    d.innerHTML = `<span>${esc(labelFor(hoverEl))}</span>`;
    hlWrap.appendChild(d);
  }
  document.addEventListener('mousemove', (e) => {
    if (!mode || composer || isOurs(e)) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === host) return;
    if (narrowStack.length && hoverEl && hoverEl.contains(el)) return; // keep widened selection while inside it
    narrowStack = [];
    hoverEl = el;
    drawHighlight();
  }, true);
  for (const type of ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'dblclick', 'contextmenu']) {
    window.addEventListener(type, (e) => {
      if (!mode || isOurs(e)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (type === 'click' && !composer) {
        const el = hoverEl && hoverEl.contains(e.target) ? hoverEl : e.target;
        openComposer({ target: describe(el, e.clientX, e.clientY), x: e.clientX, y: e.clientY });
      }
    }, true);
  }

  // ── Composer (new + edit) ──────────────────────────────────────────
  function openComposer({ target = null, existing = null, x, y }) {
    closeComposer();
    hlWrap.innerHTML = '';
    const state = composer = {
      existing, target: existing ? existing.target : target,
      category: existing ? existing.category : '',
      images: [],            // new: {name, dataUrl}
      keep: existing ? [...existing.images] : [],
      el: document.createElement('div'),
    };
    const card = state.el;
    card.className = 'card';
    const where = state.target ? state.target.label : (existing ? existing.page : PAGE) + ' — whole page';
    card.innerHTML = `
      <h4><span>${existing ? 'Edit #' + existing.n : state.target ? 'Comment on' : 'Page note / inspo'}</span><code title="${esc(where)}">${esc(where)}</code></h4>
      <textarea placeholder="Brain-dump it — messy is totally fine.\nWhat bugs you, what you want instead, vibes, half-thoughts, ‘like X but more Y’…"></textarea>
      <div class="chips">${CATEGORIES.map((c) => `<button class="chip${c === state.category ? ' on' : ''}" data-c="${c}">${c}</button>`).join('')}</div>
      <div class="drop">Drop, paste (⌘V) or <u>browse</u> inspo images</div>
      <input type="file" accept="image/*" multiple hidden>
      <div class="thumbs"></div>
      <div class="row"><span class="meta">⌘↵ save · Esc cancel</span><span><button class="btn" data-a="cancel">Cancel</button> <button class="btn primary" data-a="save">Save</button></span></div>`;
    floats.appendChild(card);

    const ta = card.querySelector('textarea');
    ta.value = existing ? existing.text : '';
    const thumbs = card.querySelector('.thumbs');
    const drop = card.querySelector('.drop');
    const file = card.querySelector('input[type=file]');
    const saveBtn = card.querySelector('[data-a=save]');

    function renderThumbs() {
      thumbs.innerHTML = '';
      state.keep.forEach((src, i) => thumbs.appendChild(thumb(src, () => { state.keep.splice(i, 1); renderThumbs(); })));
      state.images.forEach((img, i) => thumbs.appendChild(thumb(img.dataUrl, () => { state.images.splice(i, 1); renderThumbs(); })));
      saveBtn.disabled = !ta.value.trim() && !state.images.length && !state.keep.length;
    }
    function thumb(src, onRemove) {
      const t = document.createElement('div');
      t.className = 'thumb';
      t.innerHTML = `<img src="${esc(src)}"><button title="Remove">✕</button>`;
      t.querySelector('button').onclick = onRemove;
      return t;
    }
    function addFiles(files) {
      [...files].filter((f) => f.type.startsWith('image/')).forEach((f) => {
        const reader = new FileReader();
        reader.onload = () => { state.images.push({ name: f.name, dataUrl: reader.result }); renderThumbs(); };
        reader.readAsDataURL(f);
      });
    }
    card.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip) {
        state.category = state.category === chip.dataset.c ? '' : chip.dataset.c;
        card.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c.dataset.c === state.category));
      }
      if (e.target.closest('.drop')) file.click();
      if (e.target.closest('[data-a=cancel]')) closeComposer();
      if (e.target.closest('[data-a=save]')) submit();
    });
    file.onchange = () => { addFiles(file.files); file.value = ''; };
    drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('over'); };
    drop.ondragleave = () => drop.classList.remove('over');
    card.ondragover = (e) => e.preventDefault();
    card.ondrop = (e) => { e.preventDefault(); drop.classList.remove('over'); addFiles(e.dataTransfer.files); };
    card.addEventListener('paste', (e) => {
      const files = [...e.clipboardData.items].filter((i) => i.kind === 'file').map((i) => i.getAsFile());
      if (files.length) { e.preventDefault(); addFiles(files); }
    });
    ta.addEventListener('input', renderThumbs);
    ta.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
      if (e.key === 'Escape') closeComposer();
    });

    async function submit() {
      if (saveBtn.disabled) return;
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';
      try {
        if (existing) {
          await api('PUT', `${API}/${existing.id}`, {
            text: ta.value.trim(), category: state.category, images: state.images,
            removeImages: existing.images.filter((s) => !state.keep.includes(s)),
          });
        } else {
          await api('POST', API, { page: PAGE, text: ta.value.trim(), category: state.category, target: state.target, images: state.images });
        }
        closeComposer();
        toast(existing ? 'Updated' : 'Saved — Claude will pick it up');
        await refresh();
      } catch (err) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
        toast('Save failed — is the review server running?');
      }
    }

    // Place near the click, kept on screen
    const w = Math.min(360, innerWidth - 32), h = 360;
    const px = x == null ? (innerWidth - w) / 2 : Math.min(Math.max(16, x + 16), innerWidth - w - 16);
    const py = y == null ? Math.max(16, (innerHeight - h) / 2) : Math.min(Math.max(16, y - 20), innerHeight - h - 16);
    Object.assign(card.style, { left: px + 'px', top: Math.max(16, py) + 'px' });
    renderThumbs();
    setTimeout(() => ta.focus(), 0);
  }
  function closeComposer() {
    if (composer) composer.el.remove();
    composer = null;
    drawHighlight();
  }

  // ── Pins ───────────────────────────────────────────────────────────
  let hidden = false;
  function visibleHere() { return comments.filter((c) => c.page === PAGE && c.target && (showDone || c.status !== 'done')); }
  function renderPins() {
    pinsEl.innerHTML = '';
    if (hidden) return;
    for (const c of visibleHere()) {
      const p = document.createElement('button');
      p.className = 'pin' + (c.status === 'done' ? ' done' : '');
      p.dataset.id = c.id;
      p.textContent = c.n;
      p.title = c.text.slice(0, 140);
      p.onclick = () => { panelOpen = true; renderPanel(); focusItem(c.id); };
      pinsEl.appendChild(p);
    }
    positionPins();
  }
  function positionPins() {
    for (const p of pinsEl.children) {
      const c = comments.find((x) => x.id === p.dataset.id);
      if (!c) continue;
      const pt = pinPoint(c.target);
      p.style.left = pt.x + 'px';
      p.style.top = pt.y + 'px';
    }
    if (mode && hoverEl && !composer) drawHighlight();
  }
  let raf = 0;
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; positionPins(); }); };
  addEventListener('scroll', schedule, true);
  addEventListener('resize', schedule);
  setInterval(positionPins, 400); // catches reveal animations / layout shifts

  // ── Panel ──────────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.className = 'panel';
  function renderCount() {
    const open = comments.filter((c) => c.status !== 'done');
    const here = open.filter((c) => c.page === PAGE).length;
    bar.querySelector('.count').textContent = here === open.length ? here : `${here}/${open.length}`;
    bar.querySelector('.count').title = `${here} open on this page, ${open.length} open overall`;
  }
  function renderPanel() {
    bar.querySelector('[data-a=panel]').classList.toggle('on', panelOpen);
    if (!panelOpen) { panel.remove(); return; }
    let list = comments.filter((c) => (panelScope === 'all' || c.page === PAGE) && (showDone || c.status !== 'done'));
    list = list.slice().sort((a, b) => (a.status === 'done') - (b.status === 'done') || b.n - a.n);
    panel.innerHTML = `
      <header><b>Feedback</b>
        <div class="seg"><button data-s="page" class="${panelScope === 'page' ? 'on' : ''}">This page</button><button data-s="all" class="${panelScope === 'all' ? 'on' : ''}">All pages</button></div>
        <label class="toggle"><input type="checkbox" ${showDone ? 'checked' : ''}> show done</label>
      </header>
      <div class="list">${list.length ? list.map(itemHTML).join('') : '<div class="empty">Nothing yet. Hit <b>＋ Comment</b> and click anything on the page.</div>'}</div>`;
    if (!panel.isConnected) floats.appendChild(panel);
  }
  function itemHTML(c) {
    const where = c.target ? c.target.label : 'Whole page';
    return `<div class="item${c.status === 'done' ? ' done' : ''}" data-id="${c.id}">
      <div class="top"><span class="num">${c.n}</span>${panelScope === 'all' ? `<span>${esc(c.page.replace(/^\//, ''))}</span>·` : ''}<span class="where" title="${esc(where)}">${esc(where)}</span>${c.category ? `<span class="tag">${esc(c.category)}</span>` : ''}</div>
      ${c.text ? `<div class="text">${esc(c.text)}</div>` : ''}
      ${c.images.length ? `<div class="thumbs">${c.images.map((s) => `<div class="thumb"><img src="${esc(s)}" data-zoom></div>`).join('')}</div>` : ''}
      ${c.claudeNote ? `<div class="note"><b>Claude:</b> ${esc(c.claudeNote)}</div>` : ''}
      <div class="acts">
        ${c.target || c.page !== PAGE ? '<button data-a="go">Show me</button>' : ''}
        <button data-a="edit">Edit</button>
        <button data-a="status">${c.status === 'done' ? 'Reopen' : 'Mark done'}</button>
        <button data-a="del">Delete</button>
      </div></div>`;
  }
  panel.addEventListener('click', async (e) => {
    const seg = e.target.closest('[data-s]');
    if (seg) { panelScope = seg.dataset.s; return renderPanel(); }
    if (e.target.matches('input[type=checkbox]')) { showDone = e.target.checked; renderPanel(); renderPins(); return; }
    const zoom = e.target.closest('[data-zoom]');
    if (zoom) return lightbox(zoom.src);
    const act = e.target.closest('[data-a]');
    const item = e.target.closest('.item');
    if (!act || !item) return;
    const c = comments.find((x) => x.id === item.dataset.id);
    if (act.dataset.a === 'go') goTo(c);
    if (act.dataset.a === 'edit') openComposer({ existing: c });
    if (act.dataset.a === 'status') { await api('PUT', `${API}/${c.id}`, { status: c.status === 'done' ? 'open' : 'done' }); refresh(); }
    if (act.dataset.a === 'del' && confirm(`Delete comment #${c.n}?`)) { await api('DELETE', `${API}/${c.id}`); refresh(); }
  });
  function focusItem(id) {
    const el = panel.querySelector(`.item[data-id="${id}"]`);
    if (el) { el.scrollIntoView({ block: 'nearest' }); el.style.borderColor = '#C6FF00'; setTimeout(() => (el.style.borderColor = ''), 1500); }
  }
  function goTo(c) {
    if (c.page !== PAGE) {
      sessionStorage.setItem('fb-focus', c.id);
      location.href = c.page.split('/').map(encodeURIComponent).join('/');
      return;
    }
    if (!c.target) return;
    const pt = pinPoint(c.target);
    if (pt.el) pt.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else scrollTo({ top: c.target.pagePoint.y - innerHeight / 2, behavior: 'smooth' });
    setTimeout(() => {
      const pin = pinsEl.querySelector(`[data-id="${c.id}"]`);
      if (pin) { pin.classList.remove('flash'); void pin.offsetWidth; pin.classList.add('flash'); }
    }, 500);
  }
  function lightbox(src) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `<img src="${esc(src)}">`;
    lb.onclick = () => lb.remove();
    floats.appendChild(lb);
  }
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    floats.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  // ── Toolbar + keys ─────────────────────────────────────────────────
  bar.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]');
    if (!a) return;
    if (a.dataset.a === 'mode') setMode(!mode);
    if (a.dataset.a === 'note') { setMode(false); openComposer({}); }
    if (a.dataset.a === 'panel') { panelOpen = !panelOpen; renderPanel(); }
    if (a.dataset.a === 'hide') { hidden = !hidden; a.classList.toggle('on', hidden); a.textContent = hidden ? 'Show' : 'Hide'; renderPins(); }
  });
  document.addEventListener('keydown', (e) => {
    const typing = isOurs(e) || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'escape') { if (composer) closeComposer(); else if (mode) setMode(false); else if (panelOpen) { panelOpen = false; renderPanel(); } }
    else if (k === 'c') setMode(!mode);
    else if (k === 'n') { setMode(false); openComposer({}); }
    else if (k === 'l') { panelOpen = !panelOpen; renderPanel(); }
    else if (k === 'h') bar.querySelector('[data-a=hide]').click();
    else if (mode && hoverEl && e.key === 'ArrowUp' && hoverEl.parentElement && hoverEl.parentElement !== document.documentElement) {
      e.preventDefault(); narrowStack.push(hoverEl); hoverEl = hoverEl.parentElement; drawHighlight();
    } else if (mode && e.key === 'ArrowDown' && narrowStack.length) {
      e.preventDefault(); hoverEl = narrowStack.pop(); drawHighlight();
    }
  }, true);

  refresh().then(() => {
    const focus = sessionStorage.getItem('fb-focus');
    if (focus) {
      sessionStorage.removeItem('fb-focus');
      const c = comments.find((x) => x.id === focus);
      if (c) setTimeout(() => goTo(c), 800);
    }
  });
  // Pick up Claude's notes / status changes without a reload
  setInterval(() => { if (!composer && document.visibilityState === 'visible') refresh(); }, 15000);
})();
