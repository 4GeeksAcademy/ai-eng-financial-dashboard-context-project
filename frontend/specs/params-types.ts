import type { BusinessType, OperationType } from "./api-types";

export type GroupBy = "day" | "week" | "month";

export interface DateRangeFilter {
  /** Inclusive lower bound in YYYY-MM-DD format. Omit to mean "no lower bound". */
  start_date?: string;
  /** Inclusive upper bound in YYYY-MM-DD format. Omit to mean "no upper bound". */
  end_date?: string;
}

export interface AlertsParams extends DateRangeFilter {
  /** Ratio threshold for anomaly detection. UI contract should clamp to 0.01..1.0. */
  threshold?: number;
  /** Period granularity used to build the summary used for anomaly detection. */
  group_by?: GroupBy;
  /** Optional segment filter applied before anomaly detection. */
  business_type?: BusinessType;
}

export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation type to aggregate. The API defaults to "outcome". */
  operation_type?: OperationType;
  /** Maximum number of categories returned. API validation is 1..20. */
  limit?: number;
  /** Optional segment filter applied before category aggregation. */
  business_type?: BusinessType;
}
