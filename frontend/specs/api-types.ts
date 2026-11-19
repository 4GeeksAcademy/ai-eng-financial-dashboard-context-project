export type OperationType = "income" | "outcome";
export type BusinessType = "B2B" | "B2C";
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

export interface FinancialMovement {
  /**
   * Fecha del movimiento.
   * Formato esperado: YYYY-MM-DD.
   */
  create_date: string;
  /**
   * Monto del movimiento.
   */
  amount: number;
  /**
   * Tipo de operación.
   */
  operation_type: OperationType;
  /**
   * Categoría financiera.
   */
  category: Category;
  /**
   * Línea de negocio.
   */
  business_type: BusinessType;
}

/**
 * Colección de movimientos financieros.
 */
export interface MetricsResponse extends Array<FinancialMovement> {}

/**
 * Colección de movimientos financieros de la línea B2B.
 */
export interface MetricsB2BResponse extends Array<FinancialMovement> {}

/**
 * Colección de movimientos financieros de la línea B2C.
 */
export interface MetricsB2CResponse extends Array<FinancialMovement> {}

export interface SummaryEntry {
  /**
   * Periodo agregado.
   * Puede representarse como YYYY-MM (month), YYYY-Www (week) o YYYY-MM-DD (day).
   */
  period: string;
  /**
   * Total de ingresos del periodo.
   */
  income: number;
  /**
   * Total de egresos del periodo.
   */
  outcome: number;
  /**
   * Neto del periodo (income - outcome).
   */
  net: number;
}

/**
 * Colección de agregados por periodo.
 */
export interface SummaryResponse extends Array<SummaryEntry> {}

export interface ComparisonResponse {
  /**
   * Neto del periodo actual.
   */
  current_period: number;
  /**
   * Neto del periodo anterior comparable.
   */
  previous_period: number;
  /**
   * Diferencia absoluta entre periodos.
   */
  delta_abs: number;
  /**
   * Diferencia porcentual, nulo cuando no hay base válida de comparación.
   */
  delta_pct: number | null;
}

export interface HealthResponse {
  /**
   * Estado del servicio backend.
   */
  status: string;
}

export interface FacetsResponse {
  /**
   * Lista de tipos de operación disponibles para filtrar métricas.
   * Valores válidos por contrato: "income" | "outcome".
   */
  operation_types: OperationType[];
  /**
   * Líneas de negocio disponibles en el dataset.
   * Valores válidos por contrato: "B2B" | "B2C".
   */
  business_types: BusinessType[];
  /**
   * Categorías financieras disponibles para filtrar o agrupar.
   * Valores válidos por contrato:
   * "suppliers" | "sales" | "operational" | "administrative" | "others".
   */
  categories: Category[];
  /**
   * Fecha mínima disponible en el dataset.
   * Formato esperado: YYYY-MM-DD.
   */
  min_date: string;
  /**
   * Fecha máxima disponible en el dataset.
   * Formato esperado: YYYY-MM-DD.
   */
  max_date: string;
}

export interface AlertEntry {
  /**
   * Periodo agregado de la alerta.
   * El formato depende de group_by; por defecto (month): YYYY-MM.
   */
  period: string;
  /**
   * Total de outcome registrado en el periodo evaluado.
   * Número decimal no negativo.
   */
  outcome_total: number;
  /**
   * Promedio base usado para comparar el outcome actual.
   * Número decimal no negativo.
   */
  baseline_average: number;
  /**
   * Incremento relativo frente al baseline.
   * Se expresa como ratio decimal (ejemplo: 0.3 equivale a 30%).
   */
  increase_ratio: number;
}

/**
 * Colección de alertas de anomalías de gasto.
 */
export interface AlertResponse extends Array<AlertEntry> {}

export interface CategoryEntry {
  /**
   * Categoría financiera del registro.
   * Valores válidos por contrato:
   * "suppliers" | "sales" | "operational" | "administrative" | "others".
   */
  category: Category;
  /**
   * Tipo de operación asociado al total de categoría.
   * Valores válidos por contrato: "income" | "outcome".
   */
  operation_type: OperationType;
  /**
   * Monto total acumulado para la categoría y filtro aplicado.
   * Número decimal no negativo.
   */
  total_amount: number;
}

/**
 * Colección de categorías ordenadas por monto total.
 */
export interface TopCategoriesResponse extends Array<CategoryEntry> {}
