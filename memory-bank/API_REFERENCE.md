---
name: API Reference
description: Complete endpoint documentation derived from backend routes
date_last_updated: 2026-11-25
---

# API Reference — Financial Metrics Backend

All endpoints are prefixed with the backend URL (default: `http://localhost:8000`).

## Health & Documentation

### `GET /health`
**Status Check**

```bash
curl http://localhost:8000/health
```

**Response**:
```json
{
  "status": "ok"
}
```

---

### `GET /docs`
**Interactive API Documentation (Swagger UI)**

Auto-generated from FastAPI. Visit `http://localhost:8000/docs` in browser.

---

## Financial Data Endpoints

### `GET /api/metrics`
**Get Financial Movements**

Returns all financial transactions (income and outcome) for the period.

**Query Parameters**:
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `start_date` | ISO 8601 | `2024-01-01` | Filter from this date (inclusive) |
| `end_date` | ISO 8601 | `2024-12-31` | Filter to this date (inclusive) |
| `category` | enum | `sales` | Filter by category (suppliers, sales, operational, administrative, others) |
| `operation_type` | enum | `income` | Filter by type (income, outcome) |

**Response**:
```json
[
  {
    "create_date": "2024-01-10",
    "amount": 5000.50,
    "operation_type": "income",
    "category": "sales",
    "business_type": "B2B"
  },
  {
    "create_date": "2024-01-15",
    "amount": 1200.75,
    "operation_type": "outcome",
    "category": "suppliers",
    "business_type": "B2B"
  }
]
```

**Note**: Returns 144 movements (~12/month) with deterministic seed=42.

---

### `GET /api/metrics/profit-margin`
**Get Profit Margin Percentage**

Calculates total profit margin as (income - outcome) / income * 100.

**Response**:
```json
{
  "profit_margin": 68.3
}
```

---

### `GET /api/metrics/facets`
**Get Available Filter Dimensions**

Returns metadata for building filter UIs: available categories, operation types, business types, and date range.

**Response**:
```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["suppliers", "sales", "operational", "administrative", "others"],
  "min_date": "2024-01-01",
  "max_date": "2024-12-31"
}
```

---

### `GET /api/metrics/summary`
**Get Aggregated Financial Summary**

Summarizes income, outcome, and net profit grouped by time period.

**Query Parameters**:
| Param | Type | Default | Values |
|-------|------|---------|--------|
| `group_by` | enum | `month` | `day`, `week`, `month` |
| `start_date` | ISO 8601 | - | Optional filter |
| `end_date` | ISO 8601 | - | Optional filter |
| `category` | enum | - | Optional filter |
| `operation_type` | enum | - | Optional filter (income, outcome) |
| `business_type` | enum | - | Optional filter (B2B, B2C) |

**Response** (example with `group_by=month`):
```json
[
  {
    "period": "Jan 2024",
    "income": 48000.00,
    "outcome": 15000.00,
    "net": 33000.00
  },
  {
    "period": "Feb 2024",
    "income": 52500.00,
    "outcome": 18000.00,
    "net": 34500.00
  }
]
```

---

### `GET /api/metrics/categories/top`
**Get Top N Categories by Amount**

Returns the highest-spending or highest-income categories.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `operation_type` | enum | `outcome` | `income` or `outcome` |
| `limit` | int | `5` | Max 20, min 1 |
| `start_date` | ISO 8601 | - | Optional filter |
| `end_date` | ISO 8601 | - | Optional filter |
| `business_type` | enum | - | Optional filter (B2B, B2C) |

**Response**:
```json
[
  {
    "category": "suppliers",
    "operation_type": "outcome",
    "total_amount": 42000.50
  },
  {
    "category": "operational",
    "operation_type": "outcome",
    "total_amount": 28500.75
  }
]
```

---

### `GET /api/metrics/comparison`
**Compare Two Periods**

Calculates income, outcome, and profit deltas between two time ranges.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `current_start` | ISO 8601 | Start of current period |
| `current_end` | ISO 8601 | End of current period |
| `previous_start` | ISO 8601 | Start of previous period |
| `previous_end` | ISO 8601 | End of previous period |
| `metric` | enum | `income`, `outcome`, or `profit` |

**Response**:
```json
{
  "current_period": 50000.00,
  "previous_period": 48000.00,
  "delta_abs": 2000.00,
  "delta_pct": 4.17
}
```

---

### `GET /api/metrics/alerts`
**Detect Anomalous Spending Periods**

Flags months where expense (outcome) exceeds historical average by a threshold.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `threshold` | float | `0.3` | Trigger when outcome exceeds baseline * (1 + threshold) |

**Response**:
```json
[
  {
    "period": "Mar 2024",
    "outcome_total": 25000.00,
    "baseline_average": 15000.00,
    "increase_ratio": 0.6667
  }
]
```

**Note**: Returns empty array if no anomalies detected.

---

### `GET /api/metrics/b2b`
**Get B2B Transactions Only**

Shortcut endpoint for filtering to B2B business type.

**Query Parameters**:
Same as `/api/metrics` (start_date, end_date, category, operation_type)

**Response**:
```json
[
  {
    "create_date": "2024-01-10",
    "amount": 8000.00,
    "operation_type": "income",
    "category": "sales",
    "business_type": "B2B"
  }
]
```

---

### `GET /api/metrics/b2c`
**Get B2C Transactions Only**

Shortcut endpoint for filtering to B2C business type.

**Query Parameters**:
Same as `/api/metrics` (start_date, end_date, category, operation_type)

**Response**:
```json
[
  {
    "create_date": "2024-02-05",
    "amount": 3500.00,
    "operation_type": "income",
    "category": "sales",
    "business_type": "B2C"
  }
]
```

---

## Data Models

### FinancialMovement
```typescript
{
  create_date: "2024-01-10",      // ISO 8601 date
  amount: 5000.50,                 // Positive number
  operation_type: "income",        // "income" | "outcome"
  category: "sales",               // "suppliers" | "sales" | "operational" | "administrative" | "others"
  business_type: "B2B"             // "B2B" | "B2C"
}
```

### MetricsSummaryItem
```typescript
{
  period: "Jan 2024",              // Human-readable period (depends on group_by)
  income: 48000.00,                // Total income for period
  outcome: 15000.00,               // Total expense for period
  net: 33000.00                    // income - outcome
}
```

### ProfitMargin
```typescript
{
  profit_margin: 68.3              // Percentage (0-100)
}
```

### MetricsAlert
```typescript
{
  period: "Mar 2024",
  outcome_total: 25000.00,
  baseline_average: 15000.00,
  increase_ratio: 0.6667
}
```

---

## Common Use Cases

### **Dashboard KPIs**
```bash
# Get current metrics for the page
curl "http://localhost:8000/api/metrics" \
  -H "Accept: application/json"

# Get profit margin
curl "http://localhost:8000/api/metrics/profit-margin" \
  -H "Accept: application/json"
```

### **Monthly Summary**
```bash
curl "http://localhost:8000/api/metrics/summary?group_by=month&start_date=2024-01-01&end_date=2024-12-31" \
  -H "Accept: application/json"
```

### **Top Spending Categories**
```bash
curl "http://localhost:8000/api/metrics/categories/top?operation_type=outcome&limit=5" \
  -H "Accept: application/json"
```

### **Anomaly Detection**
```bash
curl "http://localhost:8000/api/metrics/alerts?threshold=0.3" \
  -H "Accept: application/json"
```

### **B2B vs B2C Analysis**
```bash
curl "http://localhost:8000/api/metrics/b2b?operation_type=income" \
  -H "Accept: application/json"

curl "http://localhost:8000/api/metrics/b2c?operation_type=income" \
  -H "Accept: application/json"
```

---

## Error Handling

All endpoints return standard HTTP status codes:

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Valid query returned data |
| 400 | Bad Request | Invalid enum value or query parameter |
| 422 | Validation Error | Date parsing failed, limit out of range |
| 500 | Server Error | Unhandled exception |

**Error Response Format**:
```json
{
  "detail": "String describing the error"
}
```

---

## Frontend Integration

The frontend fetches from these endpoints in `App.tsx`:

```typescript
// Central fetch point
const [movements, profitMargin] = await Promise.all([
  fetchFinancialData("/api/metrics"),
  fetchFinancialData("/api/metrics/profit-margin")
]);
```

Data is then:
1. Computed into KPIs via `computeKPIs(movements)`
2. Aggregated to monthly via `computeMonthlyData(movements)`
3. Passed as props to dashboard components

---

## Mock Data Notes

- **Deterministic**: Generated with `seed=42` for reproducibility
- **Volume**: 144 movements (~12/month for 12 months)
- **Distribution**: ~60% B2B, ~40% B2C
- **Income**: 55% probability (avg $800–$12k)
- **Outcome**: 45% probability, random categories (avg $500–$9k)

---

## Related Documentation

- **Frontend Integration**: `../frontend/src/App.tsx`
- **Backend Routes**: `../backend/app/routes.py`
- **API Documentation (live)**: http://localhost:8000/docs
- **Tech Stack**: `memory-bank/TECH_STACK.md`

