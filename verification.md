# Phase 1 verification trail

| # | Claim (short) | Mark | How verified |
|---|---|---|---|
| 1 | Financial metrics dashboard: React + TypeScript frontend, FastAPI backend. | ✅ | Verified in the file cited (`README.md`). |
| 2 | Heading “Financial Overview,” subtitle “Executive metrics dashboard,” badge “2024 - Full Year.” | ✅ | Seen in the browser at http://localhost:5173. |
| 3 | Four KPI cards: Total Income, Total Outcome, Profit, Profit Margin (USD). | ✅ | Seen in the browser at http://localhost:5173. |
| 4 | Two charts: “Income vs. Outcome” and “Profit Margin %.” | ✅ | Seen in the browser at http://localhost:5173. |
| 5 | No named user, login, or role in the code. | ❓ | No login or user roles exist in the code. |
| 6 | Backend returns a fixed mock movement list (seed 42) from `GET /api/metrics`. | ✅ | Verified in the file cited (`backend/app/routes.py`). |
| 7 | Frontend loads `${API_BASE_URL}/api/metrics`; base URL is `VITE_API_BASE_URL` or empty. | ✅ | Verified in the file cited (`frontend/src/App.tsx`, `frontend/.env.example`). |
| 8 | Vite proxies `/api` to `http://backend:8000`. | ✅ | Verified in the file cited (`frontend/vite.config.ts`). |
| 9 | `computeKPIs` and `computeMonthlyData` feed `KPIRow` and the two charts. | ✅ | Verified in the files cited (`frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts`). |
| 10 | Run with `docker compose up --build`. | ✅ | Ran `docker compose up --build` and both services started. |
| 11 | Frontend URL is http://localhost:5173. | ✅ | Seen in the browser at http://localhost:5173. |
| 12 | Backend URL is http://localhost:8000. | ✅ | http://localhost:8000/docs loads. |
| 13 | API docs are at http://localhost:8000/docs. | ✅ | Corrected: agent marked UNVERIFIED; page loads in browser. |

## Findings

- The "2024 - Full Year" badge is hardcoded (frontend/src/App.tsx line 49), but the backend builds dates from today's date (backend/app/routes.py line 97), so the charts show the last 12 months, not 2024.
- The backend also starts a debugger on port 5678 (backend/Dockerfile), which the README does not mention.
