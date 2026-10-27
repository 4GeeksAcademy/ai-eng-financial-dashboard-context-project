# Architecture and Data Flow

## Rule 1: Keep frontend-consumed financial payloads aligned across backend and frontend

When changing a field consumed by the UI, update the relevant Pydantic model in `backend/app/routes.py` and the TypeScript declaration in `frontend/src/lib/financial-types.ts`. Add a frontend TS type when the frontend begins consuming a new backend response.

**Repo fact:** `FinancialMovement` is declared in both files, while backend response models `MetricsSummaryItem`, `MetricsComparison`, and `MetricsAlert` in `backend/app/routes.py` have no matching frontend declarations.

## Rule 2: Use the existing API proxy for frontend API calls

Prefer relative `/api/...` URLs in frontend code unless intentionally configuring a different origin via `VITE_API_BASE_URL`.

**Repo fact:** `frontend/vite.config.ts` proxies `/api` to `http://backend:8000`, and `frontend/src/App.tsx` fetches `${API_BASE_URL}/api/metrics` with `API_BASE_URL` defaulting to `""`.

## Rule 3: Make the data source for dashboard calculations explicit

If adding UI features based on backend analytics, connect the corresponding route deliberately instead of assuming it is already in use.

**Repo fact:** `frontend/src/App.tsx` calls only `/api/metrics` and computes displayed KPIs/charts with `frontend/src/lib/financial-utils.ts`; the summary, comparison, top-categories, alerts, facets, and B2B/B2C routes defined in `backend/app/routes.py` are not consumed by the current UI.

## Rule 4: Revisit mock-data generation if dataset size or request load grows; do not add caching or service indirection solely for the current mock size

**Repo fact:** each analytics handler in `backend/app/routes.py` calls `generate_mock_movements(seed=42)`, which constructs 360 movements (12 months × 30) per request.
