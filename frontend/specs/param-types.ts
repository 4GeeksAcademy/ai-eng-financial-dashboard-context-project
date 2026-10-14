import type {
  BusinessType,
  Category,
  GroupBy,
  ISODate,
  OperationType,
} from "./api-types";

/**
 * Optional date query parameters shared by the requested dashboard views.
 * Values use the API `date` format: YYYY-MM-DD.
 */
export interface DateRangeFilter {
  /** Inclusive lower date; omit or use null when unset.
   * @format YYYY-MM-DD
   */
  start_date?: ISODate | null;
  /** Inclusive upper date; omit or use null when unset.
   * @format YYYY-MM-DD
   */
  end_date?: ISODate | null;
}

/** Query contract and UI constraints for outcome alerts. */
export interface AlertsParams extends DateRangeFilter {
  /** Numeric fractional ratio; API minimum 0 and default 0.3, UI range 0.01..1.0. */
  threshold?: number;
  /** Aggregation interval: day, week, or month; API default is month. */
  group_by?: GroupBy;
  /** Optional segment filter accepted by the alerts endpoint: B2B or B2C. */
  business_type?: BusinessType | null;
}

export type AlertsQuery = AlertsParams;

/** Query contract for one business segment's top income categories. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation type income or outcome; this view sends income. API default is outcome. */
  operation_type?: OperationType;
  /** Integer API range 1..20, default 5; this view requests 5. */
  limit?: number;
  /** Set B2B or B2C for the corresponding panel. */
  business_type?: BusinessType | null;
}

export type TopCategoriesQuery = TopCategoriesParams;

/** Query parameters for the existing general metrics endpoint. */
export interface MetricsParams extends DateRangeFilter {
  /** Optional category enum filter; null or omission disables filtering. */
  category?: Category | null;
  /** Optional income/outcome filter; null or omission disables filtering. */
  operation_type?: OperationType | null;
}

/** Query parameters for summary, including optional business segmentation. */
export interface MetricsSummaryParams extends DateRangeFilter {
  /** Bucket granularity: day, week, or month; defaults to month. */
  group_by?: GroupBy;
  /** Optional category enum filter; null or omission disables filtering. */
  category?: Category | null;
  /** Optional income/outcome filter; null or omission disables filtering. */
  operation_type?: OperationType | null;
  /** Optional segment filter: B2B or B2C. */
  business_type?: BusinessType | null;
}

/** Query parameters shared by the fixed-group B2B and B2C routes. */
export interface SegmentMovementsParams extends DateRangeFilter {
  /** Optional category enum filter; null or omission disables filtering. */
  category?: Category | null;
  /** Optional income/outcome filter; null or omission disables filtering. */
  operation_type?: OperationType | null;
}

/** Required date query parameters for the auxiliary period-comparison route. */
export interface ComparisonParams {
  /** Required inclusive start date in YYYY-MM-DD format. */
  start_date: ISODate;
  /** Required inclusive end date in YYYY-MM-DD format. */
  end_date: ISODate;
  /** Optional segment filter: B2B or B2C. */
  business_type?: BusinessType | null;
}
