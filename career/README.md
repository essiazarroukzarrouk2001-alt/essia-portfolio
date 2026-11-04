# Career OS — the plan

Everything for the job hunt lives in GitHub: profile data, templates, every tailored CV and cover letter, and a log of each application. Nothing stays on a laptop.

This folder is the **draft for you to give feedback on**. Nothing in it is final until you sign off on the templates.

---

## 1. Is it possible? Yes, with one important catch

| What you asked for | Possible? | How |
|---|---|---|
| Everything stored in GitHub (folders, images, docs) | ✅ | One private repo, structured below. Every run commits its output. |
| Agent reads your job-hunt requirements and screens roles | ✅ | `profile/search-criteria.md` plus your Notion **Job Application Tracker** (already connected, 47 roles in it). |
| A tailored CV + cover letter for every role, positioning you as the fit | ✅ | One CV template and one cover-letter template, filled per job from `profile/master-profile.md`. Rendered to PDF. |
| Agent fills in the application form | ✅ for most ATS forms (Greenhouse, Lever, Ashby, Workable, Recruitee, Personio, Teamtailor, SmartRecruiters). ⚠️ for Workday (needs an account per company) and LinkedIn Easy Apply (needs your login). | See the catch below. |
| Agent **never** submits; it tells you what's ready and what it couldn't do | ✅ | Hard rule in the agent: stop before the final Submit button, every time. |
| You say "run it" and it runs | ✅ | You type `run the job agent` (or paste a link) in a Claude Code session on this repo. |

**The catch: the form has to be filled in *your* browser.**
A cloud session like this one runs its browser inside a temporary container. It *can* fill a form there, but you can't see that browser or click its Submit button, and the filled form vanishes when the session ends. So the work splits in two:

1. **Cloud (here):** find and screen the role, tailor the CV and letter, render the PDFs, write every form answer, commit it all to GitHub, update Notion. This is roughly 90% of the work.
2. **Your Chrome (Claude in Chrome extension):** open the application page in your browser, fill every field, upload the PDFs, and **stop with the tab open on the Submit button.** You check it and click Apply. Because it's your real browser, your LinkedIn and Workday logins work too.

Until Claude in Chrome is set up, every application folder still gets an `answers.md`, a copy-paste sheet with every field answered in order, so applying takes you about 2 minutes.

**LinkedIn note:** automating LinkedIn itself can get an account restricted. The agent will never script LinkedIn. For a LinkedIn job it follows the "Apply on company website" link when there is one. For Easy Apply it gives you the prepared answers and you click through.

---

## 2. How a run works

```
You: "run the job agent"   (or: "run it on <link>")
        │
        ▼
1. COLLECT   Notion tracker rows with Status = Not Started (+ any links you paste)
2. SCREEN    Check each one against search-criteria.md → Go / Flag / Skip, with the reason
3. MATCH     Pick the track (PM · Marketing/Brand/Campaign · Account) and the 3 strongest proof points
4. TAILOR    CV: headline, summary, "Selected work", bullet order, keywords mirrored from the posting
             Letter: the matching track template, written as one connected story, with a real company detail
5. RENDER    PDFs → applications/<date>_<company>_<role>/
6. ANSWERS   answers.md + answers.json for every form question (from form-answers.md)
7. FILL      (Claude in Chrome) open the form, fill it, upload, STOP before Submit
8. REPORT    A table: Ready for you to click Apply · Blocked (why) · Skipped (why)
9. LOG       Commit to GitHub, set Notion Status = In Progress, link the folder
```

You only ever do two things: say "run it", and click Apply.

---

## 3. GitHub organisation

Two repos, each with one job:

### `essia-portfolio` (this repo, **public**): the website only
It has to stay public because GitHub Pages serves your site from it. So **no applications, salary numbers, or visa details go here.** Anything in this repo, on any branch, is visible to anyone.

### `essia-career` (new, **private**): the job agent
```
essia-career/
├── README.md                  ← one page: how to run it
├── CLAUDE.md                  ← the agent's rules (never submit, never invent facts, filters)
├── profile/
│   ├── master-profile.md      ← single source of truth: every role, fact, metric, story
│   ├── search-criteria.md     ← what to apply for / never apply for
│   ├── form-answers.md        ← standard answers: notice period, salary, permit, "why leave", etc.
│   ├── voice.md               ← how you sound (plain, confident, no fluff)
│   └── assets/                ← headshot, signature, the master CV PDF
├── templates/
│   ├── cv.html                ← one layout, content swapped per track
│   ├── cover-letter.html
│   └── tracks/                ← pm.md · marketing.md · account.md (the proof points + letter paragraphs per track)
├── agent/
│   ├── skills/run-job-agent/SKILL.md
│   ├── render.js              ← HTML → PDF
│   └── fill-form.js           ← field-mapping rules per ATS
├── applications/
│   └── 2026-11-04_picnic_campaign-manager/
│       ├── job.md             ← posting snapshot (postings disappear), fit score, track, gaps
│       ├── Essia Zarrouk - CV - Picnic.pdf
│       ├── Essia Zarrouk - Cover Letter - Picnic.pdf
│       ├── answers.md         ← copy-paste sheet
│       ├── screenshots/       ← filled form, before Submit
│       └── status.md          ← ready / blocked (why) / submitted on <date>
└── log.md                     ← one line per run
```
Notion stays the **tracker** (statuses, interviews), since you already use it. GitHub is the **archive** (every document actually sent). Each Notion row links to its GitHub folder.

**Why name folders `date_company_role`:** they sort by date, you can find them by company, and they never collide when one company has two roles.

**Right now:** I can't create the private repo from this session. Create an empty private repo called `essia-career` on GitHub (2 clicks: github.com/new → Private) and add it to this Claude environment. I'll move this `career/` folder into it and delete it from the public repo. Until then this folder only holds facts that are already public on your resume.

---

## 4. What I need from you

1. **Feedback on the two templates** in `templates/` (open the PDFs in `templates/previews/`).
2. **Create the private repo** `essia-career` (see above).
3. **The form-answer facts** I don't have. Send these in a private channel, *not* in this public repo:
   - work-permit / sponsorship status, worded the way you want employers to read it
   - notice period / earliest start date
   - salary expectation per track (a range)
   - willing to relocate? (Dubai roles are in your tracker)
   - how you want "why are you leaving NOWN" answered
   - date of birth / nationality, only if you're OK with forms that ask
4. **Install Claude in Chrome** on your computer when you're ready for step 7 (auto-fill in your browser).
5. **Anything new**: Carve launch results as they land, Veil numbers (units, revenue, configurator usage), references.

---

## 5. Rollout

| Phase | What | Done when |
|---|---|---|
| 0 | Agree templates + positioning (this) | You sign off on the CV and letter |
| 1 | Private repo, profile, form answers, agent skill | `run it on <link>` produces a folder with 2 PDFs + answers.md |
| 2 | Batch mode from Notion | `run the job agent` processes every Not Started row and reports back |
| 3 | Auto-fill in your Chrome | Forms are filled and waiting on Submit |
| 4 | Website repositioning (see `website-plan.md`) | Site says PM first and matches the CV |
