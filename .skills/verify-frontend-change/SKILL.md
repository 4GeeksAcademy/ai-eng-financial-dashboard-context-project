---
name: verify-frontend-change
description: Use before committing or merging any change under frontend/ in this repo. Verifies the change inside Docker with this repo's real commands.
---

## Objective

Before a change under `frontend/` is committed or merged, prove the build and tests pass inside this repo's Compose `frontend` container, and that chunk size, layout, and accessibility did not regress.

## Inputs

- Changed files: `git diff --name-only main...HEAD` plus `git status --short` (catches untracked files)
- Docker stack running: `docker compose up --build` (`README.md` line 42; `docker-compose.yml` lines 2–12)

## Baseline

Entry 187.61 kB, largest 342.29 kB (LineChart), no build warnings, Lighthouse a11y 100 (commits `ac0e230`, `b1ab982`). Update the Baseline in the same commit when a change is merged.

## Steps

1. If the stack is not up, run `docker compose up --build`.
2. Run `docker compose exec frontend npm run build`. That script is `tsc -b && vite build` (`frontend/package.json` line 8) on `node:24-alpine` (`frontend/Dockerfile` line 1).
3. Run `docker compose exec frontend npm test` (`frontend/package.json` line 10; `.agents/rules/testing.md` rule 3).
4. Do NOT use `npx tsc --noEmit` in frontend/ as a check — it typechecks nothing (tsconfig.json "files": []). Step 2's build runs the real typecheck. (`frontend/tsconfig.json` lines 2–6)
5. Compare the Vite chunk table against the Baseline. PASS when the entry and the largest chunk are at or under the Baseline, no chunk exceeds 500 kB, and the log adds no warnings.
6. Check chart fallbacks stay `h-[422px]` (`frontend/src/App.tsx` lines 78–87) and KPI skeletons stay `h-9` / `h-5` (`frontend/src/components/dashboard/kpi-card.tsx` lines 45–46).
7. If the diff changes UI, Human step: Chrome → right-click page → Inspect → Lighthouse tab → check only Accessibility → Analyze page load. Page: http://localhost:5173. Allow NEEDS HUMAN in the report until the human reports the score. FAIL if that score is under the Baseline of 100.
8. Frozen items: run `git diff --name-only main...HEAD -- frontend/src/lib/mock-data.ts backend/app/routes.py` (must print nothing unless a task explicitly targets them) and `grep -n "2024 - Full Year" frontend/src/App.tsx` (must still match). (`memory-bank/current-status.md` lines 18–19 and 30; `.agents/rules/frontend-structure.md` rules 4 and 5)

## Expected output

```
Changed files: <list>
Build:            PASS/FAIL
Tests:            PASS/FAIL  (<passed> passed)
Chunks:           PASS/FAIL  (largest <n> kB, entry <n> kB; new warnings: none/<list>)
Layout:           PASS/FAIL  (chart fallbacks h-[422px], KPI h-9 / h-5)
Lighthouse a11y:  PASS/FAIL/SKIPPED/NEEDS HUMAN  (<score>; skip only if no UI change)
Frozen items:     PASS/FAIL
Verdict:          MERGE / DO NOT MERGE
```

## Acceptance criteria

- [ ] `docker compose exec frontend npm run build` exits 0
- [ ] `docker compose exec frontend npm test` exits 0
- [ ] No JS chunk is over 500 kB, and entry and largest stay at or under the Baseline
- [ ] No new warnings versus the Baseline
- [ ] No layout shift: chart fallbacks stay `h-[422px]` and KPI skeletons stay `h-9` / `h-5`
- [ ] When UI changed, Lighthouse a11y is not lower than the Baseline of 100. NEEDS HUMAN blocks MERGE until the human reports the score.
- [ ] The frozen-item diff prints nothing unless the task targets those files, and the badge grep still matches
