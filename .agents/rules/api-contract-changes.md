# API Contract Changes

## Purpose

Keep the FastAPI response models and the TypeScript consumer types synchronized.

## Scope

Apply this rule when changing `backend/app/routes.py`, `frontend/src/lib/financial-types.ts`, API calls, or fixtures that represent financial movements.

## Justification

`backend/app/routes.py` defines the Pydantic models and allowed literals. `frontend/src/lib/financial-types.ts` mirrors fields such as `create_date`, `operation_type`, and `business_type`. These types are not generated from a shared schema, so drift is only detected at runtime.

## Required guidance

- Preserve snake_case for fields crossing the HTTP boundary.
- When changing `operation_type`, start with the `OperationType` literal in `backend/app/routes.py` and its mirror in `frontend/src/lib/financial-types.ts`.
- When adding, renaming, or removing a field or literal, update the backend model, frontend type, backend endpoint tests, and frontend fixtures such as `frontend/src/lib/mock-data.ts` and `frontend/src/lib/financial-utils.test.ts` in the same change.
- Keep endpoint mock generation deterministic by passing an explicit seed.
- Add or update a route test in `backend/tests/test_routes.py` for changed response or filtering behavior.
- Run backend and frontend validation for cross-service contract changes.

## Validation

```bash
docker compose exec -T backend pytest -q
docker compose exec -T frontend npm test
docker compose exec -T frontend npm run build
```