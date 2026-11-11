/** Financial operation values accepted by the API. */
export type OperationType = 'income' | 'outcome'

/** Category values accepted by the API. */
export type Category =
  | 'suppliers'
  | 'sales'
  | 'operational'
  | 'administrative'
  | 'others'

/** Customer segment values accepted by the API. */
export type BusinessType = 'B2B' | 'B2C'

/** Time grouping values accepted by summary and alert queries. */
export type GroupBy = 'day' | 'week' | 'month'

/** One financial movement returned by the metrics endpoints. */
export interface FinancialMovement {
  /** Movement calendar date, serialized as YYYY-MM-DD. */
  create_date: string
  /** Movement amount as a JSON number; the API schema defines no additional range. */
  amount: number
  /** Movement direction: income or outcome. */
  operation_type: OperationType
  /** Movement category: suppliers, sales, operational, administrative, or others. */
  category: Category
  /** Customer segment: B2B or B2C. */
  business_type: BusinessType
}

/** Available filter values and date bounds returned by GET /api/metrics/facets. */
export interface FacetsResponse {
  /** Operation types present in the data; values are income or outcome. */
  operation_types: OperationType[]
  /** Business segments present in the data; values are B2B or B2C. */
  business_types: BusinessType[]
  /** Categories present in the data; values use the Category union. */
  categories: Category[]
  /** Earliest movement date, serialized as YYYY-MM-DD. */
  min_date: string
  /** Latest movement date, serialized as YYYY-MM-DD. */
  max_date: string
}

/** Backward-compatible name for the facets endpoint response. */
export type MetricsFacets = FacetsResponse

/** Aggregated income, outcome, and net amount for one summary period. */
export interface MetricsSummaryItem {
  /** Period key: YYYY-MM-DD for day, YYYY-Www for ISO week, or YYYY-MM for month. */
  period: string
  /** Sum of income movements in the period, rounded to two decimal places. */
  income: number
  /** Sum of outcome movements in the period, rounded to two decimal places. */
  outcome: number
  /** Net amount (income minus outcome) in the period, rounded to two decimal places. */
  net: number
}

/** One operation/category total returned by GET /api/metrics/categories/top. */
export interface CategoryEntry {
  /** Category value, one of suppliers, sales, operational, administrative, or others. */
  category: Category
  /** Operation direction used for this total: income or outcome. */
  operation_type: OperationType
  /** Sum for the category and operation, rounded to two decimal places. */
  total_amount: number
}

/** Top-category endpoint response; the API returns a JSON array without an envelope. */
export type TopCategoriesResponse = CategoryEntry[]

/** Backward-compatible name for one top-category row. */
export type TopCategoryItem = CategoryEntry

/** Net-amount comparison between the requested and preceding equal-length periods. */
export interface MetricsComparison {
  /** Net amount for the requested date range, rounded to two decimal places. */
  current_period: number
  /** Net amount for the preceding equal-length date range, rounded to two decimal places. */
  previous_period: number
  /** Difference current_period minus previous_period, rounded to two decimal places. */
  delta_abs: number
  /** Relative change in percent units, or null when previous_period is zero. */
  delta_pct: number | null
}

/** One anomalous outcome period returned by GET /api/metrics/alerts. */
export interface AlertEntry {
  /** Period key: YYYY-MM-DD for day, YYYY-Www for ISO week, or YYYY-MM for month. */
  period: string
  /** Outcome sum for the period, rounded to two decimal places. */
  outcome_total: number
  /** Mean outcome sum of earlier periods in the filtered result, rounded to two decimals. */
  baseline_average: number
  /** Relative increase over baseline as a ratio; for example, 0.3 means 30 percent. */
  increase_ratio: number
}

/** Alerts endpoint response; the API returns a JSON array without an envelope. */
export type AlertsResponse = AlertEntry[]

/** Backward-compatible name for one alert row. */
export type MetricsAlert = AlertEntry

/** One validation issue included in FastAPI's HTTP 422 response. */
export interface ValidationError {
  /** Path to the invalid value, represented by field names and/or array indexes. */
  loc: Array<string | number>
  /** Human-readable explanation of the validation failure. */
  msg: string
  /** Machine-readable validation error identifier. */
  type: string
  /** Submitted value when supplied by the server; its schema may vary by input. */
  input?: unknown
  /** Additional error metadata supplied by the validator. */
  ctx?: Record<string, unknown>
}

/** FastAPI validation response shape for status code 422. */
export interface HTTPValidationError {
  /** Validation issues; omitted when the error response has no detail list. */
  detail?: ValidationError[]
}

/** Health-check response returned by GET /health. */
export interface HealthResponse {
  /** Health status; the current endpoint returns the literal value ok. */
  status: 'ok'
}
