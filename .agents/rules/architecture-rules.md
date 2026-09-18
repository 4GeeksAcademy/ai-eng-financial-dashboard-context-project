---
description: Architecture rules — how frontend and backend are structured and connected
applyTo:
  - "**"
---

# Architecture Rules

## Project structure

```
├── backend/           # Python FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py    # App entry point, CORS, router mount
│   │   └── routes.py  # ALL API endpoints in one file
│   └── tests/
│       ├── conftest.py
│       └── test_routes.py
├── frontend/          # React + TypeScript + Vite
│   └── src/
│       ├── App.tsx            # Root component
│       ├── main.tsx           # Entry point
│       ├── index.css          # Theme + CSS variables
│       ├── components/
│       │   ├── dashboard/     # Business components
│       │   └── ui/            # shadcn/ui (DO NOT EDIT)
│       └── lib/
│           ├── financial-types.ts   # Shared type definitions
│           ├── financial-utils.ts   # Client-side computation
│           ├── mock-data.ts         # Static reference data (UNUSED in prod)
│           └── utils.ts             # cn() helper
└── docker-compose.yml
```

## Data flow

```
Frontend (port 5173)
  │  fetch("/api/metrics")
  │
  ▼
Vite Proxy (/api → http://backend:8000)
  │
  ▼
Backend (port 8000)
  │  generate_mock_movements(seed=42)
  │  Returns list[FinancialMovement] (raw data)
  │
  ▼
Frontend receives raw movements
  │  computeKPIs(movements)    → KPIMetrics
  │  computeMonthlyData(movements) → MonthlyDataPoint[]
  │
  ▼
Dashboard renders KPIs + Charts
```

## Key architectural decisions

### 1. No database — mock data only
- Backend generates 360 movements on every request (12 months × 30)
- Data is generated with `seed=42` for reproducibility
- **NEVER** change the seed or generation logic without updating tests

### 2. Frontend computes its own KPIs
- Backend returns raw `FinancialMovement[]` only
- Frontend calculates: `computeKPIs()`, `computeMonthlyData()`
- **DO NOT** add KPI computation to the backend unless explicitly asked

### 3. Types are duplicated, not shared
- Backend: `FinancialMovement(BaseModel)` in `routes.py`
- Frontend: `FinancialMovement` interface in `financial-types.ts`
- Both must stay in sync. If you change one, change the other.

### 4. Single-file backend API
- ALL endpoints live in `routes.py` (~380 lines)
- **DO NOT** split into multiple route files unless the file exceeds 500 lines
- Order: models → helpers → endpoints

### 5. No authentication
- CORS is open: `allow_origins=["*"]`
- No tokens, no sessions, no middleware

## Docker

- `docker compose up --build` runs both services
- Frontend: port 5173 (Vite dev server with hot reload)
- Backend: port 8000 (Uvicorn with --reload)
- Debugger: port 5678 (debugpy)

## Environment variables

- `VITE_API_BASE_URL` — optional, defaults to `""` (uses Vite proxy)
- No `.env` file required for local development
