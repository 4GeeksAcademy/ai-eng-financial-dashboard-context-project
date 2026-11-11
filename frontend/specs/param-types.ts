import type { BusinessType, Category, GroupBy, OperationType } from './api-types'

/** Optional inclusive date bounds accepted by metrics query endpoints. */
export interface DateRangeFilter {
  /** Include movements on or after this calendar date; format YYYY-MM-DD. */
  start_date?: string
  /** Include movements on or before this calendar date; format YYYY-MM-DD. */
  end_date?: string
}

type MovementFilters = DateRangeFilter & {
  /** Keep only one of suppliers, sales, operational, administrative, or others. */
  category?: Category
  /** Keep only income or outcome movements. */
  operation_type?: OperationType
}

/** Query parameters for GET /api/metrics. */
export type MetricsParams = MovementFilters

/** Query parameters for GET /api/metrics/b2b and GET /api/metrics/b2c. */
export type BusinessMetricsParams = MovementFilters

/** Query parameters for GET /api/metrics/summary. */
export type MetricsSummaryParams = DateRangeFilter & {
  /** Aggregate by day, ISO week, or month; defaults to month. */
  group_by?: GroupBy
  /** Keep only one of suppliers, sales, operational, administrative, or others. */
  category?: Category
  /** Keep only income or outcome movements. */
  operation_type?: OperationType
  /** Keep only B2B or B2C movements. */
  business_type?: BusinessType
}

/** Query parameters for GET /api/metrics/categories/top. */
export type TopCategoriesParams = DateRangeFilter & {
  /** Rank income or outcome categories; defaults to outcome. */
  operation_type?: OperationType
  /** Number of rows to return; integer from 1 to 20, defaults to 5. */
  limit?: number
  /** Keep only B2B or B2C movements. */
  business_type?: BusinessType
}

/** Query parameters for GET /api/metrics/comparison. */
export interface MetricsComparisonParams {
  /** First included calendar date; required, format YYYY-MM-DD. */
  start_date: string
  /** Last included calendar date; required, format YYYY-MM-DD. */
  end_date: string
  /** Compare only B2B or B2C movements when supplied. */
  business_type?: BusinessType
}

/** Query parameters for GET /api/metrics/alerts. */
export type AlertParams = DateRangeFilter & {
  /** Alert when outcome increase ratio is greater than this value; number >= 0, defaults to 0.3. */
  threshold?: number
  /** Aggregate by day, ISO week, or month; defaults to month. */
  group_by?: GroupBy
  /** Keep only B2B or B2C movements. */
  business_type?: BusinessType
}

/** Backward-compatible name for alert query parameters. */
export type MetricsAlertsParams = AlertParams

/** GET /api/metrics/facets accepts no query parameters. */
export type MetricsFacetsParams = Record<string, never>

/** GET /health accepts no query parameters. */
export type HealthParams = Record<string, never>
