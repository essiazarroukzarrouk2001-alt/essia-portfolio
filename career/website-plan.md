# Website plan: present Essia as a Product Manager

## The problem today
The site describes you three different ways, and none of them leads with Product:
- Hero tagline: *"Brand and campaigns marketer who keeps creative and commercial speaking the same language."*
- Page title and footer: **Sales & Marketing**
- `content.js` role: **Product, Marketing & Brand Manager**
- Resume PDF: **Marketing, Brand & Account/Project Manager**, "three years" (the site says four), and a portfolio link to *essiazarrouk.com*, which isn't your domain.

Navigation is organised by **12 skills**. That reads as "generalist who does lots of things", while a hiring manager for a PM role skims for *products shipped, decisions made, outcomes*. Your strongest PM work (Veil, the Carve launch system, the search/analytics audit) sits in the list next to the email newsletters.

## Positioning
> **Product manager for physical and digital products: I take them from roadmap to launch.**
> Agency-trained in brand and go-to-market, so the launch is part of the product, not a hand-off.

The range (brand, accounts, content) stays, but as **the reason you're a better PM**, not as separate careers.

Use the same headline on the site, CV, LinkedIn and cover letters. Recruiters cross-check them.

## New structure

### Home
1. **Hero:** "I take products from roadmap to launch." Sub: "Product Manager at NOWN: physical products, their software, and the go-to-market. Amsterdam · EN / AR / FR." Two buttons: *See the work* · *Download CV*.
2. **Proof bar** (mono, Terminal Strike style): `2 products owned end to end` · `+15% quote requests` · `≈$7k wasted spend found & stopped` · `83k monthly searches instrumented` · `4 yrs · agency + in-house`.
3. **Three flagship case studies** as large cards:
   - **Veil**: a physical product and its configurator, shipped together
   - **ASOFT Carve**: building a launch operating system (PRD → RICE → Stage-Gate → AARRR)
   - **Search & analytics audit**: finding what nobody was measuring
4. **"The range behind it"**: 4 lenses instead of 12 skills: *Product · Go-to-market · Brand · Accounts*. Each links to the filtered Work page.
5. Personal teaser → About / origin story (keep the aflaj story; it's your differentiator).
6. Contact.

### Work (today's Portfolio Detail)
- Filter by **4 lenses** first; the 12 skills become secondary tags.
- Default sort: Product work first.
- Keep the expandable cards, but every PM case study uses the same structure:
  **Problem → My role & scope → Key decisions (and the trade-off) → What shipped → Outcome → What I'd do next.**
  The "key decisions" block is what separates a PM case study from a marketing one.

### How I work (new page)
Your Carve Launch HQ is a portfolio piece on its own. Show the operating system as a 9-step strip (Frame · Understand · Scope · Prioritise · Plan · Align · De-risk · Execute · Measure), each with the framework you used and a screenshot from Notion (with confidential numbers blurred). It answers "how do you run a product?" before the interview does.

### About
Keep the origin story and timelines. Retitle the professional timeline entries so the PM scope is visible ("Marketing & Brand Manager · Product Owner, Veil & ASOFT Carve").

### Resume
- Rebuild the resume page and PDF from `career/templates/cv.html` (PM version), so there's one source.
- Fix: four years, the portfolio link, the headline.

### Later (optional, premium touch)
**Tailored landing pages per application**, e.g. `/for/picnic`: a short page with the three case studies that matter for that role and a note to the hiring manager. The job agent can generate it alongside the CV, and the cover letter links to it. Only for strong-fit roles.

## Copy and SEO basics
- `<title>`: "Essia Zarrouk: Product Manager, Amsterdam"
- Meta description and Open Graph image (headshot + headline) so links look good when shared in LinkedIn and email
- Person schema (name, jobTitle, sameAs LinkedIn)

## Build order
1. Fix the facts everywhere (headline, years, link): 1 PR
2. Home hero + proof bar + 3 flagship cards: 1 PR
3. Rewrite the 3 flagship case studies in the PM structure: 1 PR (needs your numbers for Veil and Carve)
4. Work page lenses: 1 PR
5. How I work page: 1 PR (needs Notion screenshots)
6. Resume page from the CV template: 1 PR

Each step goes through your review mode (`python3 feedback/server.py`) before it merges.
