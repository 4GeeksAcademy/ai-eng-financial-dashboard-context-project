import { describe, expect, it } from "vitest";

import { computeCategoryShares } from "./category-share";
import type { TopCategoryItem } from "./financial-types";

describe("computeCategoryShares", () => {
  it("computes each category's percent of the group total", () => {
    const items: TopCategoryItem[] = [
      { category: "sales", operation_type: "income", total_amount: 75 },
      { category: "others", operation_type: "income", total_amount: 25 },
    ];

    expect(computeCategoryShares(items)).toEqual([
      { category: "sales", total_amount: 75, percent: 75 },
      { category: "others", total_amount: 25, percent: 25 },
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(computeCategoryShares([])).toEqual([]);
  });

  it("gives a single category 100 percent", () => {
    const items: TopCategoryItem[] = [
      { category: "suppliers", operation_type: "outcome", total_amount: 4200 },
    ];

    expect(computeCategoryShares(items)).toEqual([
      { category: "suppliers", total_amount: 4200, percent: 100 },
    ]);
  });

  it("forces percent to 0 when the group total is 0", () => {
    const items: TopCategoryItem[] = [
      { category: "sales", operation_type: "income", total_amount: 0 },
      { category: "others", operation_type: "income", total_amount: 0 },
    ];

    expect(computeCategoryShares(items)).toEqual([
      { category: "sales", total_amount: 0, percent: 0 },
      { category: "others", total_amount: 0, percent: 0 },
    ]);
  });
});
