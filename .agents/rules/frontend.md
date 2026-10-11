# Frontend Rules

## Scope

React dashboard rendering, client-side financial transformations, and API date handling.

## Rationale

The frontend owns dashboard state and turns API records into KPIs and chart points. Keeping transformations and date semantics explicit prevents incorrect displays.

## Project-Specific Guidance

1. Keep reusable financial calculations in `frontend/src/lib/financial-utils.ts`; dashboard components should consume these functions instead of reimplementing totals or monthly grouping.
   - Repository fact: `frontend/src/App.tsx` calls `computeKPIs` and `computeMonthlyData` from `frontend/src/lib/financial-utils.ts`.

2. Treat backend `YYYY-MM-DD` values as date-only when grouping or formatting them; do not use local-time parsing that can shift a record across a month boundary.
   - Repository fact: `frontend/src/lib/financial-utils.ts` derives grouping keys with `m.create_date.slice(0, 7)` and constructs display labels from date components.

3. Keep API request, loading, and error behavior in `App` unless a dedicated data boundary is introduced and tested.
   - Repository fact: `frontend/src/App.tsx` owns the `/api/metrics` fetch plus its `loading` and `error` state.
