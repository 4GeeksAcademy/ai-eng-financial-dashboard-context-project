import { afterEach, describe, expect, it, vi } from "vitest";

import {
  computeKPIs,
  computeMonthlyData,
  formatCurrency,
  formatPercent,
  formatPeriodRange,
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
});

describe("computeMonthlyData", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps a date on the 1st in its own month in timezones behind UTC", () => {
    vi.stubEnv("TZ", "America/Santiago");
    const movements: FinancialMovement[] = [
      {
        create_date: "2026-03-01",
        amount: 100,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
      {
        create_date: "2026-03-15",
        amount: 40,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
    ];

    expect(computeMonthlyData(movements)).toEqual([
      { month: "Mar 2026", income: 100, outcome: 40, profitPercent: 60 },
    ]);
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

describe("formatters", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("formats a period range from its first and last month", () => {
    expect(formatPeriodRange("2025-11-15", "2026-10-28")).toBe(
      "Nov 2025 - Oct 2026",
    );
  });

  it("keeps a period starting on the 1st in timezones behind UTC", () => {
    vi.stubEnv("TZ", "America/Santiago");

    expect(formatPeriodRange("2025-11-01", "2026-10-01")).toBe(
      "Nov 2025 - Oct 2026",
    );
  });

  it("formats a period within one month as a single label", () => {
    expect(formatPeriodRange("2026-03-01", "2026-03-28")).toBe("Mar 2026");
  });

  it("formats currency without decimals", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });

  it("formats percent with one decimal", () => {
    expect(formatPercent(15.555)).toBe("15.6%");
  });
});
