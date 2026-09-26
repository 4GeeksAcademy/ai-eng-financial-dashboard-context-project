# Data and Tests

- Do not assume generated movement dates belong to a fixed calendar year. Derive date expectations from the generated data or control the clock in tests.
- Add or update tests in the suite for the changed layer: Vitest for frontend utilities and pytest for backend behavior.
- Prefer assertions about calculated values, filtering, and ordering over assertions that only check response shape.
- Run the narrow relevant test first, then the corresponding lint or build check when the change affects that toolchain.

Repo anchors: `generate_mock_movements(seed=42)` creates 360 movements, while `_year_for_month()` uses `date.today()`; `financial-utils.test.ts` uses Vitest and `backend/tests/test_routes.py` uses pytest. The comparison test currently uses fixed 2025 dates.