# Testing rules

- **Backend:** tests are in `backend/tests/test_routes.py`, using
  `TestClient(app)`. `backend/tests/conftest.py` inserts `backend/` into
  `sys.path`, so run `pytest` from `backend/`. The file has a test for each
  endpoint (e.g. `test_metrics_alerts_returns_anomaly_candidates`): add one when
  you add an endpoint, and delete its test when you delete an endpoint.
- `test_generate_mock_movements_returns_full_year_sorted_data`
  (`test_routes.py:12-16`) asserts `len(movements) == 360` (12 months x 30).
  Changing the generator means updating it.
- **Frontend:** tests are colocated (`frontend/src/lib/financial-utils.test.ts`)
  and run with `npm test` (`"test": "vitest run"`, `package.json`). Test new
  `lib/` logic the same way.
- Report which of `pytest`, `npm test`, `npm run lint`, `npm run build` you
  actually ran; mark the rest as not run, as in `memory-bank/verification.md`.
