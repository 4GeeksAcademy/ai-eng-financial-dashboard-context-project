# Agent Guidance

Agents working on this project **must**:

- Look for **work instructions and rules** in the directory:  
  `./memory-bank/.agents/rules`

- Look for available **agent skills** in the directory:  
  `./memory-bank/.agents/skills`

- Also load the project-specific financial contract skill from
  [`./memory-bank/.skills/verify-financial-dashboard-contract/SKILL.md`](./memory-bank/.skills/verify-financial-dashboard-contract/SKILL.md)
  when working on the financial API, frontend integration, calculations, or contract documentation.
  Keep this skill in `memory-bank/.skills/`; do not relocate it to `.agents/skills/` or maintain a duplicate.

- Look for the **project memory bank** in:  
  `./memory-bank`  
  _(if the directory exists)_

Before taking action (analyzing code, modifying files, or generating outputs), always review the latest files in these locations to ensure compliance with project conventions, context, and operational constraints.

Resolve the paths above from the repository root, including when working in `frontend/` or `backend/`. The `.skills/` location is loaded explicitly through this guidance; do not assume editor auto-discovery.

The application npm package is [`frontend/package.json`](./frontend/package.json). [`memory-bank/package.json`](./memory-bank/package.json) forwards `test`, `build`, and `lint` to that package, so `npm test`, `npm run build`, and `npm run lint` also work directly from `memory-bank/`. Keep application dependencies in frontend, not in this forwarding manifest. From any directory inside this Git repository, use `npm --prefix "$(git rev-parse --show-toplevel)/frontend" test` or `npm --prefix "$(git rev-parse --show-toplevel)/frontend" run <script>`. `npm run` without a script only lists available scripts.

- At the end of each repository work session, append a dated entry to `memory-bank/progress.md` using its existing schema. Record the request and relevant inputs, files changed, commit hashes or `none`, exact validation commands and results, significant logs/warnings, and follow-up work. Preserve prior entries, summarize only relevant log lines, and never include secrets or credentials.
