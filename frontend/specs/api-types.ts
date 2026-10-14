/**
 * TypeScript transcription of response schemas served by the project's
 * FastAPI OpenAPI document. Query parameter types live in param-types.ts.
 * This file defines wire contracts, not runtime validation or an HTTP client.
 *
 * Verified against http://localhost:8000/openapi.json on 2026-10-09.
 */

/** Financial movement operation values. */
export type OperationType = "income" | "outcome";
/** Category values declared by the API. */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";
/** Business segment values declared by the API. */
export type BusinessType = "B2B" | "B2C";
/** Supported summary/alert aggregation intervals. */
export type GroupBy = "day" | "week" | "month";

/** OpenAPI `string` with `format: date`, serialized as YYYY-MM-DD. */
export type ISODate = string;

// Response schemas
export interface FinancialMovement {
  /** Movement date in YYYY-MM-DD format. */
  create_date: ISODate;
  /** Movement amount; OpenAPI does not declare a currency. */
  amount: number;
  /** Valid values: income or outcome. */
  operation_type: OperationType;
  /** One of the five Category enum values. */
  category: Category;
  /** Business segment: B2B or B2C. */
  business_type: BusinessType;
}

export interface FacetsResponse {
  /** Operation types present in the dataset: income and/or outcome. */
  operation_types: OperationType[];
  /** Business segments present in the dataset: B2B and/or B2C. */
  business_types: BusinessType[];
  /** Global categories present in the dataset; not segmented by business type. */
  categories: Category[];
  /** Earliest dataset date in YYYY-MM-DD format. */
  min_date: ISODate;
  /** Latest dataset date in YYYY-MM-DD format. */
  max_date: ISODate;
}

export type MetricsFacets = FacetsResponse;

export interface MetricsSummaryItem {
  /** Aggregation bucket; format depends on group_by (month: YYYY-MM). */
  period: string;
  /** Sum of income amounts for the bucket. */
  income: number;
  /** Sum of outcome amounts for the bucket. */
  outcome: number;
  /** income minus outcome for the bucket. */
  net: number;
}

export interface CategoryEntry {
  /** Category enum value for this aggregate. */
  category: Category;
  /** Operation type requested from the top-categories endpoint. */
  operation_type: OperationType;
  /** Sum of amounts for this category and operation type. */
  total_amount: number;
}

export type TopCategoryItem = CategoryEntry;

export interface MetricsComparison {
  /** Net value for the requested current period. */
  current_period: number;
  /** Net value for the immediately preceding period. */
  previous_period: number;
  /** Difference between current_period and previous_period. */
  delta_abs: number;
  /** Percentage delta; null when the previous net is zero. */
  delta_pct: number | null;
}

export interface AlertEntry {
  /** Aggregation period label; format depends on group_by. */
  period: string;
  /** Outcome total for the period. */
  outcome_total: number;
  /** API baseline is the average of all earlier periods, not a three-period window. */
  baseline_average: number;
  /** Fractional increase ratio (not multiplied by 100). */
  increase_ratio: number;
}

export type MetricsAlert = AlertEntry;

/** OpenAPI validation error schema used by the documented 422 responses. */
export interface ValidationError {
  /** Location path represented by string and/or numeric segments. */
  loc: Array<string | number>;
  /** Human-readable validation message. */
  msg: string;
  /** Validation error identifier. */
  type: string;
  /** Input value associated with the validation error, when supplied. */
  input?: unknown;
  /** Additional validation context, when supplied. */
  ctx?: Record<string, unknown>;
}

/** OpenAPI HTTPValidationError; `detail` is optional in the published schema. */
export interface HTTPValidationError {
  /** Validation details; optional in the OpenAPI schema. */
  detail?: ValidationError[];
}

// Successful response aliases for the documented endpoints.
export type MetricsResponse = FinancialMovement[];
export type MetricsFacetsResponse = FacetsResponse;
export type MetricsSummaryResponse = MetricsSummaryItem[];
export type TopCategoriesResponse = CategoryEntry[];
export type MetricsComparisonResponse = MetricsComparison;
export type AlertsResponse = AlertEntry[];
export type MetricsAlertsResponse = AlertsResponse;
export type SegmentMovementsResponse = FinancialMovement[];
