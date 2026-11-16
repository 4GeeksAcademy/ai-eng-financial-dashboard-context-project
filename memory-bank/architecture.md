# Architecture and data flow

## Components

- **Frontend:** Vite development server serves the React application (`frontend/vite.config.ts`, `frontend/src/main.tsx`).
- **Backend:** FastAPI app in `backend/app/main.py`; route handlers and response models are in `backend/app/routes.py`.
- **Local orchestration:** `docker-compose.yml` declares `frontend` and `backend` services. No database service is declared.

## Request flow

```mermaid
flowchart LR
    Browser["Browser"] -->|"GET /api/metrics"| Vite["Vite frontend"]
    Vite -->|"proxy /api"| API["FastAPI backend"]
    API -->|"mock movements"| Vite
    Vite -->|"KPIs and charts"| Browser
```

`frontend/src/App.tsx` calls `/api/metrics`. `frontend/vite.config.ts` proxies `/api` to `http://backend:8000`. The frontend calculates KPIs and monthly totals in `frontend/src/lib/financial-utils.ts`.

## Backend routes

`backend/app/routes.py` defines `/health` and these API routes:

- `/api/metrics`
- `/api/metrics/facets`
- `/api/metrics/summary`
- `/api/metrics/categories/top`
- `/api/metrics/comparison`
- `/api/metrics/alerts`
- `/api/metrics/b2b`
- `/api/metrics/b2c`

Only `/api/metrics` is called from the frontend `App.tsx` inspected for this handover. No client usage of the other routes was found in the reviewed source.

## Data and security configuration

The API creates seeded mock movements in memory (`generate_mock_movements(seed=42)` in `backend/app/routes.py`). No persistence layer is visible in the repository. `backend/app/main.py` configures CORS with wildcard origins and credentials; the repository does not establish whether this is intended for production.
