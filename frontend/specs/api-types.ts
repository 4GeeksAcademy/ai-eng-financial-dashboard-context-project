import type { BusinessType, Category, OperationType } from '../src/lib/financial-types';

/**
 * GET /api/metrics/facets: esquema MetricsFacets del backend.
 * Todas las propiedades son obligatorias y no admiten null.
 * Actualmente las facetas son globales, sin filtros ni categorias por negocio.
 * La ampliacion prevista en el plan 003 no forma parte del contrato actual.
 */
export interface FacetsResponse {
  /** Tipos de operacion presentes: income u outcome. */
  operation_types: OperationType[];
  /** Tipos de negocio presentes: B2B o B2C; no vincula categorias a grupos. */
  business_types: BusinessType[];
  /** Categorias globales presentes, incluyendo ingresos y gastos. */
  categories: Category[];
  /** Fecha minima global, serializada como string YYYY-MM-DD, no como Date. */
  min_date: string;
  /** Fecha maxima global, serializada como string YYYY-MM-DD, no como Date. */
  max_date: string;
}

/**
 * Elemento de GET /api/metrics/alerts: esquema MetricsAlert del backend.
 * Todas las propiedades son obligatorias y no admiten null.
 * El calculo actual usa todos los periodos previos del rango filtrado,
 * no la media movil de tres periodos exigida por la spec 002.
 * threshold admite actualmente valores >= 0, no solo 0.01-1.0.
 */
export interface AlertEntry {
  /** Periodo: YYYY-MM-DD, YYYY-Www o YYYY-MM segun group_by (mes por defecto). */
  period: string;
  /** Gasto total registrado en el periodo; float del backend, number en JSON. */
  outcome_total: number;
  /** Media de gastos anteriores calculada por el backend; no garantiza tres periodos. */
  baseline_average: number;
  /** Incremento relativo (gasto - media) / media: 0.3 representa un 30 por ciento. */
  increase_ratio: number;
}

/**
 * GET /api/metrics/alerts responde list[MetricsAlert], sin envoltorio.
 * Puede ser una lista vacia. Nombre AlersResponse conservado segun la solicitud.
 */
export type AlersResponse = AlertEntry[];

/**
 * Elemento de GET /api/metrics/categories/top: esquema TopCategoryItem.
 * Todas las propiedades son obligatorias y no admiten null.
 * No incluye porcentaje, total del grupo ni business_type en cada fila.
 */
export interface CategoryEntry {
  /** Categoria: suppliers, sales, operational, administrative u others. */
  category: Category;
  /** Tipo de operacion; sera income al consultar con operation_type=income. */
  operation_type: OperationType;
  /** Importe total de la categoria para los filtros aplicados, no del grupo completo. */
  total_amount: number;
}

/**
 * GET /api/metrics/categories/top responde list[TopCategoryItem], sin envoltorio.
 * limit=5 fija un maximo, no garantiza cinco elementos; los datos simulados
 * solo generan ingresos en sales y others. Puede devolver una lista vacia.
 * Nombre TopCategoriesReponse conservado segun la solicitud.
 * El total completo necesario en el plan 003 procede de /api/metrics/summary,
 * no de una propiedad adicional inventada en esta respuesta.
 * Definiciones contrastadas con codigo; /docs en ejecucion no verificado.
 */
export type TopCategoriesReponse = CategoryEntry[];