# Component Specs — Features 1–3

Draft. Props reference the Phase 2 types in [api-types.ts](./api-types.ts) and [param-types.ts](./param-types.ts). When implementing, move those types into `src/lib/financial-types.ts` (per `.agents/rules/api-contracts.md`) and import them via `@/lib/financial-types`.

## Conventions (all features)

- **Layering** (`.agents/rules/frontend-structure.md`): data fetching and page state live in `App.tsx` (or a page component it renders); components under `src/components/` are presentational and receive data via props; pure helpers go in `src/lib/`.
- **Loading / error**: every data-driven component takes `loading?: boolean` and renders `Skeleton` while loading, matching `KPIRow` and the charts. Errors are rendered by the parent as the existing destructive banner, not inside components.
- **Copy**: UI labels in English, as in current components.
- **Formatting**: amounts with `formatCurrency`; percentages with `formatPercent` (expects a percentage, so ratios are multiplied by 100 first).
- **Query strings**: built by one helper that drops `undefined` keys, so empty inputs are never sent as `""`.

## Shared lib additions (`src/lib/`)

| Symbol | Signature | Notes |
|---|---|---|
| `fetchFacets` | `() => Promise<FacetsResponse>` | `GET /api/metrics/facets`. |
| `fetchMovements` | `(filter: DateRangeFilter) => Promise<FinancialMovement[]>` | Replaces the current `fetchFinancialData`. |
| `fetchAlerts` | `(params: AlertParams) => Promise<AlertResponse>` | Always sends `group_by=month` implicitly (API default). |
| `fetchTopCategories` | `(params: TopCategoriesParams) => Promise<TopCategoriesResponse>` | |
| `toQueryString` | `(params: DateRangeFilter \| AlertParams \| TopCategoriesParams) => string` | Omits `undefined`; returns `""` or `"?a=1&b=2"`. |
| `parseISODate` | `(value: string) => ISODate \| undefined` | Returns `undefined` for `""` or anything not matching `^\d{4}-\d{2}-\d{2}$` and not a real calendar date. Single place where `string → ISODate` narrowing happens. |
| `validateDateRange` | `(filter: DateRangeFilter, facets: FacetsResponse \| null) => DateRangeError \| null` | See Feature 1 validation. |
| `formatPeriodLabel` | `(period: string) => string` | `"2025-12"` → `"Dec 2025"`. Reuse the private `formatMonthYearLabel` by exporting it under this name. |

```ts
type DateRangeError = 'start_after_end' | 'start_before_min' | 'end_after_max'
```

---

## Feature 1 — Date range filter (home)

### `DateRangeFilter` — `src/components/dashboard/date-range-filter.tsx`

The component shares its name with the `DateRangeFilter` params type; import the type with an alias (`type DateRangeFilter as DateRangeValue`) in this file.

```ts
interface DateRangeFilterProps {
  /** Current committed filter; keys absent when the input is empty. */
  value: DateRangeFilter
  /** Called with the new filter after local validation passes. */
  onChange: (next: DateRangeFilter) => void
  /** Source of min/max reference; `null` while loading or if facets failed. */
  facets: FacetsResponse | null
  loading?: boolean
}
```

Behaviour:

- Two `<input type="date">` labelled **Start date** / **End date**, plus a **Clear** button (disabled when both are empty).
- `min`/`max` attributes of both inputs come from `facets.min_date` / `facets.max_date`. The end input's `min` also becomes `value.start_date` when set; the start input's `max` becomes `value.end_date` when set.
- Reference text next to the inputs: `Available data: {formatDate(min_date)} – {formatDate(max_date)}`. While `facets` is `null` and `loading`, show a `Skeleton`; if `null` and not loading, show `Available range unavailable` and leave inputs without `min`/`max`.
- The component keeps a local draft per input. On each input change: `parseISODate` → `validateDateRange`. If valid, call `onChange` immediately (no Apply button). If invalid, keep the draft, show the inline error below the inputs, and **do not** call `onChange` (the dashboard keeps showing the last valid range).

Validation messages:

| `DateRangeError` | Message |
|---|---|
| `start_after_end` | `Start date must be on or before end date.` |
| `start_before_min` | `Start date is before the earliest available date ({min_date}).` |
| `end_after_max` | `End date is after the latest available date ({max_date}).` |

A start date after `max_date` or an end date before `min_date` is **allowed** (it just yields an empty dashboard); only the three cases above are errors.

### Page wiring (`App.tsx`)

- New state: `facets: FacetsResponse | null`, `dateRange: DateRangeFilter` (initially `{}`).
- `fetchFacets()` once on mount; failure does not block the dashboard.
- `fetchMovements(dateRange)` on mount and whenever `dateRange` changes; KPIs and charts are recomputed from the result with the existing `computeKPIs` / `computeMonthlyData`. Ignore stale responses (abort the previous request with `AbortController`).
- `DateRangeFilter` renders between `DashboardHeader` and the KPI section.
- `DashboardHeader` keeps receiving `formatMonthRange(monthlyData)`, so the badge reflects the data actually shown.
- Empty result (valid range, zero movements): KPIs show zero values, charts render empty, and an inline notice `No movements in the selected range.` appears above the KPIs.

---

## Feature 2 — Anomaly alerts table (home)

### `AlertThresholdInput` — `src/components/dashboard/alert-threshold-input.tsx`

```ts
interface AlertThresholdInputProps {
  /** Last valid threshold (ratio). */
  value: number
  /** Called only with values in [ALERT_THRESHOLD_MIN, ALERT_THRESHOLD_MAX]. */
  onChange: (next: number) => void
}
```

Constants in `src/lib/`: `ALERT_THRESHOLD_MIN = 0.01`, `ALERT_THRESHOLD_MAX = 1`, `ALERT_THRESHOLD_DEFAULT = 0.3` (mirror the backend `Query` constraints).

- `<input type="number" step="0.01" min="0.01" max="1">` labelled **Spike threshold**.
- Helper text shows the equivalent percentage: `Flag periods more than +{formatPercent(value * 100)} above the 3-period average.`
- Local draft; `onChange` fires 300 ms after the last keystroke if the draft parses to a finite number within range. Empty or out-of-range drafts show `Enter a ratio between 0.01 and 1.0.` and do not fire `onChange`.
- The input is a ratio, not a percentage (`0.3`, not `30`).

### `AnomalyAlertsTable` — `src/components/dashboard/anomaly-alerts-table.tsx`

```ts
interface AnomalyAlertsTableProps {
  alerts: AlertResponse
  /** Threshold the `alerts` were fetched with; used in the empty-state message. */
  threshold: number
  loading?: boolean
  /** Rendered in the card header (`CardAction`); App passes `AlertThresholdInput`. */
  controls?: ReactNode
}
```

- Wrapped in `Card` with title **Spending anomalies**; the threshold input is injected through `controls`, so the table stays presentational and owns no threshold state.
- Columns (in order), mapped from `AlertEntry`:

| Header | Source | Format |
|---|---|---|
| Period | `period` | `formatPeriodLabel` |
| Outcome | `outcome_total` | `formatCurrency` |
| 3-period average | `baseline_average` | `formatCurrency` |
| Increase | `increase_ratio` | `+{formatPercent(increase_ratio * 100)}` |

- Rows in API order (chronological). No client-side sorting.
- Loading: 3 skeleton rows inside the table body (the header stays visible).
- **Empty state** (`alerts.length === 0` and not loading): the table header stays visible and a single full-width row reads `No spending anomalies above +{formatPercent(threshold * 100)} for the selected period.` followed by a muted second line `The first 3 months of the range have no baseline and are never flagged.`

### Page wiring (`App.tsx`)

- New state: `threshold` (default `ALERT_THRESHOLD_DEFAULT`), `alerts: AlertResponse`, `alertsLoading`, `alertsError`.
- `fetchAlerts({ threshold, ...dateRange })` whenever `threshold` or `dateRange` changes (same abort strategy as Feature 1). The date range is the same state object used by Feature 1.
- Section placed below the charts section, `aria-label="Spending anomalies"`.
- A failure here shows its own banner inside the section and does not hide KPIs/charts.

---

## Feature 3 — B2B vs B2C comparison page

### Navigation

No router is installed; do not add one for a single extra view. `App.tsx` holds `view: 'overview' | 'comparison'`, synced with `location.hash` (`#/comparison` ↔ `comparison`, anything else ↔ `overview`) so the page is linkable and the back button works.

#### `DashboardNav` — `src/components/dashboard/dashboard-nav.tsx`

```ts
type DashboardView = 'overview' | 'comparison'

interface DashboardNavProps {
  current: DashboardView
  onNavigate: (view: DashboardView) => void
}
```

Two links, **Overview** and **B2B vs B2C**, rendered as `<a href="#/…">` with `aria-current="page"` on the active one. Placed inside `DashboardHeader` (new optional `nav?: ReactNode` prop, so the header stays presentational).

### Shared date range

The comparison page reuses the `DateRangeFilter` component and the **same** `dateRange` state and `facets` from `App.tsx`, so switching views keeps the selected range.

### `ComparisonPage` — `src/components/comparison/comparison-page.tsx`

Page-level container (allowed to fetch, like `App.tsx`).

```ts
interface ComparisonPageProps {
  dateRange: DateRangeFilter
  facets: FacetsResponse | null
}
```

- Fetches in parallel on mount and whenever `dateRange` changes:
  `fetchTopCategories({ operation_type: 'income', limit: 5, business_type: 'B2B', ...dateRange })` and the same for `'B2C'`.
- `limit: 5` returns the full set because `Category` has exactly 5 values; the group total is therefore the sum of the returned rows. If `Category` ever grows beyond 5, switch to `limit: 20` for the total and slice to 5 for display.
- Builds one `BusinessLineSummary` per line (see below) and renders two `TopCategoriesTable` side by side (`grid grid-cols-1 md:grid-cols-2 gap-4`) and one `BusinessLineIncomeChart` below them.
- One request failing shows an error banner in that section only; the chart then renders only the line that loaded.

#### Derived model (`src/lib/`)

```ts
interface CategoryShare {
  category: Category
  total_amount: number
  /** 0–100; `null` when the group total is 0. */
  share_pct: number | null
}

interface BusinessLineSummary {
  business_type: BusinessType
  /** Sum of all income in the range for this line. */
  total_income: number
  /** At most 5 rows, sorted by `total_amount` desc, then category name asc. */
  rows: CategoryShare[]
}

function buildBusinessLineSummary(
  businessType: BusinessType,
  entries: TopCategoriesResponse,
  facets: FacetsResponse | null,
): BusinessLineSummary
```

Rules (resolves "categories must come from facets"):

- **Row set** = `facets.categories_by_business_type[businessType]?.income`. Each facet category gets its `total_amount` from `entries`, or `0` if it has no income in the selected range. This keeps rows stable when the range changes.
- If `facets` is `null` (failed/loading), fall back to the categories present in `entries`.
- Categories in `entries` but not in facets are ignored (should not happen: facets are computed over the full dataset).
- `share_pct = total_amount / total_income * 100`.

Unit tests (Vitest) for `buildBusinessLineSummary`: zero-income category from facets is kept with `share_pct` 0; `total_income = 0` yields `share_pct: null`; ordering tie-break; `facets = null` fallback.

### `TopCategoriesTable` — `src/components/comparison/top-categories-table.tsx`

```ts
interface TopCategoriesTableProps {
  summary: BusinessLineSummary | null
  loading?: boolean
}
```

- `Card` titled `{business_type} — Top income categories`, description `Total: {formatCurrency(total_income)}`.
- Columns: **Category** (capitalized, e.g. `Sales`), **Income** (`formatCurrency(total_amount)`), **% of {business_type}** (`formatPercent(share_pct)` or `—` when `null`).
- Empty state (`rows.length === 0`): single row `No income categories for {business_type}.`

### `BusinessLineIncomeChart` — `src/components/comparison/business-line-income-chart.tsx`

```ts
interface BusinessLineIncomeChartProps {
  /** One entry per loaded line; order B2B, B2C. */
  data: Pick<BusinessLineSummary, 'business_type' | 'total_income'>[]
  loading?: boolean
}
```

- Recharts `BarChart`, one bar per business line, x-axis `business_type`, y-axis formatted with `formatCurrency`, tooltip consistent with `IncomeOutcomeChart`'s `CustomTooltip`.
- Empty state when every `total_income` is 0: `No income in the selected range.`

---

## Decisions that resolve open ambiguities

| # | Question | Decision |
|---|---|---|
| 1 | Filter client- or server-side? | Server-side via `start_date`/`end_date` on every endpoint; the frontend never filters movements by date. |
| 2 | Apply button or live? | Live on valid change; threshold debounced 300 ms. |
| 3 | Invalid input handling | Inline error, keep last valid data, no request. |
| 4 | Dates outside facets range | Only `start < min_date` / `end > max_date` are errors; other out-of-data ranges return empty data with an explicit message. |
| 5 | Threshold unit | Ratio in the input; percentage in helper text and table. |
| 6 | Alerts granularity | Monthly (`group_by` omitted → `month`). |
| 7 | "Previous 3 periods" near range start | First 3 months never flagged; stated in the empty-state hint. |
| 8 | Facets vs top-categories as row source | Facets define rows; top-categories supplies amounts. |
| 9 | Group total for "% of group" | Sum of all income categories returned (complete with `limit: 5`). |
| 10 | Routing for the new page | Hash-based view state in `App.tsx`; no new dependency. |
| 11 | Date range shared across pages? | Yes, one `dateRange` state in `App.tsx`. |
| 12 | Filter state in URL | Out of scope; only the view is in the hash. |
