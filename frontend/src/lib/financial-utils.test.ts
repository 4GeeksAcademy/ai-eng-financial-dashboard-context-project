import { describe, expect, it } from "vitest";

import {
  computeKPIs,
  computeMonthlyData,
  formatCurrency,
  formatPeriodRange,
  formatPercent,
} from "./financial-utils";
import type { FinancialMovement } from "./financial-types";

const sampleMovements: FinancialMovement[] = [
  {
    create_date: "2024-01-10",
    amount: 1000,
    operation_type: "income",
    category: "sales",
    business_type: "B2B",
  },
  {
    create_date: "2024-01-15",
    amount: 250,
    operation_type: "outcome",
    category: "suppliers",
    business_type: "B2B",
  },
  {
    create_date: "2024-02-01",
    amount: 500,
    operation_type: "income",
    category: "sales",
    business_type: "B2C",
  },
];

describe("computeKPIs", () => {
  it("returns zero metrics when there are no movements", () => {
    expect(computeKPIs([])).toEqual({
      totalIncome: 0,
      totalOutcome: 0,
      profit: 0,
      profitPercent: 0,
    });
  });

  it("calculates totals and profit values", () => {
    const metrics = computeKPIs(sampleMovements);

    expect(metrics).toEqual({
      totalIncome: 1500,
      totalOutcome: 250,
      profit: 1250,
      profitPercent: (1250 / 1500) * 100,
    });
  });

  it("returns 0 profitPercent when there is no income", () => {
    const onlyOutcomes: FinancialMovement[] = [
      {
        create_date: "2024-03-05",
        amount: 350,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
    ];

    const metrics = computeKPIs(onlyOutcomes);
    expect(metrics.profitPercent).toBe(0);
  });
});

describe("computeMonthlyData", () => {
  it("preserves calendar months at month and year boundaries", () => {
    const movements: FinancialMovement[] = [
      { ...sampleMovements[0], create_date: "2025-12-31", amount: 100 },
      { ...sampleMovements[0], create_date: "2026-01-01", amount: 200 },
      { ...sampleMovements[1], create_date: "2026-01-31", amount: 50 },
      { ...sampleMovements[0], create_date: "2026-02-01", amount: 300 },
    ];
    const monthlyData = computeMonthlyData(movements);

    expect(monthlyData).toEqual([
      { month: "Dec 2025", income: 100, outcome: 0, profitPercent: 100 },
      { month: "Jan 2026", income: 200, outcome: 50, profitPercent: 75 },
      { month: "Feb 2026", income: 300, outcome: 0, profitPercent: 100 },
    ]);
    expect(formatPeriodRange(monthlyData)).toBe("Dec 2025 - Feb 2026");
  });

  it("returns no monthly points for empty movements", () => {
    expect(computeMonthlyData([])).toEqual([]);
  });

  it("returns chronological year-month points with aggregated totals", () => {
    const unsortedCrossYearMovements: FinancialMovement[] = [
      {
        create_date: "2026-01-08",
        amount: 300,
        operation_type: "income",
        category: "sales",
        business_type: "B2C",
      },
      {
        create_date: "2025-12-05",
        amount: 200,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
      {
        create_date: "2025-12-03",
        amount: 1000,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
    ];
    const monthlyData = computeMonthlyData(unsortedCrossYearMovements);

    expect(monthlyData).toHaveLength(2);
    expect(monthlyData[0]).toEqual({
      month: "Dec 2025",
      income: 1000,
      outcome: 200,
      profitPercent: 80,
    });
    expect(monthlyData[1]).toEqual({
      month: "Jan 2026",
      income: 300,
      outcome: 0,
      profitPercent: 100,
    });
  });
});

describe("formatPeriodRange", () => {
  it("formats the first and last available months", () => {
    expect(formatPeriodRange(computeMonthlyData(sampleMovements))).toBe(
      "Jan 2024 - Feb 2024",
    );
  });

  it("reports when period data is unavailable", () => {
    expect(formatPeriodRange([])).toBe("Period unavailable");
  });
});

describe("formatters", () => {
  it("formats currency without decimals", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });

  it("formats percent with one decimal", () => {
    expect(formatPercent(15.555)).toBe("15.6%");
  });
});
