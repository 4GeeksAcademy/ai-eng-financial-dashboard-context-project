# Product Description

## What is this project?

**Financial Metrics Dashboard** — a web application that displays key financial performance indicators (KPIs) and visualizations for business analytics.

## Target audience

Business analysts, executives, and financial teams who need a quick overview of:
- Total income vs total outcome
- Net profit and profit margin percentage
- Monthly trends over a full year

## Core features

### 1. KPI Cards (4 metrics)
- **Total Income** — cumulative revenue from all income movements
- **Total Outcome** — total expenditure across all categories
- **Profit** — net profit (income minus outcome)
- **Profit Margin** — profit as percentage of income

### 2. Charts (2 visualizations)
- **Income vs Outcome** — monthly line chart showing both trends
- **Profit Margin %** — monthly line chart with reference line at 0%

### 3. Dashboard Header
- Title: "Financial Overview"
- Subtitle: "Executive metrics dashboard"
- Period badge: "2024 — Full Year" (currently hardcoded)

## Data model

### FinancialMovement (core entity)
| Field | Type | Values |
|---|---|---|
| `create_date` | ISO date | `2024-01-05` format |
| `amount` | number | USD amount (800–12,000 for income, 500–9,000 for outcome) |
| `operation_type` | enum | `"income"` \| `"outcome"` |
| `category` | enum | `"sales"` \| `"suppliers"` \| `"operational"` \| `"administrative"` \| `"others"` |
| `business_type` | enum | `"B2B"` \| `"B2C"` |

### KPIMetrics (computed client-side)
| Field | Formula |
|---|---|
| `totalIncome` | `sum(amount where operation_type == "income")` |
| `totalOutcome` | `sum(amount where operation_type == "outcome")` |
| `profit` | `totalIncome - totalOutcome` |
| `profitPercent` | `(profit / totalIncome) * 100` |

### MonthlyDataPoint (computed client-side)
| Field | Description |
|---|---|
| `month` | Formatted label: `"Jan 2024"`, `"Feb 2024"`, etc. |
| `income` | Sum of income for that month |
| `outcome` | Sum of outcome for that month |
| `profitPercent` | `(income - outcome) / income * 100` |

## Business rules

- Income movements are 45–70% of total (random per month)
- B2B movements are ~55% of total
- Income categories: 90% `"sales"`, 10% `"others"`
- Outcome categories: evenly distributed among `"suppliers"`, `"operational"`, `"administrative"`, `"others"`
- Amounts: income $800–$12,000, outcome $500–$9,000

## Current limitations

- Period is hardcoded to "2024 — Full Year" — no date picker
- No filtering UI (filters exist in API but not exposed in dashboard)
- No persistence — data regenerates on each request
- No authentication or user management
- Single-page dashboard — no navigation
