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

- Backend tests are in `backend/tests/test_routes.py`; running `python -m pytest -q` from the repository root passed: **15 passed** (one Starlette deprecation warning).
- Frontend tests are in `frontend/src/lib/financial-utils.test.ts`, and the frontend test script is `vitest run` in `frontend/package.json`. The frontend tests were not successfully run; see Unverified items.

## 2. Incorrect claims and corrections

- **Incorrect claim:** the backend data is for a fixed calendar year. **Correction:** `backend/app/routes.py` generates **360 mock financial movements** (30 for each month) using random seed `42`, but calculates their dates relative to the current date, so the date range changes over time.
- **Incorrect claim:** the dashboard uses the frontend's mock-data fixture. **Correction:** `frontend/src/lib/mock-data.ts` contains a separate sample fixture, but `frontend/src/App.tsx` fetches from the backend and does not import or use it.

## 3. Unverified items

- Frontend tests have not been successfully run. Vitest was unavailable, and installing frontend dependencies failed because of a permissions error.
- `README.md` references `frontend/.env.example`; it was reported as not found during Phase 1 verification. Its presence could not be independently rechecked in this pass because access was blocked by the organization's content exclusion policy.

## 4. Runtime verification

**Manual runtime verification, reported by the user:** The user ran `docker compose up --build`; both frontend and backend started successfully. The backend received frontend requests and returned HTTP 200 responses. These runtime results are user-reported; they were not independently observed as part of this verification.

## 5. Verification method

Findings were checked against actual repository files, including `frontend/package.json`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/lib/mock-data.ts`, `frontend/vite.config.ts`, `backend/requirements.txt`, `backend/app/main.py`, `backend/app/routes.py`, `backend/tests/test_routes.py`, both Dockerfiles, `docker-compose.yml`, and `README.md`.

The evidence types are distinguished as follows:

- **Code/configuration inspection** establishes what is defined in the repository, such as entry points, routes, ports, Docker commands, and test scripts. Inspection alone does not demonstrate that the app runs.
- **Automated testing:** `python -m pytest -q` passed with **15 passed** and one deprecation warning. The frontend test suite did not complete successfully because of the dependency issues listed above.
- **Manual runtime verification:** the successful Compose startup and HTTP 200 responses are reported by the user, not independently tested here.

## 6. Phase 2: Categorized repository findings

This section groups repository observations and verification results. It contains no proposed rules or recommendations.

### Architecture

- The frontend uses React and TypeScript with Vite (`frontend/package.json`); the backend is a FastAPI application (`backend/app/main.py`, `backend/requirements.txt`).
- `frontend/src/main.tsx` mounts the React application. `frontend/src/App.tsx` fetches `/api/metrics` (optionally prefixed by `VITE_API_BASE_URL`) and renders the dashboard.
- `backend/app/main.py` creates the FastAPI app and registers routes from `backend/app/routes.py`. The backend defines `/health` and eight `/api/metrics...` GET routes. The dashboard currently calls only `/api/metrics`.
- `frontend/vite.config.ts` proxies `/api` requests to `http://backend:8000`. `docker-compose.yml` builds both services, maps frontend port `5173` and backend port `8000`, exposes debug port `5678`, mounts the source directories, and declares frontend dependency on backend.
- `frontend/src/lib/mock-data.ts` contains a separate sample fixture; `frontend/src/App.tsx` fetches backend data and does not import the fixture.
- **Risk — data generation:** `generate_mock_movements` in `backend/app/routes.py` calls `random.seed(seed)` when a seed is supplied, modifying Python's process-global random state. It generates movement dates relative to `date.today()`.
- **Risk — date consistency:** `frontend/src/App.tsx` displays the hard-coded period `2024 - Full Year`, while `backend/app/routes.py` generates movement dates relative to the current date.

### Naming

- Backend request values are represented by domain-specific `Literal` aliases named `OperationType`, `Category`, `BusinessType`, and `GroupBy` in `backend/app/routes.py`.
- Backend response models in `backend/app/routes.py` use descriptive names, including `MetricsSummaryItem`, `TopCategoryItem`, and `MetricsComparison`. Frontend dashboard components use PascalCase names and kebab-case filenames under `frontend/src/components/dashboard/` (for example, `DashboardHeader` in `dashboard-header.tsx`).
- The `@/` import alias in `frontend/vite.config.ts` resolves to `frontend/src/`; frontend imports use this alias in `frontend/src/App.tsx`.

### Testing

- Backend tests are in `backend/tests/test_routes.py` and use FastAPI's `TestClient`. Running `python -m pytest -q` from the repository root passed with 15 tests and one Starlette deprecation warning.
- Frontend utility tests are in `frontend/src/lib/financial-utils.test.ts`; `frontend/package.json` defines `vitest run` as the test command. The frontend suite did not complete during Phase 1 because Vitest was unavailable and dependency installation failed with a permissions error.
- The backend test file covers mock generation, date and query filtering, endpoint responses, and summary/comparison/alert behavior. The frontend tests cover KPI calculations, monthly aggregation, and formatting.

### Documentation

- `README.md` documents the local service URLs (`http://localhost:5173`, `http://localhost:8000`, and `http://localhost:8000/docs`) and the `docker compose up --build` startup command.
- `README.md` references `frontend/.env.example`. The file was reported as not found during Phase 1, but its presence could not be independently rechecked because access was blocked by the organization's content exclusion policy; its status remains unverified.
- This verification record is the evidence source for the findings and verification status summarized in Phase 1; runtime startup and HTTP 200 results are explicitly identified there as user-reported.

### Developer Experience (DX)

- `frontend/package.json` defines `dev`, `build`, `lint`, `test`, `test:watch`, and `test:coverage` scripts. `backend/Dockerfile` launches Uvicorn with reload under debugpy; `frontend/Dockerfile` starts the Vite development server.
- `docker-compose.yml` provides the documented local startup setup. The successful `docker compose up --build` and HTTP 200 responses are user-reported, not independently observed in this verification.
- **Observed issue:** The `.catch()` handler in `frontend/src/App.tsx` discards the caught fetch error and displays the same generic message for failures.

### Security

- **Configuration/risk:** `backend/app/main.py` configures CORS with `allow_origins=["*"]` and `allow_credentials=True`. This is the configuration present in the repository; deployment suitability was not established by the available evidence.

## Proposed Development Rules

These are recommendations for future contributors and AI coding agents, derived from the repository patterns cited below. They are proposed rules, not requirements currently enforced by the project.

### 1. Architecture

**Category: Architecture**

**Proposed Rule:** Add dashboard components under `frontend/src/components/dashboard/` and frontend shared types or calculation helpers under `frontend/src/lib/`, following the existing separation.

**Repository Evidence:** `frontend/src/App.tsx` imports dashboard components from `@/components/dashboard/` and financial types/helpers from `@/lib/`; existing examples include `frontend/src/components/dashboard/dashboard-header.tsx` and `frontend/src/lib/financial-utils.ts`.

**Reason:** Keeps new frontend code in the same feature and shared-logic locations used by the current application.

**Category: Architecture**

**Proposed Rule:** Add backend API routes and their request/response models alongside the existing routes in `backend/app/routes.py`; register routers with the FastAPI application in `backend/app/main.py`.

**Repository Evidence:** `backend/app/routes.py` defines the existing endpoints, `Literal` request types, and Pydantic response models. `backend/app/main.py` imports and registers `router`.

**Reason:** This follows the current boundary between route definitions and application setup.

**Category: Architecture**

**Proposed Rule:** For frontend API calls, preserve the `/api` path convention, account for `VITE_API_BASE_URL`, and keep endpoint response data consistent with the backend's Pydantic models and matching frontend types.

**Repository Evidence:** `frontend/src/App.tsx` fetches `${API_BASE_URL}/api/metrics`; `frontend/vite.config.ts` proxies `/api` to `http://backend:8000`; `backend/app/routes.py` defines `FinancialMovement` as the response model and `frontend/src/lib/financial-types.ts` defines the corresponding `FinancialMovement` type. `backend/tests/test_routes.py` checks response keys for summary, comparison, and alert routes.

**Reason:** Changes to paths or response fields affect the frontend/backend boundary and existing consumers.

**Category: Architecture**

**Proposed Rule:** When changing seeded mock-data generation, preserve its repeatable results and avoid affecting unrelated consumers of Python's process-global random state; use an isolated generator if changing the implementation.

**Repository Evidence:** `generate_mock_movements` in `backend/app/routes.py` calls `random.seed(seed)` and uses module-level random functions; the route tests call it with `seed=42`.

**Reason:** The current implementation makes the output reproducible for a given seed but also changes shared random state.

### 2. Naming

**Category: Naming**

**Proposed Rule:** Follow the observed language-specific naming patterns: Python modules, functions, and helpers use `snake_case`; backend Pydantic classes, React components, and TypeScript types use `PascalCase`; TypeScript functions and local variables use `camelCase`; and module-level constants use `UPPER_SNAKE_CASE`.

**Repository Evidence:** `backend/app/routes.py` uses `generate_mock_movements`, `filter_movements`, and `FinancialMovement`; `frontend/src/App.tsx` uses `fetchFinancialData` and `API_BASE_URL`, imports `DashboardHeader`, and defines `App`; `frontend/src/lib/financial-utils.ts` uses camelCase helper names.

**Reason:** Consistent names make the language and role of symbols recognizable throughout both applications.

**Category: Naming**

**Proposed Rule:** For frontend dashboard component files, use the existing kebab-case filename pattern and PascalCase exported component names.

**Repository Evidence:** `frontend/src/components/dashboard/dashboard-header.tsx` exports `DashboardHeader`; sibling files include `income-outcome-chart.tsx`, `kpi-card.tsx`, and `profit-percent-chart.tsx`.

**Reason:** This matches the concrete file and component naming pattern in the dashboard directory.

### 3. Testing

**Category: Testing**

**Proposed Rule:** Add backend endpoint and helper tests to `backend/tests/test_routes.py` using FastAPI `TestClient`, and run `python -m pytest -q` from the repository root.

**Repository Evidence:** `backend/tests/test_routes.py` imports and instantiates `TestClient`; the repository verification records that `python -m pytest -q` passed 15 tests.

**Reason:** Reuses the existing backend test setup and documented command.

**Category: Testing**

**Proposed Rule:** Add frontend calculation tests alongside the existing utility tests in `frontend/src/lib/financial-utils.test.ts` using Vitest, and run them with `npm test` from `frontend/`.

**Repository Evidence:** `frontend/src/lib/financial-utils.test.ts` uses Vitest; `frontend/package.json` defines `"test": "vitest run"`.

**Reason:** Keeps utility behavior tests with the existing suite and invokes the repository's configured test runner.

**Category: Testing**

**Proposed Rule:** When changing date filters or API response structures, cover the existing inclusive date boundaries and response fields in route tests; when changing dashboard calculations, cover totals, edge cases, and chronological monthly aggregation.

**Repository Evidence:** `backend/tests/test_routes.py::test_filter_movements_by_date_includes_range_edges` checks inclusive range edges, and summary/comparison/alert tests assert response keys. `frontend/src/lib/financial-utils.test.ts` tests KPI calculations, zero-income behavior, and cross-year monthly ordering.

**Reason:** These tests exercise observable contract and calculation behaviors that could regress when related logic changes.

### 4. Documentation

**Category: Documentation**

**Proposed Rule:** When changing local setup commands, service URLs, or frontend environment-variable instructions, update the corresponding instructions in both `README.md` and `README.es.md`.

**Repository Evidence:** Both README files document `docker compose up --build`, service URLs, and the `VITE_API_BASE_URL` setup; each links to the other language's instructions.

**Reason:** Keeps the English and Spanish setup documentation aligned with the actual workflow.

**Category: Documentation**

**Proposed Rule:** If adding standalone AI-agent rule files, use the `.agents/rules/<rule-name>.md` location described in the README's expected agent directory structure; do not assume that directory currently exists.

**Repository Evidence:** `README.md` documents `.agents/rules/<rule-name>.md` as the expected structure. The `.agents` directory was not present when this verification was performed.

**Reason:** Uses the documented destination while distinguishing the documented expectation from current repository contents.

### 5. Developer Experience (DX)

**Category: Developer Experience (DX)**

**Proposed Rule:** Use `docker compose up --build` from the repository root as the documented workflow for starting the full local application.

**Repository Evidence:** `README.md` documents this command; `docker-compose.yml` builds and connects the frontend and backend services.

**Reason:** The Compose workflow starts both configured services with their expected ports and development configuration.

**Category: Developer Experience (DX)**

**Proposed Rule:** Use the dependency installation sources already defined for each service: the frontend package manifest and lockfile, and `backend/requirements.txt`; container builds install dependencies from those files.

**Repository Evidence:** `frontend/Dockerfile` copies `package*.json` and runs `npm install`; `backend/Dockerfile` installs from `requirements.txt` using `pip install -r requirements.txt`.

**Reason:** These are the repository's concrete dependency declarations and installation steps for the two services.

**Category: Developer Experience (DX)**

**Proposed Rule:** For an API request failure, retain the non-OK response check and visible error state when changing request handling; if changing diagnostics, avoid losing the caught error without replacing that behavior with another documented diagnostic path.

**Repository Evidence:** `frontend/src/App.tsx::fetchFinancialData` throws when `response.ok` is false, and the `.catch()' handler displays an error message, although it currently discards the caught error.

**Reason:** Preserves the existing user-visible failure handling while making clear that the current message does not expose diagnostic details.

**Category: Developer Experience (DX)**

**Proposed Rule:** When investigating a frontend request that does not reach the backend, check the configured `VITE_API_BASE_URL` and the Vite `/api` proxy target before attributing the failure to endpoint logic.

**Repository Evidence:** `frontend/src/App.tsx` builds the request from `VITE_API_BASE_URL`; `frontend/vite.config.ts` proxies `/api` to `http://backend:8000`; `README.md` documents the local proxy and override.

**Reason:** These settings determine the request's backend origin in local development.

### 6. Security

**Category: Security**

**Proposed Rule:** Review the CORS settings in `backend/app/main.py` before changing backend cross-origin behavior; do not broaden them without checking the intended deployment access policy.

**Repository Evidence:** `backend/app/main.py` currently sets `allow_origins=["*"]`, `allow_credentials=True`, and allows all methods and headers.

**Reason:** The existing policy is broad, and repository evidence does not establish that it is suitable for every deployment.

### Examples not included as rules

- No rule prohibits modifying lockfiles, configuration files, or generated files: the repository contains `frontend/package-lock.json`, but the inspected evidence does not establish a policy against modifying it.
- No custom request-header policy is proposed: the inspected frontend fetch uses no explicit headers, so there is no repository-specific header behavior to preserve.
