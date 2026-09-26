import { useEffect, useState } from "react";
import { ComparisonPage } from "@/components/comparison/comparison-page";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AlertThresholdInput } from "@/components/dashboard/alert-threshold-input";
import { AnomalyAlertsTable } from "@/components/dashboard/anomaly-alerts-table";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
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
    fetchMovements(dateRange, controller.signal)
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
  }, [dateRange]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAlerts({ threshold, ...dateRange }, controller.signal)
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
  }, [threshold, dateRange]);

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
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader
            period={view === "comparison" ? "B2B vs B2C" : loading ? "Loading..." : formatMonthRange(monthlyData)}
            nav={<DashboardNav current={view} onNavigate={setView} />}
          />

          {view === "comparison" ? (
            <ComparisonPage
              dateRange={dateRange}
              facets={facets}
              facetsLoading={facetsLoading}
              onDateRangeChange={handleDateRangeChange}
            />
          ) : (
            <DateRangeFilter
              value={dateRange}
              onChange={handleDateRangeChange}
              facets={facets}
              loading={facetsLoading}
            />
          )}

          {view === "overview" && error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          {view === "overview" && isEmpty ? (
            <div className="rounded-lg border border-border bg-secondary p-4 text-sm text-secondary-foreground">
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
            <IncomeOutcomeChart data={monthlyData} loading={loading} />
            <ProfitPercentChart data={monthlyData} loading={loading} />
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
