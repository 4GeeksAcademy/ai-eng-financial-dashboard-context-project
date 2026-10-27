# Agent Workflow

## Rule 15: Inspect the instruction directories named in AGENTS.md and report when they are absent

Before making changes, read the files under `.agents/rules` (this directory), and check for `.agents/skills` and `memory-bank`. If a directory named in `AGENTS.md` is absent, report the gap rather than inventing its contents.

**Repo fact:** `AGENTS.md` directs agents to `./.agents/rules`, `./.agents/skills`, and `./memory-bank`; none existed during the initial review, and all three have since been created (`.agents/rules` and `.agents/skills` hold draft conventions; `memory-bank` holds project knowledge).
