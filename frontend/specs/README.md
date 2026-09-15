# Frontend specification for the financial dashboard extensions

## Scope
This document defines the frontend contract for three new capabilities requested by the finance team:
1. Date range filter on the home dashboard
2. Anomaly alerts table
3. B2B vs B2C comparison view

## API evidence and resolved mismatches

### Verification trail
- Swagger UI target: `https://literate-space-fortnight-pj7g477rw6x9f7q5g-8000.app.github.dev/docs`.
- The public Codespaces tunnel redirects unauthenticated requests to GitHub sign-in.
- The same running backend exposes `http://127.0.0.1:8000/openapi.json` with HTTP 200; its live schema was inspected for the routes and fields below.

### Verified API claims
- `GET /api/metrics/facets` returns `operation_types`, `business_types`, `categories`, `min_date`, and `max_date`.
- `GET /api/metrics/alerts` accepts `threshold`, `group_by`, `start_date`, `end_date`, and `business_type`.
- `GET /api/metrics/categories/top` accepts `operation_type`, `limit`, `start_date`, `end_date`, and `business_type`.
- Dates are serialized in the wire format `YYYY-MM-DD`.

### Resolved mismatches
- The PM request says the threshold should be `0.01` to `1.0`. The backend enforces only `threshold >= 0`. The frontend contract should clamp user input to `[0.01, 1.0]` while using the API as the source of truth for the final request.
- The PM request describes a single chart comparing B2B vs B2C total income, but the API does not expose a dedicated chart endpoint. The frontend should derive the totals from the segment-filtered income datasets (`/api/metrics/b2b` and `/api/metrics/b2c`) or the filtered summary endpoint.
- The raw API response keys use snake_case (`start_date`, `end_date`, `total_amount`), while the frontend may use its own internal naming convention. The spec keeps the query names consistent with the backend and maps them in the UI layer as needed.

## Endpoints consumed

### Feature 1: home dashboard date range
- `GET /api/metrics/facets`
- Existing filtered metrics endpoints, including `GET /api/metrics` and `GET /api/metrics/summary`

### Feature 2: anomaly alerts
- `GET /api/metrics/alerts?threshold=<ratio>&group_by=<day|week|month>&start_date=<YYYY-MM-DD>&end_date=<YYYY-MM-DD>`

### Feature 3: B2B vs B2C income comparison
- `GET /api/metrics/facets`
- `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B`
- `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C`
- Derived total-income comparison values from the filtered B2B/B2C income datasets

## TypeScript contracts

The frontend type definitions live in:
- `frontend/specs/api-types.ts`
- `frontend/specs/params-types.ts`

The most important wire models are:
- `FacetsResponse`
- `AlertsResponse`
- `TopCategoriesResponse`
- `DateRangeFilter`
- `AlertsParams`
- `TopCategoriesParams`

## Valid values and constraints

### Dates
- Format: `YYYY-MM-DD`
- Optional in both `start_date` and `end_date`
- Empty value means “no lower bound” or “no upper bound”
- Range validation: `start_date <= end_date`

### Threshold
- Default value: `0.3`
- Frontend UI constraint: `0.01 <= threshold <= 1.0`
- Backend minimum: `threshold >= 0`

### Categories
- Allowed values: `administrative`, `operational`, `others`, `sales`, `suppliers`
- `FacetsResponse.categories` is the canonical list of categories the UI should display

### Segment filters
- Allowed values: `B2B`, `B2C`

### Operation types
- Allowed values: `income`, `outcome`

## Edge cases by feature

### Feature 1
1. `start_date` is empty and `end_date` is present: treat as “all dates before end_date”.
2. `start_date` is present and `end_date` is empty: treat as “all dates from start_date onward”.
3. `start_date > end_date`: block the request in the UI or show an inline validation error instead of sending it.
4. `facets.min_date` and `facets.max_date` are identical: the UI should allow the single-day selection and still render correctly.

### Feature 2
1. The threshold is outside the UI range (`0`, `1.5`, negative): clamp or sanitize before the request is sent.
2. No anomalies exist for the selected date range: show a clear empty state message instead of a blank table.
3. `group_by` is set to `week` or `day`: the API response still returns a `period` field, and the UI should handle string labels without assuming a month-only format.

### Feature 3
1. B2B has no income rows in the selected range: render the B2B section with empty-state text and a neutral chart value of `0`.
2. B2C has no income rows in the selected range: render the B2C section with empty-state text and a neutral chart value of `0`.
3. Fewer than five categories exist: show the available categories in descending `total_amount` order without padding the list.
4. The facet list includes categories not present in the top-five result: the table should render only the returned category rows, while the page-level legend and filters should still use the full facet list.

## Non-goals
- This document does not prescribe implementation details for React components, hooks, or network layers.
- This document does not require front-end code changes beyond the specification artifacts.
- External API or auth behavior is out of scope for the current challenge.
