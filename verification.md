# Handover verification

Checks of the project map and summary against the real code. Each item says how
it was checked by the agent. The last column is for the human reviewer.

**Legend:** ✅ confirmed · ❌ does not match · ❓ not verified

## Project map

| Area | Path | Role |
|---|---|---|
| Orchestration | `docker-compose.yml` | Defines the `frontend` and `backend` services |
| Backend entry point | `backend/app/main.py` | Creates the FastAPI app, adds CORS, includes the router |
| Backend logic | `backend/app/routes.py` | Models, mock data, calculations and all routes |
| Backend tests | `backend/tests/` | Pytest with `TestClient` |
| Frontend HTML | `frontend/index.html` | Loads `/src/main.tsx` |
| Frontend entry point | `frontend/src/main.tsx` | Mounts `App` on `#root` |
| Frontend page | `frontend/src/App.tsx` | Fetches data, holds state, lays out the page |
| Frontend components | `frontend/src/components/` | `dashboard/` and `ui/` |
| Frontend logic | `frontend/src/lib/` | Types, calculations, formatters and tests |

## Project summary

A single-page financial dashboard. The React frontend fetches movements from the
FastAPI backend and calculates KPIs and monthly charts in the browser. The backend
generates its data on each request, and there is no database. Both services run
with `docker compose up --build`.

## Verification

| # | Claim | Result | How it was checked | Your check |
|---|---|---|---|---|
| 1 | `docker-compose.yml` defines exactly two services | ✅ | Read the file; `docker compose ps` lists `backend` and `frontend` | OK |
| 2 | The frontend is served on port 5173 | ✅ | `curl localhost:5173/` returns 200 HTML | OK |
| 3 | The API and its docs are served on port 8000 | ✅ | `/health` and `/docs` return 200 | OK |
| 4 | `index.html` loads `main.tsx`, which mounts `App` | ✅ | Read both files | OK |
| 5 | The frontend reaches the backend through the Vite proxy | ✅ | `localhost:5173/api/metrics` returns 360 movements | OK |
| 6 | Only `/api` is proxied | ✅ | `vite.config.ts`; `localhost:5173/health` returns HTML, not JSON | OK |
| 7 | There is no database | ✅ | Compose has no database service; `routes.py` persists nothing | |
| 8 | Data is simulated and repeats between requests | ✅ | Two `/api/metrics` responses have the same hash | |
| 9 | Data covers the 12 full months before today | ✅ | `/api/metrics/facets`: `2025-11-01` to `2026-10-28`, checked on 2026-11-05 | |
| 10 | All routes are `GET` and match `memory-bank/architecture.md` | ✅ | Compared the table with `/openapi.json` by script | |
| 11 | KPIs and monthly data are calculated in the browser | ✅ | `App.tsx` calls `computeKPIs` and `computeMonthlyData` | |
| 12 | Backend tests, frontend tests, lint and build pass | ✅ | Ran inside the containers | |
| 13 | Port 5678 accepts connections for debugpy | ✅ | Connected to the port from the host | |
| 14 | The header shows the period of the data | ✅ | Was ❌ with a hardcoded "2024 - Full Year". Now reads `/api/metrics/facets`; Chrome shows `Nov 2025 - Oct 2026` | |
| 15 | Monthly totals are right in every timezone | ✅ | Wrong behind UTC. Corrected in commit `5bee479` | |
| 16 | `AGENTS.md` points to existing folders | ✅ | `.agents/` and `memory-bank/` were missing. Corrected in commit `2cd0e1e` | |
| 17 | The README says where `.env` goes | ✅ | Was ❌: "copy to `.env`" gave no folder, and Vite only reads `frontend/`. Both READMEs now say `frontend/.env` | Todo OK |
| 18 | The page title names the product | ✅ | Was ❌ with `<title>frontend</title>`. Now "Financial Metrics Dashboard", the name in the README; read from the page in Chrome | Todo OK |
| 19 | A debugger can attach and stop at a breakpoint | ❓ | The port is open, but no debug session was tried | |
| 20 | `VITE_API_BASE_URL` points the frontend at another backend | ❓ | Read the code in `App.tsx`, but did not try it | |
| 21 | The project runs in GitHub Codespaces | ✅ | Was ❓: the agent only ran it on macOS. Confirmed by the human reviewer | Verificado en Codespaces |
| 22 | The page renders correctly in a browser | ✅ | Headless Chrome with the `America/Santiago` timezone: KPIs, both charts with full lines, 12 months, and the loading state | |

## Mismatches to resolve

- **#19 and #20:** still need a real check. Do not state them as facts until then.

## Reviewer steps

Check these yourself and fill in the last column:

1. Open each path in the project map.
2. Run `docker compose up --build` and open http://localhost:5173.
3. Open http://localhost:8000/docs and try `/api/metrics`.
4. Pick any three ✅ rows and repeat the check.
