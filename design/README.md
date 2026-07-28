# Handoff: Essia Zarrouk Portfolio Website

## Overview
A personal marketing/branding portfolio site — "Terminal Strike" visual system: utilitarian, grid-led, monochrome with a single acid-green accent. Four main pages: Home (Profile/Portfolio/Contact), Portfolio Detail (project index with skill+tool filtering), Personal Page (hobbies/values/projects), and About Me (origin story + timelines). A standalone Resume page also exists.

## About the Design Files
The files in this bundle are **design references built in HTML** (Claude "Design Component" prototypes) — they show the intended look, content, and interaction behavior. They are NOT production code to ship as-is. Your task is to **recreate these HTML designs in the target codebase's environment** (React, Vue, plain static site, etc.) using that codebase's own conventions and libraries. If no environment exists yet, pick the simplest appropriate stack (a static site is sufficient — there is no backend/data layer, all content is hardcoded).

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and motion timings are final — reproduce pixel-accurately. Do not restyle; the brand guideline below is authoritative.

## Files in this bundle
- `index.html` — Home page (Hero, Profile, Portfolio/skills teaser, Contact). Self-contained static HTML/CSS/JS, no build step.
- `Portfolio Detail.html` — Full project index: skill + tool dual filter bar, expandable project cards, OQ parent/child accordion pattern. Compiled from `Portfolio Detail Wireframe.dc.html` + `content.js`.
- `Personal Page.html` — Hobbies (drifting-text words + polaroid popups), Values (orbit + popups), Personal projects (filmstrip). Compiled from `Personal Page Wireframe.dc.html`.
- `About Me.html` — Origin story (scroll-driven narrative) + educational/professional timelines. Compiled from `About Me.dc.html`.
- `Essia Zarrouk Resume.html` — Standalone one-page resume, same visual system.
- `content.js` — single source of truth for all portfolio project data (title, client, year, skill tags, tool tags, description, cover images). Loaded by Portfolio Detail.
- `Brand Guideline.md` — full design system spec (also summarized below).
- `*.dc.html` files — the original editable source templates (template + logic class) the compiled `.html` files were generated from. Reference these for exact render logic (state, filtering, animation triggers) when reimplementing interactions.

## Screens / Views

### 1. Home (index.html)
- **Hero**: full-bleed, giant headline (clamp 44-90px), tagline "Brand and campaigns marketer who keeps creative and commercial speaking the same language.", hero image slot (bottom half), fades in on load.
- **Profile section**: 3-column grid (150px label gutter / 1fr bio / 300px portrait), bio paragraph, portrait image.
- **Portfolio teaser section**: skill list as clickable rows (150px gutter aside + list), each row links to `Portfolio Detail.html?skill=<name>` to open pre-filtered. Skills: Brand Strategy, Social Media, Content & Copy, Art Direction, Account Management, Performance & Data, Brand & Communications, Media Production, Product Management, Research & Insight, Team Management, Email Marketing.
- **Personal section**: teaser linking to Personal Page.html.
- **Contact section**: dark panel (#111 bg), large heading, contact channels list (email/phone/LinkedIn/Instagram).
- Nav: fixed top, links to Profile/Portfolio (in-page anchors) + Personal Page.html (separate file) + Contact anchor.

### 2. Portfolio Detail
- Dual filter bar: **Skill** row (pill buttons, single-select, shows count) + **Tool** row (pill buttons, multi-select, AND logic with skill filter).
- Project cards: click to expand — shows sections parsed from description (Challenge / Approach / Framework / Result as clickable/expandable sub-headers), skill tag pills (primary) + tool pills (secondary, smaller/outline), optional cover image (fades/scales in on expand).
- Special "OQ" project: one parent card containing 3 nested sub-project accordion children (Polymer Complex, Duqm Refinery, Salalah LPG & Ammonia) — parent carries shared context/skills/tools, children carry their own short Approach/Result. Filtering by any parent tag surfaces the whole OQ card.
- URL param `?skill=Brand+Strategy` (or any skill name, URL-encoded) auto-applies that skill filter on load — this is how Home's skill rows deep-link in.
- Lightbox: click an image thumbnail to view full-size with caption, thumbnail strip to switch images.

### 3. Personal Page
- Toolbar: category tabs (Hobbies / Values / Personal projects).
- **Hobbies**: several words drift slowly and randomly within the frame bounds (CSS translate keyframes per word, capped range, never leaving viewport) — no orbit circle. Click a word to open a polaroid-style modal popup with title, full description text, thumbnail strip if multiple images, click outside to close.
- **Values**: similar popup pattern for value words with descriptions (e.g. Accountability: "If I said I'd handle it, consider it handled — and if it goes sideways, you'll hear it from me first.").
- **Personal projects**: horizontal filmstrip — click a card to expand it (scales up, border turns lime accent, description reveals), others shrink/dim. Currently: Shabab, Casa Swana.

### 4. About Me
- **Origin Story**: scroll-driven narrative in 6 beats down a vertical "water channel" spine line that fills as you scroll (metaphor: Al Jabal Al Akhdar aflaj irrigation channels). Each beat: teaser line always visible + "read more" expand/collapse for full text. Hero opens full-bleed with mountain name + first teaser; closing beat loops back to water/growth motif.
- **Educational and professional timelines**: built from resume data, vertical timeline layout.
- Linked from Home page's Personal/About teaser CTA ("Go to profile").

## Interactions & Behavior (site-wide)
- Scroll reveals: elements fade up from ~12-20px below plus opacity 0 to 1, staggered ~80-120ms apart per group, 0.5-0.8s ease (no bounce or spring).
- Custom cursor: small acid-green accent circle/dot follows mouse with slight lag; grows or changes on hover over links, buttons, project rows, skill/tool chips.
- Hover states: list rows (skills, tools) fill accent background plus black text on hover/active; arrows slide right on hover.
- Card/image hover: subtle scale-up (1.03-1.05x) with 0.25-0.3s cubic-bezier ease.
- Expand/collapse: project detail panels, hobby/value popups, accordion children — 0.35-0.6s ease, height/opacity/transform combined, never instant.
- Page-load intro: nav and hero content fade in sequentially (not simultaneously); wordmark/headline can clip-reveal from a masked line.
- All easing: 0.6-0.8s, ease-out feel, deliberate — explicitly NO spring physics, NO bounce.

## State Management
- Portfolio Detail: active skill filter (default "All"), active tools array (multi-select), which project card is expanded (or none), which image is in the lightbox (or none). A URL query param seeds the active skill filter on page load.
- Personal Page: active tab (Hobbies/Values/Personal projects), which popup is open, active image index in popup, which filmstrip card is expanded.
- No backend — all content is static, defined in content.js (portfolio) or inline in each page's script (bios, hobbies, values, timeline data).

## Design Tokens (full detail in Brand Guideline.md)
**Colors**
- Ink (page background): #000000
- Panel (card background): #111111
- Surface (inset/image slots): #1A1A1A
- Hairline (borders): #333333
- White (primary text): #FFFFFF
- Mute (body text): #CCCCCC
- Grey (metadata): #777777
- Strike accent (use sparingly, about 1 per viewport): #C6FF00

**Typography**
- Display/body font: Helvetica Neue
- Labels/data font: monospace (SF Mono / ui-monospace)
- Display: 64-104px, weight 700, tracking -0.04em
- Section heading: 36px, weight 700, tracking -0.02em
- Body: 15-16px, weight 400, line-height 1.8, measure 430-560px
- Mono label: 11-13px, weight 400, tracking 0.12em, uppercase, often bracketed (e.g. "[ Label ] . Metadata . 01 / 12")

**Layout**
- Frame padding: 24-28px
- Label gutter: 150px (used as first grid column throughout)
- Section rhythm: 48px spacing, separated by 1px hairlines
- Border: 1px hairline color, square corners (0 border-radius) everywhere
- Faint modular grid overlay (~90px columns) visible behind content on most sections

**Components**
- Primary button: solid accent fill, black text, mono uppercase (e.g. "Enter profile")
- Ghost button: 1px white border, white text
- Tabs: active = accent fill plus black text plus bold; default = 1px hairline border plus grey text
- List rows: hover/active = accent fill plus black text, arrow slides right; inactive = grey text on hairline
- Image slots: surface fill, 1px hairline border, square corners

## Assets
- Site currently uses placeholder image slots in most locations (marked with a drop-image hint per brand guideline) — the user has been dropping in personal photos directly (a hero image, a portrait, one project cover) but most slots are still empty pending real photography.
- No icon set or illustration assets — the design is intentionally text/grid-led with zero decorative graphics or emoji.

## Voice & Tone
Plain, confident, technical — state what was done and what it changed, no fluff or buzzwords. Signature line used sitewide: "not new here, but always improving."

---
Questions about specific pixel values or copy not covered above: read the corresponding .dc.html source file directly — the JS logic class shows exact computed styles and the template shows exact copy.
