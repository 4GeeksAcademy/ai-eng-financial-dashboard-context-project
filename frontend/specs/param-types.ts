/**
 * Query Parameter Type Specifications
 *
 * This module defines TypeScript interfaces for query parameters sent to Financial Metrics API endpoints.
 * All parameters are verified against the OpenAPI schema (http://localhost:8000/openapi.json)
 * and cross-referenced with backend validation constraints.
 */

import type { OperationType, BusinessType } from '../src/lib/financial-types';

/**
 * Date Range Filter - Shared date parameters for filtering results
 *
 * Used by multiple endpoints to narrow results to a specific date range.
 * Both parameters are optional; if only one is provided, it's used as an open-ended filter.
 */
export interface DateRangeFilter {
  /**
   * Start date for filtering results (inclusive).
   * Format: YYYY-MM-DD (ISO 8601 date string)
   * Optional; if omitted, no lower bound is applied.
   * Example: '2024-01-01'
   */
  start_date?: string;

  /**
   * End date for filtering results (inclusive).
   * Format: YYYY-MM-DD (ISO 8601 date string)
   * Optional; if omitted, no upper bound is applied.
   * Example: '2024-12-31'
   */
  end_date?: string;
}

/**
 * Alerts Parameters - Query parameters for anomaly detection endpoint
 *
 * Used by: GET /api/metrics/alerts
 *
 * Extends DateRangeFilter to inherit start_date and end_date.
 * Returns periods where spending exceeded baseline by the specified threshold.
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Minimum increase ratio threshold to trigger an alert.
   * Type: number
   * Default: 0.3 (30% increase above baseline)
   * Valid range: >= 0 (enforced by backend)
   * Interpretation:
   *   - 0.3 means flag periods where spending is 30% higher than baseline
   *   - 0.5 means flag periods with 50% increase
   *   - 1.0 means flag periods that double the baseline
   * Example: 0.5
   */
  threshold?: number;

  /**
   * Time period granularity for grouping anomalies.
   * Type: 'day' | 'week' | 'month'
   * Default: 'month'
   * Affects the format of period field in results:
   *   - 'day': YYYY-MM-DD (each day is a separate period)
   *   - 'week': YYYY-Www (ISO week format, e.g., 2024-W01)
   *   - 'month': YYYY-MM (each month is a separate period)
   * Example: 'month'
   */
  group_by?: 'day' | 'week' | 'month';

  /**
   * Filter alerts by business type (B2B or B2C customers).
   * Type: 'B2B' | 'B2C' | null | undefined
   * Default: undefined (no filter, includes both types)
   * When provided, only anomalies from the specified business type are returned.
   * Example: 'B2B'
   */
  business_type?: BusinessType | null;
}

/**
 * Top Categories Parameters - Query parameters for top categories endpoint
 *
 * Used by: GET /api/metrics/categories/top
 *
 * Extends DateRangeFilter to inherit start_date and end_date.
 * Returns the highest-value categories filtered by operation type and optional date range.
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Type of operation to filter by.
   * Type: 'income' | 'outcome'
   * Default: 'outcome'
   * Determines which transactions are included in category totals.
   * Example: 'income'
   */
  operation_type?: OperationType;

  /**
   * Maximum number of top categories to return.
   * Type: integer
   * Default: 5
   * Valid range: 1-20 (enforced by backend)
   * Useful for limiting results to N highest-value categories.
   * Example: 10
   */
  limit?: number;

  /**
   * Filter categories by business type (B2B or B2C customers).
   * Type: 'B2B' | 'B2C' | null | undefined
   * Default: undefined (no filter, includes both types)
   * When provided, only categories from the specified business type are returned.
   * Example: 'B2C'
   */
  business_type?: BusinessType | null;
}

/**
 * Combined API request parameters
 *
 * Union type for endpoints that support query parameters.
 * Useful when building a generic API client that handles multiple endpoints.
 */
export type APIParams = DateRangeFilter | AlertsParams | TopCategoriesParams;
