# Backend API

## Scope

Applies to `backend/app/main.py` and `backend/app/routes.py`.

## Rules

1. Do add backend models, helpers, and HTTP handlers in `backend/app/routes.py`, and mount that router from `backend/app/main.py`.
2. Do write a new handler as a `GET` on the existing `APIRouter`, with `response_model`, `Query` parameters, and its Pydantic model in `routes.py`.
3. Do call `generate_mock_movements(seed=42)` from every metrics handler, and pass that seed explicitly.

## Rationale

- Rule 1 — F4: `main.py` builds the FastAPI app and mounts one router. Models, helpers, and handlers live in `routes.py`.
- Rule 2 — F5: Existing handlers are `GET` routes on `APIRouter` with `response_model`, `Query` parameters, and a Pydantic model in the same file.
- Rule 3 — F6, F21: Every metrics handler calls `generate_mock_movements(seed=42)`. Omitting the seed leaves the process-wide `random` module unseeded, so the dataset no longer matches the other handlers or `backend/tests/test_routes.py`.
