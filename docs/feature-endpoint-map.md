# API endpoint map for proposed dashboard features

**Verified:** 2026-10-15 against the running local FastAPI app at `http://localhost:8000` using its `/openapi.json` schema and representative GET requests. This maps the current backend contract; it does not imply the frontend already calls these endpoints. The interactive API reference is available at [`http://localhost:8000/docs`](http://localhost:8000/docs) while the backend is running.

**Frontend convention checked:** `frontend/src/App.tsx` is currently the only source fetch call found. It uses `${VITE_API_BASE_URL ?? ""}/api/metrics`, checks `response.ok`, and decodes JSON; `frontend/vite.config.ts` proxies `/api` to `http://backend:8000` locally. New requests should preserve this base-URL/proxy convention and use `URLSearchParams` for optional query values.

All routes below use `GET`. Date parameters are optional ISO calendar dates (`YYYY-MM-DD`) and existing movement filters include both boundary dates. Query validation errors return HTTP `422`.

## Feature 1 — Home dashboard date range filter

### `GET /api/metrics`

Returns movements used by the dashboard. Send only the non-empty date filters; omit both for all available data.

| Query parameter | Type / accepted values | Required | Current default |
|---|---|---:|---|
| `start_date` | date, `YYYY-MM-DD` | No | `null` (no lower bound) |
| `end_date` | date, `YYYY-MM-DD` | No | `null` (no upper bound) |
| `category` | `suppliers`, `sales`, `operational`, `administrative`, `others` | No | `null` (all) |
| `operation_type` | `income`, `outcome` | No | `null` (both) |

**Response:** `FinancialMovement[]`

```json
[
  {
    "create_date": "2026-01-01",
    "amount": 6434.18,
    "operation_type": "outcome",
    "category": "operational",
    "business_type": "B2C"
  }
]
```

`amount` is a JSON number. The current frontend can calculate its KPIs and chart series from this filtered list.

### `GET /api/metrics/facets`

No query parameters. Use this response for the unfiltered available-date reference and data-driven categories/business types.

**Response:** `MetricsFacets`

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-10-02",
  "max_date": "2026-09-28"
}
```

Date values above are a live sample, not constants; they are generated from the current mock dataset and will change over time.

## Feature 2 — Home dashboard anomaly alerts

### `GET /api/metrics/alerts`

Returns the anomaly rows. Forward the selected Feature 1 date filters to keep the alert view scoped consistently.

| Query parameter | Type / accepted values | Required | Current default |
|---|---|---:|---|
| `threshold` | number, `>= 0` | No | `0.3` |
| `group_by` | `day`, `week`, `month` | No | `month` |
| `start_date` | date, `YYYY-MM-DD` | No | `null` |
| `end_date` | date, `YYYY-MM-DD` | No | `null` |
| `business_type` | `B2B`, `B2C` | No | `null` (both) |

**Response:** `MetricsAlert[]`

```json
[
  {
    "period": "2026-03",
    "outcome_total": 88076.9,
    "baseline_average": 38276.88,
    "increase_ratio": 1.301
  }
]
```

`increase_ratio` is a ratio, not a percentage value: multiply by 100 for percentage display (for example, `1.301` → `130.1%`). An empty result is `[]`.

**Resolved contract for Feature 2 (implementation required):** Feature threshold accepts ratios `0.01` through `1.0` inclusive. The API must constrain the parameter to this range, in addition to UI validation. `baseline_average` will be the mean of up to the three immediately preceding periods, excluding the current period; if one or two are available use those, if none are available do not evaluate. For a selected start date, fetch enough lookback data for up to three preceding periods, but return alerts only within the selected range. Use strict comparison (`increase_ratio > threshold`); omit alerts where the baseline is zero. These are settled feature-spec decisions, not current backend behavior.

## Feature 3 — B2B vs B2C comparison view

### `GET /api/metrics/categories/top`

Call once per business type with the same dates to get separate top-income-category lists.

| Query parameter | Type / accepted values | Required | Current default |
|---|---|---:|---|
| `operation_type` | `income`, `outcome` | No | `outcome` (pass `income` for this feature) |
| `limit` | integer, `1`–`20` | No | `5` |
| `start_date` | date, `YYYY-MM-DD` | No | `null` |
| `end_date` | date, `YYYY-MM-DD` | No | `null` |
| `business_type` | `B2B`, `B2C` | No | `null` (both; pass one group per call) |

Example requests:

```text
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B&start_date=2026-01-01&end_date=2026-03-31
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C&start_date=2026-01-01&end_date=2026-03-31
```

**Response:** `TopCategoryItem[]`

```json
[
  { "category": "sales", "operation_type": "income", "total_amount": 131534.81 },
  { "category": "others", "operation_type": "income", "total_amount": 17963.64 }
]
```

The list may contain fewer than five rows when fewer categories match. `total_amount` is the category aggregate, not the business line's overall income; the response does not include the denominator needed for each category's share or the total for the comparison chart.

### Supporting data for Feature 3

- `GET /api/metrics/facets` (above) returns the shared, global `categories` list. It has no query parameters and does **not** return categories separately for B2B and B2C.
- `GET /api/metrics/b2b` and `GET /api/metrics/b2c` return `FinancialMovement[]` (same shape as `/api/metrics`) and accept optional `start_date`, `end_date`, `category`, and `operation_type`. For the specified Feature 3 strategy, call each with the selected date bounds and `operation_type=income`; aggregate each response by category to calculate group totals, category shares, and chart totals.

**Resolved contract for Feature 3:** the frontend aggregates the B2B/B2C movement lists, so the top-category endpoint is not required for the first implementation. Use the facets response's global `categories` as the permitted category vocabulary and intersect it with income categories present for each group/date range. Category share is `category_income / group_total_income * 100`. When group total is zero, display an em dash for percentages and zero in the chart. Use the existing single-page app state for navigation rather than introducing routing solely for this view.

## Cross-cutting implementation notes

- Query date bounds are optional and inclusive. The current API does not reject `start_date > end_date`; it can return an empty result. Feature 1 resolves this at the UI: validate and reject reversed ranges before sending a request.
- Current response amounts are floats represented as JSON numbers. Maintain consistent display formatting and avoid relying on example values above.
- Current frontend flow calls only `GET /api/metrics`; these routes must be wired intentionally when implementing the proposed features.

## Verification trail

- `GET /health` → HTTP 200; `GET /docs` → HTTP 200.
- Inspected `/openapi.json` for the relevant path/query/response schemas.
- Issued representative requests to `/api/metrics` (date bounded), `/api/metrics/facets`, `/api/metrics/alerts` (threshold and date bounded), and `/api/metrics/categories/top` for both B2B and B2C with income and date filters. Observed the documented JSON field names and shapes.
- Cross-checked frontend fetch and proxy conventions in `frontend/src/App.tsx` and `frontend/vite.config.ts`; no additional frontend fetch call sites were found.
