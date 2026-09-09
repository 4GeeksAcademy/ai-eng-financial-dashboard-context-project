import {
  type CategoryShare,
  type TopCategoryItem,
} from "./financial-types";

/**
 * Turn a /api/metrics/categories/top response into per-category shares.
 *
 * The endpoint returns neither a percentage nor a group total, so the caller
 * computes them (backend/app/routes.py:200-208). `percent` is each category's
 * cut of the summed `total_amount` and is forced to 0 when that sum is 0,
 * mirroring the divide-by-zero guard in financial-utils.ts:31,59.
 *
 * Items are returned in the order received (the API already sorts them by
 * `total_amount` descending); this function does not re-sort.
 */
export function computeCategoryShares(
  items: TopCategoryItem[],
): CategoryShare[] {
  const total = items.reduce((sum, item) => sum + item.total_amount, 0);
  return items.map((item) => ({
    category: item.category,
    total_amount: item.total_amount,
    percent: total > 0 ? (item.total_amount / total) * 100 : 0,
  }));
}
