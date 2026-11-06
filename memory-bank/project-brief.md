# Project brief

**Financial Metrics Dashboard** is a dashboard with a React and TypeScript
frontend and a FastAPI backend, used as a 4Geeks Academy AI Engineering exercise.

Every statement below has a source you can check.

## Product overview

| Statement | Evidence |
|---|---|
| Described as a financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend | `README.md` |
| The single page is titled "Financial Overview", with the subtitle "Executive metrics dashboard" | `dashboard-header.tsx` |
| KPI cards show total income, total outcome, profit and profit margin | `kpi-row.tsx` |
| One chart shows monthly income and outcome | `income-outcome-chart.tsx` |
| One chart shows monthly profit margin, with a reference line at zero | `profit-percent-chart.tsx` |
| The header shows the period covered by the data | `App.tsx`, `/api/metrics/facets` |
| All data is simulated and nothing is stored | `generate_mock_movements` in `routes.py` |

## Purpose of the exercise

Give AI agents useful project context, according to `README.md`:

1. Inspect the frontend and backend with an agent.
2. Document rules and a memory bank in the fork.
3. Refine and validate them against the project's real workflow.

Rules and skills live in `.agents/`, and `AGENTS.md` points agents to them.

## Domain terms

Defined by `backend/app/routes.py` and `frontend/src/lib/financial-utils.ts`.

| Term | Meaning |
|---|---|
| Movement | One financial record: date, amount, operation type, category and business type |
| Operation type | `income` or `outcome` |
| Category | `sales`, `suppliers`, `operational`, `administrative` or `others` |
| Business type | `B2B` or `B2C` |
| Profit | Income minus outcome. The API calls this `net` |
| Profit margin | Profit as a percentage of income, or 0 when there is no income |

## Not known

The repo gives no evidence for these, so do not assume or state them:

- Who the real users are, or what business the data represents.
- Whether real data, authentication or a database are planned.
- Whether or where the app will be deployed.
- Any product roadmap.
