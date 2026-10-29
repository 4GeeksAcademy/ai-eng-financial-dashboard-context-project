import { describe, expect, it } from "vitest";

import { validateFinancialMovements } from "./financial-validation";

describe("validateFinancialMovements", () => {
  it("accepts an array of valid financial movements", () => {
    const movements = [
      {
        create_date: "2024-02-29",
        amount: 120.5,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
    ];

    expect(validateFinancialMovements(movements)).toEqual(movements);
  });

  it("rejects malformed API data", () => {
    expect(() =>
      validateFinancialMovements([
        {
          create_date: "2024-02-30",
          amount: "120.50",
          operation_type: "credit",
          category: "sales",
          business_type: "B2B",
        },
      ]),
    ).toThrow("Invalid financial movements response");
  });
});