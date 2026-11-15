import { describe, expect, it } from "vitest";

import {
  computeKPIs,
  computeMonthlyData,
  formatCurrency,
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

  it("returns zeroed metrics for an empty list", () => {
    expect(computeKPIs([])).toEqual({
      totalIncome: 0,
      totalOutcome: 0,
      profit: 0,
      profitPercent: 0,
    });
  });

  it("reports a negative profit when outcomes exceed income", () => {
    const metrics = computeKPIs([
      {
        create_date: "2024-04-02",
        amount: 400,
        operation_type: "income",
        category: "sales",
        business_type: "B2C",
      },
      {
        create_date: "2024-04-03",
        amount: 1000,
        operation_type: "outcome",
        category: "administrative",
        business_type: "B2B",
      },
    ]);

    expect(metrics.profit).toBe(-600);
    expect(metrics.profitPercent).toBe(-150);
  });

  it("reports 100% profit when there are only incomes", () => {
    const metrics = computeKPIs([
      {
        create_date: "2024-05-07",
        amount: 800,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
    ]);

    expect(metrics).toEqual({
      totalIncome: 800,
      totalOutcome: 0,
      profit: 800,
      profitPercent: 100,
    });
  });
});

describe("computeMonthlyData", () => {
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

describe("formatters", () => {
  it("formats currency without decimals", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });

  it("formats percent with one decimal", () => {
    expect(formatPercent(15.555)).toBe("15.6%");
  });
});
