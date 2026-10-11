# Architecture Rules

## Scope

Cross-service behavior, browser-to-API communication, and financial-movement contract changes.

## Rationale

The dashboard depends on a Vite proxy and matching FastAPI and TypeScript data contracts. Changes to either side can otherwise break the dashboard without a compile-time error.

## Project-Specific Guidance

1. Use relative `/api` URLs for browser requests unless an explicit `VITE_API_BASE_URL` override is required.
   - Repository fact: `frontend/src/App.tsx` requests `/api/metrics`, and `frontend/vite.config.ts` proxies `/api` to `http://backend:8000`.

2. When changing the financial-movement API contract, update the FastAPI model, frontend TypeScript type, and tests that consume the changed fields in the same change.
   - Repository fact: `backend/app/routes.py` defines `FinancialMovement`, while `frontend/src/lib/financial-types.ts` independently mirrors its fields and allowed values.

3. Derive the displayed dashboard period from returned data or an explicit API filter; do not hardcode a reporting year.
   - Repository fact: `frontend/src/App.tsx` calls `getDashboardPeriod(movements)`, while `backend/app/routes.py` derives generated movement years from `date.today()`.
