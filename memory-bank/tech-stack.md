# Tech Stack

## Application

| Area | Technology | Evidence |
| --- | --- | --- |
| Frontend language | TypeScript | `frontend/tsconfig.json` and `frontend/src/` |
| Frontend framework | React 19 | `frontend/package.json` |
| Frontend build and dev server | Vite 8 | `frontend/package.json` and `frontend/vite.config.ts` |
| Styling | Tailwind CSS 4 | `frontend/package.json` and `frontend/vite.config.ts` |
| Dashboard UI | Recharts and Lucide React | `frontend/package.json` and `frontend/src/components/dashboard/` |
| Frontend tests | Vitest, JSDOM, React Testing Library | `frontend/package.json`, `frontend/vite.config.ts`, and `frontend/src/App.test.tsx` |
| Backend language | Python | `backend/app/` and `backend/requirements.txt` |
| Backend framework | FastAPI with Pydantic models | `backend/app/main.py` and `backend/app/routes.py` |
| ASGI server and debugger | Uvicorn and debugpy | `backend/requirements.txt` and `backend/Dockerfile` |
| Backend tests | Pytest, pytest-cov, and httpx | `backend/requirements.txt` and `backend/tests/` |

## Infrastructure and Tooling

- Docker Compose runs `frontend` and `backend`; it publishes ports `5173`, `8000`, and `5678`.
- The frontend container runs Vite. The backend container runs debugpy and Uvicorn with reload enabled.
- Vite proxies browser requests under `/api` to the Compose `backend` service on port `8000`.
- ESLint and TypeScript are configured in `frontend/eslint.config.js` and the frontend TypeScript configuration files.

## Evidence

- `docker-compose.yml`
- `frontend/Dockerfile` and `backend/Dockerfile`
- `frontend/package.json`, `frontend/vite.config.ts`, and `backend/requirements.txt`
