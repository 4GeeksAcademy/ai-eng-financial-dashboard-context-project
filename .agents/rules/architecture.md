# Architecture rules

- **Aggregation lives in one place.** `computeKPIs` / `computeMonthlyData`
  (`frontend/src/lib/financial-utils.ts`) duplicate what
  `GET /api/metrics/summary` (`backend/app/routes.py`) already computes.
  When you change a business rule (e.g. how profit % is defined), change both
  and their tests, or move the frontend onto the endpoint.
  *Fact:* `App.tsx` calls only `/api/metrics` (single `fetch`), so `/summary`
  has no consumer.
- **Endpoints stay thin.** Put logic in the pure helpers in `routes.py`
  (`filter_movements`, `summarize_movements`, `build_top_categories`, ...) and
  have the endpoint call them. *Fact:* `test_routes.py:6` imports
  `filter_movements_by_date` and `generate_mock_movements` directly.
- **Mock data is regenerated per request.** Every data endpoint calls
  `generate_mock_movements(seed=42)` (`/health` does not). Amounts/categories
  are fixed by the seed; each date's year follows `date.today()`
  (`_year_for_month`, `routes.py:65-68`).
- **Filter parity.** `/api/metrics` has no `business_type` param;
  `/summary`, `/categories/top`, `/comparison`, `/alerts` do. When adding a
  filter, add it to every endpoint it logically applies to, or note why not.
- **Dead code:** `frontend/src/lib/mock-data.ts` is imported nowhere in
  `frontend/src` (grep: no matches). Remove it rather than extending it.
