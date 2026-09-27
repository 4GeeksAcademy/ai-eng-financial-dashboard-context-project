export type OperationType = 'income' | 'outcome'
export type Category = 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'
export type BusinessType = 'B2B' | 'B2C'
export type DashboardView = 'overview' | 'comparison'

/** Calendar date in `YYYY-MM-DD` format (OpenAPI `format: date`). */
export type ISODate = `${number}-${number}-${number}`

export interface FinancialMovement {
  create_date: string // ISO date
  amount: number
  operation_type: OperationType
  category: Category
  business_type: BusinessType
}

export interface KPIMetrics {
  totalIncome: number
  totalOutcome: number
  profit: number
  profitPercent: number
}

export interface MonthlyDataPoint {
  month: string
  income: number
  outcome: number
  profitPercent: number
}

/** Inclusive date bounds for metrics endpoints; omit a key instead of sending `""`. */
export interface DateRangeFilter {
  start_date?: ISODate
  end_date?: ISODate
}

/** Mirrors `MetricsFacets` in `backend/app/routes.py`; computed over the full dataset. */
export interface FacetsResponse {
  operation_types: OperationType[]
  business_types: BusinessType[]
  categories: Category[]
  categories_by_business_type: Partial<Record<BusinessType, Partial<Record<OperationType, Category[]>>>>
  min_date: ISODate
  max_date: ISODate
}

/** Mirrors `MetricsAlert`: a month whose outcome exceeded its 3-month rolling average by more than `threshold`. */
export interface AlertEntry {
  /** `YYYY-MM` (monthly grouping). */
  period: string
  outcome_total: number
  baseline_average: number
  /** Ratio, not percentage: `0.3` means +30%. */
  increase_ratio: number
}

export type AlertResponse = AlertEntry[]

/** Query params of `GET /api/metrics/alerts`; `threshold` is a ratio in [0.01, 1.0]. */
export interface AlertParams extends DateRangeFilter {
  threshold?: number
}

export interface TopCategoriesParams extends DateRangeFilter {
  operation_type: OperationType
  limit?: number
  business_type?: BusinessType
}

export interface TopCategoryEntry {
  category: Category
  operation_type: OperationType
  total_amount: number
}

export type TopCategoriesResponse = TopCategoryEntry[]

export interface CategoryShare {
  category: Category
  total_amount: number
  share_pct: number | null
}

export interface BusinessLineSummary {
  business_type: BusinessType
  total_income: number
  rows: CategoryShare[]
}
