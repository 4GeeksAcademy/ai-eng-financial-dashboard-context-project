# Current Status

## What Works

- The Compose configuration defines a frontend service on port `5173` and a backend service on port `8000`, with debugpy on `5678`.
- The frontend fetches `/api/metrics` through the Vite proxy, derives the displayed period from the response, and has utility and App-level tests.
- Backend route tests cover health, metrics filters, B2B/B2C data, facets, summaries, top categories, comparisons, and alerts.
- Latest local validation completed successfully: frontend production build passed; Vitest reported `8 passed`; backend Pytest reported `16 passed`; `git diff --check` passed.

## Known Gaps and Constraints

- The backend generates mock financial movements in memory; no database or persistence service is defined in `docker-compose.yml` or `backend/requirements.txt`.
- `backend/app/main.py` permits all CORS origins with credentials, which is appropriate only for unrestricted development use.
- The latest frontend build emitted Vite warnings about `__dirname` in `frontend/vite.config.ts` and a JavaScript output chunk larger than 500 kB.
- The latest backend test run emitted a Starlette deprecation warning for the FastAPI `TestClient` dependency path.

## Evidence-Backed Next Priorities

These are maintenance priorities inferred from current implementation and validation; no product roadmap is documented in this repository.

1. Define whether financial movements require persistence before adding a database, because `backend/app/routes.py` currently generates mock data.
2. Set allowed CORS origins before deploying beyond local development, because `backend/app/main.py` uses `allow_origins=["*"]` with credentials.
3. Resolve the observed Vite config-loader and large-chunk warnings before treating the frontend build configuration as production-ready.
4. Review the backend test-client dependency warning during the next dependency update.

## Validation Commands

- Frontend: `npm run build` and `npm test` from `frontend/` after dependencies are installed.
- Backend: `pytest tests/test_routes.py` from `backend/` after installing `backend/requirements.txt`.
- Patch hygiene: `git diff --check` from the repository root.
