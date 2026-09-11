import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const UNAVAILABLE_PERIOD = "Period unavailable";

function formatDataPeriod(movements: FinancialMovement[]): string {
  if (movements.length === 0) return UNAVAILABLE_PERIOD;

  const dates = movements.map((movement) => movement.create_date).sort();
  const formatMonth = (value: string) =>
    new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  const firstMonth = formatMonth(dates[0]);
  const lastMonth = formatMonth(dates[dates.length - 1]);

  return firstMonth === lastMonth ? firstMonth : `${firstMonth} - ${lastMonth}`;
}

async function fetchFinancialData(signal: AbortSignal): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [period, setPeriod] = useState(UNAVAILABLE_PERIOD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchFinancialData(controller.signal)
      .then((movements) => {
        if (controller.signal.aborted) return;
        setPeriod(formatDataPeriod(movements));
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted || (requestError instanceof Error && requestError.name === "AbortError")) {
          return;
        }
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period={period} />

          {error ? (
            <div
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
            >
              {error}
            </div>
          ) : null}

          <h2 id="kpi-heading" className="sr-only">
            Key performance indicators
          </h2>
          <section aria-labelledby="kpi-heading">
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <h2 id="charts-heading" className="sr-only">
            Financial charts
          </h2>
          <section
            aria-labelledby="charts-heading"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <IncomeOutcomeChart data={monthlyData} loading={loading} />
            <ProfitPercentChart data={monthlyData} loading={loading} />
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
