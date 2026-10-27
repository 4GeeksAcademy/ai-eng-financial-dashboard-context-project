# Tech Stack — Financial Metrics Dashboard

_Last verified: 2026-10-09. Versions from `frontend/package.json`, `backend/requirements.txt`, Dockerfiles, and `docker-compose.yml`._

## Languages

- **TypeScript** ~6.0.2 (strict frontend; `tsconfig.app.json`)
- **Python** 3.13 (container: `python:3.13-slim`; host env may differ)

## Frontend

| Layer | Choice | Version |
|---|---|---|
| UI library | React | ^19.2.4 |
| Build tool | Vite (+ `@vitejs/plugin-react`) | ^8.0.4 |
| Styling | Tailwind CSS (via `@tailwindcss/vite`) | ^4.2.2 |
| Component primitives | shadcn-style (`components.json`, `class-variance-authority`, `clsx`, `tailwind-merge`); local `ui/card.tsx`, `ui/skeleton.tsx` | — |
| Charts | Recharts | ^3.8.1 |
| Icons | lucide-react | ^1.8.0 |
| Tests | Vitest (+ `@vitest/coverage-v8`) | ^4.1.4 |
| Lint | ESLint + `typescript-eslint`, react-hooks, react-refresh | ^9.39.4 |

Scripts (`frontend/package.json`): `dev`, `build` (`tsc -b && vite build`), `lint`, `test` (`vitest run`), `test:watch`, `test:coverage`.

## Backend

- **FastAPI** + **Pydantic** (models, `Literal` enums, `Query` validation) — `backend/requirements.txt`
- **Uvicorn** (`--reload`) served under **debugpy** (`0.0.0.0:5678`) — `backend/Dockerfile` CMD
- **Tests:** pytest, pytest-cov, httpx (FastAPI `TestClient`) — `backend/tests/`

## Infrastructure / tooling

- **Docker Compose** (`docker-compose.yml`): `frontend` (node:24-alpine, port 5173) + `backend` (python:3.13-slim, ports 8000 + 5678 debugpy)
- **Vite dev proxy:** `/api` → `http://backend:8000` (`frontend/vite.config.ts`); hostname `backend` resolves only inside the compose network
- **No database, no cache, no message queue** — data is generated per-request from `random.seed(42)`
- Env var `VITE_API_BASE_URL` optionally overrides the API origin (`App.tsx`); `frontend/.env.example` referenced by README is missing (known gap)

## Agent tooling

- `AGENTS.md` → `.agents/rules/` (20 draft rules, in use), `.agents/skills/` (4 SKILL.md procedures: run-and-verify-stack, add-api-endpoint, add-dashboard-feature, maintain-rules-and-verification), `memory-bank/` (this folder)
- Verification record: `verification.md` (checklist + Phase 2 rules + Phase 3 implementation)
