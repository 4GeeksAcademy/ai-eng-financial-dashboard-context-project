# Financial Metrics Dashboard

<!-- hide -->

By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) at [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_Estas instrucciones están [disponibles en español](./README.es.md)._

**Before you start**: 📗 [Read the instructions](https://4geeks.com/lesson/how-to-start-a-project) on how to start a coding project.

<!-- endhide -->

---

_Financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend._

## Recommended steps

1. Fork this repository to your account.
2. Open your fork in GitHub Codespaces or clone it and run it in your local environment.
3. Run your AI agent to inspect both frontend and backend.
4. Document the proposed rules and memory bank in your fork.
5. Refine and validate the rules until they fit the project's real workflow.

## Expected agents directory structure

```text
./.agents
└─ /rules
   └─ <rule-name>.md
└─ /skills
   └─ /<skill-name>
      └─ /SKILL.md
```

## How to run locally

```bash
docker compose up --build
```

The frontend always calls the API with the relative URL `/api/metrics`. Vite proxies
that path using `VITE_API_PROXY_TARGET`. Docker Compose sets this variable to
`http://host.docker.internal:8000` and maps `host.docker.internal` to the Docker
host, which is required when running the frontend container in GitHub Codespaces.
The Vite server listens on `0.0.0.0:5173`, and FastAPI listens on
`0.0.0.0:8000`.

Then verify the services and the proxied API from the workspace host:

```bash
docker compose config
docker compose ps
curl -I http://localhost:8000/docs
curl http://localhost:8000/api/metrics
curl -I http://localhost:5173
```

For a different environment, override `VITE_API_PROXY_TARGET` when starting the
frontend service. Keep the application request relative so it continues to work
through the Vite proxy:

```bash
VITE_API_PROXY_TARGET=http://host.docker.internal:8000 docker compose up --build
```

If TypeScript reports `Cannot find type definition file for 'vite/client'`,
install the frontend dependencies so the `vite` package is available locally:

```bash
cd frontend
npm install
npm ls vite
```

When using Docker, the equivalent check is:

```bash
docker compose build --no-cache frontend
docker compose up -d frontend
docker compose exec frontend npm ls vite
```

The `"vite/client"` entry in `frontend/tsconfig.app.json` should remain; it
provides Vite typings for `import.meta.env`.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API documentation: http://localhost:8000/docs

---

## Project Technical Report

> Each claim below is verified against the actual source code with evidence.

### 1. Project Purpose

✅ **Web financial metrics dashboard** that displays KPIs (income, outcome, profit, profit margin) and monthly line charts.
**Evidence:** `frontend/src/App.tsx` — the `App()` component renders `<DashboardHeader>`, `<KPIRow>`, `<IncomeOutcomeChart>`, and `<ProfitPercentChart>`.

✅ **Built as an educational project by 4Geeks Academy** by @marcogonzalo.
**Evidence:** `README.md` line 3.

---

### 2. Architecture

✅ **Two-service architecture: frontend + backend, communicating via HTTP proxy.**
**Evidence:**
- `docker-compose.yml` — defines `frontend` and `backend` services, including the Codespaces host mapping
- `frontend/vite.config.ts` — proxy `/api` using `VITE_API_PROXY_TARGET`

✅ **The backend generates mock data on every request (no database).**
**Evidence:** `backend/app/routes.py` — every endpoint (e.g., `get_metrics()`) calls `generate_mock_movements(seed=42)` at the start.

✅ **The frontend fetches data from the backend via the relative path `fetch("/api/metrics")`.**
**Evidence:** `frontend/src/App.tsx`: `fetch("/api/metrics")`; Vite forwards this path using `VITE_API_PROXY_TARGET`.

✅ **CORS is enabled for all origins in the backend.**
**Evidence:** `backend/app/main.py` lines 6-9: `allow_origins=["*"]`

---

### 3. Backend Stack

| Technology | Version | Evidence File | Impact |
|---|---|---|---|
| **Python** | **3.13-slim** | `backend/Dockerfile` line 1 | Main backend language |
| **FastAPI** | latest (unpinned) | `backend/requirements.txt` + `routes.py` line 12 | REST API framework |
| **Uvicorn** | latest (unpinned) | `backend/requirements.txt` + `Dockerfile` line 12 | ASGI server |
| **Pydantic** | (bundled with FastAPI) | `backend/app/routes.py` line 13 | Data validation models |
| **debugpy** | latest | `backend/requirements.txt` + `Dockerfile` line 12 | Remote debugging on port 5678 |
| **pytest + pytest-cov** | latest | `backend/requirements.txt` lines 4-5 | Testing + coverage |
| **httpx** | latest | `backend/requirements.txt` line 6 | HTTP client for tests |

✅ **The backend defines 6 API endpoints.**
**Evidence:** `backend/app/routes.py`:
1. `GET /health`
2. `GET /api/metrics`
3. `GET /api/metrics/summary`
4. `GET /api/metrics/categories/top`
5. `GET /api/metrics/comparison`
6. `GET /api/metrics/alerts`

✅ **The backend generates 360 movements (12 months × 30 per month).**
**Evidence:** `routes.py` function `generate_mock_movements()` — `for month in range(1, 13): ... for _ in range(30)`. Confirmed by test: `assert len(movements) == 360` in `test_routes.py` line 8.

✅ **Mock data is reproducible with seed=42.**
**Evidence:** All endpoints in `routes.py` call `generate_mock_movements(seed=42)`.

---

### 4. Frontend Stack

| Technology | Version | Evidence File | Impact |
|---|---|---|---|
| **Node.js** | **24-alpine** | `frontend/Dockerfile` line 1 | JavaScript runtime |
| **React** | **^19.2.4** | `frontend/package.json` line 12 | UI component library |
| **TypeScript** | **~6.0.2** | `frontend/package.json` line 34 | Static typing |
| **Vite** | **^8.0.4** | `frontend/package.json` line 39 | Bundler + dev server |
| **Tailwind CSS** | **^4.2.2** | `frontend/package.json` line 37 + `index.css` line 1 | Utility-first CSS framework |
| **Recharts** | **^3.8.1** | `frontend/package.json` line 15 | Charts library |
| **Lucide React** | **^1.8.0** | `frontend/package.json` line 14 | SVG icons |
| **shadcn/ui (New York)** | — | `frontend/components.json` line 2 | UI component system |
| **Vitest** | **^4.1.4** | `frontend/package.json` line 40 | Testing framework |
| **ESLint 9** | **^9.39.4** | `frontend/package.json` line 29 | Code linting |

✅ **The `cn()` utility combines clsx + tailwind-merge.**
**Evidence:** `frontend/src/lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

✅ **TypeScript target is ES2023 with ESNext modules.**
**Evidence:** `frontend/tsconfig.app.json` lines 4-6.

---

### 5. Dashboard UI

✅ **4 KPI cards: Total Income, Total Outcome, Profit, Profit Margin.**
**Evidence:** `frontend/src/components/dashboard/kpi-row.tsx` — renders 4 `<KPICard>` components with those labels.

✅ **2 line charts: Monthly Income vs Outcome and Profit Margin %.**
**Evidence:**
- `income-outcome-chart.tsx` — `<LineChart>` with two `<Line>` elements
- `profit-percent-chart.tsx` — `<LineChart>` with `<Line>` and `<ReferenceLine>` at 0

✅ **The dashboard period is hardcoded to "2024 - Full Year".**
**Evidence:** `App.tsx` line 50: `<DashboardHeader period="2024 - Full Year" />`

---

### 6. Data Layer

✅ **The frontend has a static mock data file that is NOT used in production flow.**
**Evidence:** `frontend/src/lib/mock-data.ts` exports `mockMovements` with ~60 hardcoded records, but `App.tsx` does NOT import it — it uses `fetch("/api/metrics")` instead.

✅ **Data types are duplicated (not shared) between frontend and backend.**
**Evidence:**
- Backend: `routes.py` defines `FinancialMovement(BaseModel)` via Pydantic
- Frontend: `financial-types.ts` defines `FinancialMovement` as a TS interface
- Both have identical fields: `create_date`, `amount`, `operation_type`, `category`, `business_type`

✅ **Business types are B2B and B2C.**
**Evidence:** Both sides: `BusinessType = Literal["B2B", "B2C"]` (Python) / `type BusinessType = 'B2B' | 'B2C'` (TS).

✅ **Expense subcategories are: suppliers, operational, administrative, others.**
**Evidence:** `routes.py` line 17: `OUTCOME_CATEGORIES = ["suppliers", "operational", "administrative", "others"]`

---

### 7. Testing

✅ **Backend: 5 tests in `test_routes.py`.**
1. `test_generate_mock_movements_returns_full_year_sorted_data` — verifies 360 sorted movements
2. `test_filter_movements_by_date_includes_range_edges` — verifies date filtering
3. `test_health_endpoint_returns_ok` — verifies `/health` endpoint
4. `test_metrics_endpoint_respects_date_filters` — verifies date filters on `/api/metrics`
5. `test_b2b_endpoint_only_returns_b2b_records` — verifies B2B filter

✅ **Frontend: unit tests with Vitest in `financial-utils.test.ts`.**
Tests `computeKPIs`, `computeMonthlyData`, `formatCurrency`, `formatPercent`.

---

### 8. Infrastructure & Execution

✅ **Run with `docker compose up --build`.**
**Evidence:** `README.md` line 80 + `docker-compose.yml`.

✅ **Ports: Frontend 5173, Backend 8000, Debugger 5678.**
**Evidence:** `docker-compose.yml` and `backend/Dockerfile`.

✅ **Hot reload enabled on both services.**
**Evidence:**
- Backend: `uvicorn ... --reload` in `Dockerfile`
- Frontend: `npm run dev` + volume mounts in `docker-compose.yml`

---

### 9. Verification Summary Table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Web financial dashboard | ✅ | `App.tsx`, `kpi-row.tsx`, chart components |
| 2 | Backend Python 3.13 + FastAPI | ✅ | `Dockerfile`, `requirements.txt` |
| 3 | Frontend React 19 + TypeScript 6 + Vite 8 | ✅ | `package.json`, `Dockerfile` |
| 4 | Tailwind CSS 4 + shadcn/ui | ✅ | `package.json`, `components.json` |
| 5 | Recharts for charts | ✅ | `package.json`, chart components |
| 6 | Mock data generated by backend | ✅ | `routes.py:generate_mock_movements()` |
| 7 | Proxy /api → configurable `VITE_API_PROXY_TARGET` (Compose: `host.docker.internal:8000`) | ✅ | `vite.config.ts`, `docker-compose.yml` |
| 8 | CORS enabled | ✅ | `main.py` |
| 9 | 5 backend tests + frontend tests | ✅ | `test_routes.py`, `financial-utils.test.ts` |
| 10 | `mock-data.ts` actively used | ❌ | File exists but `App.tsx` doesn't import it — uses `fetch` |
| 11 | KPIs computed in backend | ❌ | Computed in frontend (`financial-utils.ts`) |
| 12 | Period hardcoded in dashboard | ✅ | `App.tsx` line 50: literal `"2024 - Full Year"` |
| 13 | Docker compose to run | ✅ | `docker-compose.yml`, `README.md` |

---

This and many other projects are built by students as part of the [Career Programs](https://4geeksacademy.com/compare-programs) at [4Geeks Academy](https://4geeksacademy.com). By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors). Find out more about [AI Engineering](https://4geeksacademy.com/en/coding-bootcamps/ai-engineering), [Data Science & Machine Learning](https://4geeksacademy.com/en/coding-bootcamps/data-science-ml), [Cybersecurity](https://4geeksacademy.com/en/coding-bootcamps/cybersecurity) and [Full-Stack Software Developer with AI](https://4geeksacademy.com/en/coding-bootcamps/full-stack-developer).
