# Tech Stack

## Frontend

- React 19 — Builds the user interface.
- TypeScript — Adds types to JavaScript code.
- Vite 8 — Runs and builds the frontend.
- Tailwind CSS 4 — Styles the dashboard.
- Recharts 3 — Displays financial charts.
- Vitest 4 — Tests frontend utilities.

## Backend

- Python 3.13 — Backend programming language.
- FastAPI — Provides financial API endpoints.
- Uvicorn — Runs the API server.
- Pydantic — Defines API data models.
- pytest — Runs backend tests.

## Development Tools

- Docker Compose — Runs frontend and backend services together.
- Git and GitHub — Version control and project hosting.
- GitHub Codespaces — Cloud development environment.

## Important Files

- `frontend/package.json` — Frontend dependencies.
- `frontend/vite.config.ts` — Vite configuration and API proxy.
- `backend/requirements.txt` — Backend dependencies.
- `backend/app/main.py` — FastAPI application setup.
- `backend/app/routes.py` — API routes and data models.
- `docker-compose.yml` — Service configuration.

## Local Development

Run `docker compose up --build` from the repository root to build and start the application.

Frontend: `http://localhost:5173`
Backend: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

## Evidence

Technology versions and configuration were inspected in `PHASE1-VERIFICATION.md`.