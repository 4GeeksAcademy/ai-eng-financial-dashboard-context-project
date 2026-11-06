# Project brief

**Financial Metrics Dashboard** is a dashboard with a React and TypeScript
frontend and a FastAPI backend, used as a 4Geeks Academy AI Engineering exercise.

## Purpose of the exercise

The goal is to give AI agents useful project context:

1. Inspect the frontend and backend with an agent.
2. Document rules and a memory bank in the fork.
3. Refine and validate them against the project's real workflow.

Rules and skills live in `.agents/`, and `AGENTS.md` points agents to them.

## What the app does

The single page, titled "Financial Overview", shows:

- **KPI cards:** total income, total outcome, profit and profit margin.
- **Income vs. Outcome chart:** monthly lines for both series.
- **Profit Margin % chart:** monthly margin, with a reference line at zero.

## Domain terms

| Term | Meaning |
|---|---|
| Movement | One financial record: date, amount, operation type, category and business type |
| Operation type | `income` or `outcome` |
| Category | `sales`, `suppliers`, `operational`, `administrative` or `others` |
| Business type | `B2B` or `B2C` |
| Profit | Income minus outcome. The API calls this `net` |
| Profit margin | Profit as a percentage of income, or 0 when there is no income |
