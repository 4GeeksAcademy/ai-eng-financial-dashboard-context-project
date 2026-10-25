import type { BusinessType, Category, OperationType } from '../src/lib/financial-types'

export interface FacetsResponse {
  /**
   * Tipos de movimiento disponibles; valores: income, outcome.
   * @see GET /api/metrics/facets
   */
  operation_types: OperationType[]
  /**
   * Lineas de negocio disponibles; valores: B2B, B2C.
   * @see GET /api/metrics/facets
   */
  business_types: BusinessType[]
  /**
   * Categorias disponibles; valores: suppliers, sales, operational,
   * administrative, others.
   * @see GET /api/metrics/facets
   */
  categories: Category[]
  /**
   * Fecha mas antigua del dataset; fecha valida con formato YYYY-MM-DD.
   * @see GET /api/metrics/facets
   */
  min_date: string
  /**
   * Fecha mas reciente del dataset; fecha valida con formato YYYY-MM-DD.
   * @see GET /api/metrics/facets
   */
  max_date: string
}

export interface AlertEntry {
  /**
   * Periodo de la alerta; string sin formato contractual ni enum.
   * Formato observado: YYYY-MM para la agrupacion mensual.
   * @see GET /api/metrics/alerts
   */
  period: string
  /**
   * Gasto registrado en el periodo; number sin limites declarados.
   * @see GET /api/metrics/alerts
   */
  outcome_total: number
  /**
   * Media de referencia del gasto; number sin limites declarados.
   * El contrato verificado no confirma una ventana de tres periodos.
   * @see GET /api/metrics/alerts
   */
  baseline_average: number
  /**
   * Incremento relativo del gasto; number sin limites declarados.
   * Formato: ratio, no porcentaje (0.45 representa 45%).
   * @see GET /api/metrics/alerts
   */
  increase_ratio: number
}

/** Lista JSON de alertas; puede estar vacia. @see GET /api/metrics/alerts */
export interface AlertsResponse extends Array<AlertEntry> {}

export interface CategoryEntry {
  /**
   * Categoria del agregado; valores: suppliers, sales, operational,
   * administrative, others.
   * @see GET /api/metrics/categories/top
   */
  category: Category
  /**
   * Tipo de movimiento agregado; valores: income, outcome.
   * @see GET /api/metrics/categories/top
   */
  operation_type: OperationType
  /**
   * Importe total de la categoria, no del grupo; number sin limites declarados.
   * @see GET /api/metrics/categories/top
   */
  total_amount: number
}

/** Lista JSON de categorias; puede estar vacia. @see GET /api/metrics/categories/top */
export interface TopCategoriesResponse extends Array<CategoryEntry> {}