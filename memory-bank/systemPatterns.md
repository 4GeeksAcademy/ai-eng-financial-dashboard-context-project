# System Patterns — Architecture & Conventions

_Last verified: 2026-10-09._

## Data flow

```
Browser (App.tsx)
  └─ fetch GET /api/metrics  ──►  Vite proxy (/api → http://backend:8000)  ──►  FastAPI router (backend/app/routes.py)
                                                                                   └─ generate_mock_movements(seed=42)  [no DB]
  ◄── FinancialMovement[] ───────────────────────────────────────────────────────┘
  └─ computeKPIs / computeMonthlyData / computePeriodLabel  (frontend/src/lib/financial-utils.ts)
  └─ <DashboardHeader/> <KPIRow/> <IncomeOutcomeChart/> <ProfitPercentChart/>
```

Key property: the **frontend owns all aggregation** for the current UI; the backend's richer analytics (summary, comparison, alerts, facets, top categories) are defined but unused (rule 3).

## Backend patterns (`backend/app/routes.py`)

- Single `APIRouter`; handlers are sync `def`, regenerate mock data per request (`seed=42`).
- Enum-like params via `Literal` types; numeric bounds via `Query(ge=, le=)`; date ranges inclusive on both edges (`filter_movements_by_date`).
- Pydantic `BaseModel` response models per endpoint (`FinancialMovement`, `MetricsFacets`, `MetricsSummaryItem`, `TopCategoryItem`, `MetricsComparison`, `MetricsAlert`).
- Helper functions (`build_metrics_facets`, `summarize_movements`, `build_top_categories`, `detect_outcome_alerts`, `calculate_net_value`) are pure over `list[FinancialMovement]`.

## Frontend patterns

- Functional components + hooks (`useState`/`useEffect`); data fetched once on mount in `App.tsx`, derived values computed in-browser.
- **Naming:** kebab-case `.tsx` files; dashboard components in `components/dashboard/`, primitives in `components/ui/` (shadcn style: CVA + `cn()` in `lib/utils.ts`).
- **Imports:** `@/` alias → `frontend/src` (configured in `vite.config.ts` + `tsconfig`).
- **Pure logic** isolated in `lib/financial-utils.ts` with colocated `*.test.ts` (vitest); types in `lib/financial-types.ts`.
- Loading UI via `skeleton.tsx`; user-facing errors in Spanish.

## Cross-stack invariants

1. `FinancialMovement` must stay aligned between Pydantic and TS (rule 1).
2. Frontend uses relative `/api/...` URLs (proxy), not hardcoded origins (rule 2).
3. Deterministic mock data depends on `seed=42`; changing the generator changes both stacks' test expectations.

## Testing architecture

- Backend: `TestClient(app)` + direct helper-function tests in one file (`backend/tests/test_routes.py`); `conftest.py` only adds `backend/` to `sys.path`.
- Frontend: vitest, pure-function tests colocated with utilities; no component/DOM tests yet.

## Agent workflow architecture

`AGENTS.md` routes agents to `.agents/rules/` (conventions, each backed by a repo fact) and `memory-bank/` (this folder: persistent project knowledge). `verification.md` is the audit trail (Phase 1 checklist → Phase 2 rules → Phase 3 implementation).
