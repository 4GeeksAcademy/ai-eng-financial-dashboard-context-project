# Component Specifications — Financial Dashboard

> **Conventions applied throughout this spec:**
> - Loading states are rendered with `<Skeleton>` placeholders matching the layout
>   of the loaded component.
> - Empty states show an explicit message inside a `<Card>` — the component never
>   disappears silently.
> - Error states are surfaced via a `string | null` error prop and rendered as a
>   destructive alert banner.
> - All props reference types from `api-types.ts` and `param-types.ts`.
> - Components use the `cn(...)` utility for class merging.
> - Icons come from **lucide-react**; charts use **recharts**.
> - The `@/` path alias maps to `frontend/src/`.

---

## Feature 1 — Date Range Filter

### Components

| Component | File (proposed) | Responsibility |
|---|---|---|
| `DateRangeFilterBar` | `src/components/dashboard/date-range-filter-bar.tsx` | Two date inputs + available-range hint |
| (integration) | `src/App.tsx` | Wire facets fetch + pass callbacks |

### `DateRangeFilterBar`

#### Props

```typescript
interface DateRangeFilterBarProps {
  /** Currently selected start date (YYYY-MM-DD), or undefined. */
  startDate?: string;
  /** Currently selected end date (YYYY-MM-DD), or undefined. */
  endDate?: string;
  /** Callback emitted when either date changes. */
  onFilterChange: (filters: { startDate?: string; endDate?: string }) => void;
  /**
   * Earliest date available in the dataset (from FacetsResponse.min_date).
   * Displayed as a hint so the user knows the valid range.
   */
  availableMinDate?: string;
  /**
   * Latest date available in the dataset (from FacetsResponse.max_date).
   * Displayed as a hint so the user knows the valid range.
   */
  availableMaxDate?: string;
  /** When true, the available-range hint is replaced by a skeleton. */
  loading?: boolean;
}
```

#### Behaviour

- Renders two `<input type="date">` elements labelled "Desde" (start) and "Hasta" (end).
- Both inputs use the native date picker. Values are always `YYYY-MM-DD`.
- When the user changes either input, `onFilterChange` is called with the current
  values. An empty / cleared input sends `undefined` for that field.
- Below the inputs (or as a subtitle), a small muted line shows the available
  range, e.g. `"Rango disponible: 2024-01-05 – 2024-12-28"`. When `loading` is
  true this text is replaced by a `<Skeleton>`.
- Both inputs honour the `min` / `max` attributes derived from `availableMinDate`
  and `availableMaxDate` so the native picker restricts selection.

#### States

| State | Visual |
|---|---|
| **Loading** | Two `<Skeleton className="h-10 w-40" />` elements side by side + a `<Skeleton className="h-4 w-60" />` for the hint. |
| **Normal** | Two `<input type="date">` with labels + available-range hint. |
| **Empty (no dates selected)** | Both inputs empty; hint still visible. |

---

### Integration in `App.tsx`

1. On mount, fetch `GET /api/metrics/facets` and store `FacetsResponse`.
2. Pass `min_date` / `max_date` to `<DateRangeFilterBar>`.
3. Store `startDate` / `endDate` in state.
4. Pass the filter values to the **summary** endpoint so charts react to the
   date range. This can be done by re-fetching `/api/metrics/summary` with
   `start_date` and `end_date` query params whenever the filter changes.
5. Re-apply the same date range to the alerts table (Feature 2) via shared state.

---

## Feature 2 — Anomaly Alerts Table

### Components

| Component | File (proposed) | Responsibility |
|---|---|---|
| `AlertsPanel` | `src/components/dashboard/alerts-panel.tsx` | Threshold input + alert table |
| (threshold input is inline inside `AlertsPanel`) | — | — |

### `AlertsPanel`

#### Props

```typescript
interface AlertsPanelProps {
  /** List of alert entries returned by the API, or null while loading. */
  alerts: AlertEntry[] | null;
  /** Current threshold value (0.0 – 1.0, default 0.3). */
  threshold: number;
  /** Called when the user changes the threshold input. */
  onThresholdChange: (value: number) => void;
  /** When true, the whole panel shows skeleton placeholders. */
  loading?: boolean;
  /** Human-readable error message, or null. */
  error?: string | null;
  /** Optional CSS class override. */
  className?: string;
}
```

#### Behaviour

- Renders a label `"Umbral de alerta"` + an `<input type="number">` with
  `min=0`, `max=1`, `step=0.05`, `value={threshold}`, and
  `onChange={(e) => onThresholdChange(Number(e.target.value))}`.
- Below the threshold input, renders a table with four columns:
  1. **Período** — the `period` string (e.g. `"2024-06"`).
  2. **Outcome registrado** — `outcome_total` formatted as currency.
  3. **Media móvil (3 períodos)** — `baseline_average` formatted as currency.
  4. **Incremento %** — `increase_ratio` formatted as a percentage
     (e.g. `"34.56%"`).
- If the API returns an empty array (`[]`), the table body is replaced with a
  single row spanning all columns that reads:
  > `"No se detectaron anomalías para el umbral seleccionado."`
- The table must respect the global date range filter (Feature 1) through the
  `start_date` / `end_date` query params sent to `/api/metrics/alerts`.
- Columns are right-aligned for numeric values.

#### States

| State | Visual |
|---|---|
| **Loading** | `<Skeleton>` for the threshold input + `<Skeleton className="h-8 w-full" />` for each of 3–4 table rows. |
| **Error** | Destructive alert banner with the error message. |
| **Normal with data** | Full table with formatted rows. |
| **Empty (no alerts)** | Table header visible; body shows "No se detectaron anomalías…" spanning 4 columns. |
| **Threshold = 0** | Acceptable value. The API may return many alerts (every period where outcome exceeds 0). |

---

### Integration in `App.tsx`

1. Add `AlertsPanel` to the main layout, placed after the charts section
   (`<section aria-label="Financial charts">`).
2. Maintain `threshold` as local state (default `0.3`).
3. Whenever `threshold`, `startDate`, or `endDate` change, call
   `GET /api/metrics/alerts?threshold=<threshold>&start_date=<start>&end_date=<end>`.
4. Pass the response as the `alerts` prop.
5. Wrap the section with `aria-label="Anomaly alerts"`.

---

## Feature 3 — B2B vs B2C Comparison View

### Architecture

This is a **new view** (separate from the main dashboard). The project currently
has no routing library. Recommended approaches (in order of preference):

1. **Simple tab / toggle in the header** — add a "Comparativa B2B vs B2C" button
   in `DashboardHeader` that swaps the main content between the dashboard and the
   comparison view using React state (`activeView: "dashboard" | "comparison"`).
2. **Add `react-router-dom`** (v7+) and create a `/comparison` route.

This spec assumes **approach 1** (simplest, no extra dependencies).

### Components

| Component | File (proposed) | Responsibility |
|---|---|---|
| `ComparisonView` | `src/components/comparison/comparison-view.tsx` | Page wrapper — holds all sub-components |
| `CategoryTable` | `src/components/comparison/category-table.tsx` | Reusable table for one business line |
| `ComparisonChart` | `src/components/comparison/comparison-chart.tsx` | Bar chart comparing B2B vs B2C totals |
| `ComparisonDateRange` | `src/components/comparison/comparison-date-range.tsx` | Date filter specific to this view |

### `ComparisonView`

#### Props

```typescript
interface ComparisonViewProps {
  /** When true, all child sections show skeletons. */
  loading?: boolean;
  /** Error message from any sub-fetch, or null. */
  error?: string | null;
}
```

#### Behaviour

- Orchestrates all data fetching for the comparison view.
- Renders two `<CategoryTable>` components side by side (B2B left, B2C right).
- Below both tables, renders a `<ComparisonChart>`.
- At the top, renders a `<ComparisonDateRange>` for filtering the comparison
  data independently (or respecting the global filter — decided at integration
  time).
- When `loading` is true, two `<Skeleton>` side-by-side cards are shown for the
  tables + a `<Skeleton>` for the chart area.

#### Data fetching logic (inside the component or via a custom hook)

1. Fetch `GET /api/metrics/facets` to know available categories (for reference).
2. Fetch `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B`
   with optional `start_date` / `end_date`.
3. Fetch `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C`
   with the same date params.
4. Fetch `GET /api/metrics/summary?group_by=month&business_type=B2B` and
   `GET /api/metrics/summary?group_by=month&business_type=B2C` for the chart.
   Alternatively, use the already-summarised data if available.

### `CategoryTable`

#### Props

```typescript
interface CategoryTableProps {
  /** Business line label, displayed as the section heading. */
  businessType: ApiBusinessType;
  /** Top‑N categories for this business line, or null while loading. */
  categories: CategoryEntry[] | null;
  /** When true, shows skeleton rows. */
  loading?: boolean;
  /** The total income for this business line (used to compute percentages). */
  groupTotal?: number;
}
```

#### Behaviour

- Displays a heading: `"B2B"` or `"B2C"` depending on `businessType`.
- Table with three columns:
  1. **Categoría** — the `category` string (e.g. `"sales"`).
  2. **Total ingresos** — `total_amount` formatted as currency.
  3. **% del grupo** — `(total_amount / groupTotal) * 100` formatted as
     `"XX.X%"`.
- If `categories` is an empty array, shows:
  > `"No hay datos de ingresos para esta línea de negocio."`

#### States

| State | Visual |
|---|---|
| **Loading** | `<Skeleton>` for heading + `<Skeleton>` for each of 5 rows. |
| **Normal with data** | Full table. |
| **Empty** | Table header visible; body shows the empty message spanning 3 columns. |
| **Error** | (Handled by parent `ComparisonView`.) |

### `ComparisonChart`

#### Props

```typescript
interface ComparisonChartProps {
  /** Monthly summary data for B2B. */
  b2bData: MonthlyDataPoint[];
  /** Monthly summary data for B2C. */
  b2cData: MonthlyDataPoint[];
  /** When true, shows a skeleton. */
  loading?: boolean;
}
```

#### Behaviour

- Renders a grouped bar chart using **recharts** `<BarChart>` with two
  `<Bar>` series: one for B2B income and one for B2C income.
- X‑axis: `month` (from `MonthlyDataPoint.month`).
- Y‑axis: income in USD, formatted as `$XXk`.
- Legend shows "B2B" and "B2C" with distinct colours.
- If both datasets are empty, shows:
  > `"No hay datos comparativos para el período seleccionado."`

### `ComparisonDateRange`

#### Props

```typescript
interface ComparisonDateRangeProps {
  startDate?: string;
  endDate?: string;
  onFilterChange: (filters: { startDate?: string; endDate?: string }) => void;
}
```

#### Behaviour

- Same layout as `DateRangeFilterBar` but independent (or can be the same
  component reused). Shows two date inputs and a label.
- Unlike the main dashboard filter, this one does **not** need to show the
  available range hint (it's a simpler inline filter).

---

### Integration in `App.tsx`

1. Add a `"Comparativa B2B vs B2C"` button to `DashboardHeader` that sets
   `activeView: "comparison"`.
2. Conditionally render `<ComparisonView>` or the main dashboard based on
   `activeView`.
3. When the user switches back to the main dashboard, data is re-fetched via
   the existing `useEffect`.

---

## Data-flow diagram (summary)

```
App.tsx
 ├── fetch /api/metrics/facets  ────────────────────►  DateRangeFilterBar
 │                                                       (availableMin/MaxDate)
 │
 ├── state: startDate, endDate
 │       │
 │       ├──► /api/metrics/summary?start_date=&end_date=  ──► charts
 │       ├──► /api/metrics/alerts?threshold=&start_date=&end_date=  ──► AlertsPanel
 │       └──► (passed to ComparisonView when active)
 │
 └── state: activeView ("dashboard" | "comparison")
         │
         └──► ComparisonView
                 ├── Date filter ──► /api/metrics/categories/top?business_type=B2B  ──► CategoryTable (B2B)
                 │               ──► /api/metrics/categories/top?business_type=B2C  ──► CategoryTable (B2C)
                 └──             ──► /api/metrics/summary?business_type=B2B         ──► ComparisonChart
                                 ──► /api/metrics/summary?business_type=B2C
```

---

## Props alignment with spec types

| Component | Prop | Type from `param-types.ts` / `api-types.ts` |
|---|---|---|
| `DateRangeFilterBar` | `availableMinDate` | `FacetsResponse.min_date` (`string`) |
| `DateRangeFilterBar` | `availableMaxDate` | `FacetsResponse.max_date` (`string`) |
| `AlertsPanel` | `alerts` | `AlertsResponse` (`AlertEntry[] \| null`) |
| `AlertsPanel` | `threshold` | `AlertsParams.threshold` (`number`) |
| `CategoryTable` | `businessType` | `ApiBusinessType` (`"B2B" \| "B2C"`) |
| `CategoryTable` | `categories` | `TopCategoriesResponse` (`CategoryEntry[] \| null`) |
| `ComparisonChart` | `b2bData` / `b2cData` | `MonthlyDataPoint[]` (from `financial-types.ts`) |
| `ComparisonDateRange` | `onFilterChange` | Uses same shape as `DateRangeFilter` |