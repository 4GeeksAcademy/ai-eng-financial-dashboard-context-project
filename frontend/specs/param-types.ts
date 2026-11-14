import type { BusinessType, OperationType } from './api-types'

export type ISODateString = string

export interface DateRangeFilter {
  /** Primer día incluido en el filtro, en formato `YYYY-MM-DD`; se omite si no hay fecha inicial. */
  start_date?: ISODateString
  /** Último día incluido en el filtro, en formato `YYYY-MM-DD`; se omite si no hay fecha final. */
  end_date?: ISODateString
}

export interface AlertsParams extends DateRangeFilter {
  /** Ratio mínimo de incremento para generar una alerta; válido desde `0`, con valor predeterminado `0.3`. */
  threshold?: number
}

export interface TopCategoriesParams extends DateRangeFilter {
  /** Tipo de operación que se agregará. Valores válidos: `income` y `outcome`; por defecto, `outcome`. */
  operation_type?: OperationType
  /** Máximo de categorías devueltas; entero entre `1` y `20`, con valor predeterminado `5`. */
  limit?: number
}

export interface SegmentTopCategoriesParams extends TopCategoriesParams {
  /** Línea de negocio requerida por la comparativa. Valores válidos: `B2B` y `B2C`. */
  business_type: BusinessType
}

export interface SegmentSummaryParams extends DateRangeFilter {
  /** Línea de negocio requerida por la comparativa. Valores válidos: `B2B` y `B2C`. */
  business_type: BusinessType
}
