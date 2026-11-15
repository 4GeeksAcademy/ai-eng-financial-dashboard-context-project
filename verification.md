# Repository Verification

## 1. Verified findings

### Technologies and frameworks

- The frontend uses React and TypeScript, built and served in development with Vite. Its dependencies and scripts are declared in `frontend/package.json`.
- The backend is a FastAPI application. Backend dependencies are listed in `backend/requirements.txt`.

### Frontend and backend entry points

- Frontend: `frontend/src/main.tsx` mounts the React application; `frontend/src/App.tsx` fetches dashboard data and renders the dashboard.
- Backend: `backend/app/main.py` creates the FastAPI app and registers routes from `backend/app/routes.py`. The Docker command launches `app.main:app`.

### Services and ports

`docker-compose.yml` configures the frontend on port `5173` and backend on port `8000`, and exposes backend debug port `5678`. The README documents the frontend at `http://localhost:5173`, backend at `http://localhost:8000`, and API documentation at `http://localhost:8000/docs`.

### Frontend-to-backend communication

`frontend/src/App.tsx` fetches `/api/metrics`, optionally prefixed by `VITE_API_BASE_URL`. `frontend/vite.config.ts` proxies `/api` requests to `http://backend:8000`. The dashboard currently calls `/api/metrics`; it does not call the other defined API endpoints.

### API endpoints

The GET endpoints defined in `backend/app/routes.py` are:

- `/health`
- `/api/metrics`
- `/api/metrics/facets`
- `/api/metrics/summary`
- `/api/metrics/categories/top`
- `/api/metrics/comparison`
- `/api/metrics/alerts`
- `/api/metrics/b2b`
- `/api/metrics/b2c`

### Docker configuration

- `docker-compose.yml` builds the frontend and backend from their respective directories, maps the ports above, mounts each source directory, and declares that the frontend depends on the backend.
- `frontend/Dockerfile` uses Node 24 Alpine and starts the Vite development server on port `5173`.
- `backend/Dockerfile` uses Python 3.13 slim and starts Uvicorn with reload under debugpy on ports `8000` and `5678`.
- `README.md` documents `docker compose up --build` as the local startup command.

### Testing setup and results

- Backend tests are in `backend/tests/test_routes.py`; the backend suite was run and passed: **15 passed**.
- Frontend tests are in `frontend/src/lib/financial-utils.test.ts`, and the frontend test script is `vitest run` in `frontend/package.json`. The frontend tests were not successfully run; see Unverified items.

## 2. Incorrect claims and corrections

- The backend generates **360 mock movements** using random seed `42`, making generated random values repeatable. However, the movement dates are calculated relative to the current date in `backend/app/routes.py`; therefore, the generated date range changes over time rather than remaining fixed to a particular calendar year.
- The frontend also contains a separate hardcoded sample fixture in `frontend/src/lib/mock-data.ts`. The current dashboard in `frontend/src/App.tsx` fetches from the backend and does not import or use that fixture.

## 3. Unverified items

- Frontend tests have not been successfully run. Vitest was unavailable, and installing frontend dependencies failed because of a permissions error.
- `README.md` references `frontend/.env.example`, but that file was not found in the repository.

## 4. Runtime verification

**Manual runtime verification, reported by the user:** The user ran `docker compose up --build`; both frontend and backend started successfully. The backend received frontend requests and returned HTTP 200 responses. These runtime results are user-reported; they were not independently observed as part of this verification.

## 5. Verification method

Findings were checked against actual repository files, including `frontend/package.json`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/lib/mock-data.ts`, `frontend/vite.config.ts`, `backend/requirements.txt`, `backend/app/main.py`, `backend/app/routes.py`, `backend/tests/test_routes.py`, both Dockerfiles, `docker-compose.yml`, and `README.md`.

The evidence types are distinguished as follows:

- **Code/configuration inspection** establishes what is defined in the repository, such as entry points, routes, ports, Docker commands, and test scripts. Inspection alone does not demonstrate that the app runs.
- **Automated test result:** the backend test suite passed with 15 tests. The frontend test suite did not complete successfully because of the dependency issues listed above.
- **Manual runtime verification:** the successful Compose startup and HTTP 200 responses are reported by the user, not independently tested here.
