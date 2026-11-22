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
import {
  computeKPIs,
  computeMonthlyData,
  formatPeriodRange,
} from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFinancialMovement(value: unknown): value is FinancialMovement {
  if (!isRecord(value)) return false;

  const validDate =
    typeof value.create_date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.create_date) &&
    !Number.isNaN(Date.parse(`${value.create_date}T00:00:00Z`));

  return (
    validDate &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    (value.operation_type === "income" || value.operation_type === "outcome") &&
    (value.category === "suppliers" ||
      value.category === "sales" ||
      value.category === "operational" ||
      value.category === "administrative" ||
      value.category === "others") &&
    (value.business_type === "B2B" || value.business_type === "B2C")
  );
}

function isFinancialMovementArray(value: unknown): value is FinancialMovement[] {
  return Array.isArray(value) && value.every(isFinancialMovement);
}

async function fetchFinancialData(signal?: AbortSignal): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  const payload: unknown = await response.json();
  if (!isFinancialMovementArray(payload)) {
    throw new TypeError("Invalid financial metrics response");
  }
  return payload;
}

function App() {
  const [dashboardData, setDashboardData] = useState<{
    metrics: KPIMetrics | null;
    monthlyData: MonthlyDataPoint[];
  }>({ metrics: null, monthlyData: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { metrics, monthlyData } = dashboardData;
  const period = loading ? "Loading..." : formatPeriodRange(monthlyData);

  useEffect(() => {
    const controller = new AbortController();

    fetchFinancialData(controller.signal)
      .then((movements) => {
        setDashboardData({
          metrics: computeKPIs(movements),
          monthlyData: computeMonthlyData(movements),
        });
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <main id="main-content" tabIndex={-1} className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period={period} loading={loading} />

          {error ? (
            <div lang="es" role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          <section aria-label="Key performance indicators" lang="en">
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            lang="en"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <IncomeOutcomeChart data={monthlyData} loading={loading} />
            <ProfitPercentChart data={monthlyData} loading={loading} />
          </section>
        </div>
      </div>
      </main>
    </>
  );
}

export default App;
