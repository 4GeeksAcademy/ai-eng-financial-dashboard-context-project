# Testing

## Scope

Applies to `backend/tests/conftest.py`, `backend/tests/test_routes.py`, `frontend/src/lib/financial-utils.test.ts`, and `frontend/package.json`. A change to the fetch in `frontend/src/App.tsx` is outside the Vitest file.

## Rules

1. Do name backend tests `test_*` in `backend/tests/test_routes.py`. Do place a frontend unit test next to its module as `*.test.ts`.
2. Do test HTTP handlers with `TestClient` against `app` from `app.main`, and test helpers by calling them directly.
3. Do test frontend calculations with Vitest and an in-file fixture. Do run them with `npm test` (`vitest run`).
4. Never treat a passing comparison test as proof that a fixed calendar range contains rows. Generated dates move with `date.today()`.
5. Do check the `fetch` in `App.tsx` yourself after changing it. The Vitest file does not call it.

## Rationale

- Rule 1 — F10: Backend tests are `test_*` functions in `backend/tests/test_routes.py`. The frontend test sits beside its module as `financial-utils.test.ts`.
- Rule 2 — F11: Backend tests use `TestClient` on `app` and also call `generate_mock_movements` and `filter_movements_by_date` directly. `conftest.py` puts the backend root on `sys.path`.
- Rule 3 — F12: Frontend tests are Vitest `describe` / `it` blocks fed by an in-file `sampleMovements` array. `package.json` runs them with `vitest run`.
- Rule 4 — F25: `test_metrics_comparison_returns_delta_fields` uses the fixed range `2025-03-01` through `2025-03-31` and only checks JSON keys, while movement dates come from `date.today()`.
- Rule 5 — F26: The Vitest file covers `computeKPIs` and `computeMonthlyData` only. It does not call the `fetch` in `App.tsx`.
