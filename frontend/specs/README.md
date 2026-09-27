# Frontend feature specifications

This document describes the three implemented dashboard features and the backend contracts they consume. Endpoint paths and parameter constraints are aligned with `backend/app/routes.py` and the TypeScript contracts in `src/lib/financial-types.ts`.

## Shared conventions

- API base URL is read from `VITE_API_BASE_URL`; paths below are relative to that base.
- Date filters are inclusive and are sent only when present. Empty inputs are omitted from the query string; the frontend never sends `start_date=` or `end_date=`.
- Dates use `YYYY-MM-DD` and are narrowed to `ISODate` only after parsing and calendar-date validation.
- API failures are shown as a destructive error banner in the owning page/section. Existing valid data remains visible where possible.
- Amounts use `formatCurrency`; percentages use `formatPercent`.
- Loading states use skeletons. Valid empty results use an explicit empty-state message rather than an error.

## Shared TypeScript types

```ts
export type OperationType = "income" | "outcome";
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";
export type BusinessType = "B2B" | "B2C";
export type ISODate = `${number}-${number}-${number}`;

export interface DateRangeFilter {
  start_date?: ISODate;
  end_date?: ISODate;
}

export interface FinancialMovement {
  create_date: string;
  amount: number;
  operation_type: OperationType;
  category: Category;
  business_type: BusinessType;
}
```

---

## Feature 1 — Date range filter and filtered dashboard

### Purpose

Allows the user to filter the overview dashboard by an inclusive start and/or end date. The selected range is shared with the comparison page.

### Consumed endpoints

| Endpoint | Request | Response | Usage |
|---|---|---|---|
| `GET /api/metrics/facets` | No query parameters | `FacetsResponse` | Loads the available date range and filter metadata once. |
| `GET /api/metrics` | `DateRangeFilter` | `FinancialMovement[]` | Loads movements for the current range; KPIs and charts are derived in the frontend. |

The frontend intentionally uses the server-side `start_date` and `end_date` filters and does not filter movements again in the browser.

### Request types and constraints

```ts
export interface DateRangeFilter {
  start_date?: ISODate; // inclusive, YYYY-MM-DD
  end_date?: ISODate;   // inclusive, YYYY-MM-DD
}

export function fetchFacets(signal?: AbortSignal): Promise<FacetsResponse>;
export function fetchMovements(
  filter: DateRangeFilter,
  signal?: AbortSignal,
): Promise<FinancialMovement[]>;
```

Backend constraints:

- `start_date` and `end_date` are optional valid calendar dates.
- If both are supplied, the API accepts the request even when the range has no matching movements.
- The UI rejects `start_date` after `end_date` before making a request.
- The UI rejects `start_date` before `facets.min_date`.
- The UI rejects `end_date` after `facets.max_date`.
- A start date after the available maximum, or an end date before the available minimum, is allowed and produces an empty result.
- `facets.min_date` and `facets.max_date` are computed from the full dataset and are not hardcoded.

### Response types

```ts
export interface FacetsResponse {
  operation_types: OperationType[];
  business_types: BusinessType[];
  categories: Category[];
  categories_by_business_type: Partial<
    Record<BusinessType, Partial<Record<OperationType, Category[]>>>
  >;
  min_date: ISODate;
  max_date: ISODate;
}

export interface FinancialMovement {
  create_date: string;
  amount: number;
  operation_type: OperationType;
  category: Category;
  business_type: BusinessType;
}
```

### UI behaviour and edge cases

1. **Empty range:** on initial load, both date inputs are empty and the dashboard requests `/api/metrics` without date query parameters. The full dataset is shown.
2. **Invalid order:** if the user enters a start date after the end date, the draft value remains in the input, an inline message says `Start date must be on or before end date.`, and the last valid dashboard data remains visible; no movement request is made.
3. **Valid range with no movements:** KPIs show zero values, charts show their empty states, and the UI displays `No movements in the selected range.` above the KPI section.
4. **Facets unavailable:** while facets are loading, the available-range text is a skeleton. If facets fail, the inputs remain usable without `min`/`max` attributes and the UI shows `Available range unavailable`.
5. **Stale response:** when the range changes quickly, the previous request is aborted and stale results must not replace the newest range's data.

The date filter has labelled `Start date` and `End date` inputs plus a `Clear` button. The clear button is disabled when both values are empty.

---

## Feature 2 — Spending anomaly alerts

### Purpose

Shows monthly periods whose outcome is greater than the previous three-period average by more than a configurable threshold.

### Consumed endpoint

| Endpoint | Request | Response |
|---|---|---|
| `GET /api/metrics/alerts` | `AlertParams` | `AlertResponse` |

The frontend omits `group_by`, relying on the backend default `month`.

### Request types and constraints

```ts
export interface AlertParams extends DateRangeFilter {
  threshold?: number;
}

export function fetchAlerts(
  params: AlertParams,
  signal?: AbortSignal,
): Promise<AlertResponse>;
```

Parameter constraints:

- `threshold` is a ratio, not a percentage: `0.3` means `+30%`.
- `threshold` is optional; backend default is `0.3`.
- When supplied, `threshold` must be a finite number from `0.01` through `1.0`, inclusive. Invalid values produce a validation error; the UI prevents those requests.
- `start_date` and `end_date` use the shared inclusive date constraints described in Feature 1.
- `group_by` exists in the backend contract and accepts `day`, `week`, or `month`, but this feature intentionally uses the default monthly grouping and does not send it.

### Response types

```ts
export interface AlertEntry {
  period: string;             // monthly response: YYYY-MM
  outcome_total: number;      // rounded amount, >= 0
  baseline_average: number;   // previous 3 periods, > 0 for an alert
  increase_ratio: number;     // ratio; 0.3 means +30%
}

export type AlertResponse = AlertEntry[];
```

Responses are ordered chronologically by `period`. An empty array means no period exceeded the threshold; it is not an API failure.

### UI behaviour and edge cases

1. **No alerts:** keep the card title and table headers visible, then show `No spending anomalies above +{threshold}% for the selected period.` and the muted explanation that the first three months have no baseline and are never flagged.
2. **First three periods:** periods without three preceding periods are never flagged, even if their outcome is high. The empty-state hint explains this rule.
3. **Zero baseline:** if the previous three-period average is zero, the backend does not create an alert because the increase ratio cannot be calculated. The UI shows no alert for that period rather than displaying infinity or an invalid percentage.
4. **Invalid threshold draft:** empty, non-numeric, or out-of-range values show `Enter a ratio between 0.01 and 1.0.`; the last valid threshold and alert data remain active. A valid value is requested after a 300 ms debounce.
5. **Request failure:** show an alerts-specific error banner inside the anomaly section without hiding the KPIs or charts.
6. **Loading:** preserve the table header and render three skeleton rows in the table body.

Displayed columns:

- `Period`: `formatPeriodLabel`, for example `2025-12` → `Dec 2025`.
- `Outcome`: `formatCurrency(outcome_total)`.
- `3-period average`: `formatCurrency(baseline_average)`.
- `Increase`: `+${formatPercent(increase_ratio * 100)}`.

---

## Feature 3 — B2B versus B2C comparison

### Purpose

Provides a hash-linkable comparison view with top income categories and total income for B2B and B2C. Navigation uses `#/comparison` and `#/` without adding a router dependency.

### Consumed endpoints

| Endpoint | Request | Response | Usage |
|---|---|---|---|
| `GET /api/metrics/facets` | No query parameters | `FacetsResponse` | Supplies the stable category row set for each business line. |
| `GET /api/metrics/categories/top` | `TopCategoriesParams` for B2B and B2C | `TopCategoriesResponse` | Two requests run in parallel for income totals by category. |

For each business line the page sends:

```text
/api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B
/api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C
```

The shared date range is added when either date is selected.

### Request types and constraints

```ts
export interface TopCategoriesParams extends DateRangeFilter {
  operation_type: OperationType;
  limit?: number;
  business_type?: BusinessType;
}

export function fetchTopCategories(
  params: TopCategoriesParams,
  signal?: AbortSignal,
): Promise<TopCategoriesResponse>;
```

Parameter constraints:

- `operation_type` accepts `income` or `outcome`; the comparison always sends `income`.
- `limit` is an integer from `1` through `20`; the comparison sends `5` because the current category universe has exactly five values.
- `business_type` is optional in the API and accepts `B2B` or `B2C`; the comparison sends one explicit value per request.
- `start_date` and `end_date` are optional inclusive `YYYY-MM-DD` values and follow Feature 1 validation.
- If the category universe grows beyond five categories, the comparison must request a larger limit (up to `20`) to calculate the complete group total, then slice displayed rows to five.

### Response and derived types

```ts
export interface TopCategoryEntry {
  category: Category;
  operation_type: OperationType;
  total_amount: number;
}

export type TopCategoriesResponse = TopCategoryEntry[];

export interface CategoryShare {
  category: Category;
  total_amount: number;
  share_pct: number | null; // 0–100, null when total_income is 0
}

export interface BusinessLineSummary {
  business_type: BusinessType;
  total_income: number;
  rows: CategoryShare[]; // maximum five, amount desc then category asc
}
```

The frontend derives `BusinessLineSummary` as follows:

1. Use `facets.categories_by_business_type[businessType]?.income` as the row set.
2. Use the matching top-category amount, or `0` when that category has no income in the selected range.
3. Ignore response categories not present in facets.
4. Sum all row amounts for `total_income`.
5. Calculate `share_pct = total_amount / total_income * 100`; use `null` for every share when the total is zero.
6. Sort by amount descending and category name ascending, then keep at most five rows.
7. If facets are unavailable, fall back to categories present in the top-category response.

### UI behaviour and edge cases

1. **One line fails:** show an error banner in the comparison section only. Render the successfully loaded line in the table and chart; the failed line remains in its loading/empty state rather than breaking the whole page.
2. **No income in a line:** show `No income categories for B2B.` or `No income categories for B2C.` in the relevant table. The chart shows `No income in the selected range.` when every loaded line has zero income.
3. **Zero-income facet category:** retain the category row with income `0` and share `0%`, so rows remain stable when the date range changes.
4. **Total income is zero:** show an em dash (`—`) for every percentage instead of dividing by zero.
5. **Tied category amounts:** sort ties alphabetically by category name.
6. **Date range change:** clear the previous summaries while the two new requests are pending, show skeletons, and ignore aborted/stale responses.
7. **Partial data:** the chart contains only loaded business lines and keeps B2B/B2C labels correct during loading.

The page renders:

- Two `TopCategoriesTable` cards in a responsive one-column/two-column grid.
- One `BusinessLineIncomeChart` below the tables, with B2B/B2C on the x-axis and currency-formatted income on the y-axis.
- A semantic section labelled `B2B versus B2C comparison`.

### Navigation contract

```ts
export type DashboardView = "overview" | "comparison";

interface DashboardNavProps {
  current: DashboardView;
  onNavigate: (view: DashboardView) => void;
}
```

Navigation links are `<a>` elements with `href="#/"` and `href="#/comparison"`. The active link has `aria-current="page"`. The selected date range remains in shared `App.tsx` state when switching views.

---

## Verification checklist

- [x] Feature 1 consumes `/api/metrics/facets` and `/api/metrics`.
- [x] Feature 2 consumes `/api/metrics/alerts`.
- [x] Feature 3 consumes `/api/metrics/facets` and `/api/metrics/categories/top`.
- [x] Request and response TypeScript types are documented.
- [x] Valid values and constraints are documented for every feature parameter.
- [x] At least two edge cases and their required UI states are documented for each feature.
- [x] Empty, loading, error, partial-success, and stale-request behaviours are documented.
