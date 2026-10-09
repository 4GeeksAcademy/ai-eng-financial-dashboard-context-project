# Project State

- **Last reviewed:** 2026-10-09
- **Review basis:** static inspection of source and [`../verifications.md`](../verifications.md).
- **Runtime and test status:** not checked for this update; no claim is made that containers or tests pass.

## Current status

This repository is a financial metrics dashboard prototype/demo. Based on source inspection, the frontend and API features below are implemented. Runtime availability has not been verified for this note. This describes code state, not production readiness.

## Implemented in source

| Area | Current behavior | Evidence |
|---|---|---|
| Frontend dashboard | Shows income, expenses, net profit, and profit margin, with monthly income/expense and margin charts. | [`../frontend/src/App.tsx`](../frontend/src/App.tsx), [`../frontend/src/components/dashboard/kpi-row.tsx`](../frontend/src/components/dashboard/kpi-row.tsx), [`../frontend/src/components/dashboard/income-outcome-chart.tsx`](../frontend/src/components/dashboard/income-outcome-chart.tsx), [`../frontend/src/components/dashboard/profit-percent-chart.tsx`](../frontend/src/components/dashboard/profit-percent-chart.tsx) |
| Loading/error states | Shows loading placeholders and a fetch error message. | [`../frontend/src/App.tsx`](../frontend/src/App.tsx), [`../frontend/src/components/ui/skeleton.tsx`](../frontend/src/components/ui/skeleton.tsx) |
| Frontend calculations | Computes KPI totals and monthly aggregates from movements. | [`../frontend/src/lib/financial-utils.ts`](../frontend/src/lib/financial-utils.ts) |
| Synthetic data | Backend generates 360 movements per request with a fixed seed; date years depend on runtime date. | [`../backend/app/routes.py`](../backend/app/routes.py) |
| API | Defines health, movement, facets, summary, top-category, comparison, alert, B2B, and B2C routes. | [`../backend/app/routes.py`](../backend/app/routes.py) |

## Integration state

The current UI calls only `GET /api/metrics` on initial mount. Vite proxies `/api` to the Compose backend service at `backend:8000`. The UI does not consume the other metrics routes. Data is generated in memory; there is no database or persistence layer.

**Evidence:** [`../frontend/src/App.tsx`](../frontend/src/App.tsx), [`../frontend/vite.config.ts`](../frontend/vite.config.ts), [`../docker-compose.yml`](../docker-compose.yml), [`../backend/app/routes.py`](../backend/app/routes.py).

## Known gaps

| Gap | Effect | Evidence |
|---|---|---|
| No real-data ingestion or persistence | No CSV/Excel import, transaction editing, or persistent records. | [`../backend/app/routes.py`](../backend/app/routes.py), [`../frontend/src/App.tsx`](../frontend/src/App.tsx) |
| Partial API/UI integration | Facets, summary, comparison, alerts, top categories, and B2B/B2C routes are not connected to UI controls. | [`../frontend/src/App.tsx`](../frontend/src/App.tsx), [`../backend/app/routes.py`](../backend/app/routes.py) |
| No filters or period selection | Users cannot filter displayed data or choose a date range. | [`../frontend/src/App.tsx`](../frontend/src/App.tsx) |
| Static displayed period | UI says `2024 - Full Year`, while backend dates depend on runtime date. | [`../frontend/src/App.tsx`](../frontend/src/App.tsx), [`../backend/app/routes.py`](../backend/app/routes.py) |
| Development-only settings | Wildcard CORS and debug/reload settings need review before production exposure. | [`../backend/app/main.py`](../backend/app/main.py), [`../backend/Dockerfile`](../backend/Dockerfile) |

These are known limitations, not approved roadmap items. MVP and roadmap remain pending product decisions in [`../docs/product/MVP.md`](../docs/product/MVP.md) and [`../docs/product/ROADMAP.md`](../docs/product/ROADMAP.md).

## Guidance for contributors and agents

- Read [`../AGENTS.md`](../AGENTS.md), [`../verificacions-phase2.md`](../verificacions-phase2.md), and applicable rules before work.
- Confirm current source and tests before relying on this snapshot; update the review date, status, and evidence in the same change when behavior changes.
- Distinguish implemented in source from runtime-verified. Record exact checks and outcomes; do not claim unexecuted tests passed.
- Do not turn a known gap into a requirement or roadmap commitment without product approval. Record approved architecture decisions as ADRs in [`../docs/adr/README.md`](../docs/adr/README.md).

## Verification references

- Detailed static review and API catalog: [`../verifications.md`](../verifications.md).
- Normative engineering standards: [`../verificacions-phase2.md`](../verificacions-phase2.md).

