# Project Verification

## Verification Status

All claims below were verified against the current source code and configuration.

| Claim | Status | Evidence |
| --- | --- | --- |
| The stack has two services. | ✅ | `docker-compose.yml` defines `frontend` and `backend`. |
| The documented start command is `docker compose up --build`. | ✅ | `README.md` documents this command. |
| The frontend is available at `http://localhost:5173`. | ✅ | Compose publishes port `5173`; the frontend container starts Vite on that port. |
| The backend is available at `http://localhost:8000`. | ✅ | Compose publishes port `8000`; Uvicorn listens on that port. |
| API documentation is available at `http://localhost:8000/docs`. | ✅ | The backend creates a default FastAPI application. |
| The frontend proxies `/api` to `http://backend:8000`. | ✅ | `frontend/vite.config.ts` configures this proxy. |
| The browser entry flow is `index.html` -> `src/main.tsx` -> `App.tsx`. | ✅ | The Vite entry module renders `App` into `#root`. |
| The project has no database or persistence service. | ✅ | Compose and backend dependencies define no database service or client. |

## Project Summary

This project is a financial metrics dashboard built with a React and TypeScript frontend and a FastAPI backend. The backend generates deterministic mock financial movements using `seed=42`; no database is involved.

The frontend fetches `GET /api/metrics`, computes KPI and monthly chart data on the client, and renders the dashboard header, KPI cards, income/outcome chart, and profit-percent chart. In local Compose development, Vite forwards `/api` requests to the backend service.

The backend starts Uvicorn with `app.main:app` on port `8000` and exposes debugpy on port `5678`. It provides `/health` plus metric, facet, summary, top-category, comparison, alert, B2B, and B2C endpoints.

## How To Run

From the repository root:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- API documentation: `http://localhost:8000/docs`

## Suggested Commit Message

```text
docs: add project verification trail
```

## PR Notes

### Summary

- Added `verification.md` with a source-backed architecture and runtime verification trail.
- Documented the frontend and backend responsibilities, service connection, local URLs, and start command.
- Recorded that the application is a two-service Compose stack using deterministic mock data without persistence.

### Validation

- Verified against `docker-compose.yml`, `README.md`, `frontend/vite.config.ts`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `backend/Dockerfile`, `backend/app/main.py`, `backend/app/routes.py`, and `backend/requirements.txt`.