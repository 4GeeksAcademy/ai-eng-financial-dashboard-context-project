# Frontend Feature Specifications

These documents define the proposed frontend contracts for the three dashboard features. They are planning artifacts; the features are not implied to be implemented merely because a type or component contract exists.

- [Component contracts](./components.md)
- [API response types](./api-types.ts)
- [Query parameter types](./param-types.ts)
- [Shared movement/domain types](../src/lib/financial-types.ts)
- [Feature specs index](../../docs/README.md)
- [Verified endpoint map](../../docs/feature-endpoint-map.md)

The endpoint paths below were verified against `/openapi.json` and representative responses as recorded in the [endpoint map](../../docs/feature-endpoint-map.md). Detailed product behavior is in [Feature 1](../../docs/specs/01-dashboard-date-range-filter.md), [Feature 2](../../docs/specs/02-dashboard-anomaly-alerts.md), and [Feature 3](../../docs/specs/03-b2b-b2c-comparison.md). Dates are optional inclusive calendar dates unless otherwise noted; a supplied value must be a real calendar date formatted `YYYY-MM-DD` (invalid values receive HTTP `422`). Build optional query strings with `URLSearchParams`, omit blank/unspecified parameters, and use the existing `${VITE_API_BASE_URL ?? ""}` base convention. The TypeScript files listed below describe client-side shapes; when an endpoint has no named request interface, use the noted shared type plus the route-specific query values rather than assuming an interface exists.

## Feature 1 — Home dashboard date range filter

### Endpoints

| Endpoint | Purpose | Query parameters |
|---|---|---|
| `GET /api/metrics` | Filtered movement list used to recalculate home KPIs and charts | `start_date`, `end_date` |
| `GET /api/metrics/facets` | Full-dataset date reference | None |

### TypeScript contracts

- Request params: `DateRangeFilter` from [`param-types.ts`](./param-types.ts), used on `/api/metrics`.
- Movement response: `FinancialMovement[]` from [`src/lib/financial-types.ts`](../src/lib/financial-types.ts) (same response shape as the existing `/api/metrics` contract): `create_date`, `amount`, `operation_type`, `category`, and `business_type`.
- Facets response: `FacetsResponse` from [`api-types.ts`](./api-types.ts): `operation_types`, `business_types`, `categories`, `min_date`, and `max_date`.

### Parameter constraints

| Parameter | Type | Valid values / format | Required / default |
|---|---|---|---|
| `start_date` | `string` | ISO calendar date `YYYY-MM-DD`; inclusive lower bound | Optional; omitted means no lower bound |
| `end_date` | `string` | ISO calendar date `YYYY-MM-DD`; inclusive upper bound | Optional; omitted means no upper bound |
| `category` | `Category` | `suppliers`, `sales`, `operational`, `administrative`, `others` | Optional; default `null` (all); this feature omits it |
| `operation_type` | `OperationType` | `income`, `outcome` | Optional; default `null` (both); this feature omits it |

The UI rejects a reversed range (`start_date > end_date`) before fetching; the current API otherwise returns an empty result. Either endpoint date bound can be omitted independently. `/api/metrics` also accepts `category` and `operation_type`, but Feature 1 deliberately omits both so all categories and both movement kinds feed the dashboard. On initial page load, fetch `/api/metrics/facets` without query parameters; its `min_date` and `max_date` describe the unfiltered dataset, are informational, and must not silently clamp selections. There is no dedicated request-parameter interface for `/api/metrics`; `DateRangeFilter` models the two date values used by this feature. The facets request has no request body or query parameters.

### Edge cases and required UI behavior

1. **Both dates blank on initial load or after clearing:** omit both query parameters and show the full available movement dataset. When facets have loaded, show its reference bounds; while loading or after failure, show the corresponding pending/unavailable reference state. Clearing dates is still a draft action until the user selects Apply.
2. **Only one date set:** after Apply, send only that non-empty date parameter and show the inclusive open-ended range. Editing a draft alone must not change the displayed dataset or issue a request.
3. **Reversed range:** show an inline validation message and do not issue the metrics request.
4. **Valid range with no movements:** keep the dashboard layout and show explicit no-data states for KPIs/charts and a data-derived period label; do not treat it as a fetch error.
5. **Facets request unavailable:** keep date filtering usable, but show that the earliest/latest reference could not be loaded rather than inventing dates.

## Feature 2 — Home dashboard anomaly alerts

### Endpoint

| Endpoint | Purpose | Query parameters |
|---|---|---|
| `GET /api/metrics/alerts` | Anomaly rows below the home dashboard charts | `threshold`, `group_by`, `start_date`, `end_date`, `business_type` |

Forward the currently applied Feature 1 date range to alerts. The threshold control defaults to `0.3`; the API parameter is optional because the backend supplies that default, though sending the selected value explicitly is recommended. Changing the threshold edits a draft only; fetch alerts when the user applies it, and also refetch when the applied home date range changes. The date bounds are optional and are omitted when the applied range is open-ended. Grouping and business type have no UI controls in this feature, so omit them and use their API defaults.

### TypeScript contracts

- Request params: `AlertsParams` from [`param-types.ts`](./param-types.ts), which extends `DateRangeFilter` with `threshold`.
- Response: `AlertsResponse` (`AlertEntry[]`) from [`api-types.ts`](./api-types.ts); each `AlertEntry` has `period`, `outcome_total`, `baseline_average`, and `increase_ratio`. The endpoint returns a JSON array, including `[]` when no rows match.

### Parameter constraints

| Parameter | Type | Valid values / format | Required / default |
|---|---|---|---|
| `threshold` | `number` | Finite ratio `0.01`–`1.0`, inclusive; no additional decimal precision limit is specified. Do not pass percentage points (e.g. `30` for 30%). | Optional; default `0.3` |
| `group_by` | string enum | `day`, `week`, `month` | Optional; default `month`; no feature control, omit |
| `start_date` | `string` | ISO calendar date `YYYY-MM-DD`, inclusive | Optional; no lower bound when omitted; use applied home filter |
| `end_date` | `string` | ISO calendar date `YYYY-MM-DD`, inclusive | Optional; no upper bound when omitted; use applied home filter |
| `business_type` | string enum | `B2B`, `B2C` | Optional; default `null` (both); no feature control, omit |

The feature-scoped `AlertsParams` intentionally excludes the endpoint's optional `group_by` and `business_type`, since this UI exposes neither control and uses the endpoint defaults (`month` and `null`/both business types). The interface extends `DateRangeFilter`, so it already carries optional dates. The current backend contract only enforces `threshold >= 0`; Feature 2 requires the implementation to enforce the stated inclusive `0.01`–`1.0` range at both UI and API boundaries. Omit empty dates. Send the applied home date range, not its un-applied draft. `increase_ratio` in each response row is a ratio; display `increase_ratio * 100` with one decimal place.

### Edge cases and required UI behavior

1. **No matching anomalies (`[]`):** keep the alert section/table context visible and show the localized Spanish equivalent of “No spending anomalies found for this period and threshold.” (The English sentence is the canonical feature-brief wording; repository UI guidance requires user-facing copy in Spanish.) A successful empty result replaces any prior rows for the currently applied request.
2. **Threshold outside `0.01`–`1.0`, blank, or not a valid number:** keep the editable input draft as text if needed, show inline validation, and do not issue a request. Convert to a number only after validation. The API must return validation failure for out-of-range numeric values after the feature is implemented.
3. **No prior periods or zero baseline:** backend emits no alert for periods without preceding data or with a zero baseline; the UI renders the returned list normally (which may therefore be empty).
4. **Date range begins mid-history:** the UI still sends only the applied `start_date` / `end_date`; the backend implementation must include up to three immediately preceding aggregation periods in baseline calculation, while returning alert rows only for aggregation periods containing movements inside the applied date bounds. With the omitted/default `group_by=month`, those lookback periods are months. The frontend must not widen the visible alert range or make a second lookback request.
5. **Request loading/failure:** show a loading skeleton while pending; on failure show a friendly error state, distinct from the successful empty state.

The resolved alert calculation is the mean of up to the three immediately preceding periods, excluding the current period. Use strict `increase_ratio > threshold`; do not recompute a different baseline in the component. Alert periods and their labels are returned by the API; the UI does not generate missing periods.

## Feature 3 — B2B vs B2C comparison

### Endpoints consumed by the selected strategy

| Endpoint | Purpose | Query parameters |
|---|---|---|
| `GET /api/metrics/facets` | Shared category vocabulary | None |
| `GET /api/metrics/b2b` | B2B filtered movement list | `start_date`, `end_date`, `category`, `operation_type` |
| `GET /api/metrics/b2c` | B2C filtered movement list | `start_date`, `end_date`, `category`, `operation_type` |

Call both movement endpoints with the same optional date bounds and `operation_type=income`; leave `category` omitted to retrieve all categories. Compute the group's total and category totals from all income movements in its successful response; the denominator is the full group total, not the visible top-five sum. Intersect observed income categories with `FacetsResponse.categories` first, then sort the remaining categories by income descending and select at most five for display. The chart uses the full successful group total, not just those five rows.

`GET /api/metrics/categories/top` is verified but **not consumed by the selected comparison UI strategy**. It returns `TopCategoriesResponse` and accepts the feature-scoped `TopCategoriesParams` plus optional `business_type`; its `total_amount` has no group denominator, so it cannot supply category percentages or group chart totals on its own. `business_type` is not included in `TopCategoriesParams` because the selected UI does not call this endpoint; callers that use it must pass `B2B` or `B2C` (or omit it for both).

### TypeScript contracts

- Request params for B2B/B2C: `DateRangeFilter` plus the `operation_type` query value `"income"`. These paths do not use `TopCategoriesParams`.
- Movement responses: `FinancialMovement[]` from [`src/lib/financial-types.ts`](../src/lib/financial-types.ts), with `create_date`, `amount`, `operation_type`, `category`, and `business_type` per item.
- Category vocabulary response: `FacetsResponse` from [`api-types.ts`](./api-types.ts), shared globally rather than split by group.
- Available-but-not-selected endpoint: `TopCategoriesParams` from [`param-types.ts`](./param-types.ts); response `TopCategoriesResponse` from [`api-types.ts`](./api-types.ts), each item containing `category`, `operation_type`, and `total_amount`.

### Parameter constraints

| Parameter | Type | Valid values / format | Required / default |
|---|---|---|---|
| `start_date` | `string` | Real ISO calendar date `YYYY-MM-DD`, inclusive | Optional; omit for no lower bound |
| `end_date` | `string` | Real ISO calendar date `YYYY-MM-DD`, inclusive | Optional; omit for no upper bound |
| `operation_type` | enum string | `income` or `outcome`; selected comparison sends exactly `income` | Optional in backend; API default `null` (both) |
| `category` | enum string | `suppliers`, `sales`, `operational`, `administrative`, `others`; omit to retrieve all categories | Optional; default `null` |

B2B/B2C group identity is encoded in the path, so there is no `business_type` query parameter on these two routes. The route request has no named exported request interface: use `DateRangeFilter` for dates and append the literal `operation_type=income`. Reject reversed dates in the UI before issuing either request. Apply dates atomically to both groups: both requests use the same applied range and income filter. The `/api/metrics/facets` request is independent and has no parameters.

For clarity, the comparison movement query is conceptually `DateRangeFilter & { operation_type: "income" }`; this is an illustrative local shape, not an exported interface. If both date bounds are blank, send only `operation_type=income`. For example, an applied January 2026 range yields `/api/metrics/b2b?start_date=2026-01-01&end_date=2026-01-31&operation_type=income` and the same query on `/api/metrics/b2c`.

For the available but unused top-category endpoint only (not part of the chosen Feature 3 fetch plan):

| Parameter | Type | Valid values / format | Required / default |
|---|---|---|---|
| `operation_type` | `OperationType` | `income` or `outcome` | Optional; default `outcome` |
| `limit` | `number` | Integer `1`–`20`, inclusive | Optional; default `5` |
| `start_date` | `string` | Optional inclusive real `YYYY-MM-DD` calendar date | Omitted for no lower bound |
| `end_date` | `string` | Optional inclusive real `YYYY-MM-DD` calendar date | Omitted for no upper bound |
| `business_type` | string enum | `B2B` or `B2C`; use one value per call for separate group lists | Optional; default `null` (both); this parameter is not represented by `TopCategoriesParams` |

`TopCategoriesParams` models `operation_type`, `limit`, and date bounds only. To call this otherwise-unused endpoint for a single group, compose it with an additional `business_type: BusinessType` value; this is a conceptual composition, not a currently exported type. Its response is `TopCategoriesResponse` (`CategoryEntry[]`), possibly empty. It has no query parameter for `category`.

### Edge cases and required UI behavior

1. **One group's movements contain no income (successful `200` response with no income rows):** show that group's total as zero and a local empty-category message; keep the other group's table and chart result visible.
2. **Group total is zero:** do not divide by zero; show `—` for category shares and zero in the total-income chart for a successful response. A successful response with zero income is different from a request error, which has no numeric chart value.
3. **One group request fails:** show an error for that group only. Preserve the successful group's table; do not represent the failed group as a zero-valued chart point.
4. **Facets request fails or is pending:** show category vocabulary unavailable/loading explicitly; never replace it with an independent hard-coded list. Group totals and chart values may remain visible, but category rows must wait until the facets response is available so the UI can intersect observed categories with the permitted vocabulary. A failed facets request is distinct from a successful response whose `categories` list is empty.
5. **Date range reversed or yields no data:** reject a reversed range before either group request; for a valid no-data range, show both group-local empty states and a zero chart total for successful responses. A request failure is not a no-data response and must not be rendered as zero.
6. **Fewer than five valid categories:** render only the available categories, sorted by income descending; for equal totals, sort category names ascending for deterministic order. Do not add placeholder/hard-coded categories.

## Shared request and display rules

- Use `${VITE_API_BASE_URL ?? ""}` plus the relative `/api/...` path; check `response.ok` before decoding JSON.
- For non-2xx responses (including query-validation HTTP `422`) or network failures, retain the error for developer diagnostics and show a friendly user-facing error; never render an error response as an empty array or zero total.
- Serialize only non-empty/selected values with `URLSearchParams`; dates remain date-only calendar strings.
- Apply buttons commit draft values. Do not fetch on each keystroke; requests use applied state only. For Feature 1 home dates, Feature 2 threshold, and Feature 3 comparison dates, follow the separate apply behaviors described above. On a new applied request, show loading state and do not leave stale data presented as if it belonged to the new filters; either clear it or explicitly identify it as stale until the request completes.
- Distinguish loading, error, and successful empty data. A zero total is valid data and must not be conflated with a failed request.
- Use Spanish for all user-facing labels, validation, empty-state, loading, and error copy, consistent with the frontend feature guidance. English quoted text above is a canonical meaning where copied from the feature brief, not a requirement to render English UI.
- API response types describe backend payloads; computed category shares and chart points are UI-derived data and must not be added to `FinancialMovement`, `AlertEntry`, or `CategoryEntry`.
