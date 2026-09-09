/**
 * TIPOS DERIVADOS / VIEW-MODEL
 *
 * Shapes CALCULADOS en el frontend a partir de las respuestas de la API. Ninguno lo devuelve
 * ningún endpoint. Se mantienen separados de api-types.ts para que ese archivo siga siendo un
 * espejo 1:1 estricto del contrato OpenAPI.
 *
 * Precedente: frontend/src/lib/financial-types.ts ya mezcla tipos de API (FinancialMovement)
 * con tipos de vista (KPIMetrics, MonthlyDataPoint). Estas specs los mantienen separados a
 * propósito, según el requisito del entregable de "mantener separadas las restricciones de API y UI".
 */

import { type BusinessType, type Category } from './api-types'

// ─────────────────────────────────────────────────────────────────────────────────
// Feature 1 — Filtro de rango de fechas del dashboard
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * El valor que mantiene el control del filtro de rango de fechas.
 * Ambos límites son opcionales: un rango semiabierto (solo inicio, o solo fin) es válido y se
 * pasa tal cual a MetricsParams.start_date / end_date.
 * Un objeto completamente vacío === "sin filtro de fecha".
 */
export interface DateRange {
  /** ISO `YYYY-MM-DD`. Omitido => sin límite inferior. */
  startDate?: string
  /** ISO `YYYY-MM-DD`. Omitido => sin límite superior. */
  endDate?: string
}

/**
 * Los límites fuera de los cuales la UI del filtro no debe permitir salir al usuario.
 * Provienen de MetricsFacets.min_date / max_date (Feature 1). Ambos obligatorios una vez cargados los facets.
 */
export interface DateRangeBounds {
  /** ISO `YYYY-MM-DD`. De MetricsFacets.min_date. */
  min: string
  /** ISO `YYYY-MM-DD`. De MetricsFacets.max_date. */
  max: string
}

// ─────────────────────────────────────────────────────────────────────────────────
// Feature 3 — Comparación B2B vs B2C
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * El ingreso de una categoría y su cuota (share) dentro de un único segmento.
 * `total_amount` viene directamente de un TopCategoryItem; `percent` lo calcula el frontend.
 */
export interface CategoryShare {
  category: Category
  /** De TopCategoryItem.total_amount (operation_type 'income'). */
  total_amount: number
  /**
   * total_amount / SegmentIncomeBreakdown.incomeTotal * 100.
   * DEBE ser 0 cuando incomeTotal === 0 (guarda contra división por cero, replicando el
   * patrón `income > 0 ? ... : 0` de frontend/src/lib/financial-utils.ts:31,59).
   * Rango: 0–100.
   */
  percent: number
}

/**
 * La foto completa de ingresos de un segmento de negocio, ensamblada a partir de una única
 * llamada GET /api/metrics/categories/top con operation_type='income', business_type=<segmento>,
 * limit=20.
 */
export interface SegmentIncomeBreakdown {
  segment: BusinessType
  /** Σ de total_amount de todas las categorías devueltas (limit=20 => todas). */
  incomeTotal: number
  /** Ordenado por total_amount descendente, tal como lo devuelve la API. Puede estar vacío (ver casos límite del README). */
  categories: CategoryShare[]
}

/**
 * El modelo ensamblado de toda la vista de comparación B2B vs B2C: exactamente dos segmentos.
 * El orden no es significativo; los componentes deben renderizar por `segment`, no por índice.
 */
export interface SegmentComparison {
  b2b: SegmentIncomeBreakdown
  b2c: SegmentIncomeBreakdown
}
