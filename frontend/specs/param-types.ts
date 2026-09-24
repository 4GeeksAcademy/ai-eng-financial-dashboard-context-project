import type { BusinessType, Category, GroupBy, OperationType } from "./api-types"

/** Optional date query values sent to metrics endpoints as `YYYY-MM-DD`. */
export interface DateRangeFilter {
  /** Optional inclusive lower-bound candidate; omit when empty. */
  start_date?: string
  /** Optional inclusive upper-bound candidate; omit when empty. */
  end_date?: string
}

/** Query parameters for the anomaly alerts endpoint. */
export interface AlertsParams extends DateRangeFilter {
  /** Alert threshold ratio; the current brief requests UI default `0.1`, while the API default is `0.3`. */
  threshold: number
  /** Time bucket for alerts; the dashboard table uses `month`. */
  group_by: GroupBy
  /** Optional business-line filter accepted by the API. */
  business_type?: BusinessType
}

/** Query parameters for the top-category endpoint. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Movement kind to aggregate; the comparison uses `income`. */
  operation_type: OperationType
  /** Number of categories requested; API allows integers from `1` through `20`. */
  limit: number
  /** Business line whose categories are requested. */
  business_type: BusinessType
}

/** Query parameters for grouped summary metrics. */
export interface SummaryParams extends DateRangeFilter {
  /** Time bucket for grouped metrics; comparison totals use `month`. */
  group_by: GroupBy
  /** Optional category filter. */
  category?: Category
  /** Optional movement-kind filter; comparison totals use `income`. */
  operation_type?: OperationType
  /** Optional business-line filter. */
  business_type?: BusinessType
}
