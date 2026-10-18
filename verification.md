# Project Summary and Verification

## Summary

This repository contains a React 19 and TypeScript financial dashboard in `frontend/` and a FastAPI service in `backend/`. The frontend requests `GET /api/metrics`, computes KPI totals and monthly chart data in `frontend/src/lib/financial-utils.ts`, and renders the dashboard in `frontend/src/App.tsx`. The backend registers its routes from `backend/app/main.py`; `backend/app/routes.py` creates seeded mock movements and exposes the metrics API. No database integration is present in the inspected application paths.

Run both services from the repository root with `docker compose up --build`. The frontend is available at `http://localhost:5173`, the backend at `http://localhost:8000`, and FastAPI's docs at `http://localhost:8000/docs`, as documented in `README.md`. Vite proxies `/api` to the backend by default; `VITE_API_BASE_URL` is an optional frontend override documented in `frontend/.env.example`.

## Verification Trail

| Claim checked | Evidence and correction |
| --- | --- |
| The dashboard UI includes every backend metrics feature. | Not supported. `frontend/src/App.tsx` fetches only `/api/metrics` and derives its displayed metrics locally. Routes for facets, summaries, category rankings, comparisons, alerts, B2B, and B2C are defined in `backend/app/routes.py`, but are not called by this UI. |
| The displayed period is a reliable label for the mock data. | Incorrect. `frontend/src/App.tsx` passes the fixed text `2024 - Full Year`, while `backend/app/routes.py` generates movement dates using `date.today()`. Treat the header as a known mismatch, not as evidence of the data range. |
| The documented local startup matches the repository configuration. | Verified: `docker compose config --quiet` succeeded; `docker-compose.yml` defines the frontend and backend services, and the Vite proxy targets `backend:8000`. |
| The checked-in application tests pass in the project runtime. | Verified after a clean frontend install: frontend tests passed (5), ESLint passed, the TypeScript/Vite build passed, and backend tests passed in the Docker image (15). The backend emitted a Starlette/httpx deprecation warning; Vite reported a config-loader warning and a bundle-size warning. |
| The frontend dependency audit is clear. | Not fully. A compatible lockfile update removed the high and low findings, but `npm audit` still reports 3 moderate advisories in Vitest 4.1.4 and its coverage/mocker packages. Resolving these requires moving to Vitest 5; no major test-runner upgrade was made in this context task. |

The context-documentation task itself was checked against the cited entry points, route implementations, package scripts, test files, and Compose configuration. No product behavior was changed as part of this project-context work.

## Rule Validation Exercise

Task: verify whether the dashboard displays all backend metrics features and whether its period label describes the API data. Following `.agents/rules/financial-dashboard.md`, I traced the request in `frontend/src/App.tsx`, compared it with route definitions and date generation in `backend/app/routes.py`, and checked the route tests. The evidence rejected the all-features claim and confirmed the static-period mismatch; both corrections are recorded above. The exercise changed project documentation only.