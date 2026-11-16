# Product overview

## Verified purpose and behavior

The README describes the project as a financial metrics dashboard with a React and TypeScript frontend and a FastAPI backend (`README.md`, `README.es.md`). The frontend displays KPI cards and two monthly charts. In `frontend/src/App.tsx`, it requests `GET /api/metrics`, then calls `computeKPIs` and `computeMonthlyData` before rendering the dashboard components.

The API returns financial movements with `create_date`, `amount`, `operation_type`, `category`, and `business_type` fields (`backend/app/routes.py`, `frontend/src/lib/financial-types.ts`). The backend currently generates mock movements; this repository does not show database persistence.

## Known mismatch

The frontend header in `frontend/src/App.tsx` displays the fixed text `2024 - Full Year`. The backend generates dates relative to the current date in `backend/app/routes.py`. `frontend/src/lib/mock-data.ts` contains static 2024 sample rows, but `App.tsx` does not import that module. Do not assume the displayed period describes the API data.

## Evidence boundaries

This is a code-based description of the checked revision, not a separate product requirements document. No product specification or documented user requirements were found in the reviewed repository files.
