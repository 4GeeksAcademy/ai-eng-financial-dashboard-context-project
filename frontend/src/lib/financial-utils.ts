import {
  type FinancialMovement,
  type KPIMetrics,
  type MetricsSummaryItem,
  type MonthlyDataPoint,
} from "./financial-types";

function toYearMonthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

function formatMonthYearLabel(yearMonthKey: string): string {
  const [yearText, monthText] = yearMonthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function computeKPIs(movements: FinancialMovement[]): KPIMetrics {
  const totalIncome = movements
    .filter((m) => m.operation_type === "income")
    .reduce((sum, m) => sum + m.amount, 0);

  const totalOutcome = movements
    .filter((m) => m.operation_type === "outcome")
    .reduce((sum, m) => sum + m.amount, 0);

  const profit = totalIncome - totalOutcome;
  const profitPercent = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

  return { totalIncome, totalOutcome, profit, profitPercent };
}

export function computeMonthlyData(
  movements: FinancialMovement[],
): MonthlyDataPoint[] {
  const monthlyMap: Record<string, { income: number; outcome: number }> = {};

  for (const m of movements) {
    const yearMonthKey = toYearMonthKey(m.create_date);
    if (!monthlyMap[yearMonthKey]) {
      monthlyMap[yearMonthKey] = { income: 0, outcome: 0 };
    }

    if (m.operation_type === "income") {
      monthlyMap[yearMonthKey].income += m.amount;
    } else {
      monthlyMap[yearMonthKey].outcome += m.amount;
    }
  }

  return Object.keys(monthlyMap)
    .sort()
    .map((yearMonthKey) => {
      const { income, outcome } = monthlyMap[yearMonthKey];
      const profit = income - outcome;
      const profitPercent = income > 0 ? (profit / income) * 100 : 0;
      return {
        month: formatMonthYearLabel(yearMonthKey),
        income,
        outcome,
        profitPercent,
      };
    });
}

export function computeKPIsFromSummary(
  summary: MetricsSummaryItem[],
): KPIMetrics {
  const totals = summary.reduce(
    (accumulator, item) => ({
      totalIncome: accumulator.totalIncome + item.income,
      totalOutcome: accumulator.totalOutcome + item.outcome,
    }),
    { totalIncome: 0, totalOutcome: 0 },
  );
  const profit = totals.totalIncome - totals.totalOutcome;
  const profitPercent = totals.totalIncome > 0
    ? (profit / totals.totalIncome) * 100
    : 0;

  return { ...totals, profit, profitPercent };
}

export function computeMonthlyDataFromSummary(
  summary: MetricsSummaryItem[],
): MonthlyDataPoint[] {
  return summary.map(({ period, income, outcome }) => {
    const profit = income - outcome;
    return {
      month: formatMonthYearLabel(period),
      income,
      outcome,
      profitPercent: income > 0 ? (profit / income) * 100 : 0,
    };
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
