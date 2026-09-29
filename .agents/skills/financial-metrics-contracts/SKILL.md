---
name: financial-metrics-contracts
description: Use when changing financial metric API contracts, aggregation, filters, comparisons, alerts, seeded mock data, or frontend KPI and chart transformations in this repository.
---

# Financial Metrics Contracts

Use this skill to preserve financial meaning and contract compatibility across the FastAPI backend and React frontend. It complements `financial-dashboard-analysis`: that skill covers general project work; this one focuses on metric semantics, aggregation parity, and cross-layer validation.

## When to Apply

Apply when a change touches any of the following:

- Pydantic request or response models, endpoint parameters, or OpenAPI output.
- Financial movement fields, categories, operation types, date ranges, or business types.
- Daily, weekly, or monthly aggregation, comparisons, alerts, or top-category calculations.
- Mock movement generation, seeding, reproducibility, or date windows.
- TypeScript API types, KPI formulas, chart transformations, or the mapping of zero and empty results.

For visual styling or general React performance, use the relevant project skill as well. For WCAG-specific work, use `accessibility`; do not duplicate its audit process here.

## Sources of Truth

Inspect the owning code before changing behavior:

- `backend/app/routes.py`: Pydantic models, query parameters, mock generator, filters, aggregation, comparison, and alerts.
- `backend/tests/test_routes.py`: endpoint and domain behavior tests.
- `frontend/src/lib/financial-types.ts`: shared frontend data contracts.
- `frontend/src/lib/financial-utils.ts`: KPI and chart transformations.
- `frontend/src/App.tsx`: endpoint consumption and period mapping.
- `frontend/src/lib/financial-utils.test.ts`, `frontend/src/App.test.tsx`, and `frontend/src/components/dashboard/dashboard-charts.test.tsx`: frontend regression coverage.

The backend is the source of API response shape; TypeScript interfaces do not validate JSON at runtime. If runtime validation is required, propose it explicitly rather than assuming a TypeScript type guarantees valid network data.

## Current Contract

A financial movement has `create_date`, `amount`, `operation_type`, `category`, and `business_type`. Operation types are `income` and `outcome`; business types are `B2B` and `B2C`.

`GET /api/metrics/summary` returns items with `period`, `income`, `outcome`, and `net`. Its `group_by` values are `day`, `week`, and `month`. Period keys are currently ISO date (`YYYY-MM-DD`), ISO week (`YYYY-Www`), and calendar month (`YYYY-MM`). The dashboard consumes the monthly summary endpoint.

Treat these as current repository contracts, not immutable product requirements. If a change intentionally revises a contract or financial convention, make that decision explicit and update backend models, frontend types, and tests together.

## Financial Invariants

Validate the relevant invariants whenever their owning behavior changes:

1. `net` equals `income - outcome`, rounded according to the backend response contract.
2. Summary income and outcome equal the movement totals for the same date range, grouping, category, operation, and business-type filters. Allow only the documented cent-level rounding tolerance when comparing rounded summaries to raw values.
3. KPI profit equals total income minus total outcome. Profit margin is `(profit / totalIncome) * 100` when income is positive and `0` otherwise.
4. Zero is a valid financial value, not the same as an empty result. A zero-margin period with data must remain distinguishable from no periods returned.
5. Calendar dates such as `YYYY-MM-01` must remain in their ISO month in every browser timezone. Do not parse date-only ISO values into local dates and then derive the month with local getters.
6. Weekly periods use ISO week-year as well as ISO week number; test dates around New Year, where the ISO week-year can differ from the calendar year.
7. Comparisons use equal-length adjacent date ranges. Current behavior defines `delta_abs = current - previous`, `delta_pct = null` when the previous net is zero, and otherwise divides the delta by the absolute previous net. Keep or deliberately revise this convention with tests.
8. Alerts are emitted only when a positive historical baseline exists and the increase ratio strictly exceeds the threshold. Current baseline behavior averages prior summary periods; do not silently change its window or meaning.
9. Mock output with a fixed seed must be repeatable even when calls run concurrently. Use a request-local `random.Random(seed)` rather than mutating Python's module-global random state with `random.seed()`.

## Change Workflow

1. Identify the touched endpoint, Pydantic model, frontend type, transformation, and existing tests. Read applicable files in `.agents/rules/`.
2. Write down the affected contract and financial formula before implementation. Separate an intentional product-rule change from a bug fix.
3. Add or update backend tests for response shape, happy path, filters, boundaries, and empty or invalid inputs as applicable.
4. Add or update Vitest tests for transformations and React behavior. Use the existing Vitest runner and `vi` mocks; do not copy `jest.*` APIs from the community testing skill or migrate to Jest without an explicit request.
5. For grouped data, compare summary results against the raw movement endpoint using identical filters. Include day/week/month cases that exercise calendar and ISO-week boundaries.
6. Keep calculations in pure helpers and presentation formatting in the frontend presentation layer. Preserve shared API types in `financial-types.ts` and response schemas in Pydantic.
7. Run the focused test first, then the relevant full suite and frontend build when the change affects the cross-layer contract.

## Suggested Validation

From the repository root, backend tests can run in the service image:

```sh
docker compose run --rm backend python -m pytest -q
```

From `frontend/`:

```sh
npm test
npm run test:coverage
npm run lint
npm run build
```

For date-only parsing regressions, include a run in a western timezone when available:

```sh
TZ=America/Los_Angeles npm test
```

A passing test suite does not prove Docker service-to-service connectivity. If the browser cannot load API data, test the Vite proxy and container network separately from API contract tests.

## Review Checklist

- Do backend response models and frontend types agree on names, enum values, period formats, nullability, and empty-result behavior?
- Do raw movements and aggregates reconcile for the same filters and time boundaries?
- Are net, margin, comparison, alert, and rounding conventions tested explicitly?
- Are zero values kept distinct from missing data in components and accessible chart tables?
- Are date and ISO-week boundaries covered without relying on the developer machine timezone?
- Does seeded mock generation remain deterministic under concurrent requests?
- Did the change update tests at the correct layer without weakening existing tests?
- Are any intentional changes to financial semantics documented for the product owner?

## Known Issues to Flag

When encountered, report rather than silently working around these existing risks:

- The mock generator currently uses module-global random state, so concurrent calls with the same seed can interfere.
- The dashboard header has a hard-coded 2024 period although the API data window is rolling.
- `ProfitPercentChart` currently treats a zero profit margin as no data.
- CORS allows all origins and the development Docker configuration publishes debugpy; do not treat these as production-safe.
