# Active Context — Current Status

_Last verified: 2026-10-09._

## Skills installed and applied

### `vercel-composition-patterns` (Vercel Labs) — applied
- **Why**: React component architecture patterns to eliminate boolean prop proliferation. The old code drilled a `loading` boolean through 4 components (`KPICard`, `KPIRow`, `IncomeOutcomeChart`, `ProfitPercentChart`), forcing each to know about and render skeleton states.
- **Pattern used**: `architecture-avoid-boolean-props` — lifted loading-state concern up to `App.tsx` (the orchestrator) using composition.
- **Changes made**:
  - Removed `loading` prop from `KPICard`, removed skeleton state, removed unused `Skeleton` import ✅
  - Removed `loading` prop from `KPIRow`, added exported `KPIRowSkeleton` component for parent-use
  - Removed `loading` prop from both charts (`IncomeOutcomeChart`, `ProfitPercentChart`), removed skeleton states
  - `App.tsx` now owns the loading decision: `{loading ? <KPIRowSkeleton /> : metrics ? <KPIRow metrics={metrics} /> : null}`
  - Tests: **17/17 green** | Build: ✅ | Lint: ✅

### `performance-optimization` (Addy Osmani) — installed, not yet applied
- **Why**: Comprehensive methodology (measure → identify → fix → verify → guard). Covers both frontend and backend. Backend opportunities: cached deterministic mock data (regenerated every request despite `random.seed(42)`), paginated list endpoints, lazy category calculations.
- **Status**: SKILL.md + reference documentation placed in `.agents/skills/performance-optimization/`. Ready for a future session focused on perf.

### `dashboard-display-conventions` — **custom skill**, created for repo-specific gap
- **Problem identified**: Community skills (React, composition, accessibility, perf) are all generic guidance. None encode this dashboard's **specific data-formatting & display conventions** — the exact currency/percent/date formatting, variant color mappings, helper text patterns, date-only-string handling, and KPI row composition patterns discovered in this codebase.
- **Gap documented via subagent verification**: the initial skill draft had 9 gaps (hard-coded 4-card row, no skeleton sync guidance, missing Spanish glossary, no icon conventions, no test-maintenance pattern, pre-existing English-vs-Spanish drift, etc.) — all fixed in v2.
- **Location**: `.skills/dashboard-display-conventions/SKILL.md` (source) and `.agents/skills/dashboard-display-conventions/` (installed copy)
- **Scope**: Number/currency formatting (§A), date/period label conventions (§B), KPI card display conventions (§C), chart display conventions (§D), language & copy (§E), component composition & loading (§F), extending types & test maintenance (§G)
- **Status**: Installed, verified via subagent, refined to address all gaps found

## What works (verified this session)

- **Full stack runs via `docker compose up --build`**: backend healthy (`GET /health` → 200), API serves 360 movements dated 2025-10-02..2026-09 (today-relative generator), frontend serves on :5173.
- **All tests green:** backend pytest **19/19** (`backend/tests/test_routes.py`), frontend vitest **10/10** (`frontend/src/lib/financial-utils.test.ts`), `npm run lint` clean, `npm run build` succeeds (pre-existing >500 kB chunk-size warning only).
- **Rule 11 fix shipped:** period badge now derived from loaded data via `computePeriodLabel()` (single year → "YYYY - Full Year", span → "YYYY - YYYY", empty → "No data"); `dashboard-header.tsx` default is neutral "Full Period". Locked by 3 vitest cases.
- **Agent conventions in place:** `.agents/rules/` holds 20 DRAFT rules (numbers match Phase 2 of `verification.md`); new Rule 16 boundary/invalid-value tests added to the backend suite.
- **Stack cleanly torn down** (`docker compose down`) — nothing running in background.

## Known gaps (open items, each governed by a draft rule)

| Gap | Rule | Notes |
|---|---|---|
| Wildcard CORS + credentials | 10 | `backend/app/main.py` — dev-only, must change before deploy |
| debugpy published on 5678 | 19 | `backend/Dockerfile` CMD + `docker-compose.yml` — dev-only |
| `frontend/.env.example` missing | 13 | README tells users to copy it |
| `build_metrics_facets()` crashes on empty list | 20 | reads `ordered[0]`/`ordered[-1]`; safe only because generator always returns 360 items |
| Global `random.seed()` in generator | 9 | mutates process-wide random state |
| Date-only strings parsed via `new Date()` | 12 | `computeMonthlyData` — local-time grouping edge near month boundaries |
| Fetch errors swallowed | 14 | `App.tsx` `.catch()` drops the error object |
| Unused analytics endpoints | 3 | facets/summary/top-categories/comparison/alerts/B2B/B2C defined but unconsumed |
| Float money + ad-hoc rounding | 18 | policy decision needed before real data |
| Rules set still DRAFT | — | awaiting ratification |

## Next priorities (suggested order)

1. **Re-validate the stack on a fresh `docker compose up --build`** — the 2026-10-09 teardown showed a Vite-proxy 502 (`ETIMEDOUT` to the backend container's old IP) while direct `:8000` worked; likely a stale-DNS artifact of container recreation, needs confirmation. Then browser-check the badge shows "2025 - 2026".
2. **Ratify the rules** — drop DRAFT markers in `.agents/rules/README.md` and Phase 3 of `verification.md`.
3. **Close cheap gaps:** add `frontend/.env.example` (rule 13), guard empty list in facets (rule 20).

## Recent changes (2026-10-09)

- Created `.agents/rules/` (9 files), `.agents/skills/` (4 SKILL.md procedures: run-and-verify-stack, add-api-endpoint, add-dashboard-feature, maintain-rules-and-verification), `memory-bank/` (this folder), Phase 3 section in `verification.md`.
- Added 4 backend tests (rule 16 boundaries/invalid values) + 5 frontend tests (empty inputs, period label).
- Fixed the hard-coded period label (product-code change; first in the repo since review began).
