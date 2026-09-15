# Component specifications

## 1) Feature: Date range filter on the home dashboard

### Goal
Allow the user to narrow the dashboard to a custom time window without losing the ability to view the full dataset when both fields are empty.

### API contract
- Endpoint: `GET /api/metrics/facets`
- Response: `FacetsResponse`
- Available range: `min_date` and `max_date`
- Filters applied to existing metric endpoints using `start_date` and `end_date` query parameters

### Component contract
`DateRangeFilter`

Props:
- `value: DateRangeFilter`
- `availableRange: { minDate: string; maxDate: string }`
- `onChange: (nextValue: DateRangeFilter) => void`
- `disabled?: boolean`

Behavior:
- Render two inputs: `start date` and `end date`.
- Each input accepts a string in `YYYY-MM-DD` format.
- Empty values mean the filter is disabled.
- If only `start_date` is provided, filter from that date through the latest available date.
- If only `end_date` is provided, filter from the earliest available date through that date.
- The UI should prevent invalid ranges such as `start_date > end_date` by disabling the apply state or by showing a validation error.
- The visible helper text should show the usable range from the facets response, for example: `Available range: 2025-01-01 to 2025-12-31`.

### Data flow
- Fetch `GET /api/metrics/facets` once on dashboard load.
- Keep the selected date range in local page state.
- Pass the same range to all chart/table requests listed in the feature spec.

---

## 2) Feature: Anomaly alerts table on the home dashboard

### Goal
Highlight periods where the outcome value spikes above a configurable historical baseline.

### API contract
- Endpoint: `GET /api/metrics/alerts`
- Query contract: `threshold`, `group_by`, `start_date`, `end_date`, `business_type`
- Response: `AlertsResponse` (array of `AlertEntry`)

### Component contract
`AnomalyAlertsTable`

Props:
- `entries: AlertsResponse`
- `threshold: number`
- `onThresholdChange: (value: number) => void`
- `dateRange: DateRangeFilter`
- `isLoading?: boolean`

Behavior:
- Render columns: Period, Recorded outcome, Rolling average of previous 3 periods, Percentage increase.
- The table should show the API response fields mapped as:
  - `period` → Period
  - `outcome_total` → Recorded outcome
  - `baseline_average` → Rolling average of previous 3 periods
  - `increase_ratio` → Percentage increase
- The threshold control is a numeric input with a valid range of `0.01` to `1.0` and default `0.3`.
- If `entries.length === 0`, render an explicit empty-state message such as: `No anomalies match the current filters.`
- The component must respect the same date range as the home dashboard.

### Data flow
- Request the alerts endpoint with `threshold` and the current `DateRangeFilter`.
- The UI-level input can clamp values to `[0.01, 1.0]`, even though the backend only enforces `threshold >= 0`.
- Results should be recalculated whenever threshold or date range changes.

---

## 3) Feature: B2B vs B2C comparison view

### Goal
Compare income performance by business segment and expose the top five income categories for each group.

### API contract
- Facets endpoint: `GET /api/metrics/facets`
- Top categories endpoint: `GET /api/metrics/categories/top?operation_type=income&limit=5`
- Business segment filtering: the backend supports `business_type=B2B|B2C` on the category-top endpoint.
- No dedicated endpoint exists for the total-income comparison chart; the front end must derive a single value per segment from the filtered income data.

### Component contract
`BusinessComparisonView`

Props:
- `dateRange: DateRangeFilter`
- `availableCategories: string[]`
- `b2bCategories: TopCategoriesResponse`
- `b2cCategories: TopCategoriesResponse`
- `totalIncome: { b2b: number; b2c: number }`

Behavior:
- Render two side-by-side sections, one for B2B and one for B2C.
- Each section shows a table with columns:
  - Category name
  - Total income
  - Percentage of group total
- The list should be ordered by descending `total_amount` and limited to the top five entries.
- A separate chart below both tables compares `totalIncome.b2b` versus `totalIncome.b2c`.
- Date filters are shared across both sections and apply to category totals and summary values.

### Derivation rules
- Use `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B` for B2B and the same with `business_type=B2C` for B2C.
- Use the `FacetsResponse.categories` list as the canonical category set for the comparison page.
- Compute each comparison chart total from all filtered income movements for that segment, using `GET /api/metrics/summary?operation_type=income&business_type=B2B|B2C` or the corresponding segment movement endpoint. Do not sum only the top-five category response, because it excludes lower-ranked categories.

### Edge conditions
- If the B2B top-five response is empty, display a short empty state inside the B2B section.
- If the B2C top-five response is empty, display a short empty state inside the B2C section.
- If the categories response is empty, keep the table rows empty but do not crash the page.
- When the date range is empty, treat it as "all time" and use the default unfiltered response.
