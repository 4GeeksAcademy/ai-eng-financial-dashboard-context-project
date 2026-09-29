/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { MonthlyDataPoint } from "@/lib/financial-types";
import { IncomeOutcomeChart } from "./income-outcome-chart";
import { ProfitPercentChart } from "./profit-percent-chart";

afterEach(cleanup);

const monthlyData: MonthlyDataPoint[] = [
  { month: "Jan 2024", income: 1000, outcome: 250, profitPercent: 75 },
];

describe("dashboard chart states", () => {
  it("renders a stable loading skeleton for both charts", () => {
    const { container } = render(
      <>
        <IncomeOutcomeChart data={[]} loading />
        <ProfitPercentChart data={[]} loading />
      </>,
    );

    expect(container.querySelectorAll('[data-slot="skeleton"]').length)
      .toBeGreaterThan(0);
  });

  it("announces empty data for each chart", () => {
    render(
      <>
        <IncomeOutcomeChart data={[]} />
        <ProfitPercentChart data={[]} />
      </>,
    );

    expect(screen.getAllByRole("status")).toHaveLength(2);
    expect(screen.getAllByText("No data available to display")).toHaveLength(2);
  });

  it("exposes chart data in accessible tables", () => {
    render(
      <>
        <IncomeOutcomeChart data={monthlyData} />
        <ProfitPercentChart data={monthlyData} />
      </>,
    );

    expect(screen.getByRole("table", { name: "Income vs Outcome monthly data" }))
      .toBeTruthy();
    expect(screen.getByRole("table", { name: "Profit margin percentage monthly data" }))
      .toBeTruthy();
    expect(screen.getByText("Income: $1,000")).toBeTruthy();
    expect(screen.getByText("Outcome: $250")).toBeTruthy();
    expect(screen.getByText("Profit margin: 75.0%")).toBeTruthy();
  });
});