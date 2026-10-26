# Technology Stack

## Frontend

- TypeScript and React 19.
- Vite 8 for development and production builds.
- Tailwind CSS 4 through the Vite plugin.
- Recharts for financial charts.
- Lucide React for icons.
- Vitest for unit tests and ESLint for static analysis.
- The `@/` alias resolves to `frontend/src` in both TypeScript and Vite configuration.

Evidence: `frontend/package.json`, `frontend/tsconfig.app.json`, `frontend/vite.config.ts`, and `frontend/eslint.config.js`.

## Backend

- Python 3.13 container image.
- FastAPI with Pydantic response models.
- Uvicorn development server with reload enabled.
- debugpy listening on port 5678.
- pytest, pytest-cov, and HTTPX for testing.
- No database driver, migration tool, or external API client is configured beyond the test/runtime HTTP dependency.

Evidence: `backend/Dockerfile` and `backend/requirements.txt`.

## Runtime model

Docker Compose builds and runs two services:

- `frontend`: Vite on container and host port 5173.
- `backend`: Uvicorn on container and host port 8000, plus debugpy on port 5678.

The frontend normally requests relative `/api` URLs. Vite is configured to proxy those requests to `http://backend:8000` on the Compose network. `VITE_API_BASE_URL` can override the relative API base.

Evidence: `docker-compose.yml`, both Dockerfiles, `frontend/vite.config.ts`, `frontend/src/App.tsx`, and the environment guidance in both README files.

## Standard checks

```bash
docker compose exec -T backend pytest -q
docker compose exec -T frontend npm test
docker compose exec -T frontend npm run lint
docker compose exec -T frontend npm run build
```

Evidence: `frontend/package.json`, `backend/requirements.txt`, and `.agents/rules/service-validation.md`.