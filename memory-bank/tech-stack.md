# Tech stack

## Frontend

- Language and UI: TypeScript and React, with React DOM (`frontend/package.json`).
- Build and dev server: Vite. Tailwind CSS is the styling tool. ESLint is the linter (`frontend/package.json`).
- Charts and UI helpers: Recharts, lucide-react, class-variance-authority, clsx, and tailwind-merge (`frontend/package.json`).
- Tests: Vitest, run with `vitest run` (`frontend/package.json`; `.agents/rules/testing.md`, rule 3).
- Container: `node:24-alpine`. The process is `npm run dev -- --host 0.0.0.0 --port 5173`, and the image exposes 5173 (`frontend/Dockerfile`).

## Backend

- Language and image: Python, `python:3.13-slim` (`backend/Dockerfile`).
- Framework and server: FastAPI, served by uvicorn (`backend/requirements.txt`; `backend/Dockerfile`).
- Other Python packages: debugpy, pytest, pytest-cov, and httpx (`backend/requirements.txt`).
- Those backend dependencies have no version pins. Each line is a name only (`backend/requirements.txt`; `proposed-rules.md`, F29; `.agents/rules/dev-environment.md`, rule 6).

## Docker Compose

Compose runs two services, `frontend` and `backend`. `frontend` depends on `backend` (`docker-compose.yml`; `.agents/rules/dev-environment.md`, rule 1).

Published ports:

- 5173 for the frontend (`docker-compose.yml`; `frontend/Dockerfile`).
- 8000 for the backend API (`docker-compose.yml`; `backend/Dockerfile`).
- 5678 for debugpy. The backend command listens on `0.0.0.0:5678`, and Compose publishes `5678:5678` (`backend/Dockerfile`; `docker-compose.yml`; `.agents/rules/dev-environment.md`, rule 5). The READMEs list 5173 and 8000 and do not document 5678 (`.agents/rules/documentation.md`, rule 3; `proposed-rules.md`, F28).
