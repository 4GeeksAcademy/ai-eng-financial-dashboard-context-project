# Project Summary Verification
## Summary verification checklist

| Status | Claim to verify | Evidence to inspect / notes |
|---|---|---|
| ✅ | The project is a financial dashboard with a React + TypeScript frontend and a FastAPI backend. | `frontend/package.json`, `frontend/src/`, `backend/requirements.txt`, `backend/app/main.py` |
| ✅ | The backend serves seeded mock financial movements; it is not currently backed by a database. | `backend/app/routes.py`: `generate_mock_movements(seed=42)`; no database configuration or persistence layer is present in the inspected project structure. |
| ✅ | Docker Compose runs frontend and backend services. | `docker-compose.yml` defines `frontend` and `backend`. |
| ✅ | The frontend is exposed on port `5173`, and the backend on port `8000`. | `docker-compose.yml` port mappings; container `EXPOSE` declarations are in each service's Dockerfile. |
| ✅ | Vite proxies `/api` requests to `http://backend:8000`. | `frontend/vite.config.ts` (`server.proxy`). |
| ✅ | The React entry point is `frontend/src/main.tsx`, which mounts `App`. | `frontend/src/main.tsx`. |
| ✅ | `frontend/src/App.tsx` requests `GET /api/metrics`, then computes KPI and monthly chart data in the browser. | `frontend/src/App.tsx`; calculations are in `frontend/src/lib/financial-utils.ts`. |
| ✅ | Dashboard components are in `frontend/src/components/dashboard/`. | Header, KPI, and chart component files in that directory. |
| ✅ | The FastAPI app entry point is `backend/app/main.py` (`app.main:app`); routes are imported from `backend/app/routes.py`. | `backend/app/main.py`; backend `Dockerfile` Uvicorn command. |
| ✅ | The API includes health, metrics, facets, summary, top categories, comparison, alerts, and B2B/B2C endpoints. | Route decorators in `backend/app/routes.py`. |
| ✅ | The frontend currently uses `/api/metrics`; the other analytics endpoints are not used by the current `App.tsx` flow. | Search frontend source for API fetch calls; `App.tsx` defines the current request. Re-check if additional views or hooks are added. |
| ✅ | Backend tests are in `backend/tests/test_routes.py`; frontend scripts are declared in `frontend/package.json`. | Test file and package scripts. |
| ❌ | The displayed period `2024 - Full Year` is guaranteed to match the generated movement dates. | It does not: `frontend/src/App.tsx` hard-codes `2024 - Full Year`, while `backend/app/routes.py` derives dates from `date.today()` in `_year_for_month()`. Correct summary wording: the label can be stale and does not necessarily match the generated dates. At the current date (2026-10-08), generated dates span 2025 and 2026, not 2024. |
| ✅ | Run instructions use `docker compose up --build`; local URLs are frontend `:5173`, backend `:8000`, and API docs `/docs`. | `README.md`; Compose port mappings. |


## Phase 2 — Derive engineering findings (with the agent)
### Proposed contributor rules

These are proposals inferred from current repository behavior, not existing enforced policies. Each rule includes a concrete repository fact as its rationale.

### Architecture and data flow

1. **Keep frontend-consumed financial payloads aligned across backend and frontend.** When changing a field consumed by the UI, update the relevant Pydantic model in `backend/app/routes.py` and TypeScript declaration in `frontend/src/lib/financial-types.ts`; add a TS type for a response when the frontend begins consuming it. **Repo fact:** `FinancialMovement` is represented in both files, while backend summary/comparison response models currently have no matching frontend declarations.
2. **Use the existing API proxy for frontend API calls.** Prefer relative `/api/...` URLs unless intentionally configuring a different origin. **Repo fact:** `frontend/vite.config.ts` proxies `/api` to `http://backend:8000`, and `frontend/src/App.tsx` requests `/api/metrics`.
3. **Make the data source for dashboard calculations explicit.** If adding UI features based on backend analytics, connect the corresponding route deliberately instead of assuming it is already in use. **Repo fact:** `frontend/src/App.tsx` calls only `/api/metrics` and computes its displayed KPIs/charts with `frontend/src/lib/financial-utils.ts`; backend summary/comparison/category/alert routes are defined in `backend/app/routes.py`.
4. **Revisit mock-data generation if dataset size or request load grows; do not add caching/service indirection solely for the current mock size.** **Repo fact:** each analytics handler in `backend/app/routes.py` calls `generate_mock_movements(seed=42)`, which constructs 360 movements per request.

### Naming and organization

5. **Follow observed component naming and location.** Put React components under `frontend/src/components/` and use `.tsx` with kebab-case filenames. **Repo fact:** dashboard components such as `kpi-row.tsx` and `income-outcome-chart.tsx` follow this pattern.
6. **Use the configured source alias for frontend imports where appropriate.** **Repo fact:** `frontend/vite.config.ts` maps `@/` to `frontend/src`, and `frontend/src/App.tsx` imports components and utilities through that alias.

### Testing

7. **Add or update backend endpoint/helper tests in `backend/tests/test_routes.py` when changing backend behavior.** **Repo fact:** that file tests route responses, filters, and mock generation.
8. **Add or update frontend calculation tests alongside the utility implementation.** **Repo fact:** `frontend/src/lib/financial-utils.test.ts` tests functions from `financial-utils.ts` in the same directory; `frontend/package.json` provides `npm test`, `npm run lint`, and `npm run build`.

### Runtime behavior and security

9. **Do not seed Python's global random generator in new or refactored mock-data code; use an isolated generator when deterministic output is needed.** **Repo fact:** `generate_mock_movements()` in `backend/app/routes.py` calls `random.seed(seed)`, which changes process-global random state.
10. **Before deploying, replace wildcard CORS settings with the intended allowed origins and permissions.** **Repo fact:** `backend/app/main.py` currently configures wildcard origins, methods, and headers together with credentials enabled.

### Dates and time zones

11. **Derive the dashboard period label from the displayed data, or keep its date range explicitly synchronized with the data source.** **Repo fact:** `frontend/src/App.tsx` hard-codes `2024 - Full Year`, while `backend/app/routes.py` generates years relative to `date.today()`.
12. **Handle API date-only strings as calendar dates when grouping, rather than relying on implicit local-time conversion.** **Repo fact:** `frontend/src/lib/financial-utils.ts` passes `create_date` to `new Date()` and groups with local `getFullYear()`/`getMonth()`.

### Documentation and developer experience

13. **Keep README setup references backed by checked-in files, or document how to create the referenced file.** **Repo fact:** `README.md` tells users to copy `frontend/.env.example`, but that path was absent during this review.
14. **Preserve fetch failure details in developer diagnostics without exposing raw internal errors to users.** **Repo fact:** the `.catch()` in `frontend/src/App.tsx` ignores its caught error and sets a fixed Spanish message.

### Agent workflow

15. **Before agent changes, inspect the instruction directories named in `AGENTS.md` and report when they are absent.** **Repo fact:** `AGENTS.md` names `.agents/rules`, `.agents/skills`, and `memory-bank`; none existed during this review.
16. **Keep API input validation explicit, and add tests for invalid values and boundary values when changing query parameters.** **Repo fact:** `backend/app/routes.py` uses `Literal` types for enum-like filters and bounds the top-category `limit` with `Query(ge=1, le=20)` and alert `threshold` with `Query(ge=0)`.
17. **Keep date-range endpoint semantics consistent and test the inclusive edges.** **Repo fact:** `filter_movements_by_date()` in `backend/app/routes.py` uses `>= start_date` and `<= end_date`, and `backend/tests/test_routes.py` checks an equal start/end date.
18. **Define and test a monetary precision/rounding policy before using these calculations with real financial data.** **Repo fact:** `FinancialMovement.amount` is a `float` in `backend/app/routes.py`, totals use floating-point sums, and several backend outputs are rounded to two decimal places.
19. **Treat the debugpy listener as development-only and restrict/remove its exposed port in production deployments.** **Repo fact:** `backend/Dockerfile` starts debugpy on `0.0.0.0:5678`, and `docker-compose.yml` publishes port `5678`.
20. **Handle empty inputs explicitly in aggregation/facet helpers if they are reused with a source that can return no movements.** **Repo fact:** `build_metrics_facets()` in `backend/app/routes.py` reads `ordered[0]` and `ordered[-1]`, which fail for an empty list; the current seeded generator always returns 360 items.

## Phase 3 — Implement and test repository rules

### Rule files created

The 20 proposed rules above were written to `.agents/rules/` as **draft** rule files, grouped by category. Each rule retains its concrete repo-fact rationale, and rule numbers match the Phase 2 list:

| File | Rules |
|---|---|
| `.agents/rules/README.md` | Index; marks the set as DRAFT (inferred from repo behavior, not yet ratified) |
| `.agents/rules/architecture-and-data-flow.md` | 1–4 |
| `.agents/rules/naming-and-organization.md` | 5–6 |
| `.agents/rules/testing.md` | 7–8 |
| `.agents/rules/runtime-behavior-and-security.md` | 9–10, 19–20 |
| `.agents/rules/dates-and-time-zones.md` | 11–12 |
| `.agents/rules/api-validation-and-precision.md` | 16–18 |
| `.agents/rules/documentation-and-developer-experience.md` | 13–14 |
| `.agents/rules/agent-workflow.md` | 15 |

Status note for rule 15: `.agents/rules/`, `.agents/skills/`, and `memory-bank/` now all exist (the two latter created after Phase 3, superseding the "remain absent" note).

### Test cases added to exercise the testing rules

New tests were added in the locations mandated by rules 7 and 8:

- **Backend (`backend/tests/test_routes.py`), exercising rule 16:** `test_top_categories_accepts_limit_boundary_values` (`limit=1` and `limit=20` succeed), `test_top_categories_rejects_out_of_range_limit` (`limit=0` and `limit=21` return 422), `test_metrics_endpoint_rejects_invalid_enum_filter` (unknown `category` returns 422), and `test_alerts_rejects_negative_threshold` (`threshold=-0.1` returns 422).
- **Frontend (`frontend/src/lib/financial-utils.test.ts`), exercising rule 8:** empty-input boundary tests — `computeKPIs([])` returns zeroed metrics, and `computeMonthlyData([])` returns an empty list (client-side echo of rule 20's empty-list concern).

### Verification results

| Check | Result |
|---|---|
| `python -m pytest tests/` (backend) | ✅ 19 passed (15 existing + 4 new) |
| `npm test` (frontend, vitest) | ✅ 7 passed (5 existing + 2 new) |
| `npm run lint` | ✅ clean |
| `npm run build` | ✅ succeeds; pre-existing chunk-size warning (>500 kB) is unrelated to test changes |

Process note: the first backend run failed with `NameError: payload` because the new tests were inserted using an anchor from a read truncated at line 100, which orphaned the final assertion of `test_b2b_endpoint_combines_new_filters` into a newly appended test. The assertion was restored to its original test and the stray line removed; the 19/19 pass reflects the corrected file.

### Open items (unchanged by Phase 3)

Phase 3 added rules and tests only; no product code was changed. The following remain open and are governed by their respective draft rules: hard-coded period label (rule 11), wildcard CORS (rule 10), debugpy port exposure (rule 19), missing `frontend/.env.example` referenced by README (rule 13), and the DRAFT status of the rule set itself.

## Phase 4 — Build project memory

The two directories from Phase 2 that remained absent were created, completing the structure `AGENTS.md` expects:

### memory-bank/ (project memory)

Six files at the repository root, each dated and grounded in verifiable repo facts:

- `projectbrief.md` and `productContext.md` — product overview, purpose, and deliberate design decisions
- `techStack.md` — languages, frameworks, and tooling with versions from `package.json` and Dockerfiles
- `activeContext.md` — what works, known gaps (mapped to rule numbers), and next priorities
- `systemPatterns.md` and `projectstructure.md` — architecture, data flow, and annotated layout

### .agents/skills/ (invocable procedures)

Four skills under `/<skill-name>/SKILL.md`: `run-and-verify-stack`, `add-api-endpoint`, `add-dashboard-feature`, and `maintain-rules-and-verification`. Each declares a "When to use" trigger and operationalizes existing rules as ordered checklists with commands and known pitfalls — rules remain the binding constraints; skills document how to follow them.

### Consistency updates

Status notes claiming these directories were absent were corrected in `verification.md`, `.agents/rules/agent-workflow.md`, `memory-bank/techStack.md`, and `memory-bank/activeContext.md`.

## SPEC-DRIVEN DEVELOPMENT — FOUR-PHASE DOCUMENTATION WORK

The following four commits document the proposed dashboard features from API discovery through the consolidated frontend contract. They are planning and contract artifacts; they do **not** mean that the three features have been implemented in the application.

### Phase 1 — Explore the API and resolve contract wording (`4d79d31`)

**Verified:** 2026-10-15 against the local running backend (`GET /health` and `GET /docs` returned 200). Inspected `/openapi.json` and made representative GET requests for the three proposed dashboard features. Cross-checked frontend calls and proxy configuration in `frontend/src/App.tsx` and `frontend/vite.config.ts`.

### Documentation updates

- `docs/feature-endpoint-map.md` records endpoint paths, actual query parameter constraints/defaults, response model fields, representative response shapes, frontend fetch conventions, and the verification trail.
- `docs/specs/01-dashboard-date-range-filter.md` clarifies that API dates are inclusive, facets supplies the unfiltered min/max dates, query strings omit blank values, and reversed ranges are rejected in the UI. The existing frontend convention uses the configured API base URL, `response.ok`, and JSON decoding.
- `docs/specs/02-dashboard-anomaly-alerts.md` resolves `increase_ratio` as a ratio (multiply by 100 for display), specifies the inclusive `0.01`–`1.0` threshold bounds, strict comparison, preceding-three-period baseline, and date-range lookback behavior.
- `docs/specs/03-b2b-b2c-comparison.md` resolves that `TopCategoryItem.total_amount` is category income only, not a group total; the selected strategy aggregates B2B/B2C movement lists to compute percentages and chart totals. Per-group categories come from that group's matching income movements, while facets provides global vocabulary only.

### Current API mismatches retained as implementation requirements

1. Alerts currently validates only `threshold >= 0`, and its baseline is the average of all earlier periods. Implementation must add the `0.01`–`1.0` bounds and rolling-three-period semantics.
2. `GET /api/metrics/categories/top` returns `{category, operation_type, total_amount}` without group-total or percentage fields. The resolved spec therefore does not rely on this endpoint for the comparison view; it uses the B2B/B2C movement endpoints and client aggregation.
3. `/api/metrics/facets` returns global `categories`, not a category list for each business type. The comparison view derives group-specific available categories from returned income movements.
4. The current frontend has one fetch call, `GET /api/metrics`, and no multi-page routing; the comparison view spec calls for in-app navigation state, not a routing dependency.

No application code was changed in this phase. Verification was contract/documentation-focused; test suites were not run because product code was not modified.

### Phase 2 — Define TypeScript API and query types (`8c5669a`)

- Added `frontend/specs/api-types.ts` for the facets, alerts, and top-category response payloads. It imports the shared movement-domain enums/types from `frontend/src/lib/financial-types.ts`, and keeps API payloads distinct from derived UI view models.
- Added `frontend/specs/param-types.ts` for inclusive optional date bounds, alert threshold, and top-category query parameters. Comments record date format, defaults, and intended constraints.
- These are feature-spec contract types, not runtime validation or types wired into the existing dashboard fetch flow. The response and query shapes were checked against the OpenAPI contract and the endpoint map; proposed feature requirements that differ from current API behavior are explicitly called out in the documentation.
- No application code changed and no test suite was run for this documentation/type-definition phase.

### Phase 3 — Specify dashboard component contracts (`26d906b`)

- Added `frontend/specs/components.md` describing shared UI conventions and proposed component responsibilities for the date-range filter, home-page composition, anomaly alerts, and B2B/B2C comparison.
- The component contracts specify draft-versus-applied filter behavior, API request ownership, loading/error/empty states, data aggregation responsibilities, and Spanish user-facing copy. They also preserve the chosen comparison strategy: aggregate income movement lists rather than depending on the top-category endpoint for group totals or percentages.
- This file is a component-level implementation plan, not a set of implemented React components. No application code changed and no test suite was run.

### Phase 4 — Consolidate frontend data contracts (`2a7c4c1`)

- Added `frontend/specs/README.md` as the frontend specs index and cross-feature contract reference. It links the three product specs, endpoint map, shared domain types, API response types, query types, and component contracts.
- It consolidates endpoint/query usage, request serialization and error-handling conventions, API-versus-derived-data boundaries, and edge cases for all three features. It also records the selected endpoint strategy and requirements where proposed behavior intentionally exceeds the current backend contract.
- This phase is documentation-only; it does not add navigation, fetch logic, components, or backend behavior. No test suite was run.

### Phase verification summary

| Phase | Verification performed | Result |
|---|---|---|
| 1 — API exploration | Local backend `/health` and `/docs`, OpenAPI schemas, representative requests for proposed feature endpoints, and frontend fetch/proxy conventions | ✅ Verified 2026-10-15; evidence in `docs/feature-endpoint-map.md` |
| 2 — TypeScript types | Compared proposed API/query shapes and constraints with the OpenAPI contract and endpoint map | ✅ Contract definitions added; not runtime-tested or integrated into app code |
| 3 — Component specifications | Reviewed proposed component contracts against the feature specs, endpoint map, and data-contract boundaries | ✅ Specification added; no React components implemented |
| 4 — Data contract index | Reviewed links and consolidated feature requirements against the phase artifacts | ✅ Index and cross-feature guidance added; no product code changed |

No frontend or backend test/build/lint commands were run specifically for these four documentation commits, since they changed no application behavior. This statement is limited to this four-phase work and does not replace the separate Phase 3 verification results above for the earlier repository-rules work.