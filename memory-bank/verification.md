# Verification: project summary vs. codebase

Trial of a project summary (what it does, how the pieces connect, how it runs), checked against the source.
Method: read the files and grep; no command was executed (`python` is not installed in the shell; `npm`/Docker not run).

Legend: ✅ verified · ❌ wrong (corrected) · ❔ unverified

## ❌ Wrong claims, corrected
| Claim | Correction |
|---|---|
| Every endpoint calls `generate_mock_movements(seed=42)` | `/health` does not; every *data* endpoint does (`backend/app/routes.py:243-245`). |
| Start with `docker-compose up --build` | README uses `docker compose up --build` (Compose v2 syntax). |

## ✅ Verified
- Two services: FastAPI backend (`backend/app/main.py`, `routes.py`) and React/Vite frontend.
- Compose ports: frontend 5173, backend 8000, debugpy 5678; source folders mounted; frontend `depends_on` backend.
- Backend image: python:3.13-slim, runs debugpy + `uvicorn --reload`. Frontend image: node:24-alpine.
- CORS is `allow_origins=["*"]`.
- Vite proxies `/api` to `http://backend:8000`; `@` aliases `src`.
- Frontend only calls `/api/metrics`; the other endpoints have no consumer.
- Data is 12 months x 30 movements = 360 (from code, not executed).
- `frontend/src/lib/mock-data.ts` is unused (no imports anywhere in `src`).
- Header period "2024 - Full Year" is hardcoded in `App.tsx`.
- `/api/metrics` response is cast to `FinancialMovement[]` with no validation.
- `.agents/` and `memory-bank/` did not exist before this file; only the README describes the `.agents` layout.
- 15 backend tests cover all endpoints; `conftest.py` adds `backend/` to `sys.path`. Frontend scripts: dev, build (`tsc -b && vite build`), lint, test (vitest).
- Entry flow: `index.html` -> `src/main.tsx` -> `App`; loading skeletons and an error banner live in `App.tsx`.

## Qualified
- "Browser never calls the backend directly" holds only while `VITE_API_BASE_URL` is empty (default).
- "Same data every request": amounts/categories are fixed by seed 42, but each date's year depends on `date.today()`, so dates shift over time.

## ❔ Unverified
- Actual count/determinism of generated movements (code not executed).
- Running without Docker (`pip install` + `uvicorn`, `localhost:8000` workaround).
- Vite HMR inside the Docker volume (no polling configured; may matter on Windows).
- Exact KPI card / chart titles; Recharts import blocks.
- "Starter project for 4Geeks context engineering" is an inference, not stated in code.
- Test suite, lint and build results: not run.
