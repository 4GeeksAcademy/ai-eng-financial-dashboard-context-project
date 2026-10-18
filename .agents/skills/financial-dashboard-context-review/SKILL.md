---
name: financial-dashboard-context-review
description: Inspect this repository and produce an evidence-based project summary, engineering findings, and maintainable project memory.
---

# Financial Dashboard Context Review

Use this workflow when creating or refreshing project context, rules, or memory.

1. Read the root `AGENTS.md`, any available `.agents/rules/` files, and the relevant project memory before inspecting code.
2. Map the frontend entry point (`frontend/src/App.tsx`), backend registration (`backend/app/main.py`), route behavior (`backend/app/routes.py`), and nearby tests. Follow the actual call path; route existence alone does not prove UI integration.
3. Check the run configuration in `README.md`, `docker-compose.yml`, `frontend/vite.config.ts`, package scripts, and backend requirements before recommending commands or URLs.
4. Group findings by architecture/API, testing and developer workflow, and documentation/product claims. Tie each proposed rule to concrete paths and exclude generic advice that does not change work in this repository.
5. Write a concise summary and a verification trail in `verification.md`. Record an unsupported or incorrect claim and its correction when discovered; keep known product mismatches explicit.
6. Keep memory concise and limited to verified product scope, stack, current status, and known gaps. Do not invent persistence, features, or roadmap plans.
7. Validate documents for accurate paths and whitespace, and run the relevant frontend/backend checks before reporting the review complete. Report warnings and checks that could not run.