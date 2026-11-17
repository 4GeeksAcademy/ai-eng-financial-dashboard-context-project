# Project Summary

## Overview

This repository contains a financial metrics dashboard with a React and TypeScript frontend and a FastAPI backend. The frontend is built with Vite.

## Application structure

- Frontend entry point: `frontend/src/main.tsx` mounts `App` with React.
- Dashboard and API client: `frontend/src/App.tsx` fetches financial movements and renders KPI cards and income/outcome and profit charts. It computes the displayed metrics in the frontend.
- Backend entry point: `backend/app/main.py` creates the FastAPI application, configures CORS, and registers the API router.
- Backend routes and data generation: `backend/app/routes.py`.

## Frontend-to-backend communication

The frontend requests `/api/metrics`, optionally prefixed by `VITE_API_BASE_URL`. In the Vite development server, `frontend/vite.config.ts` proxies `/api` to `http://backend:8000`. The dashboard currently calls `/api/metrics`; it does not call the other backend endpoints.

## API endpoints

The backend defines these GET routes in `backend/app/routes.py`:

- `/health`
- `/api/metrics` — movements, with date, category, and operation-type filters
- `/api/metrics/facets` — available filter values and date range
- `/api/metrics/summary` — grouped financial totals
- `/api/metrics/categories/top` — highest-total categories
- `/api/metrics/comparison` — current and previous period net values and deltas
- `/api/metrics/alerts` — outcome increases relative to prior periods
- `/api/metrics/b2b` and `/api/metrics/b2c` — movements filtered by business type

## Data

Each backend endpoint generates 360 mock movements (30 for each of 12 months), using seed `42` for repeatable random values. Generated dates are relative to the current date, so the calendar-year range shifts over time. The frontend also contains hardcoded 2024 sample movements in `frontend/src/lib/mock-data.ts`; the current `App` does not import that fixture.

## Dependencies and run configuration

- Frontend dependencies and scripts are listed in `frontend/package.json`. Scripts include Vite development/preview, a TypeScript-and-Vite build, ESLint, and Vitest tests.
- Backend dependencies are listed in `backend/requirements.txt`: FastAPI, Uvicorn, debugpy, pytest, pytest-cov, and httpx.
- `docker-compose.yml` configures the frontend on port `5173` and backend on port `8000`, and exposes backend debug port `5678`.
- `frontend/Dockerfile` uses Node 24 Alpine and starts the Vite development server.
- `backend/Dockerfile` uses Python 3.13 slim and starts Uvicorn with reload under debugpy.
- The documented Compose command is `docker compose up --build`; the README lists the frontend at `http://localhost:5173`, backend at `http://localhost:8000`, and API docs at `http://localhost:8000/docs`.

## Tests and verification

Backend route tests are in `backend/tests/test_routes.py`; the suite passed with 15 tests during the Phase 1 investigation. Frontend utility tests are in `frontend/src/lib/financial-utils.test.ts`, but could not be run during that investigation because Vitest was unavailable and installing frontend dependencies failed due to a permissions error. The application was not started, so the documented runtime behavior and Docker setup were not independently tested.
