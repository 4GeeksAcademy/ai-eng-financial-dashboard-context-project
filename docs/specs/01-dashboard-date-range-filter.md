# Feature 1 — Home dashboard date range filter

**Status:** Proposed  
**Source:** [Course feature brief](https://learn.4geeks.com/main-cohort/latam-aie-pt-7/syllabus/latam-working-with-ai-coding-agents-v3/project/company-financial-dashboard-specs-project?moduleId=3#the-finance-team-wants-to-focus-on-specific-period)

## Goal

Let finance users focus the home dashboard on an optional date interval rather than always viewing all available movements.

## User experience and requirements

- Add start-date and end-date inputs near the top of the home dashboard.
- Either input may be left blank. With both blank, show all available data.
- Send selected dates to the API as `YYYY-MM-DD` query values.
- Filter all existing home-dashboard data by the selected interval: KPI totals, income/outcome chart, profit-margin chart, and displayed period label.
- Show the dataset's earliest and latest available dates near the inputs as a reference.
- Date filtering is inclusive at both ends, consistent with the existing API filter helper.

## API and current implementation

- `GET /api/metrics` already accepts optional `start_date` and `end_date` query parameters and applies inclusive filtering.
- `GET /api/metrics/facets` returns `min_date` and `max_date`, suitable for the date reference.
- The current frontend only fetches `/api/metrics` without filters and computes dashboard values client-side.
- Follow the existing frontend request convention: prefix relative `/api/...` paths with `VITE_API_BASE_URL ?? ""`, check `response.ok`, and then decode JSON. Vite proxies `/api` to the backend in local development. Build optional query strings with `URLSearchParams` and omit blank dates.
- Date-only values must be treated as calendar dates. Do not group them by parsing with `new Date("YYYY-MM-DD")` and reading local date components.

## Acceptance criteria

1. Both date fields are visible on the home dashboard and can be set independently.
2. Submitting a valid start date, end date, or both requests `/api/metrics` with only the selected non-empty date parameters in `YYYY-MM-DD` format.
3. When both fields are empty, the dashboard shows the full available dataset without date query parameters.
4. KPIs and both charts reflect only the filtered movements; the period label describes the filtered data.
5. Earliest and latest available dates are displayed from facets data, not hard-coded.
6. The selected interval includes movements on its start and end dates.
7. Reject a reversed interval (`start_date > end_date`) in the UI before sending a request, and show an inline validation message. The current API does not reject this interval; it returns an empty result after filtering.
8. Loading, fetch failure, and no-results states remain understandable and consistent with the existing dashboard.

## Interaction behavior

- Date values are drafts until the user activates **Apply**. The applied range is sent consistently to the metrics and alerts requests; clearing both values and applying removes both query parameters.
- The date reference always comes from the unfiltered `GET /api/metrics/facets` response. It is informational; it does not silently clamp user selections. The current endpoint reports bounds for the full generated dataset.
