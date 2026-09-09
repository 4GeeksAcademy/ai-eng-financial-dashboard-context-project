/**
 * TIPOS DE RESPUESTA DE LA API
 *
 * Espejo 1:1 del contrato OpenAPI de FastAPI servido en GET /openapi.json
 * (Swagger UI: http://localhost:8000/docs). Origen backend: backend/app/routes.py.
 *
 * Reglas de este archivo:
 * - Nombres de campo, miembros de enum y obligatoriedad coinciden EXACTAMENTE con el contrato.
 * - NO añadir campos que el backend no devuelve. Los shapes derivados / calculados viven en
 *   view-types.ts, nunca aquí.
 * - El `format: date` de OpenAPI se modela como `string` (ISO `YYYY-MM-DD`), igual que la
 *   convención existente en frontend/src/lib/financial-types.ts.
 *
 * Verificado contra el contrato en vivo el 2026-09-06. Ver ./README.md y ./endpoints.md
 * para el rastro de evidencia y las notas de verificación previas.
 */

// ─────────────────────────────────────────────────────────────────────────────────
// Enums compartidos
// Origen: miembros de enum en /docs → Schemas (FinancialMovement, TopCategoryItem, …)
//         y backend/app/routes.py:11-15
// OperationType / Category / BusinessType son idénticos a
// frontend/src/lib/financial-types.ts:1-3 (se redeclaran aquí para que la carpeta de specs
// sea autocontenida; reconciliar en la implementación).
// ─────────────────────────────────────────────────────────────────────────────────

export type OperationType = 'income' | 'outcome'

export type Category =
  | 'suppliers'
  | 'sales'
  | 'operational'
  | 'administrative'
  | 'others'

export type BusinessType = 'B2B' | 'B2C'

/**
 * Bucket de agregación para /api/metrics/summary y /api/metrics/alerts.
 * Default de la API: 'month'. No existe en financial-types.ts.
 * Origen: /docs → GET /api/metrics/summary → Parameters → group_by; routes.py:15
 */
export type GroupBy = 'day' | 'week' | 'month'

// ─────────────────────────────────────────────────────────────────────────────────
// FinancialMovement
// /docs → Schemas → FinancialMovement
// Cuerpo de respuesta de: GET /api/metrics, GET /api/metrics/b2b, GET /api/metrics/b2c
// (cada uno devuelve FinancialMovement[], ordenado por create_date ascendente — routes.py:259)
// ─────────────────────────────────────────────────────────────────────────────────

export interface FinancialMovement {
  /** ISO `YYYY-MM-DD`. OpenAPI `string`, `format: date`. Único campo de fecha de este schema. */
  create_date: string
  amount: number
  operation_type: OperationType
  category: Category
  business_type: BusinessType
}

// ─────────────────────────────────────────────────────────────────────────────────
// MetricsFacets
// /docs → Schemas → MetricsFacets
// Cuerpo de respuesta de: GET /api/metrics/facets (el endpoint NO admite query params)
// ─────────────────────────────────────────────────────────────────────────────────

export interface MetricsFacets {
  operation_types: OperationType[]
  business_types: BusinessType[]
  /**
   * Lista GLOBAL de categorías presentes en TODOS los movimientos.
   * NO separada por business_type — verificado contra backend/app/routes.py:150-158.
   * Pasar `business_type` a /api/metrics/facets devuelve 200 y se ignora en silencio.
   */
  categories: Category[]
  /**
   * ISO `YYYY-MM-DD`. create_date más antiguo del dataset.
   * El backend genera fechas relativas a "hoy", así que este valor es DINÁMICO — no
   * hard-codearlo en ningún sitio. Usarlo como límite inferior del filtro de rango de fechas (Feature 1).
   */
  min_date: string
  /** ISO `YYYY-MM-DD`. create_date más reciente del dataset. Dinámico (ver min_date). */
  max_date: string
}

// ─────────────────────────────────────────────────────────────────────────────────
// MetricsSummaryItem
// /docs → Schemas → MetricsSummaryItem
// Cuerpo de respuesta de: GET /api/metrics/summary (devuelve MetricsSummaryItem[],
// ordenado por period ascendente — routes.py:186)
// ─────────────────────────────────────────────────────────────────────────────────

export interface MetricsSummaryItem {
  /** Etiqueta de período. El formato depende del query param `group_by` (p. ej. "2026-03" para month). */
  period: string
  income: number
  outcome: number
  /** income - outcome */
  net: number
}

// ─────────────────────────────────────────────────────────────────────────────────
// MetricsAlert
// /docs → Schemas → MetricsAlert
// Cuerpo de respuesta de: GET /api/metrics/alerts (devuelve MetricsAlert[],
// period ascendente — routes.py:225-239)
// ─────────────────────────────────────────────────────────────────────────────────

export interface MetricsAlert {
  /**
   * Etiqueta de período. El formato depende del query param `group_by` (observado: "2026-03"
   * para month). El schema OpenAPI solo lo tipa como `string` — sin patrón ni ejemplo.
   */
  period: string
  /** `outcome` (gasto) total de este período. */
  outcome_total: number
  /**
   * Media ACUMULADA del `outcome` de TODOS los períodos ANTERIORES a este (media expandente),
   * NO una media móvil de 3 períodos. Verificado contra backend/app/routes.py:219-240.
   * El primer período de la serie nunca se devuelve como alerta.
   */
  baseline_average: number
  /**
   * Un RATIO, no un porcentaje ya formateado. p. ej. 0.7353 significa +73,53 %.
   * Es igual a (outcome_total - baseline_average) / baseline_average.
   * Una fila se devuelve solo cuando este valor es estrictamente mayor que el query param `threshold`.
   */
  increase_ratio: number
}

// ─────────────────────────────────────────────────────────────────────────────────
// TopCategoryItem
// /docs → Schemas → TopCategoryItem
// Cuerpo de respuesta de: GET /api/metrics/categories/top (devuelve TopCategoryItem[],
// ordenado por total_amount descendente — routes.py:200)
// ─────────────────────────────────────────────────────────────────────────────────

export interface TopCategoryItem {
  category: Category
  operation_type: OperationType
  /** Suma de `amount` para esta categoría, restringida al `operation_type` solicitado. */
  total_amount: number
  // NOTA — ausencias verificadas:
  // * NO hay campo `business_type`. Para una vista B2B vs B2C, el llamador hace una petición
  //   por segmento (query param business_type) y etiqueta cada resultado por su cuenta.
  // * NO hay campo de porcentaje / share. Calcularlo en cliente: total_amount / Σ(total_amount).
  //   Obtener el denominador con limit=20 (devuelve todas las categorías). Ver view-types.ts
  //   (CategoryShare, SegmentIncomeBreakdown) y param-types.ts (TopCategoriesParams.limit).
}
