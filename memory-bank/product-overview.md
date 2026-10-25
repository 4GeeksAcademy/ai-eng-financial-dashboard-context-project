# Product Overview

## What this repository provides

This repository contains a financial metrics dashboard with a React frontend and a FastAPI backend. The visible dashboard presents total income, total outcome, profit, profit margin, and monthly income/outcome and profit-percentage charts.

Evidence:

- `frontend/src/App.tsx` loads financial movements and renders the dashboard sections.
- `frontend/src/components/dashboard/kpi-row.tsx` defines the four KPI cards.
- `frontend/src/components/dashboard/income-outcome-chart.tsx` and `profit-percent-chart.tsx` render the monthly charts.
- `frontend/src/lib/financial-utils.ts` computes the KPI and monthly values used by those components.

## Data and API behavior

The backend generates a deterministic set of mock financial movements rather than reading from a database or external financial service. Movements contain a date, amount, income/outcome operation type, category, and B2B/B2C business type.

FastAPI provides health, movement, facet, summary, category ranking, comparison, alert, B2B, and B2C endpoints. The current frontend consumes only `GET /api/metrics` and performs its dashboard aggregation locally.

Evidence:

- `backend/app/routes.py` defines the models, seeded mock generator, and all API routes.
- `frontend/src/App.tsx` fetches `/api/metrics`.
- `backend/tests/test_routes.py` verifies generation, filtering, grouping, categories, comparisons, alerts, and business-type endpoints.

## Intended context

The repository is an educational project for practicing agent-assisted repository stewardship. Its README asks contributors to inspect the existing frontend and backend, document repository rules, and maintain a memory bank. The code does not establish a specific commercial customer or production deployment, so none should be assumed.

Evidence: `README.md` and `README.es.md`.