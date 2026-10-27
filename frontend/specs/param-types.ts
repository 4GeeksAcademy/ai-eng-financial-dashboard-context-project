/**
 * Query parameter types for dashboard API requests. These describe client-side
 * values; dates are passed as ISO calendar-date strings (`YYYY-MM-DD`).
 * Keep aligned with backend/app/routes.py and docs/feature-endpoint-map.md.
 */
import type { OperationType } from "../src/lib/financial-types";

/** Optional, inclusive date bounds shared by date-filtered feature requests. */
export interface DateRangeFilter {
  /**
   * Inclusive lower bound as an ISO calendar date (`YYYY-MM-DD`); omit it for
   * no lower bound. The selected feature rejects ranges where start_date is
   * later than end_date.
   */
  start_date?: string;
  /** Inclusive upper bound as an ISO calendar date (`YYYY-MM-DD`); omit it for no upper bound. */
  end_date?: string;
}

/** Query parameters for GET /api/metrics/alerts. */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Minimum alert increase ratio, from 0.01 through 1.0 inclusive. Omission
   * uses the API default of 0.3; multiply by 100 to express it as a percentage.
   */
  threshold?: number;
}

/** Query parameters for GET /api/metrics/categories/top. */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Movement kind to rank: `income` or `outcome`. Omission uses the API default
   * `outcome`; the comparison feature requests `income`.
   */
  operation_type?: OperationType;
  /**
   * Maximum number of categories returned; an integer from 1 through 20.
   * Omission uses the API default of 5.
   */
  limit?: number;
}
