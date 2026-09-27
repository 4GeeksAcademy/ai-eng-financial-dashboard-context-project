// Draft: verified against /openapi.json (MetricsFacets, MetricsAlert, TopCategoryItem); keep aligned with backend/app/routes.py.
import type { BusinessType, Category, OperationType } from '../src/lib/financial-types'

/** Calendar date in `YYYY-MM-DD` format (OpenAPI `format: date`), e.g. `"2026-03-31"`. */
export type ISODate = `${number}-${number}-${number}`

/** Response of `GET /api/metrics/facets`. Always computed over the full dataset; ignores any filter. */
export interface FacetsResponse {
  /** Operation types present in the data, sorted alphabetically. Values: `"income"`, `"outcome"`. */
  operation_types: OperationType[]
  /** Business lines present in the data, sorted alphabetically. Values: `"B2B"`, `"B2C"`. */
  business_types: BusinessType[]
  /**
   * Every category present in the data (income and outcome mixed), sorted alphabetically.
   * Values: `"administrative"`, `"operational"`, `"others"`, `"sales"`, `"suppliers"`.
   */
  categories: Category[]
  /**
   * Categories per business line, then per operation type, each list sorted alphabetically.
   * Keys only appear when that combination has data, e.g. `categories_by_business_type.B2B?.income`.
   */
  categories_by_business_type: Partial<Record<BusinessType, Partial<Record<OperationType, Category[]>>>>
  /** Earliest movement date in the dataset (`YYYY-MM-DD`). Moves with the current date; never hardcode. */
  min_date: ISODate
  /** Latest movement date in the dataset (`YYYY-MM-DD`). Always `>= min_date`. */
  max_date: ISODate
}

/** One item of `GET /api/metrics/alerts`: a period whose outcome exceeded its baseline by more than `threshold`. */
export interface AlertEntry {
  /**
   * Period key; format depends on the request's `group_by` (default `month`):
   * `month` → `YYYY-MM`, `week` → ISO week `YYYY-Www`, `day` → `YYYY-MM-DD`.
   */
  period: string
  /** Total outcome recorded in the period, rounded to 2 decimals. Always `>= 0`. */
  outcome_total: number
  /** Mean outcome of the 3 immediately preceding periods, rounded to 2 decimals. Always `> 0`. */
  baseline_average: number
  /**
   * `(outcome_total - baseline_average) / baseline_average`, rounded to 4 decimals.
   * A ratio, not a percentage: `0.3` means +30%. Always `>` the requested `threshold`.
   */
  increase_ratio: number
}

/** Response of `GET /api/metrics/alerts`, ordered chronologically by `period`. Empty array when nothing exceeds the threshold. */
export type AlertResponse = AlertEntry[]

/** One item of `GET /api/metrics/categories/top`. */
export interface CategoryEntry {
  /** Category name. Values: `"suppliers"`, `"sales"`, `"operational"`, `"administrative"`, `"others"`. */
  category: Category
  /** Echoes the requested `operation_type`. Values: `"income"`, `"outcome"`. */
  operation_type: OperationType
  /** Sum of movement amounts for the category within the filters, rounded to 2 decimals. Always `> 0`. */
  total_amount: number
}

/** Response of `GET /api/metrics/categories/top`, sorted by `total_amount` descending; length `<= limit`. */
export type TopCategoriesResponse = CategoryEntry[]
