/**
 * Wire contracts for the dashboard API.
 * Dates are serialized as ISO date strings in YYYY-MM-DD format.
 */
export type ISODateString = string;

export type OperationType = "income" | "outcome";
export type BusinessType = "B2B" | "B2C";
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

export interface FacetsResponse {
  /** Supported values for the metrics operation filter. */
  operation_types: OperationType[];
  /** Supported values for the business-type filter. */
  business_types: BusinessType[];
  /** Available categories across the whole dataset. */
  categories: Category[];
  /** Earliest date available in the generated dataset. */
  min_date: ISODateString;
  /** Latest date available in the generated dataset. */
  max_date: ISODateString;
}

export interface AlertEntry {
  /** Period label delivered by the API, for example 2025-03 or 2025-W12. */
  period: string;
  /** Total outcome for the highlighted period. */
  outcome_total: number;
  /** Historical average used as the anomaly baseline. */
  baseline_average: number;
  /** Relative percentage increase measured against the historical baseline. */
  increase_ratio: number;
}

export type AlertsResponse = AlertEntry[];

export interface CategoryEntry {
  /** Category name associated with the total. */
  category: Category;
  /** Operation type for this aggregate. */
  operation_type: OperationType;
  /** Accumulated amount for the category under the active filters. */
  total_amount: number;
}

export type TopCategoriesResponse = CategoryEntry[];
