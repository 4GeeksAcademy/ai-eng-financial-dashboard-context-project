import type {
  BusinessType,
  Category,
  OperationType,
} from "../src/lib/financial-types";
import type { ISODateString } from "./param-types";

/** Available filter values and the date bounds exposed by GET /api/metrics/facets. */
export interface FacetResponse {
  /** Available operation filters; each value is "income" or "outcome". */
  operation_types: OperationType[];
  /** Available business segments; each value is "B2B" or "B2C". */
  business_types: BusinessType[];
  /** Available categories: suppliers, sales, operational, administrative, or others. */
  categories: Category[];
  /** Earliest movement date, formatted as YYYY-MM-DD. */
  min_date: ISODateString;
  /** Latest movement date, formatted as YYYY-MM-DD. */
  max_date: ISODateString;
}

/** Net comparison returned by GET /api/metrics/comparison. */
export interface ComparisonResponse {
  /** Net amount (income minus outcome) for the requested range; may be negative. */
  current_period: number;
  /** Net amount for the immediately preceding range of equal duration; may be negative. */
  previous_period: number;
  /** Monetary difference, current_period - previous_period; may be positive, zero, or negative. */
  delta_abs: number;
  /** Percentage change (already multiplied by 100); null when previous_period is zero. */
  delta_pct: number | null;
}

/** One anomalous expense period returned by GET /api/metrics/alerts. */
export interface AlertEntry {
  /** Alert bucket: YYYY-MM-DD for day, YYYY-Www for ISO week, or YYYY-MM for month grouping. */
  period: string;
  /** Total expenses (operation_type="outcome") in this bucket; non-negative monetary amount. */
  outcome_total: number;
  /** Arithmetic average of earlier bucket expenses; positive when returned as an alert. */
  baseline_average: number;
  /** Proportional increase over baseline, strictly above threshold; e.g. 0.5 means 50%. */
  increase_ratio: number;
}

/** The alerts endpoint returns an array, including an empty array when none match. */
export type AlertsResponse = AlertEntry[];

/** One category aggregate returned by GET /api/metrics/categories/top. */
export interface CategoryEntry {
  /** Category identifier: suppliers, sales, operational, administrative, or others. */
  category: Category;
  /** Aggregated movement type: "income" or "outcome". */
  operation_type: OperationType;
  /** Sum for this category and operation type over the applied filters; monetary amount >= 0. */
  total_amount: number;
}

/**
 * The endpoint returns one list per request. To compare B2B and B2C, request it
 * separately with business_type=B2B and business_type=B2C; it does not return
 * paired segment values in a single response.
 */
export type TopCategoriesResponse = CategoryEntry[];
