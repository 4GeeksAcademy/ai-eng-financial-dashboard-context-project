# Project Context

- **Last verified:** 2026-10-09
- **Source:** repository inspection recorded in [`../verifications.md`](../verifications.md); normative rules are in [`../verificacions-phase2.md`](../verificacions-phase2.md).

This repository contains a demo financial metrics dashboard with a React/TypeScript frontend and FastAPI/Python backend. It displays income, expenses, net profit, and profit margin using synthetic movements. The intended user persona is not formally specified in the repository; do not present an inferred persona as an approved requirement.

The active UI fetches `GET /api/metrics`, then calculates KPI totals and monthly chart data in the frontend. The backend also defines summary, comparison, alert, top-category, facet, B2B, and B2C endpoints, but the current UI does not consume them. There is no database or persistent financial data store.

Use [README.md](../README.md) for run instructions, [`architecture-and-data-flow.md`](architecture-and-data-flow.md) for the current system map, and [`known-constraints.md`](known-constraints.md) for limitations. Keep this note factual and update its review date when implementation changes.

## Evidence

- Frontend flow: [`../frontend/src/App.tsx`](../frontend/src/App.tsx)
- Backend routes and synthetic data: [`../backend/app/routes.py`](../backend/app/routes.py)
- Current system verification: [`../verifications.md`](../verifications.md)

