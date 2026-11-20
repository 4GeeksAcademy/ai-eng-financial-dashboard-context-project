import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "./financial-types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

function toYearMonthKey(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthYearLabel(yearMonthKey: string): string {
  const [yearText, monthText] = yearMonthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  return monthYearFormatter.format(new Date(year, month, 1));
}

export interface FinancialSummary {
  metrics: KPIMetrics;
  monthlyData: MonthlyDataPoint[];
}

export function computeFinancialSummary(
  movements: FinancialMovement[],
): FinancialSummary {
  let totalIncome = 0;
  let totalOutcome = 0;
  const monthlyMap: Record<string, { income: number; outcome: number }> = {};

  for (const movement of movements) {
    const yearMonthKey = toYearMonthKey(new Date(movement.create_date));
    const monthlyTotals = monthlyMap[yearMonthKey] ??= { income: 0, outcome: 0 };

    if (movement.operation_type === "income") {
      totalIncome += movement.amount;
      monthlyTotals.income += movement.amount;
    } else {
      totalOutcome += movement.amount;
      monthlyTotals.outcome += movement.amount;
    }
  }

  const profit = totalIncome - totalOutcome;
  const metrics = {
    totalIncome,
    totalOutcome,
    profit,
    profitPercent: totalIncome > 0 ? (profit / totalIncome) * 100 : 0,
  };

  const monthlyData = Object.keys(monthlyMap)
    .sort()
    .map((yearMonthKey) => {
      const { income, outcome } = monthlyMap[yearMonthKey];
      const monthlyProfit = income - outcome;
      const profitPercent = income > 0 ? (monthlyProfit / income) * 100 : 0;
      return {
        month: formatMonthYearLabel(yearMonthKey),
        income,
        outcome,
        profitPercent,
      };
    });

  return { metrics, monthlyData };
}

export function computeKPIs(movements: FinancialMovement[]): KPIMetrics {
  return computeFinancialSummary(movements).metrics;
}

export function computeMonthlyData(
  movements: FinancialMovement[],
): MonthlyDataPoint[] {
  return computeFinancialSummary(movements).monthlyData;
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
