# Feature 3 — B2B vs B2C comparison view

**Status:** Proposed  
**Source:** [Course feature brief](https://learn.4geeks.com/main-cohort/latam-aie-pt-7/syllabus/latam-working-with-ai-coding-agents-v3/project/company-financial-dashboard-specs-project?moduleId=3#create-a-new-page-in-the-dashboard-for-comparing-r)

## Goal

Add a dashboard page for comparing income performance between the B2B and B2C business lines.

## User experience and requirements

- Create a separate page/view reachable through a visible in-app navigation control between Home and B2B vs B2C comparison.
- Show B2B and B2C sections side by side.
- Each section contains a table of the top five income categories for that business line, with category name, total income, and percentage of that business line's total income.
- Show one chart below the two sections comparing total B2B income with total B2C income.
- Provide optional start and end date filters in `YYYY-MM-DD` format.
- Obtain category choices from the facets endpoint rather than maintaining a separate hard-coded category list.

## API and current implementation

- `GET /api/metrics/categories/top` is an available endpoint that supports `operation_type=income`, `limit=5`, optional date bounds, and optional `business_type` (`B2B` or `B2C`). Its response item fields are `category`, `operation_type`, and `total_amount`; the selected implementation strategy below does not use it because it does not supply group totals or percentages.
- The endpoint returns `total_amount` for each category; it does **not** return `total_income` or a category percentage. Do not treat `total_amount` as the group denominator. Feature requirement: category share is `category total_amount / all income for that business type in the selected date range * 100`.
- `GET /api/metrics/facets` returns the globally available categories under `categories`, not categories separately by business type. Use this endpoint as the category vocabulary, then intersect it with categories observed in each group's matching income data so a group does not show categories with no income in the selected range.
- Existing `GET /api/metrics/b2b` and `GET /api/metrics/b2c` endpoints return filtered `FinancialMovement[]` (fields: `create_date`, `amount`, `operation_type`, `category`, `business_type`) and accept optional dates, category, and operation type. Their responses can provide per-group totals, category availability, and chart totals via client aggregation, but are not pre-aggregated.
- Follow the existing frontend request convention: use relative `/api/...` paths prefixed by `VITE_API_BASE_URL ?? ""`, build query strings with `URLSearchParams`, check `response.ok`, and decode JSON. Vite proxies `/api` to the backend in local development.
- No navigation or multi-page routing is currently present in the frontend; `App.tsx` renders the single home dashboard. Feature behavior is to add an in-app view switch, as specified below.

## Acceptance criteria

1. A distinct comparison page/view can be reached from the dashboard UI.
2. B2B and B2C sections are presented side by side at wide viewport sizes and remain usable on narrow screens.
3. Each group table contains at most five income categories, ordered by income total descending, with category, total amount, and percent of that group's total income.
4. The view displays a chart comparing total income for B2B and B2C over the selected date range.
5. Changing either date filter and applying updates both tables and the chart using the same selected range; blank fields mean all available data. Date values are sent as `YYYY-MM-DD` and bounds are inclusive.
6. Each table lists only categories present in the facets response that also have income movements for its own business type and selected date range. The UI does not introduce an independent hard-coded category list.
7. Loading, error, empty-group, and no-category states are explicit and do not break the other group section.
8. Monetary and percentage values use consistent formatting with the home dashboard.

## Data and navigation behavior

- Use the two business-type-filtered movement endpoints as the authoritative source for group totals, category totals, and chart totals: aggregate only movements with `operation_type === "income"`; group income by category; sort descending; show up to five categories.
- Use `/api/metrics/facets` as the category vocabulary; intersect `facets.categories` with categories having income movements for each group/date range. The top-category endpoint remains available but is not required by this implementation strategy because it does not include group totals or category percentages.
- Use an in-app page state for the initial comparison view; no new routing dependency is required. Provide a visible navigation control to switch between Home and B2B vs B2C comparison.
- If a group's total income is zero, show an em dash (`—`) for category percentages and a zero total in the chart. If a group has no income categories, show a local empty-state message for that section without hiding the other group.
