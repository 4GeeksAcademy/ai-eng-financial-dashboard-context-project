import {
  type TopCategoriesQuery,
  type TopCategoryItem,
} from "./financial-types";

// Same access pattern as App.tsx:13 — read with a fallback (.agents/rules/docker-and-env-vars.md R2).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const DEFAULT_LIMIT = 20;

/**
 * GET /api/metrics/categories/top (backend/app/routes.py:287-302).
 *
 * Follows the native-fetch pattern of App.tsx: no HTTP client, throw on a
 * non-ok response, return the parsed body. The caller wires the rejection into
 * the existing `error` state / fixed message (no console.error here).
 *
 * - `operation_type` is always sent explicitly — the API default is 'outcome',
 *   so an income ranking must ask for 'income' (routes.py:289).
 * - `limit` defaults to 20 (returns every category, so a share denominator is
 *   the real group total). An explicit value is sent as-is; the API validates
 *   its 1..20 range (routes.py:290) and returns 422 for anything outside it.
 * - `start_date` / `end_date` / `business_type` are appended only when defined;
 *   an omitted optional param is never sent as `null` (frontend/specs/param-types.ts:9-13).
 */
export async function fetchTopCategories(
  query: TopCategoriesQuery,
): Promise<TopCategoryItem[]> {
  const params = new URLSearchParams();
  params.set("operation_type", query.operation_type);
  params.set("limit", String(query.limit ?? DEFAULT_LIMIT));
  if (query.start_date !== undefined) {
    params.set("start_date", query.start_date);
  }
  if (query.end_date !== undefined) {
    params.set("end_date", query.end_date);
  }
  if (query.business_type !== undefined) {
    params.set("business_type", query.business_type);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/metrics/categories/top?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch top categories: ${response.status}`);
  }
  return response.json();
}
