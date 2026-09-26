# Frontend Structure

- Keep page-level data loading and composition in `frontend/src/App.tsx`, reusable calculations and formatting in `frontend/src/lib/`, and visual components in `frontend/src/components/`.
- Before changing a financial calculation, search for other implementations of that calculation and keep their behavior consistent.
- Use the existing `@/` alias for imports from `frontend/src`.
- Derive displayed date ranges from the data shown; do not use a fixed year when the backend data window moves with the current date.

Repo anchors: `App.tsx` fetches movements and composes dashboard components; `financial-utils.ts` calculates KPI and monthly aggregates; `vite.config.ts` and `tsconfig.app.json` configure `@/`. `routes.py` assigns movement years relative to `date.today()`, and `App.tsx` derives the displayed range from the monthly data through `formatMonthRange()`.