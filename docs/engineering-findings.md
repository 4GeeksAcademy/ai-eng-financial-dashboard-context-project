# Engineering findings

Conventions and risks that affect future contributors and agents. Every finding
is tied to a file or an observed behavior. Line numbers are from commit `5bee479`.

**Type:** Convention (follow it) · Risk (be careful, or fix it)

This is a snapshot, so it is not updated as issues are fixed. Since it was written,
F1 was fixed in `840e6f2`, T3 in `22db46d`, and D2 and D3 afterward. The current
list of open gaps is in
`memory-bank/current-state.md`.

## Architecture

| ID | Type | Finding | Evidence | Why it matters |
|---|---|---|---|---|
| A1 | Convention | The backend is one module with models, helpers and handlers | `backend/app/routes.py` (392 lines) | New code has an obvious home, but the file keeps growing |
| A2 | Convention | Handlers are thin and calculations live in pure helpers | `summarize_movements`, `detect_outcome_alerts` in `routes.py` | Logic can be tested without HTTP |
| A3 | Convention | All 8 data handlers rebuild data with `seed=42` | `generate_mock_movements(seed=42)` in `routes.py` | A different seed would make endpoints disagree |
| A4 | Risk | Seeding changes Python's global random state | `random.seed(seed)`, `routes.py:96` | Any other use of `random` in the process is affected |
| A5 | Risk | Monthly totals are calculated on both sides | `computeMonthlyData` in `financial-utils.ts`, `summarize_movements` in `routes.py` | A rule change on one side will not reach the other |
| A6 | Risk | The `business_type` filter is repeated inline in 4 handlers | `routes.py:278`, `296`, `312`, `351` | `filter_movements` does not accept it, so a change needs 4 edits |
| A7 | Convention | Frontend calculations live in `src/lib/`, not in components | `financial-utils.ts`; `App.tsx` only calls it | Logic stays testable without a DOM |

## Naming

| ID | Type | Finding | Evidence | Why it matters |
|---|---|---|---|---|
| N1 | Convention | API fields use `snake_case`; derived frontend types use `camelCase` | `create_date` and `totalIncome` in `financial-types.ts` | Renaming an API field silently breaks the UI |
| N2 | Risk | The same value is `net` in the API and `profit` in the UI | `MetricsSummaryItem.net`, `KPIMetrics.profit` | Easy to treat as two different metrics |
| N3 | Convention | Expenses are called `outcome` everywhere | `OperationType` on both sides | New code should not introduce `expense` |
| N4 | Risk | `/api/metrics` returns movements, not metrics | `get_metrics` has `response_model=list[FinancialMovement]` | The route name suggests aggregated data |

## API contract

| ID | Type | Finding | Evidence | Why it matters |
|---|---|---|---|---|
| C1 | Risk | Frontend types are copied by hand from the backend | `financial-types.ts`, `routes.py:11-27` | A mismatch does not fail the build |
| C2 | Convention | Dates are `YYYY-MM-DD` strings with no time | `FinancialMovement.create_date` | Parsing them with `new Date()` shifts days behind UTC, as in commit `5bee479` |
| C3 | Risk | `/health` on port 5173 returns the app's HTML with a 200 | Observed with `curl`; proxy config in `vite.config.ts` | A health check through the frontend always looks healthy |

## Testing

| ID | Type | Finding | Evidence | Why it matters |
|---|---|---|---|---|
| T1 | Risk | Several backend tests only check status codes and keys | `test_metrics_comparison_returns_delta_fields` in `test_routes.py` | Wrong calculations would still pass |
| T2 | Risk | One assertion block only runs if the response is not empty | `if payload:` at `test_routes.py:182` | The test can pass without checking anything |
| T3 | Risk | Some backend paths are not covered | `routes.py` lines 170, 297, 313, 332, 352 | Includes the `delta_pct` calculation |
| T4 | Risk | Components have no tests | No `jsdom` or Testing Library in `package.json` | Loading, empty and error states are unverified |
| T5 | Risk | Containers run in UTC | `date +%Z` in the container | Hides timezone bugs, as with commit `5bee479` |
| T6 | Risk | Nothing runs the checks automatically | No `.github/` folder | A broken branch is only caught if someone runs the checks |

## Documentation

| ID | Type | Finding | Evidence | Why it matters |
|---|---|---|---|---|
| D1 | Convention | The README exists in two languages | `README.md`, `README.es.md` | A change to one must reach the other |
| D2 | Risk | The README does not say which folder `.env` belongs in | "Copy `frontend/.env.example` to `.env`" | A root `.env` has no effect, because Vite reads `frontend/` |
| D3 | Risk | The page title is the scaffold default | `<title>frontend</title>` in `index.html` | The browser tab does not name the product |

## Developer experience

| ID | Type | Finding | Evidence | Why it matters |
|---|---|---|---|---|
| X1 | Convention | The project runs through Docker Compose | Proxy target `http://backend:8000` in `vite.config.ts` | That host only resolves on the Compose network |
| X2 | Risk | `node_modules` is an anonymous volume | `/app/node_modules` in `docker-compose.yml` | A rebuild alone leaves the old packages in place |
| X3 | Risk | Python dependencies have no versions | `backend/requirements.txt` | Rebuilds can change behavior. A `starlette` deprecation warning already appears |
| X4 | Risk | The image ignores the exact lockfile versions | `RUN npm install` in `frontend/Dockerfile`, with a tracked `package-lock.json` | `npm ci` would make builds reproducible |
| X5 | Risk | No formatter is configured | No Prettier config; `App.tsx` uses double quotes, `kpi-row.tsx` uses single | Style depends on the file, and reformatting adds diff noise |
| X6 | Risk | Python has no linter | No lint tool in `requirements.txt` | Only pytest checks backend changes |

## Frontend behavior

| ID | Type | Finding | Evidence | Why it matters |
|---|---|---|---|---|
| F1 | Risk | The period label is hardcoded | `App.tsx:49`, `dashboard-header.tsx:7` | The UI says 2024 while the data is from 2025 and 2026 |
| F2 | Risk | The UI mixes languages | Spanish error in `App.tsx:37`; everything else is English | Users see an inconsistent product |
| F3 | Risk | The fetch error's cause is discarded | `.catch(() => ...)` in `App.tsx:35` | The status code never reaches the console or the UI |
| F4 | Convention | Data components have loading, empty and data states | `income-outcome-chart.tsx`, `profit-percent-chart.tsx` | New components should match |
| F5 | Convention | Colors come from theme tokens | `var(--chart-income)`, `index.css` | A metric keeps its color across charts |
| F6 | Risk | Unused code remains | Nothing imports `src/lib/mock-data.ts` | Its 2024 data looks like the real source |
| F7 | Risk | The production bundle exceeds Vite's warning size | 584 kB chunk in `npm run build` | Slower first load |

## Security

| ID | Type | Finding | Evidence | Why it matters |
|---|---|---|---|---|
| S1 | Risk | CORS allows any origin with credentials | `backend/app/main.py:9-10` | Must change before any deployment |

## Discarded

These were removed because they were vague or had no concrete evidence:

- "The code should be cleaner."
- "It needs better error handling." Only the specific case in F3 survived.
- "It needs more tests." Only the specific gaps in T1 to T4 survived.
- "The backend should be split into layers." Nothing in the repo shows this is a
  problem yet, and A1 records the fact without the prescription.
- "It should have a real database." The repo gives no sign this is planned.

## Proposed rules

Each rule cites facts from the findings above.

| Proposed rule | Goes in | Based on |
|---|---|---|
| Run and verify everything through Docker Compose | `workflow.md` | X1, X2 |
| Rebuild with `-V` after a frontend dependency change | `workflow.md` | X2 |
| Keep both READMEs and the memory bank in sync | `workflow.md` | D1 |
| Keep one concern per commit | `workflow.md` | Commit `2cd0e1e` mixes rules and memory bank |
| Keep handlers thin and put calculations in pure helpers | `backend.md` | A2 |
| Always use `seed=42`, and never assume a specific year | `backend.md` | A3, finding #9 in `verification.md` |
| Assert on calculated values, not only keys | `backend.md` | T1, T2, T3 |
| Keep calculations in `src/lib/` | `frontend.md` | A7 |
| Implement loading, empty and data states | `frontend.md` | F4 |
| Use theme tokens for colors | `frontend.md` | F5 |
| Match the style of the file you edit | `frontend.md` | X5 |
| Never read a month or day from `new Date("YYYY-MM-DD")` | `frontend.md` | C2, T5 |
| Change backend and frontend types together | `api-contract.md` | C1, N1 |
| Put new routes under `/api`, and check health on port 8000 | `api-contract.md` | C3 |
| Set `VITE_API_BASE_URL` in `frontend/.env` | `api-contract.md` | D2 |

The remaining risks are not rules. They are tracked as gaps in
`memory-bank/current-state.md`.
