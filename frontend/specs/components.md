# Component specifications

Specification only: no component in this document exists yet. Prop types are in
[`view-types.ts`](view-types.ts) (they compile with `npx tsc --noEmit -p specs/tsconfig.json`); API types are in
[`api-types.ts`](api-types.ts) and [`param-types.ts`](param-types.ts). The endpoint contract and its verification
trail are in [`README.md`](README.md).

Existing code this builds on (`frontend/src`): `App.tsx` (fetches `/api/metrics` once), `components/dashboard/*`
(`DashboardHeader`, `KPIRow`, `KPICard`, `IncomeOutcomeChart`, `ProfitPercentChart`), `components/ui/*` (`Card`,
`Skeleton`), `lib/financial-utils.ts` (`computeKPIs`, `computeMonthlyData`, `formatCurrency` = USD without decimals,
`formatPercent` = one decimal plus `%`). Charts use Recharts. New dashboard components go in
`components/dashboard/`, in the same quote and semicolon style as that folder (rule STYLE-1).

## Spec decisions (the PM brief left these open)

| # | Decision | Reason | Confirm with PM |
|---|---|---|---|
| D1 | The Feature 2 baseline column is titled **"Average of previous periods"**, not "rolling average of the previous 3". | The API averages every earlier period in range; changing that needs a backend change, which is out of scope. | Yes |
| D2 | The alerts table uses monthly grouping (the API default). It never sends `group_by`. | Matches the monthly charts; the brief names no granularity. | Yes |
| D3 | Navigation between the dashboard and the comparison page is a view switch held in `App` state (`AppView`), shown by `ViewNav`. No router dependency is added. | The project has no router. | Yes |
| D4 | The date filter state is **shared**: one `DateRangeFilter` held in `App`, used by the dashboard, the alerts table and the comparison page. | One mental model; fewer components. | Yes |
| D5 | Feature 3 takes its **business lines** (panels) and the **date hint** from facets, and its **category names** from the top-categories response. | Facets returns one global category list; it cannot say which categories a business line has income in. | Yes |
| D6 | An invalid date range is **never sent**: the previous results stay on screen and an inline message explains the problem. | An inverted range returns an empty list, indistinguishable from "no data". | No |
| D7 | The threshold is applied when it is valid and has not changed for 400 ms, or on blur or Enter. | Avoids a request per keystroke. | No |

## State ownership (`App`)

`App` owns: `view: AppView`, `dateRange: DateRangeFilter`, and the facets request (`FacetsResponse`, fetched once on
mount). It derives `availableRange: AvailableDateRange | null` from facets and `issue: DateRangeIssue` from
`dateRange` and `availableRange`. Only a valid `dateRange` is passed down to anything that fetches.
Request failures must keep their cause visible (`console.error` plus a message naming the HTTP status), unlike
today's `.catch(() => ...)` in `App.tsx:35`.

---

## Feature 1: date range filter

### Components

| Component | Props | Job |
|---|---|---|
| `DateRangeFilterBar` | `DateRangeFilterBarProps` | Two optional date inputs plus the available-range hint. Renders on both screens, above the content. |
| `DashboardHeader` (existing, changed) | `DashboardHeaderProps` | Shows `periodLabel` instead of the hardcoded `"2024 - Full Year"`. |

### Layout (`DateRangeFilterBar`)
One row, wrapping on narrow screens, in this order:
1. Label **"From"** and an `<input type="date">` bound to `value.start_date`.
2. Label **"To"** and an `<input type="date">` bound to `value.end_date`.
3. A **"Clear"** button, visible only when at least one bound is set; it calls `onChange({})`.
4. Reference text: **"Available data: {min_date} to {max_date}"** (ISO dates as returned), for example
   `Available data: 2025-11-01 to 2026-10-28`.
5. Below the row, an inline message when `issue` is not `null` (texts below).

Both inputs get `min={min_date}` and `max={max_date}` when `availableRange` is not `null`.
Input values are `YYYY-MM-DD` strings; an emptied input maps to `undefined` (the key is removed, never `""`).

### Conditional rendering

| Situation | Render |
|---|---|
| `availableRange === null` (facets loading) | Inputs enabled; the reference text is replaced by a skeleton of the same width. |
| facets failed | Inputs enabled with no `min`/`max`; reference text **"Available range unavailable"**. |
| Both inputs empty | No filter. The dashboard shows all data. |
| **Only one input filled** | Valid, an **open-ended range**. Only that parameter is sent: only "From" means from that date to the latest data; only "To" means from the earliest data up to that date. The empty input shows its native placeholder and is not marked invalid. No message is shown. |
| `issue === "start_after_end"` | Message **"The start date must be on or before the end date."** No request is sent (D6). |
| `issue === "outside_available_range"` | Message **"Choose dates between {min_date} and {max_date}."** No request is sent (D6). |
| Valid range with zero rows returned | The charts area shows **"No data for the selected date range."**; KPI cards show the values `computeKPIs([])` returns (`$0`, `0.0%`). |

### What "filters everything" means
When `dateRange` changes to a valid value, `App` refetches `GET /api/metrics` with `MetricsParams` built from it
(only set keys) and recomputes the KPI cards and both charts from the response. The alerts table (Feature 2) and the
comparison page (Feature 3) receive the same `dateRange`. The header `periodLabel`:
- no bounds: `"{min_date} to {max_date}"` (or `"All data"` while facets is loading);
- one or two bounds: `"{start_date ?? min_date} to {end_date ?? max_date}"`.

Month grouping for the charts must be derived from the date string (for example `create_date.slice(0, 7)`), not from
local-time `Date` getters, or months shift in negative-UTC timezones (EDGE-1) and the chart disagrees with the filter.

---

## Feature 2: anomaly alerts table

### Components

| Component | Props | Job |
|---|---|---|
| `AnomalyAlertsSection` | `AnomalyAlertsSectionProps` | Container below the two charts. Holds `threshold` state (default `0.3`) and the alerts request; renders the heading **"Spending alerts"**, `ThresholdInput`, `AlertsTable`. |
| `ThresholdInput` | `ThresholdInputProps` | Numeric input, label **"Spike threshold (ratio)"**, `min=0.01`, `max=1`, `step=0.01`. |
| `AlertsTable` | `AlertsTableProps` | The table and its empty, loading and error states. |

Request: `GET /api/metrics/alerts` with `AlertsParams = { threshold, ...dateRange }` (only set keys). Re-requested
when the applied threshold or `dateRange` changes.

### `ThresholdInput` behavior
- Shows what the user types. A value is **valid** when it is a finite number with `min <= value <= max`.
- Valid and unchanged for 400 ms (or blur, or Enter): call `onChange(value)`; the request is sent.
- **Out of range, empty or not a number** (for example `0`, `1.5`, `-1`, `abc`): do not call `onChange`; keep the last
  applied threshold and keep showing its results; mark the input invalid and show **"Enter a ratio between 0.01 and 1.0."**
  The API would accept `0` and values above `1.0`, so this limit is enforced here, not by the backend.
- On blur with an invalid value: restore the last applied threshold in the input and clear the message.

### `AlertsTable` columns

| # | Header | Source field | Type | Display |
|---|---|---|---|---|
| 1 | **Period** | `period` | `string` (`YYYY-MM`) | Month and year as in the charts, for example `Dec 2025`. Built from the string; do not use local-time `Date` getters. |
| 2 | **Recorded outcome** | `outcome_total` | `number` (dollars) | `formatCurrency`, for example `$103,379`. Right-aligned. |
| 3 | **Average of previous periods** (D1) | `baseline_average` | `number` (dollars) | `formatCurrency`. Right-aligned. |
| 4 | **Increase** | `increase_ratio` | `number` (ratio) | `formatPercent(increase_ratio * 100)`, for example `149.7%`. Right-aligned. |

Row order: as returned (chronological). No sorting controls.

### Conditional rendering

| Situation | Render |
|---|---|
| `status === "loading"` | Header row plus 3 skeleton rows. |
| `status === "error"` | In place of the table: `errorMessage` (name the HTTP status). The threshold input stays usable. |
| `status === "ready"`, `alerts.length > 0` | The table. |
| `status === "ready"`, `alerts.length === 0` | **The table frame stays.** Headers remain and the body is one full-width row with the empty message. Never render nothing. |

**Empty-state message** (`P` is `threshold * 100` with no trailing zeros, e.g. `30`):
- no date filter: **"No spending spikes above {P}% were found. Try a lower threshold."**
- with a date filter: **"No spending spikes above {P}% were found in the selected date range. Try a lower threshold or a wider range."**

### Known behavior the UI must not hide
- The first month in range is never flagged (it has no earlier months), and a one-month range always returns nothing.
  The empty message already covers this case.
- Under a date filter the average is computed only from months inside the range, so the same month can show a
  different average than without the filter. No special UI; this is expected.

---

## Feature 3: B2B vs B2C comparison view

### Components

| Component | Props | Job |
|---|---|---|
| `ViewNav` | `ViewNavProps` | Two buttons in the page header area: **"Dashboard"** and **"B2B vs B2C"**; marks the active one (D3). |
| `ComparisonPage` | `ComparisonPageProps` | The page. Renders `DateRangeFilterBar` (shared state, D4), one `BusinessLinePanel` per `facets.business_types` entry, then `BusinessLineComparisonChart`. Owns the two requests. |
| `BusinessLinePanel` | `BusinessLinePanelProps` | One business line: heading (`"B2B"` or `"B2C"`), the group's total income, and either `CategoryIncomeTable` or the empty message. |
| `CategoryIncomeTable` | `CategoryIncomeTableProps` | The top-5 table. |
| `BusinessLineComparisonChart` | `BusinessLineComparisonChartProps` | One bar chart (Recharts, like the existing charts) with one bar per business line. |

### Data loading
For each business line `b` in `facets.business_types`, request `GET /api/metrics/categories/top` with
`TopCategoriesParams = { operation_type: "income", limit: 20, business_type: b, ...dateRange }`.
(`operation_type` is always sent because the API default is `"outcome"`; `limit` is 20, not 5, so the response holds every
category and the group total can be summed.) Requests run in parallel and each has its own `LoadStatus`.

Derivation, per response, into `BusinessLineIncome`:
- `totalIncome` = sum of `total_amount` over all entries.
- `rows` = the first 5 entries (the API already sorts by `total_amount` descending), each with
  `percentOfGroup = total_amount / totalIncome * 100`.

### Layout
- Two panels side by side from the `md` breakpoint up; stacked (B2B first) below it.
- The chart sits below both panels, full width.
- `DateRangeFilterBar` at the top, above the panels.

### `CategoryIncomeTable` columns

| # | Header | Source | Type | Display |
|---|---|---|---|---|
| 1 | **Category** | `category` | `Category` | Capitalized: `Sales`, `Others`. |
| 2 | **Total income** | `totalAmount` | `number` (dollars) | `formatCurrency`. Right-aligned. |
| 3 | **% of group total** | `percentOfGroup` | `number` | `formatPercent`, for example `90.6%`. Right-aligned. |

Show only the rows that exist. With the mock data each panel has **2 rows**, not 5; do not pad to 5. Percentages are
rounded individually and may not add up to exactly 100.0%; that is acceptable and needs no note.

### Conditional rendering: panel

| Situation | Render |
|---|---|
| `status === "loading"` | Heading plus 2 skeleton rows. |
| `status === "error"` | Heading plus `errorMessage`. The other panel is unaffected. |
| `status === "ready"`, `income.rows.length > 0` | Heading, **"Total income: {formatCurrency(totalIncome)}"**, then `CategoryIncomeTable`. |
| `status === "ready"`, `income.rows.length === 0` | Heading and the message **"No income recorded for {B2B or B2C} in the selected date range."** (with no filter set: **"No income recorded for {B2B or B2C}."**). No table, no percentages. |

### `BusinessLineComparisonChart`
- **What it shows:** a bar chart with **two bars**. Bar 1 is total income of **B2B**, bar 2 is total income of **B2C**,
  each being that line's `totalIncome` (the sum of all its income categories) over the selected date range.
  Y axis in dollars (same tick style as `IncomeOutcomeChart`), bars labeled with `formatCurrency`, accessible
  names "B2B total income" and "B2C total income". Bars use two distinct colors, with the business line also
  written on the axis (never color alone).
- **Conditional rendering:**

| Situation | Render |
|---|---|
| Either panel `loading` | Chart skeleton. |
| Either panel `error` | **"Comparison unavailable because one of the requests failed."** The panel that succeeded stays visible. |
| Both `ready`, both totals `0` | **"No income recorded for either business line in the selected date range."** instead of the chart. |
| Both `ready`, one total `0` | The chart renders; the empty line has a zero-height bar labeled `$0`. |

### Date filter on this page
The same `DateRangeFilterBar` and the same single-date and invalid-range behavior as Feature 1 apply. Changing the
filter refetches both panels; the tables and the chart always show the same range.

---

## Verification checklist for the implementer
Each item is observable in the running app (nothing here is automated yet):

1. Only "From" filled: network call has `start_date` and no `end_date`; header and data follow. Same for only "To".
2. Start after end: no request fires; message D6 shown; previous data unchanged.
3. Alerts at default threshold show the four columns; threshold `100` is rejected by the input (message shown, no request); threshold `1.0` with a range containing no spike shows the empty message, with the table frame still present.
4. Comparison page: each panel shows 2 rows today; changing the range to one with no income shows the panel empty message and the chart message.
5. Throttle or fail one request: the other panel still renders.
