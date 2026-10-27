import { Suspense, lazy, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow, KPIRowSkeleton } from "@/components/dashboard/kpi-row";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData, computePeriodLabel } from "@/lib/financial-utils";

// recharts is the largest dependency (~most of the main chunk). Lazy-load the
// chart components so recharts is code-split into its own async chunk instead
// of blocking first paint (vercel-react-best-practices: bundle-dynamic-imports).
const IncomeOutcomeChart = lazy(() =>
  import("@/components/dashboard/income-outcome-chart").then((m) => ({
    default: m.IncomeOutcomeChart,
  })),
);

const ProfitPercentChart = lazy(() =>
  import("@/components/dashboard/profit-percent-chart").then((m) => ({
    default: m.ProfitPercentChart,
  })),
);

// Matches the chart cards' loading skeleton so layout doesn't shift while the
// recharts chunk loads.
function ChartFallback() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-3 w-64 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

// Warm up the lazily-loaded chart chunks in parallel with the data fetch so the
// heavy recharts chunk downloads while /api/metrics is in flight instead of
// serially after it (vercel-react-best-practices: bundle-preload, async-parallel).
// The dynamic import urls here match React.lazy's factories above, so the module
// is fetched once and the lazy() render reuses the cached chunk.
function preloadCharts() {
  if (typeof window === "undefined") return;
  void import("@/components/dashboard/income-outcome-chart");
  void import("@/components/dashboard/profit-percent-chart");
}

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [period, setPeriod] = useState("Full Period");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Start the lazy chart chunks downloading in parallel with the API call.
    preloadCharts();

    fetchFinancialData()
      .then((movements) => {
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
        setPeriod(computePeriodLabel(movements));
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period={period} />

          {/* Visually hidden live region announces async content changes to screen readers (WCAG 4.1.3) */}
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {loading
              ? "Loading financial dashboard data"
              : error
                ? "Failed to load financial dashboard data"
                : "Financial dashboard data loaded"}
          </p>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
            >
              {error}
            </div>
          ) : null}

          <section aria-label="Key performance indicators">
            {loading ? <KPIRowSkeleton /> : metrics ? <KPIRow metrics={metrics} /> : null}
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <Suspense fallback={<ChartFallback />}>
              <IncomeOutcomeChart data={monthlyData} />
            </Suspense>
            <Suspense fallback={<ChartFallback />}>
              <ProfitPercentChart data={monthlyData} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
