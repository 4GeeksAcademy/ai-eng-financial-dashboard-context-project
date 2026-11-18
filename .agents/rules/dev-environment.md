# Dev environment

## Scope

Applies to `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/vite.config.ts`, `frontend/.env.example`, `frontend/src/App.tsx` (`VITE_API_BASE_URL`), `backend/app/main.py` (CORS), `backend/app/routes.py` (`/health`), and `backend/requirements.txt`.

## Rules

1. Do keep the running app as the `frontend` and `backend` Compose services, with `frontend` depending on `backend`.
2. Do keep the `./frontend` and `./backend` bind mounts, and keep uvicorn’s `--reload` flag, when changing the dev containers.
3. Do leave `VITE_API_BASE_URL` empty so the browser uses the Vite proxy to `http://backend:8000`.
4. Do keep browser API calls on the Vite `/api` proxy. The CORS setup allows every origin and credentials together.
5. Do keep the backend command starting debugpy on `0.0.0.0:5678`, and keep Compose publishing `5678:5678`.
6. Do add a Python dependency to `backend/requirements.txt` as a name with no version pin, matching the current file.
7. Do call `/health` on the backend origin. The Vite proxy forwards only paths that start with `/api`.

## Rationale

- Rule 1 — F1: Compose defines `frontend` and `backend`, and `frontend` depends on `backend`.
- Rule 2 — F14: Compose bind-mounts `./frontend` and `./backend` over `/app`, and the backend image starts uvicorn with `--reload`.
- Rule 3 — F15: `frontend/.env.example` leaves `VITE_API_BASE_URL` blank, and `App.tsx` falls back to `""`, so requests stay on the Vite proxy to `http://backend:8000`.
- Rule 4 — F15, F22: The default UI uses the Vite `/api` proxy. CORS in `main.py` sets `allow_origins=["*"]` and `allow_credentials=True` together.
- Rule 5 — F28: `backend/Dockerfile` always starts debugpy on `0.0.0.0:5678` before uvicorn, and Compose publishes `5678:5678`.
- Rule 6 — F29: `backend/requirements.txt` names `fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov`, and `httpx` with no version pins.
- Rule 7 — F30: `/health` is registered at the backend root. The Vite proxy only forwards paths starting with `/api`.
