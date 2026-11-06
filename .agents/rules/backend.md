# Backend

Applies to `backend/`. Stack: FastAPI on Python 3.13, with Pydantic models.

## Structure

- `app/main.py` creates the app, adds CORS and includes the router. Keep it minimal.
- `app/routes.py` holds the models, the helpers and the handlers.

## Handlers

- Declare `response_model` and a return type on every route.
- Declare query parameters with `Query(...)`, and add bounds where they apply,
  as in `limit: int = Query(default=5, ge=1, le=20)`.
- Express closed sets with the existing `Literal` aliases (`OperationType`,
  `Category`, `BusinessType`, `GroupBy`) so FastAPI rejects bad values with a 422.
- Keep handlers thin: get the movements, filter them, call a helper, return.
- Put calculations in pure helpers that take and return plain data, so they can
  be tested without HTTP.

## Data

- There is no database. Handlers get their data from
  `generate_mock_movements(seed=42)`. Keep `seed=42` so all endpoints agree.
- Do not hardcode years or dates in code or assertions. Generated dates roll
  with today's date: the 12 full months before the current one.
- Reuse `filter_movements` and `filter_movements_by_date`. Date ranges include
  both ends.
- Round money totals with `round(value, 2)`.

## Tests

- Tests live in `backend/tests/test_routes.py` and use `TestClient`.
- Add a test for each new route or helper. Assert on calculated values, not only
  on the status code and response keys.
