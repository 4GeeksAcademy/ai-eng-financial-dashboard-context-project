# Backend Rules

## Scope

FastAPI endpoint definitions, generated fixture data, and backend runtime configuration.

## Rationale

The backend validates the dashboard API and generates its current data set. Endpoint and runtime changes must preserve that contract and avoid process-wide side effects.

## Project-Specific Guidance

1. Define endpoint inputs with FastAPI `Query` constraints and endpoint outputs with Pydantic response models.
   - Repository fact: `backend/app/routes.py` uses `Query` parameters and `response_model` declarations on its metrics endpoints.

2. Use a local `random.Random` instance for generated fixture data and pass it to helpers that need random values.
   - Repository fact: `backend/app/routes.py` constructs `random.Random(seed)` in `generate_mock_movements` and passes it to `_build_movement`.

3. Restrict CORS origins before deploying beyond local development.
   - Repository fact: `backend/app/main.py` currently configures `allow_origins=["*"]` and `allow_credentials=True`.
