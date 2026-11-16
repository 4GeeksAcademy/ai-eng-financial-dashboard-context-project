# Data contract: PM feature requests vs. the backend API

Source: `frontend/src/PM-FEATURES.md` (3 feature requests). Each API claim in them was checked against the
backend's OpenAPI schema (`/openapi.json`, the schema that `/docs` renders) and against live calls.

Legend: ✅ verified in /docs and live · ❌ wrong or incomplete (corrected) · ❓ unverified or needs a decision

**How verified (2026-11-16):** local backend on port 8000, Python 3.14, FastAPI 0.163.1 (the project pins no version),
default mock data (`seed=42`, 360 movements, 2025-11-01..2026-10-28; the window moves with `date.today()`).
`/docs` returned 200; I did not browse the Swagger UI itself. Docker was not used. No frontend code was run or changed.
Rule IDs (ARCH-, EDGE-, ...) point to `.agents/rules/`.

## Shared facts (apply to all features)

| Fact | Status | Evidence |
|---|---|---|
| Dates are ISO `YYYY-MM-DD` (`format: date`) | ✅ | `01/01/2026` and `2026-13-01` both return 422 |
| `start_date` and `end_date` are independent and optional | ✅ | `start_date=2026-06-01` alone returns 150 rows |
| `start_date` after `end_date` returns `200 []`, not an error | ✅ | observed; the UI must handle it |
| A range with no data returns `200 []` | ✅ | 2020 range returns `[]` on `/metrics`, `/summary`, `/categories/top`, `/alerts` |
| Amounts are floats rounded to 2 decimals | ✅ | `routes.py:182-184,205` |
| Frontend calls only `/api/metrics` today, with no query string | ✅ | `App.tsx:16`; no other `fetch` in `frontend/src` |
| The frontend has no router | ✅ | no `router`, `react-router` or `wouter` in `frontend/package.json` |

## Feature 1: date range filter

| # | Claim | Status | Finding / correction |
|---|---|---|---|
| F1-1 | `/api/metrics/facets` gives the available date range | ✅ | `min_date` `2025-11-01`, `max_date` `2026-10-28` (both `string`, required) |
| F1-2 | Facets range is the dataset's full range, whatever the filter | ✅ | facets takes **no parameters**; `?start_date=...` is ignored. That suits a "valid range" hint, but it will not shrink when the user filters |
| F1-3 | `/api/metrics` supports date filters | ✅ | `start_date`, `end_date`; Jan 2026 returned 30 rows, all inside January |
| F1-4 | Both inputs optional; empty means all data | ✅ | omitting both returns 360 rows |
| F1-5 | `end_date` is inclusive | ❓ | the last January row was 2026-01-28, so a boundary-day row was not tested. Confirm in `filter_movements_by_date` before relying on it |
| F1-6 | "Filters all the data currently displayed" | ❓ | KPIs and both charts come from the single `/api/metrics` response, so passing dates there covers them. The header label is hardcoded `"2024 - Full Year"` (`App.tsx:49`, EDGE-2) and would be wrong under a filter |
| F1-7 | Month bucketing is correct under any filter | ❌ | still subject to EDGE-1 (negative-UTC timezones shift months) |
| F1-8 | `build_metrics_facets` is safe with filtered data | ✅ not reachable | facets ignores filters, so the empty-input `IndexError` (EDGE-3) cannot be triggered over HTTP |

## Feature 2: anomaly alerts table

| # | Claim | Status | Finding / correction |
|---|---|---|---|
| F2-1 | `GET /api/metrics/alerts?threshold=<ratio>` exists | ✅ | `threshold` number, default 0.3 |
| F2-2 | Threshold range is 0.01 to 1.0 | ❌ | API accepts `>= 0` with **no maximum**: `0` returns 200 (6 alerts), `2` returns 200 `[]`, `-0.1` and `abc` return 422. The 0.01-1.0 limit must be enforced in the UI |
| F2-3 | Column "period" | ✅ | `period` string, e.g. `2025-12` |
| F2-4 | Column "recorded outcome" | ✅ | `outcome_total` |
| F2-5 | Column "rolling average of the previous 3 periods" | ❌ | `baseline_average` is the mean of **all earlier periods** in the range (`routes.py:224-227`). It matched the all-previous mean on 5 of 5 alerts and differs from a 3-period mean (2026-03: 55334.29 vs 59977.58). Either relabel the column or ask the PM whether the backend should change |
| F2-6 | Column "percentage increase" | ❌ | field is `increase_ratio`, a ratio rounded to 4 decimals (`1.4968` = 149.68%). The UI multiplies by 100 |
| F2-7 | Empty result is distinguishable | ✅ | `threshold=100` returns `200 []`; the UI must render the empty state message |
| F2-8 | Respects the Feature 1 date range | ✅ with a caveat | accepts `start_date`/`end_date`. The baseline is recomputed from in-range periods only (2026-06: 60192.76 with Mar-Aug vs 57416.50 unfiltered) |
| F2-9 | Every period can be flagged | ❌ | the first period in range has no history and is never flagged; a one-period range returns `[]`. Periods with a baseline `<= 0` are skipped |
| F2-10 | Which period granularity | ❓ | PM does not say. `group_by` is `day`, `week` or `month` (default `month`; `week` gave 18 alerts at 0.3, labels like `2025-W46`). Needs a PM decision; month matches the charts |
| F2-11 | Response is chronological | ✅ | observed |

Response shape: `MetricsAlert { period: string, outcome_total: number, baseline_average: number, increase_ratio: number }[]`.

## Feature 3: B2B vs B2C comparison

| # | Claim | Status | Finding / correction |
|---|---|---|---|
| F3-1 | `categories/top` takes `operation_type=income&limit=5` | ✅ | `limit` 1-20 (default 5); `operation_type` default is `outcome` |
| F3-2 | The URL gives top categories per business line | ❌ | the PM URL has no `business_type`, so it returns the combined view. Call it twice with `business_type=B2B` and `business_type=B2C`. Check: B2B 557,903.97 + B2C 574,193.41 = combined 1,132,097.38 for `sales` |
| F3-3 | Response includes "percentage of the group total" | ❌ | response is only `{category, operation_type, total_amount}`. The percentage is derived: `total_amount / group total` |
| F3-4 | Group total is available | ✅ derivable | sum of `categories/top` with `limit=20` equals the sum of `/summary` income for that group: B2B 615,540.72 and B2C 642,606.15. `limit=5` would undercount once more than 5 categories carry income |
| F3-5 | Each table shows 5 rows | ❌ | only **2** categories have income in either group (`sales`, `others`), so `limit=5` returns 2 rows. Tables must handle fewer than 5 rows |
| F3-6 | Available categories come from facets, per group | ❌ | facets returns one **global** list of 5 categories and ignores `business_type`. Three of them (`administrative`, `operational`, `suppliers`) never appear in income. Per-group categories can only come from `categories/top` |
| F3-7 | Date filter applies | ✅ | `start_date`/`end_date` on `categories/top`; Jan 2026 B2B returned `sales` 30,201.35 and `others` 7,968.00; 2020 range returns `[]` |
| F3-8 | An endpoint gives the B2B vs B2C total for the chart | ❓ | none exists. Derive it from the F3-4 sums (two calls) |
| F3-9 | "New page" can be added | ❓ | no router exists (see Shared facts). Navigation approach needs a decision |

Response shape: `TopCategoryItem { category, operation_type, total_amount: number }[]`, sorted by `total_amount` descending.

## Open decisions for the PM
1. F2-5: relabel to "average of previous periods" or change the backend to a 3-period window?
2. F2-10: which granularity should the alerts table use?
3. F3-5/F3-6: confirm the tables may show fewer than 5 rows, and that category names come from `categories/top`.
4. F3-9: how should the new page be reached (router, tabs)?
5. F1-5: confirm whether `end_date` is inclusive (check `filter_movements_by_date`).
