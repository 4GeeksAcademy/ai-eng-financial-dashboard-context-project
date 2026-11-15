import type {
  BusinessType,
  Category,
  OperationType,
} from "../src/lib/financial-types";

/** Response body returned by `GET /api/metrics/facets`. */
export interface FacetsResponse {
  /** Operation types present in the complete dataset (`income` or `outcome`). */
  operation_types: OperationType[];
  /** Business segments present in the complete dataset (`B2B` or `B2C`). */
  business_types: BusinessType[];
  /** Categories present in the complete dataset; values are not split by segment. */
  categories: Category[];
  /** Earliest movement date in the complete dataset, serialized as `YYYY-MM-DD`. */
  min_date: string;
  /** Latest movement date in the complete dataset, serialized as `YYYY-MM-DD`. */
  max_date: string;
}

/** One alert item returned by `GET /api/metrics/alerts`. */
export interface AlertEntry {
  /**
   * Group key: `YYYY-MM-DD` for `day`, `YYYY-Www` for `week`,
   * or `YYYY-MM` for `month`.
   */
  period: string;
  /** Sum of outcome amounts in this period. */
  outcome_total: number;
  /**
   * Backend-calculated arithmetic mean of outcome totals across all prior
   * periods available in the filtered summary. It is not necessarily the
   * mean of only the three immediately preceding periods. Periods with no
   * movements are absent from that summary; periods with movements but no
   * outcomes contribute zero.
   */
  baseline_average: number;
  /**
   * Relative increase `(outcome_total - baseline_average) / baseline_average`;
   * expressed as a ratio (for example, `0.3` means 30%). The backend returns
   * alerts only when this ratio is greater than the threshold and the baseline
   * is positive.
   */
  increase_ratio: number;
}

/** Response body returned by `GET /api/metrics/alerts` (a JSON array). */
export type AlertsResponse = AlertEntry[];

/** One category total returned by `GET /api/metrics/categories/top`. */
export interface CategoryEntry {
  /** Financial category, using the API's existing category values. */
  category: Category;
  /** Operation type selected for the ranking (`income` or `outcome`). */
  operation_type: OperationType;
  /** Sum of amounts for this category and operation type. */
  total_amount: number;
}

/** Response body returned by `GET /api/metrics/categories/top` (a JSON array). */
export type TopCategoriesResponse = CategoryEntry[];
