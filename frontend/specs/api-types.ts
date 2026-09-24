/** Values accepted by metrics endpoints for the kind of financial movement. */
export type OperationType = "income" | "outcome"

/** Categories returned by the financial metrics API. */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others"

/** Business lines supported by the comparison endpoints. */
export type BusinessType = "B2B" | "B2C"

/** Time buckets accepted by grouped metrics endpoints. */
export type GroupBy = "day" | "week" | "month"

/** A financial movement returned by `GET /api/metrics`. */
export interface FinancialMovement {
  /** Calendar date of the movement in `YYYY-MM-DD` format. */
  create_date: string
  /** Monetary amount of the movement. */
  amount: number
  /** Whether the movement is income or outcome. */
  operation_type: OperationType
  /** Financial category assigned to the movement. */
  category: Category
  /** Business line assigned to the movement. */
  business_type: BusinessType
}

/** Facets and available date bounds returned by `GET /api/metrics/facets`. */
export interface FacetsResponse {
  /** Operation types available in the dataset. */
  operation_types: OperationType[]
  /** Business lines available in the dataset. */
  business_types: BusinessType[]
  /** Global category catalogue; it is not partitioned by business line. */
  categories: Category[]
  /** Earliest available movement date in `YYYY-MM-DD` format. */
  min_date: string
  /** Latest available movement date in `YYYY-MM-DD` format. */
  max_date: string
}

/** One grouped period returned by `GET /api/metrics/summary`. */
export interface MetricsSummaryItem {
  /** Period label whose format depends on the requested group. */
  period: string
  /** Total income in the period. */
  income: number
  /** Total outcome in the period. */
  outcome: number
  /** Net value for the period, equal to income minus outcome. */
  net: number
}

/** Array response returned by `GET /api/metrics/summary`. */
export type SummaryResponse = MetricsSummaryItem[]

/** One anomaly entry returned by `GET /api/metrics/alerts`. */
export interface AlertEntry {
  /** Grouped period in the response, normally `YYYY-MM` for monthly alerts. */
  period: string
  /** Recorded outcome total for the period. */
  outcome_total: number
  /** Average of previous available periods; not a verified three-period moving average. */
  baseline_average: number
  /** Increase ratio as a decimal; `0.3` represents a 30% increase. */
  increase_ratio: number
}

/** Array response returned by `GET /api/metrics/alerts`. */
export type AlertsResponse = AlertEntry[]

/** One category aggregate returned by `GET /api/metrics/categories/top`. */
export interface CategoryEntry {
  /** Category identifier. */
  category: Category
  /** Operation type used to aggregate the category. */
  operation_type: OperationType
  /** Total amount for the category and requested operation type. */
  total_amount: number
}

/** Array response returned by `GET /api/metrics/categories/top`. */
export type TopCategoriesResponse = CategoryEntry[]
