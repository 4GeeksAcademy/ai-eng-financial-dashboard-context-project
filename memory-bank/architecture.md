# Architecture

## General structure

The repository is divided into two main applications:

- `frontend/`: React and TypeScript dashboard.
- `backend/`: FastAPI REST API.

Docker Compose runs both services together.

## Frontend

Main technologies:

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Vitest

Main entry points:

- `frontend/src/main.tsx`
- `frontend/src/App.tsx`

The frontend requests financial movements from:

- `GET /api/metrics`

It calculates KPIs and monthly chart data using reusable functions from `frontend/src/lib`.

## Backend

Main technologies:

- Python
- FastAPI
- Pydantic
- Uvicorn
- Pytest

Main entry point:

- `backend/app/main.py`

Routes and current business logic are located in:

- `backend/app/routes.py`

The backend generates mock movements with a fixed seed to keep responses repeatable.

## Service communication

- Frontend port: `5173`
- Backend port: `8000`
- FastAPI documentation: `/docs`
- Backend debugging port: `5678`

The frontend uses relative `/api` requests by default through the Vite proxy.

An alternative backend can be configured with `VITE_API_BASE_URL`.
