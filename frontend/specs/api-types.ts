/**
 * API Response Type Specifications
 *
 * This module defines TypeScript interfaces for API responses from the Financial Metrics backend.
 * All types are verified against the OpenAPI schema (http://localhost:8000/openapi.json)
 * and cross-referenced with existing types in frontend/src/lib/financial-types.ts
 */

import type { OperationType, Category, BusinessType } from '../src/lib/financial-types';

/**
 * Facets Response - Available date range and filter dimensions
 *
 * Returns metadata about the data available in the system, including:
 * - Date range boundaries (min_date to max_date in YYYY-MM-DD format)
 * - Available operation types (income, outcome)
 * - Available business types (B2B, B2C)
 * - Available categories (suppliers, sales, operational, administrative, others)
 *
 * Used by: GET /api/metrics/facets
 * No query parameters required.
 */
export interface FacetsResponse {
  /**
   * Array of available operation types in the dataset.
   * Values: 'income' | 'outcome'
   * Always includes both values when data exists.
   */
  operation_types: OperationType[];

  /**
   * Array of available business types in the dataset.
   * Values: 'B2B' | 'B2C'
   * Always includes both values when data exists.
   */
  business_types: BusinessType[];

  /**
   * Array of available categories in the dataset.
   * Values: 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'
   * Includes only categories present in the data.
   */
  categories: Category[];

  /**
   * Minimum date in the dataset (earliest financial movement).
   * Format: YYYY-MM-DD (ISO 8601 date string)
   * Null or absent if no data exists in the system.
   */
  min_date: string; // ISO date format: YYYY-MM-DD

  /**
   * Maximum date in the dataset (latest financial movement).
   * Format: YYYY-MM-DD (ISO 8601 date string)
   * Null or absent if no data exists in the system.
   */
  max_date: string; // ISO date format: YYYY-MM-DD
}

/**
 * Alert Entry - Single anomaly detection result
 *
 * Represents a detected anomaly where spending (outcome) exceeded
 * the baseline by a threshold ratio. Used in the alerts table.
 */
export interface AlertEntry {
  /**
   * The period (day, week, or month) when the anomaly was detected.
   * Format depends on group_by parameter: YYYY-MM-DD, YYYY-Www, or YYYY-MM
   */
  period: string;

  /**
   * Total outcome (spending) amount during this period.
   * Numeric value, can be positive or negative depending on data.
   */
  outcome_total: number;

  /**
   * Baseline average from previous periods.
   * Used as reference point to calculate increase_ratio.
   */
  baseline_average: number;

  /**
   * Relative increase ratio above baseline: (outcome_total - baseline_average) / baseline_average.
   * Values: > 0 indicates increase (e.g. 0.3 = +30%, 0.5 = +50%, 1.4968 = +149.68%).
   * Threshold comparison: alert triggers when increase_ratio > threshold (default 0.3).
   */
  increase_ratio: number;
}

/**
 * Alerts Response - Array of detected anomalies
 *
 * Returns list of periods where spending exceeded baseline by threshold.
 * Used by: GET /api/metrics/alerts
 *
 * Query parameters:
 * - threshold: number (default: 0.3, range: >= 0)
 * - group_by: 'day' | 'week' | 'month' (default: 'month')
 * - start_date: string | null (YYYY-MM-DD format, optional)
 * - end_date: string | null (YYYY-MM-DD format, optional)
 * - business_type: 'B2B' | 'B2C' | null (optional)
 */
export type AlertsResponse = AlertEntry[];

/**
 * Category Entry - Top category metric (B2B or B2C comparison)
 *
 * Represents a single category with its total amount for a specific
 * operation type and business type combination.
 */
export interface CategoryEntry {
  /**
   * The financial category.
   * Values: 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'
   */
  category: Category;

  /**
   * Operation type for this entry.
   * Values: 'income' | 'outcome'
   */
  operation_type: OperationType;

  /**
   * Total amount for this category and operation type.
   * Numeric value representing sum of all transactions.
   */
  total_amount: number;
}

/**
 * Top Categories Response - Array of top categories sorted by amount
 *
 * Returns the top N categories by total amount, filtered by operation type,
 * business type, and optional date range. Used in comparative B2B vs B2C tables.
 *
 * Used by: GET /api/metrics/categories/top
 *
 * Query parameters:
 * - operation_type: 'income' | 'outcome' (default: 'outcome')
 * - limit: number (default: 5, range: 1-20)
 * - start_date: string | null (YYYY-MM-DD format, optional)
 * - end_date: string | null (YYYY-MM-DD format, optional)
 * - business_type: 'B2B' | 'B2C' | null (optional, filters by specific type)
 */
export type TopCategoriesResponse = CategoryEntry[];
