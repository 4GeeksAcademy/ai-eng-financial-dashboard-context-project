import type { BusinessType, OperationType } from '../src/lib/financial-types';

/**
 * Fechas opcionales de /api/metrics, /api/metrics/alerts y
 * /api/metrics/categories/top. Nombre DateRangeFiler conservado segun solicitud.
 * Omitir fechas no seleccionadas; no enviar strings vacios ni null.
 * string documenta YYYY-MM-DD, pero no valida formato ni orden de las fechas.
 * /api/metrics/facets no acepta estos filtros en el contrato actual.
 */
export interface DateRangeFiler {
  /** Inicio inclusivo en formato YYYY-MM-DD; omitido significa sin limite inferior. */
  start_date?: string;
  /** Fin inclusivo en formato YYYY-MM-DD; omitido significa sin limite superior. */
  end_date?: string;
}

/**
 * Query de GET /api/metrics/alerts; hereda las fechas opcionales.
 * Todos los parametros son opcionales segun el contrato FastAPI actual.
 */
export interface AlertsParams extends DateRangeFiler {
  /**
   * Ratio numerico >= 0, sin maximo en la API; predeterminado 0.3 (30 por ciento).
   * La spec 002 pide 0.01-1.0; esa restriccion sigue pendiente en el backend.
   * number no impone por si solo los limites del valor.
   */
  threshold?: number;
  /** Agrupacion admitida por la API: day, week o month; predeterminado month. */
  group_by?: 'day' | 'week' | 'month';
  /** Negocio B2B o B2C; omitido incluye ambos. No requerido por la spec 002. */
  business_type?: BusinessType;
}

/**
 * Query de GET /api/metrics/categories/top; hereda las fechas opcionales.
 * Todos los parametros son opcionales segun el contrato FastAPI actual.
 * Para la comparativa 003 se envia operation_type=income, limit=5 y el negocio.
 * Los filtros de negocio previstos para /facets aun no estan implementados.
 */
export interface TopCategoriesParams extends DateRangeFiler {
  /** Tipo income u outcome; predeterminado outcome, no income. */
  operation_type?: OperationType;
  /** Maximo de categorias: entero entre 1 y 20; predeterminado 5, sin garantizar cinco filas. */
  limit?: number;
  /** Negocio B2B o B2C para separar la comparativa; omitido combina ambos grupos. */
  business_type?: BusinessType;
}