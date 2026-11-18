# Phase 2 proposed rules

## Findings

### Conventions

#### Architecture

- **F1.** The app is two Compose services: `frontend` (build `./frontend`) and `backend` (build `./backend`), with the frontend waiting on the backend. `docker-compose.yml` lines 2–12 and 14–16.
- **F2.** Screen pieces live in `frontend/src/components/dashboard/`, shared primitives in `frontend/src/components/ui/`, and domain types plus calculations in `frontend/src/lib/`. `frontend/src/App.tsx` lines 2–11.
- **F3.** Imports inside `src` use the `@/` alias, mapped to `./src/*`. `frontend/tsconfig.app.json` lines 12–14, `frontend/vite.config.ts` lines 18–21, `frontend/components.json` lines 13–18.
- **F4.** The backend package is `backend/app/`. `main.py` builds the FastAPI app and mounts one router; models, helpers, and handlers stay in `routes.py`. `backend/app/main.py` lines 1–14.
- **F5.** Each handler is a `GET` on `APIRouter`, with a `response_model`, `Query` parameters, and a Pydantic model defined in the same file. `backend/app/routes.py` lines 19, 22–27, and 248–254.
- **F6.** Every metrics handler builds its data with `generate_mock_movements(seed=42)`. `backend/app/routes.py` lines 255, 264, 277, 295, 311, 350, 370, and 386.
- **F7.** The page loads one endpoint, `GET /api/metrics`, then derives KPIs and monthly points in the browser with `computeKPIs` and `computeMonthlyData`. `frontend/src/App.tsx` lines 15–16 and 31–33.

#### Naming

- **F8.** Dashboard files are kebab-case and export a PascalCase function (`dashboard-header.tsx` exports `DashboardHeader`). `frontend/src/components/dashboard/dashboard-header.tsx` line 7. `App` is the default export. `frontend/src/App.tsx` line 74.
- **F9.** Wire types match the API in snake_case (`create_date`, `operation_type`, `business_type`). Values computed in the browser are camelCase (`totalIncome`, `profitPercent`). `frontend/src/lib/financial-types.ts` lines 5–17.
- **F10.** Backend test functions are `test_*` in `backend/tests/test_routes.py`. The frontend test sits beside its module as `frontend/src/lib/financial-utils.test.ts`.

#### Testing

- **F11.** Backend tests import `app` from `app.main`, call it with `TestClient`, and also call `generate_mock_movements` and `filter_movements_by_date` directly. `backend/tests/conftest.py` lines 4–6 puts the backend root on `sys.path`. `backend/tests/test_routes.py` lines 5–9 and 12–13.
- **F12.** Frontend tests are Vitest `describe` / `it` blocks fed by an in-file `sampleMovements` array, with no `fetch`. `frontend/src/lib/financial-utils.test.ts` lines 1–16 and 35–36. The script is `"test": "vitest run"` in `frontend/package.json` line 11.

#### Documentation

- **F13.** `README.md` and `README.es.md` both document `docker compose up --build`, port 5173, and port 8000. `README.md` lines 41–50. `README.es.md` lines 41–50.

#### Developer experience (DX)

- **F14.** Compose bind-mounts `./frontend` and `./backend` over `/app`, and the backend process is started with `--reload`. `docker-compose.yml` lines 8–9 and 21–22. `backend/Dockerfile` line 12.
- **F15.** Local API calls go through the Vite proxy. `VITE_API_BASE_URL` is blank in `frontend/.env.example` line 4, and `frontend/src/App.tsx` line 13 falls back to `""`. The proxy target is `http://backend:8000` in `frontend/vite.config.ts` lines 11–15.
- **F16.** Dashboard components take a `loading` prop and render `Skeleton` while it is set. `frontend/src/components/dashboard/kpi-card.tsx` lines 12 and 37–48.
- **F17.** TypeScript fails the frontend build on unused locals and unused parameters. `frontend/tsconfig.app.json` lines 22–23.

### Risky patterns

#### Architecture

- **F18.** The badge is the hardcoded string `"2024 - Full Year"`. `frontend/src/App.tsx` line 49. The backend dates each movement from `date.today()`: months before the current month use this year, and the current month and later use last year. `backend/app/routes.py` lines 65–68, 75, and 97. The charts follow that rolling window, so the badge does not describe the data.
- **F19.** `frontend/src/lib/mock-data.ts` exports `mockMovements` dated entirely in 2024 (line 3 onward). Nothing else imports that module. The page reads the API instead (`frontend/src/App.tsx` line 16). Using `mock-data.ts` as the data source would show a different year from the API.
- **F20.** The UI never calls `/api/metrics/facets`, `/summary`, `/categories/top`, `/comparison`, `/alerts`, `/b2b`, or `/b2c`. Those handlers exist only in `backend/app/routes.py` lines 262–390. The browser’s only call is `frontend/src/App.tsx` line 16. Changing an unused endpoint does not change the dashboard, and changing the `/api/metrics` payload does.
- **F21.** `generate_mock_movements` reseeds the process-wide `random` module when a seed is passed, and leaves it unseeded when `seed` is omitted. `backend/app/routes.py` lines 94–96. A new handler that omits `seed=42` will not match the dataset the other handlers and `backend/tests/test_routes.py` line 13 depend on.
- **F22.** CORS is configured with `allow_origins=["*"]` and `allow_credentials=True` together. `backend/app/main.py` lines 7–12. The default UI avoids that middleware by using the Vite proxy (`frontend/vite.config.ts` lines 11–15).

#### Naming

- **F23.** Dashboard and UI files use single quotes and no semicolons (`frontend/src/components/dashboard/kpi-card.tsx` lines 1–3). `App.tsx`, `financial-utils.ts`, and the Vitest file use double quotes and semicolons (`frontend/src/App.tsx` lines 1–11). Copying the nearest file produces a different style.
- **F24.** The load-error text is Spanish (`"No se pudo cargar la informacion financiera..."`) while the visible labels are English. `frontend/src/App.tsx` lines 36–38. `frontend/src/components/dashboard/dashboard-header.tsx` lines 16–17.

#### Testing

- **F25.** `test_metrics_comparison_returns_delta_fields` requests the fixed range `2025-03-01` through `2025-03-31` and only checks the JSON keys. `backend/tests/test_routes.py` lines 157–170. Generated dates move with `date.today()` (`backend/app/routes.py` lines 65–68 and 97), so that March 2025 window can contain no rows while the test still passes.
- **F26.** Frontend tests cover `computeKPIs` and `computeMonthlyData` only. `frontend/src/lib/financial-utils.test.ts` lines 35 and 63. There is no test for the `fetch` in `frontend/src/App.tsx` lines 15–20.

#### Documentation

- **F27.** `AGENTS.md` lines 6–13 tell agents to read `./.agents/rules`, `./.agents/skills`, and `./memory-bank`. Those paths are not in the repo.

#### Developer experience (DX)

- **F28.** The backend command always starts debugpy on `0.0.0.0:5678` before uvicorn. `backend/Dockerfile` lines 10–12. Compose publishes `5678:5678`. `docker-compose.yml` line 20. `README.md` lines 48–50 list 5173 and 8000 and do not mention 5678.
- **F29.** `backend/requirements.txt` lines 1–6 name `fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov`, and `httpx` with no version pins.
- **F30.** `/health` is registered at the app root. `backend/app/routes.py` lines 243–245. The dev proxy only forwards paths starting with `/api`. `frontend/vite.config.ts` lines 11–14. A frontend request to `/health` stays on the Vite server.

## Proposed rules

### Architecture

- Keep the running app as the `frontend` and `backend` Compose services, with `frontend` depending on `backend`. (F1)
- Put screen components in `frontend/src/components/dashboard/`, shared primitives in `frontend/src/components/ui/`, and domain types and calculations in `frontend/src/lib/`. (F2)
- Import modules under `frontend/src` through the `@/` alias. (F3)
- Add backend models, helpers, and HTTP handlers in `backend/app/routes.py`, and mount that router from `backend/app/main.py`. (F4)
- Write a new handler as a `GET` on the existing `APIRouter`, with `response_model`, `Query` parameters, and its Pydantic model in `routes.py`. (F5)
- Call `generate_mock_movements(seed=42)` from every metrics handler, and pass that seed explicitly. (F6, F21)
- Keep the dashboard’s data load as `GET /api/metrics`, then `computeKPIs` and `computeMonthlyData` in the browser. (F7, F20)
- Leave `frontend/src/lib/mock-data.ts` unused by the page. The screen reads `/api/metrics`. (F19)
- Treat the `"2024 - Full Year"` badge and the backend dates as separate: the badge is fixed in `App.tsx`, and movement dates come from `date.today()` in `routes.py`. (F18)
- Keep browser API calls on the Vite `/api` proxy. The CORS setup allows every origin and credentials together. (F15, F22)

### Naming

- Name a dashboard component file in kebab-case and export a PascalCase function. Leave `App` as the default export. (F8)
- Use snake_case for fields that match the API, and camelCase for values computed in the browser. (F9)
- Name backend tests `test_*` in `backend/tests/test_routes.py`. Place a frontend unit test next to its module as `*.test.ts`. (F10)
- Match the file you edit: dashboard and UI files use single quotes and no semicolons; `App.tsx`, `financial-utils.ts`, and the Vitest file use double quotes and semicolons. (F23)
- Keep dashboard labels in English. The fetch error string in `App.tsx` is Spanish. (F24)

### Testing

- Test HTTP handlers with `TestClient` against `app` from `app.main`, and test helpers by calling them directly. (F11)
- Test frontend calculations with Vitest and an in-file fixture, run by `npm test` (`vitest run`). (F12)
- Do not treat a passing comparison test as proof that a fixed calendar range contains rows. Generated dates move with `date.today()`. (F25)
- After changing the `fetch` in `App.tsx`, check it yourself. The Vitest file does not call it. (F26)

### Documentation

- When you change the run command or ports 5173 and 8000, update both `README.md` and `README.es.md`. (F13)
- Do not read `./.agents/rules`, `./.agents/skills`, or `./memory-bank` as if they were present. `AGENTS.md` names them, and they are not in the repo. (F27)
- When you list published ports from the README, list 5173 and 8000. Port 5678 is the debugger in the backend image, and the README does not mention it. (F13, F28)

### Developer experience (DX)

- Keep the `./frontend` and `./backend` bind mounts, and keep uvicorn’s `--reload` flag, when changing the dev containers. (F14)
- Leave `VITE_API_BASE_URL` empty so the browser uses the Vite proxy to `http://backend:8000`. (F15)
- Give a dashboard component a `loading` prop and render `Skeleton` while it is set. (F16)
- Remove unused locals and unused parameters in frontend TypeScript. The app tsconfig fails the build on them. (F17)
- Keep the backend command starting debugpy on `0.0.0.0:5678` and keep Compose publishing `5678:5678`. (F28)
- Add a Python dependency to `backend/requirements.txt` as a name with no version pin, matching the current file. (F29)
- Call `/health` on the backend origin. The Vite proxy forwards only paths that start with `/api`. (F30)
