import { lazy, Suspense, useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AlertThresholdInput } from "@/components/dashboard/alert-threshold-input";
import { AnomalyAlertsTable } from "@/components/dashboard/anomaly-alerts-table";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { fetchAlerts, fetchFacets, fetchMovements } from "@/lib/api";
import {
  type AlertResponse,
  type DateRangeFilter as DateRangeValue,
  type FacetsResponse,
  type KPIMetrics,
  type MonthlyDataPoint,
  type DashboardView,
} from "@/lib/financial-types";
import {
  ALERT_THRESHOLD_DEFAULT,
  computeKPIs,
  computeMonthlyData,
  formatMonthRange,
} from "@/lib/financial-utils";

// Charts and the secondary comparison view pull in Recharts. Load them on demand
// so the initial dashboard shell becomes interactive without waiting for that bundle.
const ComparisonPage = lazy(() =>
  import("@/components/comparison/comparison-page").then((module) => ({
    default: module.ComparisonPage,
  })),
);
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

function ChartLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard visualizations"
      className="h-[280px] rounded-xl border border-border bg-card"
    />
  );
}

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeValue>({});
  const [facets, setFacets] = useState<FacetsResponse | null>(null);
  const [facetsLoading, setFacetsLoading] = useState(true);
  const [threshold, setThreshold] = useState(ALERT_THRESHOLD_DEFAULT);
  const [alerts, setAlerts] = useState<AlertResponse>([]);
  const [alertsThreshold, setAlertsThreshold] = useState(ALERT_THRESHOLD_DEFAULT);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [view, setView] = useState<DashboardView>(() =>
    window.location.hash === "#/comparison" ? "comparison" : "overview",
  );

  useEffect(() => {
    const handleHashChange = () => {
      setView(window.location.hash === "#/comparison" ? "comparison" : "overview");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchFacets(controller.signal)
      .then(setFacets)
      .catch(() => {
        // Leaving facets null makes the filter show "range unavailable".
      })
      .finally(() => {
        if (!controller.signal.aborted) setFacetsLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const selectedDateRange: DateRangeValue = {
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    };
    fetchMovements(selectedDateRange, controller.signal)
      .then((movements) => {
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
        setError(null);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [dateRange.start_date, dateRange.end_date]);

  useEffect(() => {
    const controller = new AbortController();
    const selectedDateRange: DateRangeValue = {
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    };
    fetchAlerts({ threshold, ...selectedDateRange }, controller.signal)
      .then((result) => {
        setAlerts(result);
        setAlertsThreshold(threshold);
        setAlertsError(null);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setAlertsError("No se pudieron cargar las alertas de gasto.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setAlertsLoading(false);
      });
    return () => controller.abort();
  }, [threshold, dateRange.start_date, dateRange.end_date]);

  function handleDateRangeChange(next: DateRangeValue) {
    setLoading(true);
    setAlertsLoading(true);
    setDateRange(next);
  }

  function handleThresholdChange(next: number) {
    setAlertsLoading(true);
    setThreshold(next);
  }

  const isEmpty = !loading && !error && monthlyData.length === 0;

  return (
    <main
      className="dark min-h-screen bg-background text-foreground"
      aria-busy={loading || alertsLoading || facetsLoading}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader
            period={view === "comparison" ? "B2B vs B2C" : loading ? "Loading..." : formatMonthRange(monthlyData)}
            nav={<DashboardNav current={view} onNavigate={setView} />}
          />

          {view === "comparison" ? (
            <Suspense fallback={<ChartLoadingFallback />}>
              <ComparisonPage
                dateRange={dateRange}
                facets={facets}
                facetsLoading={facetsLoading}
                onDateRangeChange={handleDateRangeChange}
              />
            </Suspense>
          ) : (
            <DateRangeFilter
              value={dateRange}
              onChange={handleDateRangeChange}
              facets={facets}
              loading={facetsLoading}
            />
          )}

          {view === "overview" && error ? (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          {view === "overview" && isEmpty ? (
            <div role="status" className="rounded-lg border border-border bg-secondary p-4 text-sm text-secondary-foreground">
              No movements in the selected range.
            </div>
          ) : null}

          {view === "overview" ? <section aria-label="Key performance indicators">
            <KPIRow metrics={metrics} loading={loading} />
          </section> : null}

          {view === "overview" ? <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <Suspense fallback={<ChartLoadingFallback />}>
              <IncomeOutcomeChart data={monthlyData} loading={loading} />
              <ProfitPercentChart data={monthlyData} loading={loading} />
            </Suspense>
          </section> : null}

          {view === "overview" ? <section aria-label="Spending anomalies" className="flex flex-col gap-4">
            {alertsError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                {alertsError}
              </div>
            ) : null}
            <AnomalyAlertsTable
              alerts={alerts}
              threshold={alertsThreshold}
              loading={alertsLoading}
              controls={
                <AlertThresholdInput
                  key={threshold}
                  value={threshold}
                  onChange={handleThresholdChange}
                />
              }
            />
          </section> : null}
        </div>
      </div>
    </main>
  );
}

export default App;
