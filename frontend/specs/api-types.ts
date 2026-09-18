import type {
  BusinessType,
  Category,
  OperationType,
} from "@/lib/financial-types"

/** Response from GET /api/metrics/facets. */
export interface FacetsResponse {
  operation_types: OperationType[]
  business_types: BusinessType[]
  categories: Category[]
  min_date: string
  max_date: string
}

/** One anomaly returned by GET /api/metrics/alerts. */
export interface AlertEntry {
  period: string
  outcome_total: number
  baseline_average: number
  increase_ratio: number
}

/** Response from GET /api/metrics/alerts. */
export type AlertResponse = AlertEntry[]

/** One category returned by GET /api/metrics/categories/top. */
export interface CategoryEntry {
  category: Category
  operation_type: OperationType
  total_amount: number
}

/** Response from GET /api/metrics/categories/top. */
export type TopCategoriesResponse = CategoryEntry[]
