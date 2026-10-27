# Dashboard Feature Component Contracts

This document defines proposed React component boundaries and props for the three dashboard features. It is a UI contract, not an implementation. Keep API payload props aligned with [`api-types.ts`](./api-types.ts), query/control props aligned with [`param-types.ts`](./param-types.ts), and UI-derived values distinct from raw API responses.

## Shared conventions

- Dashboard components live in `frontend/src/components/dashboard/` with kebab-case `.tsx` filenames; page-level composition lives in `frontend/src/`.
- Use TypeScript interfaces for props and import shared types with `import type` / `type` imports. Do not use `any` or generic `object` props.
- Components receive data and callbacks from their parent; the parent/page owns API requests, applied filter state, validation, and request cancellation or stale-response handling.
- Every data component distinguishes loading, request failure, and successful empty results. Loading must not be confused with an empty result.
- Use the existing shared currency/percentage formatters and dashboard visual language. New user-facing feature copy should be Spanish, consistent with the repository feature guidance.
- Date inputs are draft values until **Apply**. An applied range is the source of truth for all relevant requests; date bounds are inclusive.

## Feature 1 — Home date range filter

### `DateRangeFilterForm`

**Suggested file:** `src/components/dashboard/date-range-filter.tsx`

Controlled date-range form above the home KPIs/charts. It displays full-dataset date bounds from `FacetsResponse` as informational reference values, not as constraints on the selectable dates.

```ts
interface DateRangeFilterFormProps {
  draftRange: DateRangeFilter;
  reference: Pick<FacetsResponse, "min_date" | "max_date"> | null;
  referenceLoading: boolean;
  referenceError: string | null;
  onDraftChange: (next: DateRangeFilter) => void;
  onApply: () => void;
  validationMessage: string | null;
  applying: boolean;
}
```

- `draftRange` holds optional `start_date` and `end_date` as `YYYY-MM-DD` calendar-date strings; blank inputs map to omitted properties, not empty strings sent to the API.
- `reference` is from the unfiltered facets response. `referenceLoading` and `referenceError` distinguish pending and failed requests from a successful response that is not available; do not invent dates or clamp inputs to the reference bounds.
- `onDraftChange` updates local draft state only; it does not fetch. **Apply** invokes `onApply` after parent validation.
- `validationMessage` is shown inline; reversed ranges (`start_date > end_date`) cannot be applied. Empty bounds are independently valid.
- `applying` disables repeated Apply actions while the parent is applying a request. Input editing behavior during loading should remain stable; simplest contract is disable both inputs and button.
- If there are no reference values due to request failure, show a concise unavailable reference state while leaving date filtering usable.

### Home page composition

The home page owns:

- `draftRange: DateRangeFilter` separately from `appliedRange: DateRangeFilter`.
- The unfiltered facets request and the filtered `/api/metrics` request. The date reference must never be derived from filtered movements.
- Passing `appliedRange` to the alerts feature so home metrics and alerts use identical date bounds.
- Passing existing typed data to current dashboard components: `FinancialMovement[]` is transformed by existing pure utilities into `KPIMetrics` and `MonthlyDataPoint[]`.

No date-filter component should calculate KPIs, chart series, or period labels itself.

## Feature 2 — Anomaly alerts

### `AlertsPanel`

**Suggested file:** `src/components/dashboard/alerts-panel.tsx`

Owns the threshold control and anomaly table presentation, but not the network request. The parent/page owns `AlertsParams` construction and fetch lifecycle.

```ts
interface AlertsPanelProps {
  threshold: number;
  dateRange: DateRangeFilter;
  entries: AlertsResponse;
  loading: boolean;
  error: string | null;
  onThresholdChange: (next: number) => void;
  onApply: () => void;
}
```

- `threshold` is the current threshold draft. Normalize it to the feature default `0.3` when initializing UI state so the control is always populated. The parent constructs the request using `AlertsParams`.
- The threshold is a ratio, valid from `0.01` to `1.0` inclusive. Display it as a ratio value (e.g. `0.3`), not `30`; do not append `%` to the input.
- Date bounds are inherited from the applied home filter and are read-only in this panel. The threshold control must not silently modify them.
- `entries` is exactly the alerts endpoint array shape: each `AlertEntry` contains `period`, `outcome_total`, `baseline_average`, and `increase_ratio`. Do not add rolling averages or percentages to the API entry type; the backend owns the resolved rolling-window calculation.
- Render four columns: period, outcome, previous-period average, and increase. Format currency fields consistently; display `increase_ratio * 100` as a percentage with one decimal place.
- `onThresholdChange` updates only the threshold draft; **Apply** validates the range and calls `onApply`. Invalid values are blocked or reported inline and must not trigger a request.
- When `loading`, show the existing dashboard skeleton pattern. When `error` is non-null, show an explicit error state. When loaded with `entries.length === 0`, keep the section/table context visible and show “No spending anomalies found for this period and threshold.”
- The feature brief does not expose grouping or business-type controls; omit `group_by` and `business_type` from this component contract and let the endpoint defaults apply.

## Feature 3 — B2B vs B2C comparison

### `ComparisonDateRangeFilter`

**Suggested file:** `src/components/dashboard/comparison-date-range-filter.tsx`

Use the same controlled draft/apply behavior and `DateRangeFilter` shape as Feature 1. It is a separate view, so its date draft/applied values are local to the comparison view unless product design later explicitly requires shared filters.

```ts
interface ComparisonDateRangeFilterProps {
  draftRange: DateRangeFilter;
  onDraftChange: (next: DateRangeFilter) => void;
  onApply: () => void;
  validationMessage: string | null;
  applying: boolean;
}
```

Reversed ranges are rejected before requests; both blank bounds mean all available data. Apply the same range to both business groups.

### `BusinessTypeComparisonPage`

**Suggested file:** `src/components/dashboard/business-type-comparison-page.tsx`

The comparison page composes navigation-selected content, date controls, both group panels, and the total-income chart. Page state owns the two movement requests and facets request.

```ts
interface BusinessTypeComparisonPageProps {
  facets: FacetsResponse | null;
  facetsLoading: boolean;
  facetsError: string | null;
  b2bMovements: FinancialMovement[];
  b2cMovements: FinancialMovement[];
  b2bLoading: boolean;
  b2cLoading: boolean;
  b2bError: string | null;
  b2cError: string | null;
  draftRange: DateRangeFilter;
  appliedRange: DateRangeFilter;
  dateValidationMessage: string | null;
  onDraftRangeChange: (next: DateRangeFilter) => void;
  onApplyDateRange: () => void;
}
```

- `b2bMovements` and `b2cMovements` are movement payloads from `/api/metrics/b2b` and `/api/metrics/b2c`, not `TopCategoriesResponse`. Requests include the same optional inclusive dates and `operation_type=income`.
- The feature strategy computes group income totals, category totals, percentages, and chart points from these movement arrays. Only `operation_type === "income"` contributes.
- `facets.categories` supplies the allowed category vocabulary; each group displays only vocabulary categories that have income data for that group/range.
- `facets === null` means facets are still unavailable; use `facetsLoading` and `facetsError` to distinguish pending from failed state. Never substitute a hard-coded category list.
- A failure for one group is local to that group's panel and must not suppress the other group's data or chart total. Group and facets requests have distinct loading/error states so partial results remain representable.
- A group with no income has total `0`, an explicit local empty-category state, and no category rows. When group income is zero, percentage cells are `—`; do not divide by zero.
- Render the B2B and B2C group panels side by side at wide widths and stack them at narrow widths. Render the comparison chart below them.
- This component contract deliberately excludes `TopCategoriesResponse`: that endpoint returns category totals but does not provide the denominator needed for group shares or chart totals. `CategoryEntry` and `TopCategoriesResponse` remain valid contracts for that endpoint if used elsewhere.

### `BusinessTypeCategoryTable`

**Suggested file:** `src/components/dashboard/business-type-category-table.tsx`

Reusable table for one business group. It accepts already aggregated view data rather than pretending the API returns group percentages.

```ts
interface BusinessTypeCategoryRow {
  category: Category;
  totalIncome: number;
  sharePercent: number | null;
}

interface BusinessTypeCategoryTableProps {
  businessType: BusinessType;
  totalIncome: number;
  rows: BusinessTypeCategoryRow[];
  loading: boolean;
  error: string | null;
}
```

- `rows` are sorted descending by `totalIncome`, contain at most five entries, and include only categories both present in `facets.categories` and observed in that group's income movements.
- `sharePercent` is percentage points (`category total / group total * 100`), or `null` when the group total is zero; display `null` as `—`.
- `totalIncome` is the full group's income total, not merely the sum of visible top-five rows.
- Preserve the panel on an error or empty state; one group's failure does not control the other panel.

### `BusinessTypeIncomeChart`

**Suggested file:** `src/components/dashboard/business-type-income-chart.tsx`

```ts
interface BusinessTypeIncomePoint {
  businessType: BusinessType;
  totalIncome: number;
}

interface BusinessTypeIncomeChartProps {
  data: BusinessTypeIncomePoint[];
  unavailableBusinessTypes: BusinessType[];
  loading: boolean;
  error: string | null;
}
```

Render one total per successfully loaded business type for the selected date range, including `0` where a successful group response has no income. Format currency consistently. For a failed group, omit its value and identify it using `unavailableBusinessTypes`; never present a failed request as a zero. `error` is reserved for chart-level failures.

### `DashboardNavigation`

**Suggested file:** `src/components/dashboard/dashboard-navigation.tsx`

```ts
type DashboardView = "home" | "comparison";

interface DashboardNavigationProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}
```

Provide visible, keyboard-accessible controls to switch between Home and B2B vs B2C comparison. The app owns `activeView` as local state; no routing package is required for this initial feature.

## Data-contract boundary and open implementation notes

- `FacetsResponse`, `AlertsResponse`, `TopCategoriesResponse`, `FinancialMovement[]`, `DateRangeFilter`, and `AlertsParams` are the existing Phase 2 contracts. The aggregate row/chart interfaces above are UI-derived types, not backend payload declarations; place reusable implementation types in `frontend/src/lib/` when coding rather than expanding API response types with computed fields.
- `TopCategoriesParams` describes the actual top-categories endpoint, but the selected comparison feature currently uses the B2B/B2C movement endpoints. Do not use the top-category response as a complete comparison model.
- **Default threshold:** alerts start at `0.3` when the user has not changed it; omission from query parameters uses the backend default. The control may send the explicit default for determinism.
- **Apply behavior:** date and threshold drafts do not affect data until their Apply action. Applying the home date range updates home metrics and alerts with the same date bounds; applying a threshold updates alerts with that threshold and the currently applied home date range. Comparison date drafts update both business-group requests only when applied.
- **Independent requests:** comparison group requests and facets should have distinct failure state so a single endpoint failure does not discard all useful content. The proposed page prop can be refined to per-resource loading states in implementation.
- **Navigation:** the app has no router today. The feature brief requires a visible Home / Comparison switch; use simple page state for the initial version, not a new routing dependency.
