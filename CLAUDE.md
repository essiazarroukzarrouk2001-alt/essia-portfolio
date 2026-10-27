# Essia Zarrouk portfolio

Static HTML site (no build step). Design system: `design/Brand Guideline.md`; overview: `design/README.md`.

## Review mode

Essia reviews the site in a local review mode and leaves comments pinned to elements, with inspo images:

```bash
python3 feedback/server.py
```

Then open http://localhost:4321 (also the `review` config in `.claude/launch.json`). Comments land in `feedback/data/comments.json` (gitignored, local only).

When she asks you to apply her feedback, follow the `apply-feedback` skill (`.claude/skills/apply-feedback/SKILL.md`). Her comments are brain dumps — interpret them generously into concrete changes instead of asking her to clarify.
