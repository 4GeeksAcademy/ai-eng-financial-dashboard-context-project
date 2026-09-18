import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DollarSign } from "lucide-react";
import { KPICard } from "@/components/dashboard/kpi-card";

describe("KPICard", () => {
  it("renders label, value and helper text", () => {
    render(
      <KPICard
        label="Total Income"
        value="$10,000"
        helperText="Based on 2024 data"
        icon={DollarSign}
        variant="income"
      />,
    );

    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("$10,000")).toBeInTheDocument();
    expect(screen.getByText("Based on 2024 data")).toBeInTheDocument();
  });

  it("renders the icon with aria-hidden", () => {
    render(
      <KPICard
        label="Total Income"
        value="$10,000"
        helperText="Based on 2024 data"
        icon={DollarSign}
        variant="income"
      />,
    );

    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it('shows skeleton state when loading is true', () => {
    const { container } = render(
      <KPICard
        label="Total Income"
        value="$10,000"
        helperText="Based on 2024 data"
        icon={DollarSign}
        variant="income"
        loading
      />,
    );

    // In loading state the card should have aria-busy
    const card = container.querySelector('[aria-busy="true"]');
    expect(card).toBeInTheDocument();
  });
});