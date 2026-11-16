import type { OperationType } from "./api-types";

export interface DateRangeFilter {
  /**
   * Inicio inclusivo en formato YYYY-MM-DD.
   * Omitir para no establecer límite inferior.
   */
  start_date?: string;

  /**
   * Fin inclusivo en formato YYYY-MM-DD.
   * Omitir para no establecer límite superior.
   */
  end_date?: string;
}

export interface AlertsParams extends DateRangeFilter {
  /**
   * Umbral como ratio numérico: 0.3 equivale al 30 %.
   * API actual: valor >= 0, sin máximo; predeterminado: 0.3.
   * Requisito de la funcionalidad: entre 0.01 y 1.0, incluidos.
   */
  threshold?: number;
}

export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Operación consultada: "income" o "outcome".
   * Predeterminado de la API: "outcome"; enviar "income" para ingresos.
   */
  operation_type?: OperationType;

  /**
   * Número máximo de categorías: entero entre 1 y 20, incluidos.
   * Predeterminado de la API: 5.
   */
  limit?: number;
}
