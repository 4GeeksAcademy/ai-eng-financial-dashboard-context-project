# Engineering Findings and Proposed Rules

These findings are limited to behavior verified in the current repository. They are the evidence base for `.agents/rules/financial-dashboard.md`.

## Architecture and API

- The frontend currently fetches `GET /api/metrics` in `frontend/src/App.tsx`; the backend also defines facets, summary, top-category, comparison, alert, B2B, and B2C routes in `backend/app/routes.py`. **Proposed rule:** trace the UI call path and backend route separately; do not claim an API capability is exposed in the UI just because the route exists.
- Backend response models and query types are declared alongside route behavior in `backend/app/routes.py`; the frontend has its own movement and KPI types in `frontend/src/lib/financial-types.ts`. **Proposed rule:** when changing an API contract, check the backend model/route, frontend type and consumer, and the relevant route tests together.
- KPI and monthly aggregation logic is in `frontend/src/lib/financial-utils.ts`, with tests in `frontend/src/lib/financial-utils.test.ts`. **Proposed rule:** keep financial calculations in the utility layer and extend its focused tests when changing calculations.

## Testing and Developer Workflow

- `frontend/package.json` provides `test`, `lint`, and `build` scripts; backend dependencies include pytest in `backend/requirements.txt`, and route tests live in `backend/tests/test_routes.py`. **Proposed rule:** use the repository's declared checks, and run backend tests in the Docker runtime if the local Python environment is not the project's runtime.
- `docker-compose.yml` starts the frontend and backend; `frontend/vite.config.ts` proxies `/api` to `backend:8000`. **Proposed rule:** verify service wiring and ports from Compose/Vite configuration instead of inventing local URLs or environment requirements.

## Documentation and Product Claims

- `frontend/src/App.tsx` hard-codes the visible period as `2024 - Full Year`, while mock movement dates in `backend/app/routes.py` depend on `date.today()`. **Finding:** the displayed period is not evidence of the generated data range. Preserve this as a known mismatch unless a product change explicitly addresses it.
- `README.md` documents Compose startup and the optional `VITE_API_BASE_URL`; the inspected app and backend paths contain no database integration. **Proposed rule:** make product, persistence, and setup claims only when a checked-in implementation or instruction supports them; do not invent roadmap items.