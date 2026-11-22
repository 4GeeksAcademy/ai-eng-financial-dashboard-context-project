import { lazy, Suspense, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { type FinancialMovement } from "@/lib/financial-types";
import {
  computeFinancialSummary,
  type FinancialSummary,
} from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

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

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinancialData()
      .then((movements) => {
        setSummary(computeFinancialSummary(movements));
      })
      .catch(() => {
        setError(
          "Unable to load financial information. Please check the backend API.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {loading ? (
            <p role="status" className="sr-only">
              Loading financial information.
            </p>
          ) : null}

          <DashboardHeader period="2024 - Full Year" />

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
            >
              {error}
            </div>
          ) : null}

          <section aria-label="Key performance indicators">
            <KPIRow metrics={summary?.metrics ?? null} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <Suspense fallback={<ChartLoadingFallback />}>
              <IncomeOutcomeChart data={summary?.monthlyData ?? []} loading={loading} />
            </Suspense>
            <Suspense fallback={<ChartLoadingFallback />}>
              <ProfitPercentChart data={summary?.monthlyData ?? []} loading={loading} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}

function ChartLoadingFallback() {
  return (
    <div
      role="status"
      className="flex h-[380px] items-center justify-center rounded-lg border border-border/60 bg-card text-sm text-muted-foreground"
    >
      Loading financial chart.
    </div>
  );
}

export default App;
