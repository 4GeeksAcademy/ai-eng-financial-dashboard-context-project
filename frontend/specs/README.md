# Frontend specs: data contract for the three PM features

Specification only. Do not treat anything here as built. Implementation is out of scope for this branch.

| File | What it holds |
|---|---|
| [`api-types.ts`](api-types.ts) | Response interfaces (`FacetsResponse`, `AlertEntry`/`AlertsResponse`, `CategoryEntry`/`TopCategoriesResponse`, `MetricsResponse`) |
| [`param-types.ts`](param-types.ts) | Query types (`DateRangeFilter`, `MetricsParams`, `AlertsParams`, `TopCategoriesParams`) |
| [`view-types.ts`](view-types.ts) | View-models and component props |
| [`components.md`](components.md) | Components, props, layout, conditional rendering, empty states, spec decisions D1-D7 |
| `tsconfig.json` | Strict config so the types compile: `cd frontend && npx tsc --noEmit -p specs/tsconfig.json` |

PM source: `frontend/src/PM-FEATURES.md` (same text as `frontend/src/SDD/CONTEXT.md`).

## How this was verified

Backend started locally, then every claim below was checked against the OpenAPI schema (`GET /openapi.json`, which
the Swagger page at `/docs` renders) and with live calls on 2026-11-16. Backend: FastAPI 0.163.1 on Python 3.14
(the project pins no version), default mock data: 360 movements, `seed=42`, `2025-11-01` to `2026-10-28`.
The Swagger page itself was not opened in a browser. Docker was not used. The dataset window follows
`date.today()` (`backend/app/routes.py:65-68,97`), so dates and totals quoted here shift over time; shapes and rules do not.

Legend: ✅ verified · ❌ the PM wording was wrong (corrected here) · ❓ a decision, not a fact

### Corrections to the PM wording

| # | PM said | Status | Reality | Where it is resolved |
|---|---|---|---|---|
| 1 | Alerts column is a "rolling average of the previous 3 periods" | ❌ | `baseline_average` is the mean of **all earlier periods** in the range (`routes.py:224-227`). On 5 of 5 alerts it equals the all-previous mean; a 3-period mean differs (2026-03: 55,334.29 vs 59,977.58) | Column titled "Average of previous periods" (D1) |
| 2 | Column is a "percentage increase" | ❌ | API field `increase_ratio` is a ratio rounded to 4 decimals (`1.4968` = 149.68%) | Multiply by 100 in the UI |
| 3 | Threshold is a ratio from `0.01` to `1.0` | ❌ for the API | API accepts any number `>= 0`, no maximum: `0` returns 200 (6 alerts), `2` returns 200 `[]`, `-0.1` and `abc` return 422 | UI enforces 0.01-1.0 |
| 4 | `categories/top?operation_type=income&limit=5` gives each business line's top 5 | ❌ | Without `business_type` it returns both lines combined (B2B 557,903.97 + B2C 574,193.41 = 1,132,097.38 for `sales`) | Call once per line with `business_type`; send `limit=20` |
| 5 | The response gives "percentage of the group total" | ❌ | Fields are only `category`, `operation_type`, `total_amount` | Derived: `total_amount / sum of all income categories` |
| 6 | Each table shows 5 categories | ❌ | Only `sales` and `others` have income in either line, so `limit=5` returns **2** rows | Tables show 1-5 rows, never padded |
| 7 | "Available categories for each group must come from the facets endpoint" | ❌ | Facets returns one global list of 5 categories and ignores `business_type`; `administrative`, `operational` and `suppliers` never carry income | Facets gives the business lines and the date range (D5); category names come from `categories/top` |
| 8 | Alerts "respect the date range" | ✅ with a caveat | Accepts `start_date`/`end_date`, but the average is computed only from months inside the range (2026-06: 60,192.76 for Mar-Aug vs 57,416.50 unfiltered) | Documented in `AlertEntry` |
| 9 | Dashboard header and "filters all the data" | ❌ | Header text is hardcoded `"2024 - Full Year"` (`App.tsx:49`) and would be wrong | `DashboardHeader` takes `periodLabel` |
| 10 | Granularity of "periods", reach of the "new page", filter sharing | ❓ | Brief is silent; no router exists (`frontend/package.json`) | D2, D3, D4 in `components.md` |

Also verified: `end_date` is inclusive (`start_date=end_date=2026-01-01` returns that day's 3 rows; the full facets range returns all
360); a `start_date`-only and an `end_date`-only call both work; `start_date` after `end_date` returns `200 []`; a range outside the
data returns `200 []` on every endpoint; `01/01/2026` and `2026-13-01` return 422; `/api/metrics/facets` ignores query parameters.

## Feature 1: date range filter

| | |
|---|---|
| Endpoints | `GET /api/metrics/facets` (no parameters) for the available range; `GET /api/metrics` for the filtered data |
| Request types | `MetricsParams` (extends `DateRangeFilter`); facets has none |
| Response types | `FacetsResponse` (`min_date`, `max_date` as `YYYY-MM-DD`); `MetricsResponse` = `FinancialMovement[]` |
| UI | `DateRangeFilterBar` and `DashboardHeader`; see `components.md` |

Parameters:

| Parameter | Type | Valid values and constraints |
|---|---|---|
| `start_date` | `string`, optional | `YYYY-MM-DD`; inclusive; omit the key when empty (never `""`); other formats return 422 |
| `end_date` | `string`, optional | same; inclusive |
| `category` | `Category`, optional | `suppliers`, `sales`, `operational`, `administrative`, `others`; unused by the PM features |
| `operation_type` | `OperationType`, optional | `income`, `outcome`; unused by the PM features |

Edge cases and what the UI must show:

| Case | Behavior |
|---|---|
| Only one date filled | Valid open-ended range; send only that parameter; show no error |
| Start after end | No request; keep previous data; show "The start date must be on or before the end date." |
| Date outside the dataset window | No request; show "Choose dates between {min_date} and {max_date}." |
| Valid range with no rows | KPI cards show zeros (`computeKPIs([])` returns zeros, no NaN); charts area shows "No data for the selected date range." |
| Facets request fails | Filtering still works; reference text reads "Available range unavailable" |
| Month charts under a filter | Month key must come from the date string, not local-time `Date` getters (known timezone bug EDGE-1 in `.agents/rules/known-edge-cases.md`) |

## Feature 2: anomaly alerts table

| | |
|---|---|
| Endpoint | `GET /api/metrics/alerts` |
| Request type | `AlertsParams` (`threshold` plus `DateRangeFilter`) |
| Response type | `AlertsResponse` = `AlertEntry[]` (`period`, `outcome_total`, `baseline_average`, `increase_ratio`) |
| UI | `AnomalyAlertsSection`, `ThresholdInput`, `AlertsTable` |

Parameters:

| Parameter | Type | Valid values and constraints |
|---|---|---|
| `threshold` | `number`, optional | API: `>= 0`, no maximum, default `0.3`. **UI: 0.01 to 1.0 inclusive**, default `0.3` |
| `start_date`, `end_date` | `string`, optional | as in Feature 1 |
| `group_by` | `"day" \| "week" \| "month"` | not sent; the API default `month` is used (D2) |
| `business_type` | `"B2B" \| "B2C"` | not sent; all lines |

Edge cases and what the UI must show:

| Case | Behavior |
|---|---|
| No period exceeds the threshold (API returns `200 []`) | Keep the table frame; one full-width row: "No spending spikes above {P}% were found. Try a lower threshold." (with a date filter: "... were found in the selected date range. Try a lower threshold or a wider range.") |
| Threshold `0`, `1.5`, negative or not a number | Do not call the API; keep the last applied threshold and its results; show "Enter a ratio between 0.01 and 1.0."; restore the last valid value on blur |
| Range of one month, or the first month of any range | A month with no earlier months is never flagged; a one-month range returns `[]`; the empty-state message applies |
| Request fails | Replace the table with an error message naming the HTTP status; the input stays usable |
| Fast typing | Apply after 400 ms without change, or on blur or Enter |

## Feature 3: B2B vs B2C comparison

| | |
|---|---|
| Endpoints | `GET /api/metrics/categories/top` (two calls, one per business line); `GET /api/metrics/facets` for the business lines and date range |
| Request type | `TopCategoriesParams` |
| Response types | `TopCategoriesResponse` = `CategoryEntry[]` (`category`, `operation_type`, `total_amount`); `FacetsResponse` |
| UI | `ViewNav`, `ComparisonPage`, `BusinessLinePanel`, `CategoryIncomeTable`, `BusinessLineComparisonChart` |

Parameters:

| Parameter | Type | Valid values and constraints |
|---|---|---|
| `operation_type` | `"income" \| "outcome"` | API default is **`outcome`**; always send `"income"` |
| `limit` | integer | 1-20, default 5; **send 20**, show the first 5 rows |
| `business_type` | `"B2B" \| "B2C"` | send once per panel |
| `start_date`, `end_date` | `string`, optional | as in Feature 1 |

Derived values (not in the API): `totalIncome` = sum of `total_amount` over all returned entries (equals the sum of `/api/metrics/summary` income for that line:
B2B 615,540.72, B2C 642,606.15 unfiltered); `percentOfGroup` = `total_amount / totalIncome * 100`.

Edge cases and what the UI must show:

| Case | Behavior |
|---|---|
| Fewer than 5 categories (2 today) | Show only existing rows; do not pad |
| No income for one line in the range (API returns `200 []`) | That panel shows "No income recorded for B2B in the selected date range."; no table; the chart shows that bar at `$0` |
| No income for either line | Chart replaced by "No income recorded for either business line in the selected date range." |
| One request fails | The other panel still renders; the chart shows "Comparison unavailable because one of the requests failed." |
| Rounded percentages not adding to 100.0% | Accepted; no note |
| Facets fails | Panels cannot be listed; show an error for the page and do not guess the business lines |

## Open items for the PM

These are the decisions D1-D5 in `components.md`: relabeling the baseline column (D1), monthly granularity (D2),
view switch instead of a router (D3), shared date filter (D4), category names from `categories/top` (D5).
If the PM wants a true 3-period rolling average, that is a backend change and a change to `AlertEntry.baseline_average`.

## Reading order for a fresh agent session
1. This file (what is true and why). 2. `api-types.ts`, `param-types.ts`. 3. `components.md` and `view-types.ts`.
Do not implement from the PM text alone: eight of its statements are wrong or incomplete and one more needs a caveat (rows 1-9 of the corrections table).
