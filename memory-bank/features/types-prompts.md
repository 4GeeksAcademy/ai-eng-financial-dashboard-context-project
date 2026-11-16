# Prompts: types, per feature

Each prompt gives the agent the PM outcome and the verified constraints, and asks it to **propose** the types
and the data-level edge cases. It does not dictate names or shapes.

**Rules for every prompt below**
- Read first: `memory-bank/features/data-contract.md` (the source of truth for the API) and
  `frontend/src/lib/financial-types.ts` (current types).
- Output a proposal only. Do **not** write or edit React components, hooks, or API calls, and do not change the backend.
- Follow `.agents/rules/` (API-3 keeps `snake_case` on API types and maps to camelCase only in view-model types).
- Where the PM wording conflicts with the data contract, follow the contract and say so in the proposal.
- Output format: (1) proposed types, each with a one-line purpose; (2) which fields come straight from the API
  and which are derived; (3) edge cases as a list, each with the input that triggers it and the expected behavior;
  (4) open questions for the PM.

---

## Feature 1: date range filter

**Prompt**

> The finance team wants to focus on specific periods. The home dashboard gets an optional start date and an optional
> end date. When both are empty it shows all data. The dataset's earliest and latest dates are shown as a reference
> next to the inputs. Dates go to the API as `YYYY-MM-DD`. The filter applies to everything on the page today.
>
> Propose the types needed to represent: the filter state, the available date range, and the query that is sent to
> the API. Decide where raw API types end and view-model types begin.
>
> Constraints from the contract (F1-1..F1-8): facets takes no parameters and always returns the full range;
> an empty or inverted range returns `200 []`; an invalid date format returns 422; the header label is hardcoded and
> must not stay that way under a filter.
>
> List the data edge cases you find (for example: only one date set, start after end, a range outside the data,
> a range with no rows, the dataset window moving with today's date, timezone month bucketing) and say what
> the types must make impossible or explicit.

**Done when:** the proposal covers all five items in the output format, cites at least three contract IDs, and
every edge case names its input and expected behavior.

---

## Feature 2: anomaly alerts table

**Prompt**

> Below the existing charts, a table highlights periods where spending spiked. Columns: period, recorded outcome,
> a baseline average, and the percentage increase. The user sets the spike threshold with a numeric input
> (ratio 0.01 to 1.0, default 0.3). With no anomalies at the current threshold the table shows an explicit empty
> state. The table respects the Feature 1 date range.
>
> Propose the types for: the alerts API response, the threshold setting and its valid range, a table row as the UI
> shows it, and the table's possible states (loading, rows, empty, error).
>
> Constraints from the contract (F2-1..F2-11): the API accepts a threshold of 0 and has no maximum, so the 0.01-1.0
> limit belongs to the UI; the percentage is returned as a ratio; the baseline is the average of all earlier periods,
> not of the previous 3; the first period in range can never alert; granularity is undecided (month is the default).
>
> List the data edge cases (threshold outside range or not a number, threshold at the limits, empty result,
> single-period range, a change of date range that changes baselines) and say what the types should encode.

**Done when:** the proposal states how the baseline column is labeled given F2-5, how ratio becomes percentage
(and where that conversion lives), and lists the states as a closed set.

---

## Feature 3: B2B vs B2C comparison

**Prompt**

> A new page compares revenue between B2B and B2C. Two sections side by side, each a table of the top 5 income
> categories for that business line: category, total income, and percentage of the group total. Below them one chart
> compares total income of B2B against B2C. The user filters by date range (`YYYY-MM-DD`).
>
> Propose the types for: the top-categories API response, one table row as the UI shows it (including the derived
> percentage), a business-line section, and the comparison chart's data.
>
> Constraints from the contract (F3-1..F3-9): the percentage is not in the API and is derived from a group total;
> the group total comes from summing all income categories (limit 20), not only the top 5; only 2 categories have
> income today, so tables may have fewer than 5 rows; facets returns one global category list and cannot give
> per-group categories; no endpoint returns the B2B vs B2C totals directly.
>
> List the data edge cases (fewer than 5 rows, zero total so the percentage divides by zero, empty range, one group
> empty and the other not, percentages that do not sum to exactly 100 after rounding, a category that appears in only
> one group) and say what the types should encode.

**Done when:** the proposal shows how the group total is carried in the types, names the zero-total case, and says
which fields are derived.
