/**
 * API response types for the Financial Dashboard.
 *
 * These interfaces reflect the exact shape of the responses returned by the
 * backend endpoints. They are intended as a reference/spec for implementing
 * the frontend components of the three new features.
 *
 * @see backend/app/routes.py for the canonical Pydantic models.
 */

// ──────────────────────────────────────────────
// Shared primitive types (mirroring backend enums)
// ──────────────────────────────────────────────

/** Movement operation type. Valid values: `"income"` | `"outcome"`. */
export type ApiOperationType = "income" | "outcome";

/**
 * Movement category.
 * Valid values: `"suppliers"` | `"sales"` | `"operational"` | `"administrative"` | `"others"`.
 */
export type ApiCategory =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

/** Business line. Valid values: `"B2B"` | `"B2C"`. */
export type ApiBusinessType = "B2B" | "B2C";

// ──────────────────────────────────────────────
// Feature 1 — Facets (date range reference)
// ──────────────────────────────────────────────

/**
 * Response from `GET /api/metrics/facets`.
 *
 * Provides the available enum values in the dataset and, crucially, the
 * earliest and latest movement dates so the UI can display the valid date
 * range for the date-picker filters.
 */
export interface FacetsResponse {
  /** Distinct operation types present in the dataset. */
  operation_types: ApiOperationType[];
  /** Distinct business lines present in the dataset. */
  business_types: ApiBusinessType[];
  /** Distinct categories present in the dataset. */
  categories: ApiCategory[];
  /** Earliest movement date (ISO 8601 date string, YYYY-MM-DD). */
  min_date: string;
  /** Latest movement date (ISO 8601 date string, YYYY-MM-DD). */
  max_date: string;
}

// ──────────────────────────────────────────────
// Feature 2 — Anomaly alerts table
// ──────────────────────────────────────────────

/**
 * A single alert row returned inside the alerts array.
 */
export interface AlertEntry {
  /**
   * Period label. When `group_by=month` (the default) this has the form
   * `"YYYY-MM"`, e.g. `"2024-01"`.
   */
  period: string;
  /** Actual total outcome recorded in this period. */
  outcome_total: number;
  /**
   * Average outcome of the 3 periods immediately before this one (the
   * "moving baseline").
   */
  baseline_average: number;
  /**
   * Ratio of the increase over the baseline:
   * `(outcome_total - baseline_average) / baseline_average`.
   * A value > *threshold* triggers the alert.
   */
  increase_ratio: number;
}

/**
 * Response from `GET /api/metrics/alerts?threshold=<ratio>`.
 *
 * Each entry represents a period whose outcome exceeded the moving baseline
 * by more than the configured threshold.
 */
export type AlertsResponse = AlertEntry[];

// ──────────────────────────────────────────────
// Feature 3 — B2B vs B2C category comparison
// ──────────────────────────────────────────────

/**
 * A single category row returned inside the top-categories array.
 */
export interface CategoryEntry {
  /** The category name, e.g. `"sales"`, `"suppliers"`. */
  category: ApiCategory;
  /** The operation type for which these categories were requested. */
  operation_type: ApiOperationType;
  /** Aggregated amount (sum of all movements in this category). */
  total_amount: number;
}

/**
 * Response from `GET /api/metrics/categories/top?operation_type=income&limit=5`.
 *
 * Ordered by `total_amount` descending. Used in the B2B vs B2C comparison
 * view to show the top‑N income categories per business line.
 */
export type TopCategoriesResponse = CategoryEntry[];