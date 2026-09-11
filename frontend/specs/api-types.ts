export type OperationType = 'income' | 'outcome'
export type Category = 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'
export type BusinessType = 'B2B' | 'B2C'
export type GroupBy = 'day' | 'week' | 'month'
export type DateString = string
export type PeriodString = string
export type RatioDecimal = number

export interface DateRangeFilter {
  start_date?: DateString
  end_date?: DateString
}

export interface FacetsResponse {
  operation_types: OperationType[]
  business_types: BusinessType[]
  categories: Category[]
  min_date: DateString
  max_date: DateString
}

export interface AlertEntry {
  period: PeriodString
  outcome_total: number
  baseline_average: number
  increase_ratio: RatioDecimal
}

export type AlertResponse = AlertEntry[]

export interface AlertsParams extends DateRangeFilter {
  threshold: RatioDecimal
  group_by?: GroupBy
  business_type?: BusinessType
}

export interface CategoryEntry {
  category: Category
  operation_type: OperationType
  total_amount: number
}

export type TopCategoriesResponse = CategoryEntry[]

export interface TopCategoriesParams extends DateRangeFilter {
  operation_type: OperationType
  limit?: number
  business_type?: BusinessType
}