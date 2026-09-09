export type OperationType = 'income' | 'outcome'
export type Category = 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'
export type BusinessType = 'B2B' | 'B2C'

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

// GET /api/metrics/categories/top response item — backend/app/routes.py:45-48,200-208
export interface TopCategoryItem {
  category: Category
  operation_type: OperationType
  total_amount: number
}

// Query params for GET /api/metrics/categories/top. `operation_type` is optional in
// the API (default 'outcome') but required here so a caller always sends it explicitly.
export interface TopCategoriesQuery {
  operation_type: OperationType
  limit?: number // API: integer 1..20, default 5; client sends 20 to get every category
  start_date?: string // ISO YYYY-MM-DD; omit when unset, never send null
  end_date?: string
  business_type?: BusinessType
}

// Derived in the client from TopCategoryItem[]; not returned by any endpoint.
export interface CategoryShare {
  category: Category
  total_amount: number
  percent: number // 0..100; 0 when the group total is 0
}
