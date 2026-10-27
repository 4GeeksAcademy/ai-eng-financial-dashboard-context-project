# Feature 2 — Home dashboard anomaly alerts

**Status:** Proposed  
**Source:** [Course feature brief](https://learn.4geeks.com/main-cohort/latam-aie-pt-7/syllabus/latam-working-with-ai-coding-agents-v3/project/company-financial-dashboard-specs-project?moduleId=3#below-the-existing-charts-add-a-table-that-highlig)

## Goal

Highlight periods with an unexpectedly high outcome (spending) total in a table below the existing home-dashboard charts.

## User experience and requirements

- Add the anomaly table below the existing charts.
- Include four columns: period, recorded outcome, rolling average of the previous three periods, and percentage increase.
- Provide a numeric threshold control with a default ratio of `0.3`; accepted values are from `0.01` through `1.0`, inclusive.
- Send the threshold as the `threshold` query parameter to the alerts endpoint.
- Respect the active date range from Feature 1 when one is selected.
- If there are no anomalies for the chosen threshold and date range, show an explicit empty-state message.

## API and current implementation

- `GET /api/metrics/alerts?threshold=<ratio>` exists and returns `period`, `outcome_total`, `baseline_average`, and `increase_ratio`. It also accepts `group_by` (`day`, `week`, `month`), optional `start_date` / `end_date`, and optional `business_type` (`B2B`, `B2C`).
- `increase_ratio` is a ratio, not a percentage: for example, `0.3` means a 30% increase. The UI displays `increase_ratio * 100` with a percent sign.
- The endpoint currently accepts thresholds `>= 0` with no upper bound. The feature requires `0.01 <= threshold <= 1.0`; the UI must validate this range and the API must add matching inclusive lower/upper bounds.
- The current detector compares each outcome with the average of **all earlier periods**, not a rolling average of exactly the previous three periods. The calculation must change to use up to the immediately preceding three periods; the behavior for fewer than three historical periods is resolved below.
- The current alerts route accepts optional `start_date` and `end_date`, which can carry the home filter range through to the request.
- Follow the existing frontend request convention: use a relative `/api/metrics/alerts` path prefixed by `VITE_API_BASE_URL ?? ""`, build query strings with `URLSearchParams`, check `response.ok`, and then decode JSON. Vite proxies `/api` to the backend in local development.

## Acceptance criteria

1. The alerts table appears below both existing charts and has the four required columns.
2. The default threshold is `0.3`; users can enter a ratio only in the inclusive range `0.01`–`1.0`.
3. Invalid thresholds are prevented or clearly reported in the UI, and invalid API values receive a validation error.
4. Alert calculation compares each period's outcome with the average of the preceding three periods, excluding the current period. It emits an alert only when the baseline is positive and `increase_ratio > threshold` (strict comparison).
5. The percentage increase shown corresponds to `(recorded outcome - rolling average) / rolling average`, expressed as a percentage.
6. When the date range from Feature 1 is active, the alerts request uses the same selected date bounds.
7. When no anomalies match, a clear empty-state message is displayed while the table section remains visible.
8. Loading and request-failure states are handled explicitly.

## Calculation and date-range behavior

- Use the mean of the **up to three immediately preceding periods**. If one or two prior periods are present, average the available prior periods; if none are present, do not evaluate the current period. A zero baseline cannot produce a meaningful percentage increase and is not an alert.
- When a date range is active, compute alerts only for periods in the selected date range, but allow up to three immediately preceding periods before `start_date` to contribute to the first in-range period's baseline. Apply the end bound to alert periods. The backend may need to fetch/retain this lookback data before restricting returned alerts.
- Keep the strict `increase_ratio > threshold` comparison already used by the current API.
- Display `period` as returned by the API, currency values using the dashboard currency formatter, and increase as a percentage (`increase_ratio * 100`, one decimal place). Empty state: **“No spending anomalies found for this period and threshold.”**
