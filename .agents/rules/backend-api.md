# Backend API changes

## Scope

Apply this rule when changing files under `backend/`, especially `backend/app/routes.py` and `backend/app/main.py`.

## Instructions

- Read the affected route, its Pydantic response model, and the related tests before editing.
- Preserve the existing response fields and query parameter meanings unless the task explicitly requires a contract change.
- When behavior or a response changes, update or add a focused test in `backend/tests/` for that behavior.
- Keep claims about persistence accurate: `routes.py` currently generates seeded mock movements; do not describe them as database records.
- Report which backend checks were actually run. `pytest` is present as a dependency, but do not claim a passing result unless it was executed.

## Repository evidence

- Routes and response models are in `backend/app/routes.py`.
- The application includes that router in `backend/app/main.py`.
- Endpoint tests are in `backend/tests/test_routes.py`.
- `backend/requirements.txt` includes `pytest`; it does not pin dependency versions.
