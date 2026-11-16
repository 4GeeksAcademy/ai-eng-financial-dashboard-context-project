# Prompts: components, per feature

Each prompt gives the agent the PM outcome and the verified constraints, and asks it to **propose** the components
and the UI edge cases. It does not dictate component names, props or file layout.

**Rules for every prompt below**
- Read first: `memory-bank/features/data-contract.md`, `memory-bank/features/types-prompts.md` (and the types the
  agent proposed from it), `frontend/src/App.tsx`, and `frontend/src/components/dashboard/`.
- Output a proposal only. Do **not** write or edit React components, hooks or API calls, and do not change the backend.
- Follow `.agents/rules/` (STYLE-3 for where files go; STYLE-1 for quote style per folder).
- Where the PM wording conflicts with the data contract, follow the contract and say so in the proposal.
- Output format: (1) component breakdown, each with its job, its props, and whether it holds state;
  (2) where state lives and how it reaches each consumer; (3) the states each component must render
  (loading, empty, error, populated); (4) UI edge cases, each with the trigger and the expected behavior;
  (5) how each requirement could be checked, by test or by observation; (6) open questions for the PM.

---

## Feature 1: date range filter

**Prompt**

> Add two optional date inputs (start, end) at the top of the home dashboard that filter everything currently
> shown. When both are empty, all data shows. Next to the inputs, show the dataset's earliest and latest dates as
> a reference so the user knows what range is valid.
>
> Propose the components and state ownership. The page today fetches once on mount and computes KPIs and charts
> from the result; decide what has to change in that flow and say who triggers a refetch.
>
> Constraints from the contract: the reference range comes from facets and does not shrink with the filter;
> an inverted or out-of-data range returns an empty list, not an error; the header label is hardcoded
> (`"2024 - Full Year"`) and will mislead under a filter; the error banner currently hides the cause of a failure.
>
> List the UI edge cases (only one date entered, start after end, dates outside the available range,
> rapid changes while a request is in flight, a filter that yields no rows so KPIs and charts have nothing to show,
> browsers that render date inputs differently, the user clearing a date) and give expected behavior for each.

**Done when:** the proposal says where the filter state lives, what each of the KPI row, both charts and the header
receives, and what is shown for an empty result.

---

## Feature 2: anomaly alerts table

**Prompt**

> Below the charts, add a table of periods where spending spiked: period, recorded outcome, a baseline average and
> the percentage increase. A numeric input sets the threshold (0.01 to 1.0, default 0.3). If nothing is flagged, show
> an explicit empty message instead of hiding the table. It follows the Feature 1 date range.
>
> Propose the components (input, table, empty state) and their relation to the Feature 1 filter.
>
> Constraints from the contract: the API accepts values outside 0.01-1.0, so the input must enforce the range;
> the increase arrives as a ratio and must be shown as a percentage; the baseline is the average of all earlier
> periods, not 3, so its column header must not claim "previous 3"; the first period in range is never flagged;
> a one-period range returns nothing.
>
> List the UI edge cases (empty input, value below 0.01 or above 1.0, non-numeric typing, decimals and locale,
> a threshold change on every keystroke causing many requests, an empty result with and without a date filter,
> the table loading while the charts are already shown) and give expected behavior for each, including the
> empty-state wording and whether it should explain why (threshold or date range).

**Done when:** the proposal states the column labels it will use (resolving F2-5), when a request is sent as the
user types, and exactly what the empty state says.

---

## Feature 3: B2B vs B2C comparison

**Prompt**

> Add a new page comparing B2B and B2C revenue. Two sections side by side, each a table of the top 5 income
> categories for that business line: category name, total income, percentage of the group total. Below, one chart
> compares total income of B2B against B2C. The page has its own date range filter.
>
> Propose the components, how the user reaches the page, and whether the date filter is shared with the home
> dashboard or separate.
>
> Constraints from the contract: the frontend has no router, so navigation is a decision to make and raise;
> each section needs its own request with the business line set; the percentage is derived; only 2 categories have
> income today, so tables will show fewer than 5 rows; facets cannot supply per-group categories, so the table rows
> come from the top-categories response; there is no endpoint for the B2B vs B2C totals.
>
> List the UI edge cases (a table with 1-2 rows, no rows in one group, no rows in either group, a zero total,
> percentages shown with rounding that does not add to 100, one section loading while the other has finished,
> one request failing and the other succeeding, narrow screens where side by side does not fit, the chart with
> one group at zero) and give expected behavior for each.

**Done when:** the proposal says how the two requests are coordinated, what the page shows when only one fails,
and how the chart and tables stay consistent with the same date range.
