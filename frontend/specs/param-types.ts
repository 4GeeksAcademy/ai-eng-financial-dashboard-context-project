import type { BusinessType, OperationType } from "../src/lib/financial-types";

/** Date query values use the backend's YYYY-MM-DD date format. */
export type ISODateString = `${number}-${number}-${number}`;

/** Optional inclusive date bounds for API query filters, formatted as YYYY-MM-DD. */
export interface DataRangeFilter {
  /** Inclusive lower bound; ISO calendar date formatted YYYY-MM-DD. */
  start_date?: ISODateString;
  /** Inclusive upper bound; ISO calendar date formatted YYYY-MM-DD. */
  end_date?: ISODateString;
}

/** Supported alert grouping: calendar day, ISO week, or calendar month. */
export type MetricsGroupBy = "day" | "week" | "month";

/** Query parameters accepted by GET /api/metrics/comparison. */
export interface ComparisonParams {
  /** Required inclusive start of the current range; ISO calendar date formatted YYYY-MM-DD. */
  start_date: ISODateString;
  /** Required inclusive end of the current range; ISO calendar date formatted YYYY-MM-DD. */
  end_date: ISODateString;
  /** Optional segment filter; allowed values are "B2B" and "B2C". */
  business_type?: BusinessType;
}

/** Query parameters accepted by GET /api/metrics/alerts. */
export interface AlertsParams extends DataRangeFilter {
  /** Proportional expense-increase threshold; must be >= 0 (0.3 means 30%); default is 0.3. */
  threshold?: number;
  /** Alert bucket size; allowed values are "day", "week", and "month"; default is "month". */
  group_by?: MetricsGroupBy;
  /** Optional segment filter; allowed values are "B2B" and "B2C". */
  business_type?: BusinessType;
}

/** Query parameters accepted by GET /api/metrics/categories/top. */
export interface TopCategoriesParams extends DataRangeFilter {
  /** Movement type to aggregate; allowed values are "income" and "outcome"; default is "outcome". */
  operation_type?: OperationType;
  /** Maximum number of categories; integer from 1 through 20; default is 5. */
  limit?: number;
  /** Optional segment filter; allowed values are "B2B" and "B2C". */
  business_type?: BusinessType;
}
