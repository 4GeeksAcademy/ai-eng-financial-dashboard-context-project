# Frontend Components Specification

## Overview

This document specifies the UI components for the Financial Dashboard across three main features, aligned with the OpenAPI schema (`GET http://localhost:8000/openapi.json`) and TypeScript types defined in:
- `frontend/specs/api-types.ts`
- `frontend/specs/param-types.ts`
- `frontend/src/lib/financial-types.ts`

---

## Feature 1: Date Range Filter (Dashboard Main View)

The date range filter allows users to narrow results across all dashboard visualizations to a specific time period. The available date range is determined by the metadata endpoint `/api/metrics/facets`.

### Data Flow

1. Component loads and calls `GET /api/metrics/facets` to retrieve `FacetsResponse`
2. User can optionally set `start_date` and/or `end_date`
3. Filters propagate to Feature 2 (Alerts Table) and other metrics automatically
4. Component reads `DateRangeFilter` from URL query params or state and applies them

### Ambiguity Resolution

**PM Brief vs API Reality:**
- **PM Brief**: "Filter by date range in the dashboard"
- **API Reality**: The API accepts `start_date` and `end_date` as independent optional parameters. Both are **inclusive**. Neither is required.
  - `start_date` only: Results from start_date to latest available date
  - `end_date` only: Results from earliest available date to end_date
  - Both omitted: Results span entire dataset range (min_date to max_date)

**Component Behavior:**
- **Empty inputs**: Display message "No date filter applied — showing all available data (from {min_date} to {max_date})"
- **start_date only**: Display "Showing data from {start_date} to {max_date}"
- **end_date only**: Display "Showing data from {min_date} to {end_date}"
- **Both set**: Display "Showing data from {start_date} to {end_date}"
- **Invalid range**: If `start_date` > `end_date`, display error "Invalid date range: start date must be before or equal to end date"

### Component: `DateRangeFilterPanel`

**Purpose**: Input controls and feedback display for date range filtering

**Props**:
```typescript
interface DateRangeFilterPanelProps {
  /**
   * Current filter state from parent (DateRangeFilter)
   * Both properties optional as per OpenAPI spec
   */
  filter: DateRangeFilter;

  /**
   * Facets metadata including min_date and max_date bounds
   * Retrieved from GET /api/metrics/facets
   */
  facets: FacetsResponse;

  /**
   * Callback triggered when user modifies start_date or end_date
   * Parent should update state and trigger API calls to Features 2 and other metrics
   * Receives updated DateRangeFilter (may have one, both, or neither dates)
   */
  onFilterChange: (filter: DateRangeFilter) => void;

  /**
   * Whether data is currently loading (disable inputs during fetch)
   * Type: boolean
   */
  isLoading?: boolean;

  /**
   * Optional error message to display (e.g., API error, validation error)
   * Type: string | null
   */
  error?: string | null;
}
```

**Rendered Output**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Date Range Filter                                               │
│                                                                 │
│ Available range: 2024-01-15 to 2024-11-30                      │
│                                                                 │
│ Start Date: [________] (YYYY-MM-DD)                            │
│ End Date:   [________] (YYYY-MM-DD)                            │
│                                                                 │
│ [Clear] [Apply Filter]                                         │
│                                                                 │
│ Status: "Showing data from 2024-01-15 to 2024-11-30"          │
└─────────────────────────────────────────────────────────────────┘
```

**UI Behavior Details**:

1. **Input Validation** (client-side only, no blocking):
   - Accept ISO 8601 date format (YYYY-MM-DD)
   - Display tooltip/helper text: "Format: YYYY-MM-DD"
   - If user enters date outside available range, display warning: "{date} is outside available range ({min_date} to {max_date})"
   - If `start_date` > `end_date`, display error: "Start date must be before end date"

2. **Clear Button**:
   - Clears both `start_date` and `end_date`
   - Calls `onFilterChange({ })` (empty object, implicitly no filters)
   - Displays status message: "No date filter applied — showing all available data"

3. **Apply Button**:
   - Validates client-side (dates within range, start <= end)
   - Calls `onFilterChange(filter)` with new dates
   - Triggers re-fetch of Features 2 and other metrics in parent

4. **State on Mount**:
   - If `filter.start_date` or `filter.end_date` provided, populate inputs
   - If both empty, show "Available range" and status message

5. **Loading State**:
   - When `isLoading === true`, disable input fields and buttons
   - Display spinner or "Loading..." text

6. **Error State**:
   - If `error` prop provided, display error message in red box above inputs
   - Do not disable inputs (allow user to modify and retry)

---

## Feature 2: Alerts Table (Dashboard Main View)

The alerts table displays detected anomalies where spending (outcome) exceeded the historical baseline by a configurable threshold. Rows represent distinct time periods (day, week, or month depending on grouping).

### Data Flow

1. Component receives `DateRangeFilter` from Feature 1
2. Component renders threshold input (default 0.3)
3. Component calls `GET /api/metrics/alerts` with `AlertsParams` (threshold, group_by, date filters, business_type)
4. Component displays array of `AlertEntry` rows in table
5. When date range or threshold changes, refetch and update table

### Ambiguity Resolution

**PM Brief vs API Reality:**
- **PM Brief**: "Table shows periods where spending exceeded the 3-period moving average"
- **API Reality**: Backend returns `baseline_average`, which is a **historical baseline computed by the backend**, not a simple 3-period moving average. The exact calculation is backend-dependent.

**Resolution**: 
- UI column label: "Baseline Avg (Historical)" instead of "3-Period Moving Avg"
- Tooltip on column header: "Historical baseline average computed from prior period data"
- Component documentation includes note: "Baseline calculation is managed by backend; UI displays as returned"

**Empty State Resolution:**
- **PM Brief**: May have implied "no rows if no alerts"
- **API Reality**: If no anomalies detected for threshold + date range, API returns empty array `[]`
- **Component Behavior**: Render explicit empty state box (do NOT hide the entire section):

```
┌─────────────────────────────────────────────────────────────────┐
│ Spending Anomalies                     Threshold: [0.30] [Set] │
│                                                                 │
│ ⓘ No anomalies detected for threshold 0.30 and date range.    │
│   Try lowering the threshold or expanding the date range.      │
│                                                                 │
│                     [Empty table placeholder]                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component: `AlertsTablePanel`

**Purpose**: Display anomalies and manage threshold filter

**Props**:
```typescript
interface AlertsTablePanelProps {
  /**
   * Current date range filter from Feature 1 (DateRangeFilter)
   * Both start_date and end_date are optional
   * When omitted, API returns alerts across entire dataset
   */
  dateFilter: DateRangeFilter;

  /**
   * Facets metadata for display (bounds, available types)
   * Used for status messages
   */
  facets: FacetsResponse;

  /**
   * Array of alert entries from GET /api/metrics/alerts
   * Empty array when no anomalies detected
   * Type: AlertsResponse (array alias to AlertEntry[])
   */
  alerts: AlertsResponse;

  /**
   * Current threshold value for anomaly detection
   * Type: number
   * Valid range: 0.01 to 1.0 (backend enforces >= 0, UI restricts)
   * Default when new component mounted: 0.3
   */
  threshold: number;

  /**
   * Callback when user changes threshold input
   * Parent should update state and refetch alerts
   * Receives new threshold value
   */
  onThresholdChange: (threshold: number) => void;

  /**
   * Whether alerts data is currently loading
   * Type: boolean
   */
  isLoading?: boolean;

  /**
   * Optional error message from API or validation
   */
  error?: string | null;

  /**
   * Grouping option (affects period format in table)
   * Type: 'day' | 'week' | 'month'
   * Default: 'month'
   * Note: UI does not expose group_by as editable; hardcoded to 'month' for MVP
   */
  groupBy?: 'day' | 'week' | 'month';
}
```

**Rendered Output**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Spending Anomalies                                              │
│                                                                 │
│ Threshold: [0.30] [Set Threshold]                              │
│ (Periods where spending exceeds baseline by this ratio)        │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐
│ │ Period    │ Total Spent │ Baseline Avg │ Excess Ratio │     │
│ ├─────────────────────────────────────────────────────────────┤
│ │ 2024-10   │ $125,450    │ $98,200      │ 1.28x        │ ⚠️  │
│ │ 2024-09   │ $142,100    │ $95,500      │ 1.49x        │ ⚠️  │
│ │ 2024-08   │ $110,200    │ $103,000     │ 1.07x        │     │
│ └─────────────────────────────────────────────────────────────┘
│                                                                 │
│ Total alerts: 3 of 12 months exceed threshold                 │
└─────────────────────────────────────────────────────────────────┘
```

**UI Behavior Details**:

1. **Threshold Input**:
   - Number input accepting decimals (0.01 to 1.0)
   - Tooltip: "Raise threshold to show only large anomalies; lower to catch minor deviations"
   - Default value on first mount: 0.3
   - "Set Threshold" button validates and calls `onThresholdChange(newThreshold)`
   - If value outside 0.01–1.0, display validation error: "Threshold must be between 0.01 and 1.0"

2. **Table Columns** (always present, even when empty):
   - **Period**: String (format depends on group_by: YYYY-MM-DD | YYYY-Www | YYYY-MM)
   - **Total Spent**: Currency (formatted number from `outcome_total`)
   - **Baseline Avg (Historical)**: Currency (formatted number from `baseline_average`)
   - **Excess Ratio**: Decimal with "x" suffix (e.g., "1.28x" from `increase_ratio`; always > 1.0 by definition)

3. **Empty State Rendering** (must be explicit):
   - Display info icon and message: "ⓘ No anomalies detected for threshold {threshold} and the selected date range."
   - Suggestion message: "Try lowering the threshold or expanding the date range."
   - Display table header row (column names) but no data rows
   - Do NOT hide the entire panel

4. **Loading State**:
   - Disable threshold input and "Set Threshold" button
   - Show spinner in table area
   - Display "Loading anomalies..." text

5. **Error State**:
   - Display error message in red box (e.g., API error)
   - Keep threshold input and button enabled (allow retry)
   - Do not render table rows

6. **Status Footer**:
   - Show count: "Total alerts: {count} of {totalPeriods} periods exceed threshold" (if data available)
   - On empty state, omit this footer

---

## Feature 3: B2B vs B2C Comparison View

A new page/view displaying revenue analysis segmented by business type (B2B customers vs B2C customers). Both segments show top-5 revenue-generating categories and an aggregate revenue comparison chart.

### Data Flow

1. Navigation to new route (e.g., `/dashboard/comparison`)
2. Component loads and calls `GET /api/metrics/facets` for metadata
3. Component renders two parallel sections (B2B and B2C)
4. Each section calls `GET /api/metrics/categories/top` with:
   - `operation_type: 'income'` (always; this is revenue-focused)
   - `limit: 5` (top 5 categories)
   - `business_type: 'B2B'` or `'B2C'` (respectively)
   - Optional `start_date` and `end_date` from shared date filter
5. Each section displays table + calculates percentage of total revenue
6. Comparison chart aggregates income totals across both business types

### Ambiguity Resolution

**PM Brief vs API Reality:**
- **PM Brief**: "Compare B2B vs B2C revenue by top 5 categories"
- **API Reality**: 
  - `operation_type` parameter controls income vs outcome; default is `'outcome'`
  - To show revenue (income), must explicitly pass `operation_type: 'income'`
  - API returns `TopCategoryItem[]` with individual category entries
  - UI must aggregate per-business-type to calculate percentage

**Resolution**:
- Component hardcodes `operation_type: 'income'` (no user toggle in MVP)
- Component calculates total revenue per business type: `sum(entries.total_amount)`
- Component calculates percentage: `(entry.total_amount / total) * 100`
- UI displays as "X% of {BusinessType} revenue"

**Empty State Resolution:**
- **PM Brief**: May have implied "show nothing if no data"
- **API Reality**: If no income categories exist for a business type in the date range, API returns empty array `[]`
- **Component Behavior**: Render explicit empty state for each panel independently:

```
┌─────────────────────────┬─────────────────────────┐
│        B2B Revenue      │      B2C Revenue        │
├─────────────────────────┼─────────────────────────┤
│ ⓘ No data available     │ ┌──────────────────────┐│
│   for the selected      │ │ Top Categories:      ││
│   date range            │ ├──────────────────────┤│
│                         │ │ Sales    │ $234.5k   ││
│                         │ │ 42% B2C  │          ││
│                         │ │ ...                  ││
│                         │ └──────────────────────┘│
└─────────────────────────┴─────────────────────────┘
```

Each panel (B2B, B2C) must independently show empty state or populated state; one side can be empty while the other displays data.

### Component: `B2BVsB2CComparisonPage`

**Purpose**: Main page container for the comparison view

**Props**:
```typescript
interface B2BVsB2CComparisonPageProps {
  /**
   * Optional initial date filter (can be passed from parent router/state)
   * Type: DateRangeFilter
   * If omitted, component defaults to { } (no filters, full date range)
   */
  initialFilter?: DateRangeFilter;
}
```

**Responsibility**:
- Manages top-level state: `dateFilter` (DateRangeFilter), `facets` (FacetsResponse)
- Fetches facets on mount
- Passes filter to child components
- Renders layout with `DateRangeFilterPanel` and two side-by-side `CategoryTablePanel` instances

**Rendered Output**:
```
┌─────────────────────────────────────────────────────────────────┐
│ B2B vs B2C Revenue Comparison                                   │
│                                                                 │
│ [Date Range Filter Panel]                                      │
│                                                                 │
│ ┌──────────────────────────────┬──────────────────────────────┐
│ │ B2B Top 5 Revenue Categories │ B2C Top 5 Revenue Categories │
│ ├──────────────────────────────┼──────────────────────────────┤
│ │ [CategoryTablePanel B2B]      │ [CategoryTablePanel B2C]      │
│ └──────────────────────────────┴──────────────────────────────┘
│                                                                 │
│ [Revenue Comparison Chart]                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Component: `DateRangeFilterPanel` (Reused from Feature 1)

Same as Feature 1. Passes updated `DateRangeFilter` to parent, which propagates to both comparison panels.

---

### Component: `CategoryTablePanel`

**Purpose**: Displays top-N categories for a single business type (B2B or B2C)

**Props**:
```typescript
interface CategoryTablePanelProps {
  /**
   * Business type being displayed in this panel
   * Type: 'B2B' | 'B2C'
   * Determines which section heading and styling
   */
  businessType: BusinessType;

  /**
   * Current date range filter from parent
   * Type: DateRangeFilter
   * Both start_date and end_date optional
   */
  dateFilter: DateRangeFilter;

  /**
   * Facets metadata for available date bounds
   * Type: FacetsResponse
   * Used in empty state messaging
   */
  facets: FacetsResponse;

  /**
   * Array of top categories for this business type
   * Type: TopCategoriesResponse (alias to CategoryEntry[])
   * Received from GET /api/metrics/categories/top with business_type parameter
   * Empty array when no income categories exist for this type in date range
   */
  categories: TopCategoriesResponse;

  /**
   * Whether category data is currently loading
   * Type: boolean
   */
  isLoading?: boolean;

  /**
   * Optional error message from API or validation
   * Type: string | null
   */
  error?: string | null;

  /**
   * Maximum number of categories to display (passed to API as limit)
   * Type: number
   * Default: 5
   * Valid range (backend enforces): 1–20
   * Note: In MVP, hardcoded to 5; not user-editable
   */
  limit?: number;
}
```

**Rendered Output** (Populated):
```
┌──────────────────────────────────────┐
│ B2B Top 5 Revenue Categories         │
│                                      │
│ ┌────────────┬──────────┬──────────┐│
│ │ Category   │ Revenue  │ % of B2B ││
│ ├────────────┼──────────┼──────────┤│
│ │ Suppliers  │ $450,230 │ 35.2%    ││
│ │ Sales      │ $380,100 │ 29.7%    ││
│ │ Ops        │ $280,440 │ 21.9%    ││
│ │ Admin      │ $125,000 │ 9.8%     ││
│ │ Other      │ $45,230  │ 3.5%     ││
│ └────────────┴──────────┴──────────┘│
│                                      │
│ Total Revenue (B2B): $1,281,000      │
└──────────────────────────────────────┘
```

**Rendered Output** (Empty State):
```
┌──────────────────────────────────────┐
│ B2B Top 5 Revenue Categories         │
│                                      │
│ ⓘ No income data available for B2B  │
│   within the selected date range     │
│   ({start_date} to {end_date})       │
│                                      │
│ Try expanding the date range or      │
│ check if B2B data exists in system.  │
└──────────────────────────────────────┘
```

**UI Behavior Details**:

1. **Table Columns** (always present, even when empty):
   - **Category**: String (category name from `Category` enum)
   - **Revenue**: Currency formatted (from `total_amount`)
   - **% of {BusinessType}**: Percentage (calculated as `(entry.total_amount / sum(all.total_amount)) * 100`)

2. **Empty State Rendering** (must be explicit):
   - Display info icon and message: "ⓘ No income data available for {businessType} within the selected date range."
   - If `dateFilter` has both dates, include range in message: "({start_date} to {end_date})"
   - Suggestion: "Try expanding the date range or check if {businessType} data exists in system."
   - Display table header row (column names) but no data rows
   - Do NOT hide the entire panel

3. **Loading State**:
   - Show spinner or skeleton loaders in table rows
   - Display "Loading categories..." text
   - Disable any interactive elements (none in this component, but for consistency)

4. **Error State**:
   - Display error message in red box (e.g., API error, network timeout)
   - Display table header row (column names) but no data rows
   - Do NOT hide the entire panel

5. **Data Summary Footer**:
   - Always display: "Total Revenue ({businessType}): ${total formatted}"
   - Calculate total by summing all `entry.total_amount` values
   - Only omit footer if empty state (no data)

6. **Percentage Calculation**:
   - For each row: `percentage = (entry.total_amount / totalRevenue) * 100`
   - Format with 1 decimal place: "35.2%"
   - Total of all percentages should equal 100.0% (accounting for rounding)

---

### Component: `RevenueComparisonChart`

**Purpose**: Visual comparison of total revenue (B2B vs B2C) over time or as aggregate

**Props**:
```typescript
interface RevenueComparisonChartProps {
  /**
   * Total revenue for B2B segment
   * Type: number
   * Calculated as: sum of all CategoryEntry.total_amount where businessType='B2B'
   * 0 if no data available
   */
  b2bTotal: number;

  /**
   * Total revenue for B2C segment
   * Type: number
   * Calculated as: sum of all CategoryEntry.total_amount where businessType='B2C'
   * 0 if no data available
   */
  b2cTotal: number;

  /**
   * Whether data is currently loading
   * Type: boolean
   */
  isLoading?: boolean;

  /**
   * Optional error message
   * Type: string | null
   */
  error?: string | null;

  /**
   * Chart type/rendering hint
   * Type: 'bar' | 'pie'
   * Default: 'bar'
   * Bar: horizontal bars for B2B vs B2C
   * Pie: single pie chart showing revenue split
   */
  chartType?: 'bar' | 'pie';
}
```

**Rendered Output** (Bar Chart, Populated):
```
┌──────────────────────────────────────┐
│ Total Revenue Comparison             │
│                                      │
│ B2B: $1,281,000  [████████    ] 65%  │
│ B2C: $  684,500  [█████      ] 35%   │
│                                      │
│ Total: $1,965,500                    │
└──────────────────────────────────────┘
```

**Rendered Output** (Loading State):
```
┌──────────────────────────────────────┐
│ Total Revenue Comparison             │
│                                      │
│ ⚙️ Loading comparison...              │
└──────────────────────────────────────┘
```

**Rendered Output** (Error State):
```
┌──────────────────────────────────────┐
│ Total Revenue Comparison             │
│                                      │
│ ❌ Error loading comparison:         │
│    {error message}                   │
└──────────────────────────────────────┘
```

**Rendered Output** (All-Zero State):
```
┌──────────────────────────────────────┐
│ Total Revenue Comparison             │
│                                      │
│ ⓘ No revenue data available for      │
│   the selected date range            │
│                                      │
│ Try expanding the date range.        │
└──────────────────────────────────────┘
```

**UI Behavior Details**:

1. **Data Aggregation**:
   - `b2bTotal` and `b2cTotal` passed from parent (already calculated from category tables)
   - Chart displays as-is; no additional API calls

2. **Bar Chart** (default):
   - Two horizontal bars: B2B (top) and B2C (bottom)
   - Bar width proportional to revenue ratio
   - Display absolute dollar amount and percentage on each bar
   - Color B2B differently from B2C (e.g., blue vs orange)

3. **Pie Chart** (alternative):
   - Single pie chart split into two slices (B2B and B2C)
   - Label each slice with business type, dollar amount, and percentage
   - Color B2B differently from B2C

4. **Loading State**:
   - Show spinner or skeleton
   - Display "Loading comparison..." text

5. **Error State**:
   - Display error icon and message
   - Allow retry action (parent should handle)

6. **All-Zero State**:
   - If both `b2bTotal === 0` and `b2cTotal === 0`
   - Display empty state message: "ⓘ No revenue data available for the selected date range"
   - Do NOT render bars/pie (render info box instead)

---

## Component Hierarchy & Data Flow

```
B2BVsB2CComparisonPage (state: dateFilter, facets)
├── DateRangeFilterPanel
│   └── onFilterChange → updates parent dateFilter
├── [B2B Column]
│   └── CategoryTablePanel (businessType='B2B', dateFilter)
│       └── Displays: TopCategoriesResponse[] for B2B
│       └── Calculates: b2bTotal
├── [B2C Column]
│   └── CategoryTablePanel (businessType='B2C', dateFilter)
│       └── Displays: TopCategoriesResponse[] for B2C
│       └── Calculates: b2cTotal
└── RevenueComparisonChart (b2bTotal, b2cTotal)
    └── Displays: Comparison visualization
```

---

## Summary of Ambiguity Resolutions

| Ambiguity | PM Brief | API Reality | Resolution |
|-----------|----------|-------------|-----------|
| **Date Filter Bounds** | Unspecified | `start_date` and `end_date` are independent optional | Component shows available range (min_date/max_date) and handles partial filters |
| **Moving Average** | "3-period moving average" | Backend returns `baseline_average` (calculation unknown) | UI column labeled "Baseline Avg (Historical)" with tooltip explaining backend manages it |
| **Alert Empty State** | Implied hide if no alerts | API returns empty array `[]` | Render explicit empty state box with helpful message |
| **Top Categories Revenue** | "Top 5 categories" | API requires `operation_type` parameter (defaults to 'outcome') | Component hardcodes `operation_type: 'income'` for revenue focus |
| **Percentage Calculation** | Unspecified | API returns individual amounts, not percentages | UI calculates: `(entry.total_amount / category_total) * 100` |
| **B2B/B2C Empty Independently** | Unclear if both sides fail together | API can return data for one type but not the other | Each panel renders independent empty state |
| **Chart Type** | Unspecified | No chart in API response | UI selects bar chart as default; pie chart as alternative |

---

## Notes for Implementation

1. **No API Calls in Components**: This spec defines structure and behavior only. API integration happens in parent (page component) or hooks layer, not in these presentational components.

2. **Type Imports**: All components import types from:
   - `frontend/specs/api-types.ts` (FacetsResponse, AlertEntry, AlertsResponse, CategoryEntry, TopCategoriesResponse)
   - `frontend/specs/param-types.ts` (DateRangeFilter, AlertsParams, TopCategoriesParams)
   - `frontend/src/lib/financial-types.ts` (OperationType, Category, BusinessType)

3. **Currency Formatting**: Component renders use formatted currency (e.g., "$1,234.56"). The actual formatting logic is NOT specified here; defer to a formatting utility in `frontend/src/lib/format.ts` or similar.

4. **Date Formatting**: ISO 8601 (YYYY-MM-DD) for all date inputs and displays unless otherwise noted.

5. **MVP Scope**: 
   - `DateRangeFilterPanel`: Fully functional
   - `AlertsTablePanel`: Fully functional, `group_by` hardcoded to 'month'
   - `B2BVsB2CComparisonPage`, `CategoryTablePanel`, `RevenueComparisonChart`: Fully functional, `operation_type` hardcoded to 'income', `limit` hardcoded to 5

6. **Future Enhancements** (Post-MVP):
   - User-editable `group_by` and `operation_type` toggles
   - Downloadable reports
   - Custom threshold presets in alerts
   - Drill-down from comparison chart to transaction level

