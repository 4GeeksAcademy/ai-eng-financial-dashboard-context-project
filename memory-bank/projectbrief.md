# Project Brief — Financial Metrics Dashboard

_Last verified: 2026-10-09 against the repository._

## What this product is

An executive financial metrics dashboard: a React + TypeScript single-page app that visualizes financial movements (income/outcome by month, KPIs, profit percentage) served by a FastAPI backend.

- Frontend entry: `frontend/src/main.tsx` mounts `App` (`frontend/src/App.tsx`).
- Backend entry: `backend/app/main.py` (`app.main:app`), routes in `backend/app/routes.py`.

## Core capabilities (verified)

| Capability | Evidence |
|---|---|
| KPI cards (income, outcome, profit, profit %) | `frontend/src/components/dashboard/kpi-card.tsx`, `kpi-row.tsx`; computed in `frontend/src/lib/financial-utils.ts` (`computeKPIs`) |
| Monthly income/outcome and profit-% charts | `income-outcome-chart.tsx`, `profit-percent-chart.tsx` (Recharts); data from `computeMonthlyData` |
| Period badge derived from loaded data | `computePeriodLabel` in `financial-utils.ts`; wired in `App.tsx` (fixed 2026-10-09, was hard-coded "2024") |
| REST API: health, metrics, facets, summary, top categories, comparison, alerts, B2B/B2C | Route decorators in `backend/app/routes.py` |
| Seeded deterministic mock data (360 movements, `seed=42`) | `generate_mock_movements()` in `backend/app/routes.py`; no database exists |

## Data model

`FinancialMovement`: `create_date` (date-only string), `amount` (float, USD), `operation_type` (`income`|`outcome`), `category` (`sales`, `suppliers`, `operational`, `administrative`, `others`), `business_type` (`B2B`|`B2C`). Declared twice: Pydantic in `backend/app/routes.py`, TS in `frontend/src/lib/financial-types.ts`.

## Intended usage context

Educational/AI-engineering exercise (4Geeks Academy): students fork the repo, run an AI agent over it, and derive contributor rules + a memory bank (see `README.md` "Recommended steps", `AGENTS.md`). UI copy is in Spanish; docs are bilingual (`README.md` / `README.es.md`).

## What it is NOT (yet)

- Not backed by a database — every analytics request regenerates mock data.
- Not all API endpoints are consumed by the UI; only `GET /api/metrics` is used (`App.tsx`).
- Not production-hardened: wildcard CORS, published debug port (see `activeContext.md` gaps).
