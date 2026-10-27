# Naming and Organization

## Rule 5: Follow observed component naming and location

Put React components under `frontend/src/components/`, use `.tsx`, and use kebab-case filenames. Dashboard-specific components live in `components/dashboard/`; shared primitives live in `components/ui/`.

**Repo fact:** `dashboard-header.tsx`, `kpi-row.tsx`, `income-outcome-chart.tsx`, and `profit-percent-chart.tsx` live in `frontend/src/components/dashboard/`; `card.tsx` and `skeleton.tsx` live in `frontend/src/components/ui/`.

## Rule 6: Use the configured source alias for frontend imports

Use the `@/` alias for imports resolving into `frontend/src`.

**Repo fact:** `frontend/vite.config.ts` maps `@/` to `frontend/src`, and `frontend/src/App.tsx` imports all components and utilities through that alias.
