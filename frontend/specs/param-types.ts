import type {
  BusinessType,
  OperationType,
} from "../src/lib/financial-types";

/** API-supported grouping units for alert periods. */
export type GroupBy = "day" | "week" | "month";

/** Query date filters shared by the metrics-related endpoints. */
export interface DateRangeFilter {
  /**
   * Inclusive lower date bound in `YYYY-MM-DD` format.
   * Omit it to leave the start of the dataset unbounded.
   */
  start_date?: string;
  /**
   * Inclusive upper date bound in `YYYY-MM-DD` format.
   * Omit it to leave the end of the dataset unbounded.
   */
  end_date?: string;
}

/** Query parameters accepted by `GET /api/metrics/alerts`. */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Minimum relative increase required to return an alert. The API default is
   * `0.3`, accepts values greater than or equal to `0`, and declares no maximum.
   * The Product Manager's UI range is `0.01`–`1.0`; that narrower range is not
   * enforced by the API contract. The comparison is strict (`increase_ratio >
   * threshold`).
   */
  threshold?: number;
  /** Period grouping: `day`, `week`, or `month`; defaults to `month`. */
  group_by?: GroupBy;
  /**
   * Optional business segment (`B2B` or `B2C`). Omit it to include both
   * segments; the API declares no default value.
   */
  business_type?: BusinessType;
}

/** Query parameters accepted by `GET /api/metrics/categories/top`. */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Operation type to rank (`income` or `outcome`); defaults to `outcome`.
   */
  operation_type?: OperationType;
  /**
   * Maximum number of ranked categories. Must be an integer from 1 through 20;
   * defaults to 5. The response may contain fewer entries when fewer categories
   * have matching movements.
   */
  limit?: number;
  /**
   * Optional business segment (`B2B` or `B2C`). Omit it to include both
   * segments; the API declares no default value.
   */
  business_type?: BusinessType;
}
