# Product Overview

## Purpose

This repository implements a financial metrics dashboard. The frontend requests financial movements from `GET /api/metrics`, computes KPIs and monthly chart data, and renders a dashboard header, KPI row, income/outcome chart, and profit-percent chart.

## Current Data Behavior

The backend returns generated financial movements rather than persisted records. Each movement has a date, amount, operation type, category, and business type. Metrics endpoints generate data with `seed=42`; dates are based on the current date.

## Evidence

- `README.md` describes the project as a financial metrics dashboard with React, TypeScript, and FastAPI.
- `frontend/src/App.tsx` fetches `/api/metrics` and renders the dashboard components.
- `frontend/src/lib/financial-utils.ts` computes KPI and monthly data from returned movements.
- `backend/app/routes.py` defines `FinancialMovement`, generates mock movements, and exposes metrics endpoints.
