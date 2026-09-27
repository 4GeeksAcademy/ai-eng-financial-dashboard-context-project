// Draft: verified against /openapi.json query parameters; keep aligned with backend/app/routes.py.
import type { BusinessType, OperationType } from '../src/lib/financial-types'
import type { ISODate } from './api-types'

/** Optional inclusive date bounds shared by the metrics endpoints. Omit a key when its input is empty; never send `""`. */
export interface DateRangeFilter {
  /** Inclusive lower bound (`YYYY-MM-DD`). Omitted → no lower bound. Invalid dates return 422. */
  start_date?: ISODate
  /** Inclusive upper bound (`YYYY-MM-DD`). Omitted → no upper bound. Must be `>= start_date` or the result is empty (not validated by the API). */
  end_date?: ISODate
}

/** Query parameters of `GET /api/metrics/alerts`. */
export interface AlertParams extends DateRangeFilter {
  /**
   * Minimum `increase_ratio` (exclusive) to flag a period, as a ratio: `0.3` means +30%.
   * Range `[0.01, 1.0]`; outside it the API returns 422. Omitted → `0.3`.
   */
  threshold?: number
}

/** Query parameters of `GET /api/metrics/categories/top`. */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Which movements to rank. Values: `"income"`, `"outcome"`.
   * Optional in the API (defaults to `"outcome"`) but required here so Feature 3 always sends `"income"`.
   */
  operation_type: OperationType
  /** Maximum number of categories returned. Integer in `[1, 20]`; outside it the API returns 422. Omitted → `5`. */
  limit?: number
  /** Restricts to one business line. Values: `"B2B"`, `"B2C"`. Omitted → both lines combined. */
  business_type?: BusinessType
}
