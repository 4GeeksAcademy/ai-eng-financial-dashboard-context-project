# Engineering Findings and Proposed Rules

## Architecture

### Keep financial transformations outside UI components

- **Repository fact:** `frontend/src/App.tsx` fetches movements, while `frontend/src/lib/financial-utils.ts` computes KPIs and monthly series. The utility behavior is covered by `frontend/src/lib/financial-utils.test.ts`.
- **Risk:** Moving calculations into dashboard components would duplicate business logic and bypass the existing unit-test boundary.
- **Proposed rule:** Put reusable financial calculations in `frontend/src/lib/financial-utils.ts` (or another focused module under `frontend/src/lib`) and add or update Vitest cases before wiring results into components.

### Preserve deterministic mock data

- **Repository fact:** Backend endpoints in `backend/app/routes.py` call `generate_mock_movements(seed=42)`, and `backend/tests/test_routes.py` asserts stable filtering and grouping behavior.
- **Risk:** Removing the fixed seed from request paths would make API behavior and tests nondeterministic.
- **Proposed rule:** Keep endpoint mock generation deterministic. Any change to generation logic must retain an explicit seed in API paths and update backend tests for the changed behavior.

## Naming and API contracts

### Update both sides of the financial movement contract

- **Repository fact:** Python literals and Pydantic models in `backend/app/routes.py` are mirrored by TypeScript types in `frontend/src/lib/financial-types.ts`. API fields use snake case, including `create_date`, `operation_type`, and `business_type`.
- **Risk:** Changing a field or allowed literal on only one side can produce runtime data mismatches that TypeScript cannot detect across HTTP.
- **Proposed rule:** When changing financial fields or literals, update backend models, frontend types, endpoint tests, and frontend fixtures in the same change. Preserve API snake_case unless both producer and consumer are migrated together.

### Keep the frontend alias configuration synchronized

- **Repository fact:** `@/*` maps to `frontend/src/*` in both `frontend/tsconfig.app.json` and `frontend/vite.config.ts`.
- **Risk:** Editing only one alias definition can make development resolution differ from TypeScript compilation.
- **Proposed rule:** Treat the TypeScript and Vite alias definitions as one contract; change and validate both together.

## Testing

### Run checks for the service being changed

- **Repository fact:** Backend behavior is tested with pytest in `backend/tests`; frontend calculations are tested with Vitest, and scripts for test, lint, and build are defined in `frontend/package.json`.
- **Risk:** Running only one service's suite misses failures in the other service or in the shared API assumptions.
- **Proposed rule:** For backend changes, run `pytest -q`. For frontend changes, run `npm test`, `npm run lint`, and `npm run build`. For API contract changes, run both backend and frontend checks.

## Documentation

### Keep execution documentation evidence-based

- **Repository fact:** `README.md` and `README.es.md` document Docker Compose startup, published URLs, and the Vite proxy. `verification.md` records that the proxy returned HTTP 502 during the verified run even though direct service URLs returned HTTP 200.
- **Risk:** Repeating configured behavior as confirmed runtime behavior would hide known uncertainty.
- **Proposed rule:** Update both README languages when startup, ports, environment variables, or service connections change. Distinguish configuration facts from runtime observations and retain unresolved limitations in `verification.md` or the current project-status memory.

## Developer experience and operations

### Verify readiness instead of relying on container start order

- **Repository fact:** `docker-compose.yml` uses `depends_on` but defines no health check. The phase 1 run observed a working backend health endpoint and a failing frontend proxy request.
- **Risk:** A running container or declared dependency does not prove that the complete frontend-to-backend path is usable.
- **Proposed rule:** After Compose changes, validate `GET /health`, the frontend root, and an `/api/metrics` request through the frontend proxy. Do not report the stack healthy when only container status or direct backend access has been checked.