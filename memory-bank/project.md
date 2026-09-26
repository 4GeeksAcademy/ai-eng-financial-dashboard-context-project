# Project Memory

## Product

Financial metrics dashboard with KPI cards for income, outcome, profit, and profit margin, plus monthly charts. It currently uses generated sample data, not a database or external financial source.

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Vitest.
- Backend: FastAPI, Pydantic, Uvicorn, pytest.
- Local orchestration: Docker Compose; frontend port 5173, backend port 8000.

## Current Status

- FastAPI generates 360 seeded movements. Values and categories are reproducible, but assigned years depend on the current date.
- The frontend consumes `GET /api/metrics` (with optional `start_date`/`end_date` from the home date range filter, Feature 1), `GET /api/metrics/facets`, and `GET /api/metrics/alerts` (anomaly table with debounced threshold input, Feature 2); API calls live in `frontend/src/lib/api.ts`. Other analysis endpoints are not wired yet.
- Specs for Features 1–3 live in `frontend/specs/` (`components.md`, `api-types.ts`, `param-types.ts`).
- `/api/metrics/alerts` uses a rolling baseline of the previous 3 periods and accepts `threshold` in [0.01, 1.0]; `/api/metrics/facets` exposes `categories_by_business_type[business_type][operation_type]`.
- The dashboard header now derives its displayed range from the first and last monthly data points; Vitest covers year-boundary and empty-data cases.
- `AGENTS.md` asks agents to inspect `.agents/rules`, `.agents/skills`, and `memory-bank`; only `.agents/rules` and `memory-bank` are established by this change. No project-specific skills are currently present.

## Useful Commands

- Start services: `docker compose up --build`.
- Frontend tests, lint, and build: run `npm test`, `npm run lint`, and `npm run build` from `frontend/`.
- Backend tests: run `pytest` from `backend/`.