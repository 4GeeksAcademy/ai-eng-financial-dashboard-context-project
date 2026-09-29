import { lazy, Suspense, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type MetricsSummaryItem,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import {
  computeKPIsFromSummary,
  computeMonthlyDataFromSummary,
} from "@/lib/financial-utils";

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

async function fetchFinancialSummary(
  signal: AbortSignal,
): Promise<MetricsSummaryItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/metrics/summary?group_by=month`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`La API respondio con HTTP ${response.status}.`);
  }
  return response.json();
}

const chartLoadingFallback = (
  <Card className="border-border/60" aria-hidden="true">
    <CardHeader className="pb-4">
      <Skeleton className="h-5 w-52" />
      <Skeleton className="h-3 w-64 mt-1" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </CardContent>
  </Card>
);

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchFinancialSummary(controller.signal)
      .then((summary) => {
        setMetrics(computeKPIsFromSummary(summary));
        setMonthlyData(computeMonthlyDataFromSummary(summary));
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;

        console.error("No se pudo cargar el resumen financiero:", cause);
        const detail = cause instanceof Error ? ` ${cause.message}` : "";
        setError(`No se pudo cargar la informacion financiera.${detail}`);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-lg focus:border focus:border-border focus:shadow-lg"
      >
        Skip to main content
      </a>
      <main id="main-content" className="dark min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8" aria-live="polite" aria-atomic="true">
            <DashboardHeader period="2024 - Full Year" />

            {error ? (
              <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                {error}
              </div>
            ) : null}

            <section
              aria-label="Key performance indicators"
              aria-busy={loading}
              role="region"
            >
              <KPIRow metrics={metrics} loading={loading} />
            </section>

            <section
              aria-label="Financial charts"
              aria-busy={loading}
              role="region"
              className="grid grid-cols-1 gap-4 xl:grid-cols-2"
            >
              <Suspense fallback={chartLoadingFallback}>
                <IncomeOutcomeChart data={monthlyData} loading={loading} />
              </Suspense>
              <Suspense fallback={chartLoadingFallback}>
                <ProfitPercentChart data={monthlyData} loading={loading} />
              </Suspense>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
