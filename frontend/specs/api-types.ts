/**
 * API response types for the three PM features.
 *
 * Source of truth: the backend OpenAPI schema (`GET http://localhost:8000/openapi.json`, rendered at `/docs`),
 * checked against live responses on 2026-11-16 (mock data, seed 42). Property names are the backend's
 * `snake_case` names, unchanged (rule API-3). Amounts are rounded by the backend to 2 decimals.
 *
 * This file is a specification. Nothing in `src/` imports it.
 */

import type {
  BusinessType,
  Category,
  FinancialMovement,
  OperationType,
} from "../src/lib/financial-types";

export type { BusinessType, Category, FinancialMovement, OperationType };

/**
 * Response of `GET /api/metrics` (Feature 1: the filtered metrics endpoint).
 * Every element is one movement; the list is already filtered by `MetricsParams`
 * and sorted by `create_date` ascending. An empty list (HTTP 200) means no movement matched.
 */
export type MetricsResponse = FinancialMovement[];

/**
 * Response of `GET /api/metrics/facets` (Features 1 and 3).
 *
 * The endpoint takes **no query parameters**. It always describes the full dataset, never a filtered
 * subset, so these values do not change when the user sets a date range.
 */
export interface FacetsResponse {
  /**
   * Operation types present in the dataset, sorted alphabetically.
   * Valid values: `"income"` | `"outcome"`.
   */
  operation_types: OperationType[];

  /**
   * Business lines present in the dataset, sorted alphabetically (`["B2B", "B2C"]` today).
   * Feature 3 renders one panel per entry.
   * Valid values: `"B2B"` | `"B2C"`.
   */
  business_types: BusinessType[];

  /**
   * All categories present in the dataset (any operation type, any business line), sorted alphabetically.
   * This list is global: it is **not** per business line and does **not** say which categories carry income.
   * Valid values: `"suppliers"` | `"sales"` | `"operational"` | `"administrative"` | `"others"`.
   */
  categories: Category[];

  /**
   * Earliest `create_date` in the dataset, inclusive.
   * Format: ISO date `YYYY-MM-DD`. Example: `"2025-11-01"`.
   */
  min_date: string;

  /**
   * Latest `create_date` in the dataset, inclusive.
   * Format: ISO date `YYYY-MM-DD`. Example: `"2026-10-28"`. Always on or after `min_date`.
   */
  max_date: string;
}

/**
 * One flagged period from `GET /api/metrics/alerts` (Feature 2, one table row).
 *
 * A period is flagged when `increase_ratio` is greater than the requested `threshold`.
 */
export interface AlertEntry {
  /**
   * The flagged period. With the default `group_by=month` (the only granularity this spec uses) the format
   * is `YYYY-MM`, for example `"2025-12"`. (Other granularities, not used here: `YYYY-MM-DD` for `day`,
   * `YYYY-Www` such as `"2025-W46"` for `week`.)
   */
  period: string;

  /**
   * Total outcome (spending) recorded in this period, in dollars, rounded to 2 decimals.
   * Always `>= 0`. Example: `103378.98`.
   */
  outcome_total: number;

  /**
   * Average outcome of **all earlier periods inside the requested date range**, in dollars, rounded to 2 decimals.
   * It is NOT a rolling average of the previous 3 periods. Always `> 0` (periods with a zero baseline are skipped).
   * Example: `41404.44`.
   */
  baseline_average: number;

  /**
   * Relative increase of `outcome_total` over `baseline_average`, as a **ratio, not a percentage**:
   * `(outcome_total - baseline_average) / baseline_average`, rounded to 4 decimals.
   * `1.4968` means +149.68%. Always greater than the requested `threshold`, so `> 0`.
   * Multiply by 100 to show a percentage.
   */
  increase_ratio: number;
}

/**
 * Response of `GET /api/metrics/alerts` (Feature 2).
 * Sorted by `period` ascending. An empty list (HTTP 200) means no period exceeded the threshold.
 * The first period inside the date range can never be flagged because it has no earlier periods.
 */
export type AlertsResponse = AlertEntry[];

/**
 * One category total from `GET /api/metrics/categories/top` (Feature 3, one table row before derivation).
 */
export interface CategoryEntry {
  /**
   * Category name.
   * Valid values: `"suppliers"` | `"sales"` | `"operational"` | `"administrative"` | `"others"`.
   */
  category: Category;

  /**
   * The operation type this total was computed for; echoes the request's `operation_type`.
   * Valid values: `"income"` | `"outcome"`.
   */
  operation_type: OperationType;

  /**
   * Sum of `amount` for this category within the request's filters, in dollars, rounded to 2 decimals.
   * Always `> 0`: categories with no matching movements are omitted, not returned as zero.
   * Example: `557903.97`.
   */
  total_amount: number;
}

/**
 * Response of `GET /api/metrics/categories/top` (Feature 3).
 * Sorted by `total_amount` descending and cut to `limit` entries. May hold fewer than `limit` entries:
 * with the mock data only `"sales"` and `"others"` have income, so `limit=5` returns 2 entries.
 * An empty list (HTTP 200) means no movement matched the filters.
 * The response carries **no percentage and no group total**; both are derived by the caller.
 */
export type TopCategoriesResponse = CategoryEntry[];
