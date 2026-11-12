---
name: architecture-data-flow
scope: backend/app/routes.py, frontend/src/App.tsx, frontend/src/lib/
applies_when: adding or changing an endpoint, KPI, chart or aggregation
related: [api-contracts, testing-workflow]
---

# Architecture rules

Format: **When** -> **Do** -> **Check** (a command or observable result) -> **Why** (repo fact).

### ARCH-1: Business-rule change touches both aggregators
- **When:** you change how income, outcome, profit or profit % is computed.
- **Do:** edit `computeKPIs` / `computeMonthlyData` (`frontend/src/lib/financial-utils.ts`)
  AND `summarize_movements` / `calculate_net_value` (`backend/app/routes.py`), and update
  both test files. To remove the duplication instead, make `App.tsx` fetch
  `/api/metrics/summary` and delete the client aggregation.
- **Check:** `cd frontend && npm test` and `cd backend && pytest -q` both pass, and the
  client monthly totals still equal `GET /api/metrics/summary?group_by=month`.
- **Why:** `App.tsx` calls only `/api/metrics`; `/summary` has no consumer, and the two
  implementations matched in UTC (12/12 months) at last validation.

### ARCH-2: New logic goes in a pure helper, not in the endpoint
- **When:** you add or change an endpoint in `routes.py`.
- **Do:** write the logic as a module-level function (like `filter_movements`,
  `summarize_movements`, `build_top_categories`) and keep the endpoint body to
  "generate -> filter -> call helper -> return".
- **Check:** the new helper is imported and called directly in `backend/tests/test_routes.py`.
- **Why:** `test_routes.py:6` already imports `filter_movements_by_date` and
  `generate_mock_movements` directly.

### ARCH-3: Filter parity when adding a query param
- **When:** you add a filter parameter to one endpoint.
- **Do:** run `grep -n "business_type\|category\|operation_type" backend/app/routes.py`,
  list the endpoints that logically need it, add it to each, or write in the PR why one is excluded.
- **Check:** each new param has a test case in `test_routes.py`.
- **Why:** `/api/metrics` ignores `business_type` (360 rows with and without it) while
  `/summary`, `/categories/top`, `/comparison`, `/alerts` honor it.

### ARCH-4: Tests must not hardcode dates outside the generated window
- **When:** you write a test or example that passes `start_date`/`end_date`.
- **Do:** derive dates from `generate_mock_movements(seed=42)` output (for example its
  first and last `create_date`), not from literals.
- **Check:** the test still passes if run next month.
- **Why:** `_year_for_month` (`routes.py:65-68`) follows `date.today()`; the data spans
  2025-11-01..2026-10-28 now, and `/comparison` for `2025-03-01..2025-03-31` returned all zeros.

### ARCH-5: Don't import `mock-data.ts`
- **When:** you need sample data in the frontend.
- **Do:** use the `/api/metrics` response, or build literals inside the test (as
  `financial-utils.test.ts` does). Delete `frontend/src/lib/mock-data.ts` if you touch it.
- **Check:** `grep -rn "mock-data" frontend/src` returns nothing outside the file itself.
- **Why:** nothing imports it today.

### ARCH-6: Endpoint added or removed means its test is added or removed
- **When:** you add or delete a route.
- **Do:** add one `test_<route>_...` in `test_routes.py` using `TestClient(app)`, or delete the old one.
- **Check:** `cd backend && pytest -q` count changes accordingly (15 passed at baseline).
- **Why:** each existing route has a test, for example `test_metrics_alerts_returns_anomaly_candidates`.
