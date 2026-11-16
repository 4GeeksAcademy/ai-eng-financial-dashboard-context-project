/**
 * Query parameter types for the endpoints used by the three PM features.
 *
 * Source of truth: the backend OpenAPI schema (`GET http://localhost:8000/openapi.json`, rendered at `/docs`),
 * checked against live calls on 2026-11-16. Every property is optional in the API; a property that is
 * `undefined` must be left out of the query string (never sent as an empty string).
 *
 * This file is a specification. Nothing in `src/` imports it.
 */

import type { BusinessType, Category, OperationType } from "./api-types";

/**
 * Optional date window shared by every filtered endpoint.
 *
 * - Both bounds are inclusive (verified: `start_date=end_date=2026-01-01` returns that day's rows).
 * - Either bound can be sent alone (an open-ended range).
 * - `start_date` later than `end_date` is NOT an error: the API returns HTTP 200 with an empty list.
 *   The UI must prevent that case itself.
 * - A malformed date returns HTTP 422.
 */
export interface DateRangeFilter {
  /**
   * First day to include.
   * Format: ISO date `YYYY-MM-DD`, for example `"2026-01-01"`. Leave `undefined` for "from the earliest data".
   * Must not be an empty string.
   */
  start_date?: string;

  /**
   * Last day to include.
   * Format: ISO date `YYYY-MM-DD`, for example `"2026-01-31"`. Leave `undefined` for "up to the latest data".
   * Must not be an empty string.
   */
  end_date?: string;
}

/**
 * Query for `GET /api/metrics` (Feature 1).
 */
export interface MetricsParams extends DateRangeFilter {
  /**
   * Keep only this category.
   * Valid values: `"suppliers"` | `"sales"` | `"operational"` | `"administrative"` | `"others"`.
   * Not used by the PM features; listed so the whole endpoint contract is in one place.
   */
  category?: Category;

  /**
   * Keep only this operation type. Valid values: `"income"` | `"outcome"`.
   * Not used by the PM features.
   */
  operation_type?: OperationType;
}

/**
 * Query for `GET /api/metrics/alerts` (Feature 2).
 *
 * The endpoint also accepts `group_by` (`"day"` | `"week"` | `"month"`, default `"month"`) and `business_type`.
 * This spec does not use them: the table always uses the default monthly grouping and all business lines.
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Minimum relative increase for a period to be flagged, as a ratio (`0.3` = 30%).
   * Default when omitted: `0.3`.
   *
   * API constraint: a number `>= 0` with no maximum (a negative or non-numeric value returns HTTP 422).
   * UI constraint (PM): a number from `0.01` to `1.0` inclusive. The UI must enforce this range itself,
   * because the API also accepts `0` and values above `1.0`.
   */
  threshold?: number;
}

/**
 * Query for `GET /api/metrics/categories/top` (Feature 3).
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Which side of the ledger to total. Valid values: `"income"` | `"outcome"`.
   * API default when omitted: `"outcome"` (not `"income"`), so Feature 3 must always send `"income"`.
   */
  operation_type?: OperationType;

  /**
   * Maximum number of categories to return, as an integer from `1` to `20` inclusive (HTTP 422 outside that range).
   * API default when omitted: `5`.
   * Feature 3 sends `20` so the response contains every category and the group total can be computed from it;
   * the UI then shows the first 5 rows.
   */
  limit?: number;

  /**
   * Restrict the totals to one business line. Valid values: `"B2B"` | `"B2C"`.
   * Omitted means both lines combined. Feature 3 always sends it, once per panel.
   */
  business_type?: BusinessType;
}
