/**
 * TypeScript shapes for the backend responses used by the proposed dashboard
 * features. These are API-contract types, not transformed UI/view-model types.
 * Keep them aligned with backend/app/routes.py and docs/feature-endpoint-map.md.
 */
import type {
  BusinessType,
  Category,
  OperationType,
} from "../src/lib/financial-types";

/** GET /api/metrics/facets */
export interface FacetsResponse {
  operation_types: OperationType[];
  business_types: BusinessType[];
  categories: Category[];
  /** ISO calendar date (`YYYY-MM-DD`) for the earliest available movement. */
  min_date: string;
  /** ISO calendar date (`YYYY-MM-DD`) for the latest available movement. */
  max_date: string;
}

/** One item returned by GET /api/metrics/alerts. */
export interface AlertEntry {
  /** Aggregation period, e.g. `2026-03` when group_by=month. */
  period: string;
  /** Outcome/spending total for this period. */
  outcome_total: number;
  /** Baseline average in the same units as outcome_total. */
  baseline_average: number;
  /** Increase ratio, not percentage points; multiply by 100 for display. */
  increase_ratio: number;
}

/** GET /api/metrics/alerts returns an array (including `[]` when no alerts). */
export type AlertsResponse = AlertEntry[];

/**
 * One item returned by GET /api/metrics/categories/top. This endpoint is
 * documented for comparison, but the current feature spec chooses to aggregate
 * the B2B/B2C movement endpoints instead because this payload lacks group totals.
 */
export interface CategoryEntry {
  category: Category;
  operation_type: OperationType;
  /** Sum for this category and operation type; not a business-group total. */
  total_amount: number;
}

/** GET /api/metrics/categories/top returns an array (possibly empty). */
export type TopCategoriesResponse = CategoryEntry[];
