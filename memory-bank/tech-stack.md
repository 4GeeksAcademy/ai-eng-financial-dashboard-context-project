# Tech stack

Versions are what was installed in the containers on 2026-11-05. Python packages
have no pinned versions, so they can change on a rebuild.

## Languages and runtimes

| Technology | Version | Source |
|---|---|---|
| Python | 3.13 | `backend/Dockerfile` |
| Node.js | 24 | `frontend/Dockerfile` |
| TypeScript | 6.0 | `frontend/package.json` |

## Backend

| Package | Version | Used for |
|---|---|---|
| FastAPI | 0.162 | API framework |
| Pydantic | 2.14 | Response models, installed through FastAPI |
| Uvicorn | 0.54 | ASGI server, with `--reload` |
| debugpy | 1.8 | Debug server on port 5678 |

## Frontend

| Package | Version | Used for |
|---|---|---|
| React | 19.2 | UI |
| Vite | 8.0 | Dev server, proxy and build |
| Tailwind CSS | 4.2 | Styling, through `@tailwindcss/vite` |
| Recharts | 3.8 | Charts |
| lucide-react | 1.8 (declared) | Icons |
| `clsx`, `tailwind-merge`, `class-variance-authority` | Declared in `package.json` | Class name helpers for shadcn/ui-style components |

## Infrastructure

- **Docker Compose:** `docker-compose.yml` defines the two services, with source
  bind mounts and live reload.
- **Base images:** `python:3.13-slim` and `node:24-alpine`.
- **Lockfile:** `frontend/package-lock.json` is tracked, but the image runs
  `npm install` rather than `npm ci`.

## Quality tooling

| Tool | Version | Command |
|---|---|---|
| pytest with pytest-cov | 9.2, 7.1 | `docker compose exec -T backend python -m pytest` |
| httpx, for `TestClient` | 0.28 | Used by the backend tests |
| Vitest | 4.1 | `docker compose exec -T frontend npm test` |
| ESLint with typescript-eslint | 9.39 | `docker compose exec -T frontend npm run lint` |
| TypeScript compiler | 6.0 | Runs in `docker compose exec -T frontend npm run build` |

## Not in the project

Do not assume these exist: database, authentication, router, state management
library, CI, formatter, Python linter or component test setup.
