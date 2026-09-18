import { lazy, Suspense, Component, type ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { useFinancialData } from "@/lib/use-financial-data";

// ---------------------------------------------------------------------------
// ErrorBoundary
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
          >
            Something went wrong rendering this section.
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Lazy-loaded chart components
// ---------------------------------------------------------------------------

const LazyIncomeOutcomeChart = lazy(
  () => import("@/components/dashboard/income-outcome-chart").then((m) => ({ default: m.IncomeOutcomeChart })),
);
const LazyProfitPercentChart = lazy(
  () => import("@/components/dashboard/profit-percent-chart").then((m) => ({ default: m.ProfitPercentChart })),
);

function App() {
  const { metrics, monthlyData, loading, error } = useFinancialData();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:inset-x-0 focus:top-2 focus:z-50 focus:mx-auto focus:w-fit focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <main id="main-content" className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period="2024 - Full Year" />

          <ErrorBoundary>
            {error ? (
              <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                {error}
              </div>
            ) : null}
          </ErrorBoundary>

          <section aria-label="Key performance indicators">
            <ErrorBoundary>
              <KPIRow metrics={metrics} loading={loading} />
            </ErrorBoundary>
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <ErrorBoundary>
              <Suspense fallback={<div className="h-75 rounded-lg bg-muted/30 animate-pulse" />}>
                <LazyIncomeOutcomeChart data={monthlyData} loading={loading} />
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary>
              <Suspense fallback={<div className="h-[300px] rounded-lg bg-muted/30 animate-pulse" />}>
                <LazyProfitPercentChart data={monthlyData} loading={loading} />
              </Suspense>
            </ErrorBoundary>
          </section>
        </div>
      </div>
    </main>
    </>
  );
}

export default App;
