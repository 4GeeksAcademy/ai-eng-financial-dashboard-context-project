import type { BusinessType, OperationType } from '../src/lib/financial-types'

export interface DateRangeFilter {
  /**
   * Limite inferior inclusivo, opcional e independiente de end_date.
   * Valores: fechas validas con formato YYYY-MM-DD; omitir si no hay limite.
   * @see GET /api/metrics
   * @see GET /api/metrics/alerts
   * @see GET /api/metrics/categories/top
   */
  start_date?: string
  /**
   * Limite superior inclusivo, opcional e independiente de start_date.
   * Valores: fechas validas con formato YYYY-MM-DD; omitir si no hay limite.
   * @see GET /api/metrics
   * @see GET /api/metrics/alerts
   * @see GET /api/metrics/categories/top
   */
  end_date?: string
}

export interface AlertsParams extends DateRangeFilter {
  /**
   * Umbral de incremento; number en formato ratio (0.3 representa 30%).
   * API verificada: minimo 0, sin maximo; valor por defecto: 0.3.
   * Decision acordada: validar entre 0.01 y 1.0, sin ajuste automatico.
   * @see GET /api/metrics/alerts
   */
  threshold?: number
  /**
   * Agrupacion temporal; valores: day, week, month; por defecto: month.
   * @see GET /api/metrics/alerts
   */
  group_by?: 'day' | 'week' | 'month'
  /**
   * Linea de negocio a filtrar; valores: B2B, B2C o null.
   * Omitir para no aplicar el filtro.
   * @see GET /api/metrics/alerts
   */
  business_type?: BusinessType | null
}

export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Tipo de movimiento a agregar; valores: income, outcome.
   * Valor por defecto de la API: outcome; usar income para la comparativa.
   * @see GET /api/metrics/categories/top
   */
  operation_type?: OperationType
  /**
   * Numero maximo de categorias; entero entre 1 y 20, ambos incluidos.
   * Valor por defecto: 5; no garantiza que existan cinco categorias.
   * @see GET /api/metrics/categories/top
   */
  limit?: number
  /**
   * Linea de negocio a filtrar; valores: B2B, B2C o null.
   * Omitir para no aplicar el filtro.
   * @see GET /api/metrics/categories/top
   */
  business_type?: BusinessType | null
}

/** Filtros de fecha del dashboard principal. @see GET /api/metrics */
export interface MetricsParams extends DateRangeFilter {}