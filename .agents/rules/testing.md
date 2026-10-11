# Testing Rules

## Scope

Backend route coverage and frontend calculation and dashboard-behavior coverage.

## Rationale

Backend API behavior and frontend transformations are tested with different toolchains. Changes must extend the test suite at the layer where the behavior is owned.

## Project-Specific Guidance

1. Add Pytest and FastAPI `TestClient` coverage for each new backend route or supported filter combination.
   - Repository fact: `backend/tests/test_routes.py` exercises `/health`, metrics filters, B2B/B2C records, facets, summaries, categories, comparisons, and alerts using `TestClient`.

2. Add Vitest coverage whenever a frontend calculation in `frontend/src/lib/financial-utils.ts` changes.
   - Repository fact: `frontend/src/lib/financial-utils.test.ts` imports and tests `computeKPIs`, `computeMonthlyData`, `formatCurrency`, and `formatPercent`.

3. Add an `App`-level test when changing the metrics request, loading state, error state, or rendered dashboard result.
   - Repository fact: `frontend/src/App.tsx` owns these behaviors, `frontend/src/App.test.tsx` mocks `/api/metrics` and checks the rendered period, and `frontend/vite.config.ts` configures the JSDOM environment.
