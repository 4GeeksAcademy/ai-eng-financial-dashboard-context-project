# Progress

## 2026-11-16: audit and proposed rule set
- Grouped the findings in `.agents/rules/*` into good and risky, by category (architecture, API, edge cases,
  security, testing, dev environment, style). The rules had no explicit audit; the grouping was derived from each rule's **Why**.
- Turned the risky findings into 16 proposed rules in `.agents/rules/proposed-rules.md` (commit `0025916`).
  Each cites at least one repo fact and names its source rule.

## Status
- Proposed only. Nothing is adopted, enforced or applied to code. The README index in `.agents/rules/` does not list the file.
- Facts were taken from the existing rule files, not re-run. Docker items (DEV-1, DEV-3, SEC-2) remain "not run".

## Next priorities
Ranked by risk. "Resolved when" is the observable result that closes the item.

| # | Gap | Source | Next step | Resolved when |
|---|---|---|---|---|
| 1 | CORS `*` with credentials | SEC-1, P-SEC-1 | Restrict origins in `backend/app/main.py:9-10` | The `curl -H "Origin: http://evil.example"` check prints no allow-origin |
| 2 | Enum drift not caught by any test | API-1, P-API-1 | Add a backend/frontend enum parity test | Adding `"tax"` to the backend only makes a test fail |
| 3 | Month bucketing shifts in negative-UTC zones | EDGE-1, P-EDGE-1 | Use `create_date.slice(0, 7)`; add a TZ vitest case | LA-timezone test expects "Dec 2025" and passes |
| 4 | `npm run build` never run | SPEC baseline, P-TEST-1 | Run it once and record the result in `SPEC.md` | A result line is quoted in `SPEC.md` |
| 5 | Docker Compose path, HMR in volume, debugger port | verification.md Unverified, DEV-1/3, SEC-2 | Run on a machine with Docker (this one has none) | `docker compose up --build` passes the DEV-1 checks; findings recorded |
| 6 | Backend dependencies unpinned | SPEC "Not established" | Pin versions from the local run (FastAPI 0.162.5) and list `pydantic` | `requirements.txt` has pins; pytest still 15 passed |
| 7 | No CI | SPEC known gaps | Add a workflow running the four TEST-1 checks | A tracked pipeline file exists and runs green |
| 8 | Stale header, empty-input crash, `/metrics` ignores `business_type` | EDGE-2, EDGE-3, ARCH-3 | Fix each with a regression test, per the rule | Matching tests added; entries removed from `known-edge-cases.md` |
| 9 | Duplicated aggregation (client and server) | ARCH-1, P-ARCH-1 | Decide: keep both in sync or fetch `/summary` | Decision recorded here; code or rule updated |
| 10 | Rule adoption | proposed-rules.md | Move accepted rules to topic files with IDs; list in README index | `.agents/rules/README.md` links them |

Items with no owner decision yet: deployment target and product goals (SPEC "Not established"). The repo states
neither, so ask the project owner before planning around them.
