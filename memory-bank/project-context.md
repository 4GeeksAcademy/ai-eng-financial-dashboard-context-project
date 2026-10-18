# Project Context

## Product

Financial Metrics Dashboard: a React interface that shows KPI totals and monthly income, outcome, and profit-margin charts from seeded mock financial movements. The backend also provides metrics, facets, summaries, top-category, comparison, alert, B2B, and B2C routes. The inspected application uses no database integration. See `frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts`, and `backend/app/routes.py`.

## Stack and Local Run

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Recharts, and Vitest (`frontend/package.json`, `frontend/vite.config.ts`).
- Backend: FastAPI and Pydantic; the container uses Python 3.13 (`backend/requirements.txt`, `backend/Dockerfile`).
- Start both services from the repository root with `docker compose up --build`. Vite proxies `/api` to `backend:8000`; set `VITE_API_BASE_URL` only when targeting a different backend origin (`docker-compose.yml`, `frontend/vite.config.ts`, `frontend/.env.example`).
- Frontend checks: from `frontend/`, run `npm test`, `npm run lint`, and `npm run build`. Backend tests: from the root, run `docker compose run --build --rm backend python -m pytest -q`.

## Current Status

- The frontend currently fetches `/api/metrics` and derives KPIs and monthly chart data locally. Additional backend routes are not currently consumed by `frontend/src/App.tsx`.
- Mock data is generated with a fixed seed, but its dates depend on `date.today()` in `backend/app/routes.py`.
- The dashboard header still displays the fixed period `2024 - Full Year`; this does not establish the mock data's date range. Tracked in `verification.md` as a known mismatch.
- Last verified in this review after a clean frontend install: 5 frontend tests passed, frontend lint and build passed, 15 backend tests passed in Docker, and `docker compose config --quiet` passed. Vite reported a config-loader warning and a large-chunk warning; backend tests reported a Starlette/httpx deprecation warning.
- The compatible frontend lockfile refresh removed high and low npm audit findings. Three moderate advisories remain in the Vitest 4.1.4 test-tooling line; addressing them requires a Vitest 5 upgrade, which was not included here.

## Evidence Policy

Only record product capabilities, persistence, integrations, and roadmap items when repository code or project documentation supports them. Do not infer UI behavior from backend route existence or invent future plans. Keep corrections and known mismatches in `verification.md` and refresh this status after relevant code changes.