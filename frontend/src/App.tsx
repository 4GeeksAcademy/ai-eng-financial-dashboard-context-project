import { lazy, Suspense, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

const IncomeOutcomeChart = lazy(() =>
  import("@/components/dashboard/income-outcome-chart").then((module) => ({
    default: module.IncomeOutcomeChart,
  })),
);
const ProfitPercentChart = lazy(() =>
  import("@/components/dashboard/profit-percent-chart").then((module) => ({
    default: module.ProfitPercentChart,
  })),
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

function ChartLoadingSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-6 rounded-xl border border-border/60 bg-card py-6 shadow-sm"
    >
      <div className="grid gap-2 px-6">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="px-6">
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>
    </div>
  );
}

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinancialData()
      .then((movements) => {
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
      })
      .catch(() => {
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        Skip to dashboard content
      </a>
      <div
        id="dashboard-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-8">
          <DashboardHeader period="2024 - Full Year" />

          {loading ? (
            <p className="sr-only" role="status">
              Loading financial dashboard
            </p>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
            >
              {error}
            </div>
          ) : null}

          <section aria-label="Key performance indicators" aria-busy={loading}>
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <ChartLoadingSkeleton />
                <ChartLoadingSkeleton />
              </>
            ) : (
              <Suspense
                fallback={
                  <>
                    <ChartLoadingSkeleton />
                    <ChartLoadingSkeleton />
                  </>
                }
              >
                <IncomeOutcomeChart data={monthlyData} />
                <ProfitPercentChart data={monthlyData} />
              </Suspense>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
