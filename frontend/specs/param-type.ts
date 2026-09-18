import type { OperationType } from "@/lib/financial-types"

type DateDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"

/** ISO calendar date used by the API query parameters (YYYY-MM-DD). */
export type ApiDateString = `${DateDigit}${DateDigit}${DateDigit}${DateDigit}-${DateDigit}${DateDigit}-${DateDigit}${DateDigit}`

/** Optional inclusive date range shared by the API queries. */
export interface DateRangeFilter {
  /** Inclusive lower bound for the movement date, formatted as YYYY-MM-DD. */
  start_date?: ApiDateString

  /** Inclusive upper bound for the movement date, formatted as YYYY-MM-DD. */
  end_date?: ApiDateString
}

/** Query parameters for GET /api/metrics/alerts. */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Decimal increase ratio used to detect an anomaly. The current API accepts
   * values greater than or equal to 0 and defaults to 0.3.
   */
  threshold?: number
}

/** Query parameters for GET /api/metrics/categories/top. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation to rank: "income" or "outcome". Defaults to "outcome". */
  operation_type?: OperationType

  /** Maximum number of categories to return; valid values are integers from 1 to 20. Defaults to 5. */
  limit?: number
}
