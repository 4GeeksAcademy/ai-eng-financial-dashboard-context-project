import type { OperationType } from "./api-types";

export interface DateRangeFilter {
  /**
   * Fecha inicial inclusiva para filtrar resultados.
   * Parámetro opcional; cuando no se envía no aplica límite inferior.
   * Formato esperado: YYYY-MM-DD.
   */
  start_date?: string;
  /**
   * Fecha final inclusiva para filtrar resultados.
   * Parámetro opcional; cuando no se envía no aplica límite superior.
   * Formato esperado: YYYY-MM-DD.
   */
  end_date?: string;
}

export interface AlertsParams extends DateRangeFilter {
  /**
   * Umbral de detección de anomalías expresado como ratio decimal.
   * Ejemplo: 0.3 equivale a 30% de incremento.
   * Recomendado para UI: 0.01 a 1.0.
   * Backend actual acepta valores >= 0.
   */
  threshold?: number;
}

export interface TopsCategoriesParams extends DateRangeFilter {
  /**
   * Tipo de operación a consultar para el ranking de categorías.
   * Valores válidos: "income" | "outcome".
   */
  operation_type: OperationType;
  /**
   * Cantidad máxima de categorías a devolver.
   * Backend actual: mínimo 1 y máximo 20.
   */
  limit?: number;
}
