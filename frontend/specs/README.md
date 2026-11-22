# Frontend Specs — Data Contract Documentation

**Purpose**: Complete, authoritative reference for the data contract between the Financial Dashboard frontend and the backend API.

**Live OpenAPI Schema**: http://localhost:8000/openapi.json  
**Documentation UI**: http://localhost:8000/docs  
**Type References**: 
- `frontend/specs/api-types.ts` — API response types
- `frontend/specs/param-types.ts` — Query parameter types
- `frontend/specs/components.md` — Component specifications

---

## Table of Contents

1. [Feature 1: Date Range Filter](#feature-1-date-range-filter)
2. [Feature 2: Alerts Table (Anomaly Detection)](#feature-2-alerts-table-anomaly-detection)
3. [Feature 3: B2B vs B2C Comparison](#feature-3-b2b-vs-b2c-comparison)
4. [Error Handling](#error-handling)
5. [Date Format Reference](#date-format-reference)

---

## Feature 1: Date Range Filter

### Overview

The date range filter provides metadata about available dates in the system and allows filtering all dashboard data to a user-specified time window. This feature supplies the foundational metadata (`min_date`, `max_date`) displayed in the UI and enables date-bound queries for Features 2 and 3.

### Endpoints Consumed

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/metrics/facets` | `GET` | Retrieve available date range and filter dimensions |

### Request Specification

**Endpoint**: `GET /api/metrics/facets`

**Query Parameters**: None required. This endpoint takes no parameters.

```typescript
// No parameters — simple metadata fetch
// Example request:
GET http://localhost:8000/api/metrics/facets
```

### Response Specification

**Type**: `FacetsResponse` (from `frontend/specs/api-types.ts`)

**Response Body**:
```typescript
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["suppliers", "sales", "operational", "administrative", "others"],
  "min_date": "2024-01-01",
  "max_date": "2024-12-31"
}
```

**Field Details**:

| Field | Type | Description | Valid Values | Example |
|-------|------|-------------|--------------|---------|
| `operation_types` | `string[]` | Available operation types in dataset | `'income'`, `'outcome'` | `["income", "outcome"]` |
| `business_types` | `string[]` | Available business types in dataset | `'B2B'`, `'B2C'` | `["B2B", "B2C"]` |
| `categories` | `string[]` | Available expense/revenue categories | `'suppliers'`, `'sales'`, `'operational'`, `'administrative'`, `'others'` | `["suppliers", "sales", "operational"]` |
| `min_date` | `string` | Earliest date with data (YYYY-MM-DD) | ISO 8601 date format | `"2024-01-01"` |
| `max_date` | `string` | Latest date with data (YYYY-MM-DD) | ISO 8601 date format | `"2024-12-31"` |

**Response Constraints**:
- All fields are **required** and always present (no null values).
- `min_date` and `max_date` define the bounds for valid `start_date` and `end_date` parameters in Features 2 and 3.
- The endpoint always returns exactly one facets object (never an array or empty response).

### Edge Cases & UI Behavior

#### Edge Case 1: Empty Database (No Data)
**Scenario**: Backend has no financial data.

**Expected Response**: 
```json
{
  "operation_types": [],
  "business_types": [],
  "categories": [],
  "min_date": null,
  "max_date": null
}
```

**UI Behavior**:
- **Date Range Filter Panel**: Display message "No data available. The dashboard is empty."
- **Date Inputs**: Disabled (users cannot enter dates if no data exists).
- **Features 2 & 3**: Skip rendering or show "No data" state immediately (no API calls needed).

#### Edge Case 2: Single Day of Data
**Scenario**: Backend contains data for only one date (e.g., 2024-06-15).

**Expected Response**:
```json
{
  "operation_types": ["outcome"],
  "business_types": ["B2B"],
  "categories": ["suppliers", "operational"],
  "min_date": "2024-06-15",
  "max_date": "2024-06-15"
}
```

**UI Behavior**:
- **Date Range Filter Panel**: Display "Data available for 1 day only: 2024-06-15"
- **Date Inputs**: 
  - Both inputs disabled or restricted to show 2024-06-15
  - User cannot select a range (start and end are locked to same day)
- **Implicit Behavior**: Both `start_date` and `end_date` fixed to 2024-06-15 when user attempts filtering.

### Type References

**Import from `frontend/specs/api-types.ts`**:
```typescript
import type { FacetsResponse } from '../specs/api-types';
```

**Component Props** (see `frontend/specs/components.md`):
```typescript
interface DateRangeFilterPanelProps {
  filter: DateRangeFilter;         // Current user filter (from param-types.ts)
  facets: FacetsResponse;          // Metadata from this endpoint
  onFilterChange: (filter: DateRangeFilter) => void;
  isLoading?: boolean;
  error?: string | null;
}
```

---

## Feature 2: Alerts Table (Anomaly Detection)

### Overview

The alerts table displays detected spending anomalies—periods where outcome (spending) exceeded the baseline by a user-configurable threshold. The component filters the data using a date range (from Feature 1) and threshold slider, and renders results in a 4-column table with explicit empty-state handling.

### Endpoints Consumed

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/metrics/alerts` | `GET` | Retrieve anomalies filtered by threshold, date range, grouping, and business type |

### Request Specification

**Endpoint**: `GET /api/metrics/alerts`

**Query Parameters**:

| Parameter | Type | Required | Default | Valid Range | Format / Valid Values | Description |
|-----------|------|----------|---------|-------------|----------------------|-------------|
| `threshold` | `number` | No | `0.3` | `>= 0` (no maximum) | Decimal (e.g., 0.3, 0.5, 1.0) | Minimum increase ratio above baseline to flag an alert |
| `group_by` | `string` | No | `'month'` | N/A | `'day'` \| `'week'` \| `'month'` | Time period granularity for grouping anomalies |
| `start_date` | `string \| null` | No | `null` | Min: facets.min_date, Max: end_date | YYYY-MM-DD (ISO 8601) | Inclusive start of date filter range |
| `end_date` | `string \| null` | No | `null` | Min: start_date, Max: facets.max_date | YYYY-MM-DD (ISO 8601) | Inclusive end of date filter range |
| `business_type` | `string \| null` | No | `null` | N/A | `'B2B'` \| `'B2C'` \| `null` | Filter to specific business type (null = both) |

**Example Requests**:

```bash
# Default parameters (threshold 0.3, monthly, all dates, all business types)
GET /api/metrics/alerts

# High threshold, daily granularity, specific date range, B2B only
GET /api/metrics/alerts?threshold=0.5&group_by=day&start_date=2024-01-01&end_date=2024-03-31&business_type=B2B

# Weekly view, single date as both start and end
GET /api/metrics/alerts?group_by=week&start_date=2024-06-15&end_date=2024-06-15

# No date filter (empty start_date and end_date)
GET /api/metrics/alerts?threshold=0.2&group_by=month
```

**Parameter Constraints**:

1. **threshold**:
   - Min: 0 (flags all anomalies where outcome > baseline)
   - Default: 0.3 (30% increase)
   - Typical range for UI slider: 0.1 to 2.0
   - Interpretation: 0.3 means outcome ≥ 1.3× baseline; 1.0 means outcome ≥ 2× baseline
   - **UI Validation**: Accept numeric input 0.01–1.0 (MVP range); alert user if outside range

2. **group_by**:
   - Affects period format in response:
     - `'day'` → YYYY-MM-DD (e.g., 2024-06-15)
     - `'week'` → YYYY-Www (e.g., 2024-W25)
     - `'month'` → YYYY-MM (e.g., 2024-06)
   - Default: `'month'`
   - **UI**: Dropdown or segment control with 3 options

3. **start_date & end_date**:
   - Format: YYYY-MM-DD (ISO 8601 date string)
   - Both **independent and optional**:
     - Omit both → results span entire dataset
     - Only start_date → results from start_date to max_date
     - Only end_date → results from min_date to end_date
     - Both set → results between start_date and end_date (inclusive on both sides)
   - **Backend constraint**: start_date ≤ end_date (backend validates; UI should prevent invalid ranges)
   - **UI Behavior**: Inherited from Feature 1 date filter

4. **business_type**:
   - Filter anomalies to specific business type (B2B or B2C customers only)
   - `null` or omitted → no filter, include all types
   - If parameter is not needed, omit it entirely from query string

### Response Specification

**Type**: `AlertsResponse` (array of `AlertEntry` from `frontend/specs/api-types.ts`)

**Response Body (Example with group_by='month', threshold=0.3)**:
```json
[
  {
    "period": "2024-06",
    "outcome_total": 150000,
    "baseline_average": 100000,
    "increase_ratio": 0.5
  },
  {
    "period": "2024-07",
    "outcome_total": 180000,
    "baseline_average": 100000,
    "increase_ratio": 0.8
  }
]
```

**Field Details**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `period` | `string` | Time period when anomaly was detected; format depends on group_by | `'2024-06'` (month), `'2024-W25'` (week), `'2024-06-15'` (day) |
| `outcome_total` | `number` | Total spending (outcome) amount in this period | `150000` |
| `baseline_average` | `number` | Historical baseline (previous periods' average); backend-calculated | `100000` |
| `increase_ratio` | `number` | Relative increase: (outcome_total - baseline_average) / baseline_average | `0.5` (50% increase) |

**Response Constraints**:
- Always returns an **array** (may be empty if no anomalies detected).
- Array is **sorted by period** (ascending, oldest to newest).
- Each entry has all 4 fields (all required).
- `increase_ratio` ≥ `threshold` (backend filters; UI does not need to re-filter).

### Edge Cases & UI Behavior

#### Edge Case 1: Threshold Too High (No Anomalies)
**Scenario**: User sets threshold = 2.0 (200% increase), but no spending anomalies exceed 200%.

**Expected Response**:
```json
[]
```

**UI Behavior** (see `frontend/specs/components.md` for full layout):
- **Panel must remain visible** (do NOT hide the entire alerts block).
- **Table header always present**: "Period", "Total Spent", "Baseline Avg (Historical)", "Excess Ratio"
- **Empty state message** (displayed where rows would be):
  ```
  No anomalies detected for threshold 2.0x.
  Try lowering the threshold or expanding the date range.
  ```
- **Threshold slider**: Still functional; user can adjust threshold to get results.
- **Data summary**: Footer shows "0 anomalies detected"

#### Edge Case 2: Date Filter Partial (Only start_date)
**Scenario**: User sets `start_date='2024-06-01'` but leaves `end_date` empty.

**Expected Request**:
```
GET /api/metrics/alerts?threshold=0.3&group_by=month&start_date=2024-06-01
```

**Expected Response** (example):
```json
[
  {
    "period": "2024-06",
    "outcome_total": 150000,
    "baseline_average": 100000,
    "increase_ratio": 0.5
  },
  {
    "period": "2024-07",
    "outcome_total": 160000,
    "baseline_average": 100000,
    "increase_ratio": 0.6
  },
  {
    "period": "2024-08",
    "outcome_total": 155000,
    "baseline_average": 100000,
    "increase_ratio": 0.55
  }
]
```

**UI Behavior**:
- **Date range display**: "Showing from 2024-06-01 to 2024-12-31" (or current max_date)
- **Table rendered normally** with all results from June through December (or last available date).
- **Anomalies from June onwards** are included; baseline_average is calculated by backend considering full history.

#### Edge Case 3: Business Type Filter Excludes All Data
**Scenario**: User sets `business_type='B2B'`, but all anomalies in the date range are from B2C customers.

**Expected Response**:
```json
[]
```

**UI Behavior** (same as Edge Case 1):
- **Panel remains visible**.
- **Empty state message**: "No anomalies detected for B2B in the selected date range. Try expanding the date range or switching to B2C."
- **Business type filter** (if implemented): Shows current selection; user can change to see B2C results.

### Type References

**Import from `frontend/specs/api-types.ts`**:
```typescript
import type { AlertEntry, AlertsResponse } from '../specs/api-types';
```

**Import from `frontend/specs/param-types.ts`**:
```typescript
import type { AlertsParams } from '../specs/param-types';
```

**Component Props** (see `frontend/specs/components.md`):
```typescript
interface AlertsTablePanelProps {
  dateFilter: DateRangeFilter;              // From Feature 1 date filter
  facets: FacetsResponse;                   // From Feature 1 facets endpoint
  alerts: AlertsResponse;                   // Response from this endpoint
  threshold: number;                        // Current threshold (0.01–1.0, default 0.3)
  onThresholdChange: (threshold: number) => void;
  isLoading?: boolean;
  error?: string | null;
  groupBy?: 'day' | 'week' | 'month';       // Optional grouping (default 'month')
}
```

---

## Feature 3: B2B vs B2C Comparison

### Overview

The B2B vs B2C comparison view displays revenue breakdown by category for each business type side-by-side, with a revenue comparison chart below. The feature uses the same date range filter from Feature 1 and fetches top categories for both B2B and B2C independently.

### Endpoints Consumed

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/metrics/categories/top` | `GET` | Retrieve top N categories by total amount for a specific business type and operation type |

**Called twice per view**: Once with `business_type=B2B` and once with `business_type=B2C`.

### Request Specification

**Endpoint**: `GET /api/metrics/categories/top`

**Query Parameters**:

| Parameter | Type | Required | Default | Valid Range | Format / Valid Values | Description |
|-----------|------|----------|---------|-------------|----------------------|-------------|
| `operation_type` | `string` | No | `'outcome'` | N/A | `'income'` \| `'outcome'` | Type of operation to filter by |
| `limit` | `integer` | No | `5` | `1–20` | Integer | Maximum number of top categories to return |
| `start_date` | `string \| null` | No | `null` | Min: facets.min_date, Max: end_date | YYYY-MM-DD (ISO 8601) | Inclusive start of date filter range |
| `end_date` | `string \| null` | No | `null` | Min: start_date, Max: facets.max_date | YYYY-MM-DD (ISO 8601) | Inclusive end of date filter range |
| `business_type` | `string \| null` | No | `null` | N/A | `'B2B'` \| `'B2C'` \| `null` | Filter to specific business type |

**Example Requests**:

```bash
# B2B revenue (income), top 5 categories, all dates
GET /api/metrics/categories/top?operation_type=income&business_type=B2B

# B2C revenue (income), top 10 categories, specific date range
GET /api/metrics/categories/top?operation_type=income&limit=10&start_date=2024-01-01&end_date=2024-06-30&business_type=B2C

# Default outcome (spending) for B2B
GET /api/metrics/categories/top?business_type=B2B

# Income for all business types (no business_type filter)
GET /api/metrics/categories/top?operation_type=income
```

**Parameter Constraints**:

1. **operation_type**:
   - For Feature 3 (B2B vs B2C Comparison): **Always use `'income'`** (revenue, not spending).
   - Default: `'outcome'` (which is used for alerts/spending in Feature 2).
   - **UI Hardcoding**: Component must pass `operation_type: 'income'` explicitly to avoid default.

2. **limit**:
   - Min: 1
   - Max: 20 (backend enforces; UI should validate)
   - Default: 5
   - **MVP Scope**: Hardcoded to 5; future versions may expose as user-configurable setting.

3. **start_date & end_date**:
   - Same behavior as Feature 2: both independent, optional, inclusive.
   - Inherited from Feature 1 date filter.

4. **business_type**:
   - For Feature 3: **Called twice**: once with `'B2B'`, once with `'B2C'`.
   - Allows independent fetches and renders per side.
   - If `null` or omitted: returns categories for all business types combined (not useful for Feature 3; always specify B2B or B2C).

### Response Specification

**Type**: `TopCategoriesResponse` (array of `CategoryEntry` from `frontend/specs/api-types.ts`)

**Response Body (Example: B2B revenue, top 5 categories)**:
```json
[
  {
    "category": "suppliers",
    "operation_type": "income",
    "total_amount": 500000
  },
  {
    "category": "sales",
    "operation_type": "income",
    "total_amount": 450000
  },
  {
    "category": "operational",
    "operation_type": "income",
    "total_amount": 300000
  },
  {
    "category": "administrative",
    "operation_type": "income",
    "total_amount": 150000
  },
  {
    "category": "others",
    "operation_type": "income",
    "total_amount": 100000
  }
]
```

**Field Details**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `category` | `string` | Financial category name | `'suppliers'`, `'sales'`, `'operational'`, `'administrative'`, `'others'` |
| `operation_type` | `string` | Operation type (always matches request parameter) | `'income'` |
| `total_amount` | `number` | Total revenue in this category | `500000` |

**Response Constraints**:
- Always returns an **array** (may be empty if no data for business type/date range).
- Array is **sorted by total_amount descending** (highest revenue first).
- Maximum length is `limit` parameter (default 5, MVP).
- All entries have `operation_type` matching the request (always `'income'` for Feature 3).

### Edge Cases & UI Behavior

#### Edge Case 1: One Business Type Has No Data
**Scenario**: B2B has revenue data, but B2C has none (or no transactions matching date range).

**Request Pair**:
```bash
# B2B fetch (returns data)
GET /api/metrics/categories/top?operation_type=income&business_type=B2B

# B2C fetch (returns empty)
GET /api/metrics/categories/top?operation_type=income&business_type=B2C
```

**Expected Responses**:
```json
// B2B response
[
  { "category": "suppliers", "operation_type": "income", "total_amount": 500000 },
  { "category": "sales", "operation_type": "income", "total_amount": 450000 }
]

// B2C response (empty)
[]
```

**UI Behavior** (see `frontend/specs/components.md`):

- **B2B Panel**: Renders normally with data:
  - Table header: "Category", "Revenue", "% of B2B"
  - 2 rows of data
  - Footer: "Total Revenue (B2B): $950,000"

- **B2C Panel**: Renders explicitly empty state:
  - Table header: **Still present** ("Category", "Revenue", "% of B2C")
  - No data rows
  - **Empty message** (displayed where rows would be):
    ```
    No income data available for B2C
    (from 2024-01-01 to 2024-12-31)
    Try expanding the date range or check if B2C data exists.
    ```
  - **Footer still present** (but grayed out or disabled): "Total Revenue (B2C): $0"
  - **Panel is NOT hidden**; it remains visible for context

- **Revenue Comparison Chart**:
  - Displays B2B: $950,000 (with label)
  - Displays B2C: $0 (with label)
  - Chart renders both sides even if one is zero (showing contrast)

#### Edge Case 2: Both Business Types Empty for Date Range
**Scenario**: User selects a date range (e.g., 2025-01-01 to 2025-12-31) with no transactions.

**Expected Responses** (both B2B and B2C):
```json
[]
```

**UI Behavior**:

- **B2B Panel**: Empty state
  - Header: "Category", "Revenue", "% of B2B"
  - Empty message: "No income data available for B2B (from 2025-01-01 to 2025-12-31). Try expanding the date range or check if B2C data exists."
  - Footer: "Total Revenue (B2B): $0"

- **B2C Panel**: Empty state (same as B2B)
  - Header present, message present, footer present ($0)

- **Revenue Comparison Chart**:
  - **Chart not rendered** (both totals are 0)
  - **Alternative display** (gray box with message):
    ```
    No revenue data available
    for the selected date range.
    ```

### UI Calculations Required

**Percentage per Category**:
The API does **not** return percentages. Component must calculate:
```
percentage = (entry.total_amount / totalRevenueForBusinessType) * 100
```

**Example** (B2B data above):
```
suppliers: (500000 / (500000 + 450000)) * 100 = 52.63%
sales:     (450000 / 950000) * 100 = 47.37%
```

**Display Format**: 1 decimal place (e.g., "52.6%")

### Type References

**Import from `frontend/specs/api-types.ts`**:
```typescript
import type { CategoryEntry, TopCategoriesResponse } from '../specs/api-types';
```

**Import from `frontend/specs/param-types.ts`**:
```typescript
import type { TopCategoriesParams } from '../specs/param-types';
```

**Component Props** (see `frontend/specs/components.md`):
```typescript
// Main page component
interface B2BVsB2CComparisonPageProps {
  initialFilter?: DateRangeFilter;
}

// Category table (reusable for B2B and B2C)
interface CategoryTablePanelProps {
  businessType: BusinessType;         // 'B2B' or 'B2C'
  dateFilter: DateRangeFilter;        // From Feature 1
  facets: FacetsResponse;             // From Feature 1
  categories: TopCategoriesResponse;  // Response from this endpoint
  isLoading?: boolean;
  error?: string | null;
  limit?: number;                     // Default 5 (MVP)
}

// Revenue comparison chart
interface RevenueComparisonChartProps {
  b2bTotal: number;                   // Sum of all B2B category totals
  b2cTotal: number;                   // Sum of all B2C category totals
  isLoading?: boolean;
  error?: string | null;
  chartType?: 'bar' | 'pie';          // Default 'bar'
}
```

---

## Error Handling

### HTTP Status Codes

| Status | Scenario | UI Behavior |
|--------|----------|-------------|
| `200 OK` | Successful response | Display data or empty state (if array is empty) |
| `400 Bad Request` | Invalid query parameters (e.g., threshold < 0, start_date > end_date) | Show error: "Invalid filter parameters. Please check your selections and try again." |
| `422 Unprocessable Entity` | Validation error (malformed date format, invalid enum value) | Show error: "Invalid date format. Please use YYYY-MM-DD." |
| `500 Internal Server Error` | Backend error | Show error: "Failed to load data. Please try again later." |

### Error State Rendering (All Features)

When an API call fails:

1. **Display error message** in the affected panel (do not hide panel).
2. **Keep previous data visible** (if available from cache or previous successful request).
3. **Provide retry mechanism** (optional: "Retry" button or automatic retry).
4. **Specific error text** based on HTTP status (see table above).

### Client-Side Validation (All Features)

Validate user input **before** sending API request:

1. **Date Format**: Ensure `start_date` and `end_date` are YYYY-MM-DD.
2. **Date Logic**: Ensure `start_date` ≤ `end_date`.
3. **Threshold Range** (Feature 2): Ensure threshold ≥ 0 and preferably ≤ 2.0.
4. **Limit Range** (Feature 3): Ensure limit is 1–20.

**UI Feedback**: Display inline validation messages (e.g., below date input: "Start date must be before end date").

---

## Date Format Reference

### Format Specification

**All dates in requests and responses use ISO 8601 date format: `YYYY-MM-DD`**

| Component | Example | Notes |
|-----------|---------|-------|
| Year | `2024` | 4 digits, full century |
| Month | `06` or `06` | 2 digits, zero-padded (01–12) |
| Day | `15` | 2 digits, zero-padded (01–31) |
| **Full Date** | `2024-06-15` | Hyphen-separated |

### Examples

```
Valid:
  2024-01-01    (January 1, 2024)
  2024-12-31    (December 31, 2024)
  2024-02-29    (Leap year February 29, 2024)

Invalid (rejected by backend):
  2024-6-15     (single-digit month; should be 2024-06-15)
  06/15/2024    (US format; should be 2024-06-15)
  15-06-2024    (European format; should be 2024-06-15)
  2024-13-01    (month 13 does not exist)
  2024-02-30    (February has only 28/29 days)
```

### JavaScript Conversion

```javascript
// String to Date object
const dateString = '2024-06-15';
const dateObj = new Date(dateString); // ✓ Works (ISO format)

// Date object to string
const today = new Date();
const isoString = today.toISOString().split('T')[0]; // e.g., '2024-06-15'

// Validation example
function isValidDateFormat(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}
```

---

## Summary: Quick Reference Table

| Feature | Endpoint | Method | Required Params | Optional Params | Response Type | Empty State |
|---------|----------|--------|-----------------|-----------------|---------------|------------|
| **1. Date Range Filter** | `/api/metrics/facets` | `GET` | None | None | `FacetsResponse` | Shows "No data" message |
| **2. Alerts Table** | `/api/metrics/alerts` | `GET` | None | threshold, group_by, start_date, end_date, business_type | `AlertsResponse[]` | Panel visible + message |
| **3. B2B vs B2C** | `/api/metrics/categories/top` | `GET` | None (but specify business_type per call) | operation_type (always 'income'), limit, start_date, end_date, business_type | `TopCategoriesResponse[]` | Per-panel empty state |

---

## Related Documentation

- **Component Specifications**: [`frontend/specs/components.md`](./components.md)
- **API Type Definitions**: [`frontend/specs/api-types.ts`](./api-types.ts)
- **Parameter Type Definitions**: [`frontend/specs/param-types.ts`](./param-types.ts)
- **Existing Type Definitions**: [`frontend/src/lib/financial-types.ts`](../src/lib/financial-types.ts)
- **Live API Documentation**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json
