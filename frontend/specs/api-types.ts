export type OperationType = 'income' | 'outcome'
export type Category =
  | 'suppliers'
  | 'sales'
  | 'operational'
  | 'administrative'
  | 'others'
export type BusinessType = 'B2B' | 'B2C'

export interface FinancialMovement {
  /** Fecha contable del movimiento en formato `YYYY-MM-DD`. */
  create_date: string
  /** Importe del movimiento; `/docs` no publica límites mínimo o máximo. */
  amount: number
  /** Naturaleza del movimiento. Valores válidos: `income` y `outcome`. */
  operation_type: OperationType
  /** Categoría financiera. Valores válidos: `suppliers`, `sales`, `operational`, `administrative` y `others`. */
  category: Category
  /** Línea de negocio. Valores válidos: `B2B` y `B2C`. */
  business_type: BusinessType
}

export interface MetricsFacets {
  /** Tipos de operación disponibles. Cada valor es `income` o `outcome`. */
  operation_types: OperationType[]
  /** Líneas de negocio disponibles. Cada valor es `B2B` o `B2C`. */
  business_types: BusinessType[]
  /** Categorías disponibles según el catálogo publicado por la API. */
  categories: Category[]
  /** Fecha más antigua disponible en el dataset, en formato `YYYY-MM-DD`. */
  min_date: string
  /** Fecha más reciente disponible en el dataset, en formato `YYYY-MM-DD`. */
  max_date: string
}

export type FacetsResponse = MetricsFacets

export interface MetricsAlert {
  /** Identificador del período agrupado; `/docs` no restringe su formato. */
  period: string
  /** Gasto total registrado durante el período. */
  outcome_total: number
  /** Media de referencia usada por la alerta; `/docs` no define su fórmula. */
  baseline_average: number
  /** Incremento respecto a la media expresado como ratio, no como porcentaje formateado. */
  increase_ratio: number
}

export type AlertEntry = MetricsAlert

export interface TopCategoryItem {
  /** Categoría financiera. Valores válidos: `suppliers`, `sales`, `operational`, `administrative` y `others`. */
  category: Category
  /** Tipo de operación agregado. Valores válidos: `income` y `outcome`. */
  operation_type: OperationType
  /** Importe total acumulado para la categoría y el tipo de operación. */
  total_amount: number
}

export type CategoryEntry = TopCategoryItem

export interface MetricsSummaryItem {
  /** Identificador del período agrupado; `/docs` no restringe su formato. */
  period: string
  /** Total de ingresos del período. */
  income: number
  /** Total de gastos del período. */
  outcome: number
  /** Balance neto del período: ingresos menos gastos. */
  net: number
}

export interface ValidationError {
  /** Ruta del valor inválido, formada por nombres de campo y, cuando aplique, índices numéricos. */
  loc: Array<string | number>
  /** Mensaje legible que describe el error de validación. */
  msg: string
  /** Identificador textual del tipo de error de validación. */
  type: string
  /** Valor recibido por la API; su forma no está restringida en `/docs`. */
  input?: unknown
  /** Metadatos opcionales del error indexados por nombre; sus claves no están definidas en `/docs`. */
  ctx?: Record<string, unknown>
}

export interface HTTPValidationError {
  /** Errores de validación asociados a la respuesta HTTP `422`. */
  detail?: ValidationError[]
}

export type MetricsResponse = FinancialMovement[]
export type AlertResponse = AlertEntry[]
export type MetricsAlertsResponse = AlertResponse
export type TopCategoriesResponse = CategoryEntry[]
export type MetricsSummaryResponse = MetricsSummaryItem[]
