# Stack and operations

## Runtime and dependencies

| Component | Evidence-backed stack |
|---|---|
| Frontend | React and TypeScript; Vite. Dependencies and scripts: `frontend/package.json`; lockfile: `frontend/package-lock.json`. Docker image: Node 24 Alpine (`frontend/Dockerfile`). |
| Backend | FastAPI and Uvicorn; dependencies: `backend/requirements.txt`. Docker image: Python 3.13 slim (`backend/Dockerfile`). Backend dependency versions are not pinned in `requirements.txt`. |
| Orchestration | Docker Compose declares frontend and backend in `docker-compose.yml`. |

## Startup and addresses

The README documents this local startup command:

```bash
docker compose up --build
```

`docker-compose.yml` maps frontend port 5173, backend port 8000, and backend debug port 5678. The README gives local URLs `http://localhost:5173`, `http://localhost:8000`, and `http://localhost:8000/docs`. These mappings do not determine the externally forwarded Codespaces URLs.

The frontend uses a Vite proxy for `/api` by default. `frontend/.env.example` documents an optional `VITE_API_BASE_URL` override; the README now specifies copying it to `frontend/.env`.

## Available frontend scripts

Declared in `frontend/package.json`:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm test` (`vitest run`)
- `npm run test:watch`
- `npm run test:coverage`
- `npm run preview`

The backend Dockerfile starts Uvicorn through debugpy. Backend dependencies include pytest, but no explicit backend test script or test command is documented in the repository.
