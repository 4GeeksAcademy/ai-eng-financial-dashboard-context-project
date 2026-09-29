import { describe, expect, it } from "vitest";

import {
  computeKPIs,
  computeKPIsFromSummary,
  computeMonthlyData,
  computeMonthlyDataFromSummary,
  formatCurrency,
  formatPercent,
} from "./financial-utils";
import type { FinancialMovement, MetricsSummaryItem } from "./financial-types";

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

const sampleSummary: MetricsSummaryItem[] = [
  { period: "2024-01", income: 1000, outcome: 250, net: 750 },
  { period: "2024-02", income: 500, outcome: 0, net: 500 },
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
});

describe("computeMonthlyData", () => {
  it("keeps the first day of a month in its ISO month", () => {
    const monthlyData = computeMonthlyData([
      {
        create_date: "2024-02-01",
        amount: 500,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
    ]);

    expect(monthlyData).toEqual([
      { month: "Feb 2024", income: 500, outcome: 0, profitPercent: 100 },
    ]);
  });

  it("returns zero profit margin for a month with no income", () => {
    const monthlyData = computeMonthlyData([
      {
        create_date: "2024-03-15",
        amount: 350,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
    ]);

    expect(monthlyData[0].profitPercent).toBe(0);
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

describe("summary transformations", () => {
  it("returns zeroed KPIs for an empty summary", () => {
    expect(computeKPIsFromSummary([])).toEqual({
      totalIncome: 0,
      totalOutcome: 0,
      profit: 0,
      profitPercent: 0,
    });
  });

  it("calculates KPIs from monthly totals", () => {
    expect(computeKPIsFromSummary(sampleSummary)).toEqual({
      totalIncome: 1500,
      totalOutcome: 250,
      profit: 1250,
      profitPercent: (1250 / 1500) * 100,
    });
  });

  it("maps API periods to chronological chart points", () => {
    expect(computeMonthlyDataFromSummary(sampleSummary)).toEqual([
      { month: "Jan 2024", income: 1000, outcome: 250, profitPercent: 75 },
      { month: "Feb 2024", income: 500, outcome: 0, profitPercent: 100 },
    ]);
  });

  it("returns zero profit margin when summary has no income", () => {
    const summary = [
      { period: "2024-03", income: 0, outcome: 350, net: -350 },
    ];

    expect(computeKPIsFromSummary(summary).profitPercent).toBe(0);
    expect(computeMonthlyDataFromSummary(summary)).toEqual([
      { month: "Mar 2024", income: 0, outcome: 350, profitPercent: 0 },
    ]);
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
