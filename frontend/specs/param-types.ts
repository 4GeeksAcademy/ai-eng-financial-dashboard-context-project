/**
 * Query‑parameter types for the Financial Dashboard API.
 *
 * These interfaces describe the shape of the query string values sent to the
 * backend endpoints. Every field that is optional in the backend is reflected
 * as optional here, and the types match the Pydantic `Query(...)` definitions
 * in `backend/app/routes.py`.
 */

import type {
  ApiOperationType,
  ApiBusinessType,
} from "./api-types";

// ──────────────────────────────────────────────
// Shared — Date range filter
// ──────────────────────────────────────────────

/**
 * Optional date range used by several endpoints.
 *
 * Both fields are ISO‑8601 date strings (`YYYY-MM-DD`). When omitted (undefined)
 * the backend returns data for the whole available period.
 *
 * @see `GET /api/metrics`
 * @see `GET /api/metrics/summary`
 * @see `GET /api/metrics/categories/top`
 * @see `GET /api/metrics/alerts`
 */
export interface DateRangeFilter {
  /** Inclusive start date. Format: `YYYY-MM-DD`. */
  start_date?: string;
  /** Inclusive end date. Format: `YYYY-MM-DD`. */
  end_date?: string;
}

// ──────────────────────────────────────────────
// Feature 2 — Alerts query parameters
// ──────────────────────────────────────────────

/**
 * Parameters for `GET /api/metrics/alerts`.
 *
 * - `threshold`: ratio between `0.01` and `1.0` (default `0.3`). Only periods
 *   whose outcome increase exceeds this ratio are returned.
 * - `group_by`: aggregation granularity (`"day"`, `"week"`, `"month"`).
*   `start_date` / `end_date`: optional date range (Feature 1 integration).
 * - `business_type`: optional business‑line filter (`"B2B"` / `"B2C"`).
 */
export interface AlertsParams extends DateRangeFilter {
  /** Alert threshold ratio (0.01 – 1.0, default 0.3). */
  threshold?: number;
  /** Aggregation granularity. Defaults to `"month"` on the backend. */
  group_by?: "day" | "week" | "month";
  /** Optional business‑line filter. */
  business_type?: ApiBusinessType;
}

// ──────────────────────────────────────────────
// Feature 3 — Top categories query parameters
// ──────────────────────────────────────────────

/**
 * Parameters for `GET /api/metrics/categories/top`.
 *
 * - `operation_type`: which type to aggregate (`"income"` or `"outcome"`).
 * - `limit`: max number of categories to return (1‑20, default 5).
 * - `start_date` / `end_date`: optional date range.
 * - `business_type`: optional business‑line filter — this is how the B2B vs
 *   B2C comparison view fetches the top income categories per line.
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation type to aggregate. Defaults to `"outcome"` on the backend. */
  operation_type?: ApiOperationType;
  /** Maximum number of categories. Between 1 and 20, default 5. */
  limit?: number;
  /** Optional business‑line filter. */
  business_type?: ApiBusinessType;
}