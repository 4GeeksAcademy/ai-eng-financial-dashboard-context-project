# Product overview

This is a financial metrics dashboard. The frontend is React and TypeScript. The backend is FastAPI (`README.md`; `verification.md`, claim 1).

The only audience wording in the code is the subtitle "Executive metrics dashboard" (`frontend/src/components/dashboard/dashboard-header.tsx`). The code has no named user, login, or role (`verification.md`, claim 5).

The screen shows:

- A header titled "Financial Overview", the subtitle "Executive metrics dashboard", and a period badge passed as "2024 - Full Year" (`frontend/src/components/dashboard/dashboard-header.tsx`; `frontend/src/App.tsx`; `verification.md`, claim 2).
- Four KPI cards: Total Income, Total Outcome, Profit, and Profit Margin. Income, outcome, and profit are formatted as USD (`frontend/src/components/dashboard/kpi-row.tsx`; `frontend/src/lib/financial-utils.ts`; `verification.md`, claim 3).
- Two charts: "Income vs. Outcome" and "Profit Margin %" (`frontend/src/components/dashboard/income-outcome-chart.tsx`; `frontend/src/components/dashboard/profit-percent-chart.tsx`; `verification.md`, claim 4).

The page loads `GET /api/metrics`, then `computeKPIs` and `computeMonthlyData` in the browser (`frontend/src/App.tsx`; `.agents/rules/frontend-structure.md`, rule 3). Those values feed `KPIRow` and the two charts (`verification.md`, claim 9).

The movements are generated mock data from `generate_mock_movements(seed=42)`, not real company data (`backend/app/routes.py`; `verification.md`, claim 6; `.agents/rules/backend-api.md`, rule 3).
