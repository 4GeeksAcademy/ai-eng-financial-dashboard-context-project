import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { BusinessComparison } from "@/components/dashboard/business-comparison";
import { OutcomeAlerts } from "@/components/dashboard/outcome-alerts";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import {
  type FinancialMovement,
  type DateRange,
  type KPIMetrics,
  type MetricsAlert,
  type MetricsFacets,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(
  range: DateRange,
  signal: AbortSignal,
): Promise<FinancialMovement[]> {
  const params = new URLSearchParams();
  if (range.startDate) params.set("start_date", range.startDate);
  if (range.endDate) params.set("end_date", range.endDate);
  const query = params.size > 0 ? `?${params.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/api/metrics${query}`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

async function fetchMetricsFacets(signal: AbortSignal): Promise<MetricsFacets> {
  const response = await fetch(`${API_BASE_URL}/api/metrics/facets`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch date range: ${response.status}`);
  }
  return response.json();
}

async function fetchOutcomeAlerts(
  range: DateRange,
  threshold: number,
  signal: AbortSignal,
): Promise<MetricsAlert[]> {
  const params = new URLSearchParams({
    threshold: String(threshold),
    group_by: "month",
  });
  if (range.startDate) params.set("start_date", range.startDate);
  if (range.endDate) params.set("end_date", range.endDate);
  const response = await fetch(`${API_BASE_URL}/api/metrics/alerts?${params}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [activeView, setActiveView] = useState<"dashboard" | "comparison">("dashboard");
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [facets, setFacets] = useState<MetricsFacets | null>(null);
  const [facetsLoading, setFacetsLoading] = useState(true);
  const [facetsError, setFacetsError] = useState<string | null>(null);
  const [thresholdInput, setThresholdInput] = useState("0.3");
  const [alerts, setAlerts] = useState<MetricsAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchMetricsFacets(controller.signal)
      .then(setFacets)
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setFacetsError("Could not load the available date range.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setFacetsLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (
      dateRange.startDate &&
      dateRange.endDate &&
      dateRange.startDate > dateRange.endDate
    ) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchFinancialData(dateRange, controller.signal)
      .then((movements) => {
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
      })
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === "AbortError") return;
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
    const threshold = Number(thresholdInput);
    if (
      dateRange.startDate &&
      dateRange.endDate &&
      dateRange.startDate > dateRange.endDate
    ) return;
    if (
      thresholdInput === "" ||
      threshold < 0.01 ||
      threshold > 1
    ) return;

    const controller = new AbortController();
    setAlertsLoading(true);
    setAlertsError(null);
    fetchOutcomeAlerts(dateRange, threshold, controller.signal)
      .then(setAlerts)
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setAlertsError("Could not load outcome alerts.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setAlertsLoading(false);
      });

    return () => controller.abort();
  }, [dateRange, thresholdInput]);

  const periodStart = dateRange.startDate ?? facets?.min_date;
  const periodEnd = dateRange.endDate ?? facets?.max_date;
  const dateRangeInvalid = Boolean(
    dateRange.startDate &&
      dateRange.endDate &&
      dateRange.startDate > dateRange.endDate,
  );
  const period = periodStart && periodEnd
    ? `${periodStart} - ${periodEnd}`
    : "All available dates";
  const thresholdInvalid =
    thresholdInput === "" || parsedThreshold < 0.01 || parsedThreshold > 1;

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period={period} />

          <DateRangeFilter
            range={dateRange}
            facets={facets}
            facetsLoading={facetsLoading}
            facetsError={facetsError}
            onChange={setDateRange}
          />

          <nav aria-label="Dashboard views" className="flex gap-2 border-b border-border">
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "dashboard"}
              onClick={() => setActiveView("dashboard")}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${activeView === "dashboard" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
            >
              Overview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "comparison"}
              onClick={() => setActiveView("comparison")}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${activeView === "comparison" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
            >
              B2B vs B2C
            </button>
          </nav>

          {activeView === "dashboard" ? (
            <>
              {error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                  {error}
                </div>
              ) : null}

              <section aria-label="Key performance indicators">
                <KPIRow
                  metrics={dateRangeInvalid ? null : metrics}
                  loading={loading && !dateRangeInvalid}
                />
              </section>

              <section
                aria-label="Financial charts"
                className="grid grid-cols-1 gap-4 xl:grid-cols-2"
              >
                <IncomeOutcomeChart
                  data={dateRangeInvalid ? [] : monthlyData}
                  loading={loading && !dateRangeInvalid}
                />
                <ProfitPercentChart
                  data={dateRangeInvalid ? [] : monthlyData}
                  loading={loading && !dateRangeInvalid}
                />
              </section>

              <OutcomeAlerts
                threshold={thresholdInput}
                alerts={alerts}
                loading={alertsLoading && !dateRangeInvalid && !thresholdInvalid}
                error={dateRangeInvalid || thresholdInvalid ? null : alertsError}
                rangeInvalid={dateRangeInvalid}
                onThresholdChange={setThresholdInput}
              />
            </>
          ) : (
            <BusinessComparison
              range={dateRange}
              facets={facets}
              facetsLoading={facetsLoading}
              facetsError={facetsError}
              rangeInvalid={dateRangeInvalid}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
