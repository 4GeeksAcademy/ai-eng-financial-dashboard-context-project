export type OperationType = "income" | "outcome";

export type BusinessType = "B2B" | "B2C";

export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

export interface FacetsResponse {
  /** Tipos de operación disponibles: "income" o "outcome". */
  operation_types: OperationType[];

  /** Líneas de negocio disponibles: "B2B" o "B2C". */
  business_types: BusinessType[];

  /** Categorías disponibles; valores definidos en Category. */
  categories: Category[];

  /** Fecha más antigua del dataset, en formato YYYY-MM-DD. */
  min_date: string;

  /** Fecha más reciente del dataset, en formato YYYY-MM-DD. */
  max_date: string;
}

export interface AlertEntry {
  /** Identificador del período; con agrupación mensual: YYYY-MM. */
  period: string;

  /** Gasto total registrado en el período, como importe numérico. */
  outcome_total: number;

  /**
   * Media de gasto usada como referencia, como importe numérico.
   * Actualmente es acumulada; el requisito exige 3 períodos previos.
   */
  baseline_average: number;

  /** Incremento relativo como ratio numérico: 0.3 equivale al 30 %. */
  increase_ratio: number;
}

/** Array directo de alertas; vacío cuando no se detectan anomalías. */
export type AlertsResponse = AlertEntry[];

export interface CategoryEntry {
  /** Identificador de categoría; valores definidos en Category. */
  category: Category;

  /** Tipo de operación agregado: "income" o "outcome". */
  operation_type: OperationType;

  /** Importe total de la categoría para la operación consultada. */
  total_amount: number;
}

/** Array de categorías ordenadas por importe descendente; puede estar vacío. */
export type TopCategoriesResponse = CategoryEntry[];
