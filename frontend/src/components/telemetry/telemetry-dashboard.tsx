import { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import { EventsPerDayTable } from '@/components/telemetry/events-per-day-table'
import { RateCard } from '@/components/telemetry/rate-card'
import type { TelemetryReport } from '@/lib/telemetry-types'
import { fetchTelemetryReport } from '@/services/telemetry-report'
import { track } from '@/services/telemetry'

interface TelemetryDashboardProps {
  period?: string
}

function formatPeriod(from: string, to: string): string {
  return `${from.slice(0, 10)} → ${to.slice(0, 10)}`
}

function sumCounts(rows: { event_count: number }[]): number {
  return rows.reduce((acc, row) => acc + row.event_count, 0)
}

function averageLatency(rows: { avg_ms: number }[]): number {
  if (rows.length === 0) return 0
  const sum = rows.reduce((acc, row) => acc + row.avg_ms, 0)
  return sum / rows.length
}

/**
 * Minimal operational telemetry dashboard (backoffice).
 * Fetches GET /telemetry/report and shows the SAME operational metrics:
 * volume, errors, latency and auth failures — not business KPIs.
 */
export function TelemetryDashboard({ period = 'Last 7 days' }: TelemetryDashboardProps) {
  const [report, setReport] = useState<TelemetryReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    track('section_viewed', { section: 'telemetry', entry_point: 'nav' })

    fetchTelemetryReport()
      .then((data) => {
        setReport(data)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        setError(`No se pudo cargar el reporte de telemetría: ${message}`)
        track('frontend_error_caught', {
          page: 'telemetry',
          component: 'TelemetryDashboard',
          error_class: err instanceof Error ? err.constructor.name : 'Unknown',
          api_endpoint: '/telemetry/report',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const totalEvents = useMemo(
    () => (report ? sumCounts(report.metrics.events_per_day) : 0),
    [report],
  )
  const avgLatency = useMemo(
    () => (report ? averageLatency(report.metrics.latency_per_day) : 0),
    [report],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {report ? formatPeriod(report.period.from, report.period.to) : period}
        </span>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <section aria-label="Operational overview" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription>Total events</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {loading ? '…' : totalEvents}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription>Error days</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {loading ? '…' : report?.metrics.error_rate.length ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription>Avg latency</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {loading ? '…' : `${avgLatency.toFixed(0)}ms`}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section aria-label="Operational metrics" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <EventsPerDayTable data={report?.metrics.events_per_day ?? []} loading={loading} />
        <RateCard
          title="Error rate"
          description="Share of error events per day"
          dataKey="error_rate"
          data={report?.metrics.error_rate ?? []}
          loading={loading}
        />
        <RateCard
          title="API latency (avg ms)"
          description="Average response time per day"
          dataKey="avg_ms"
          data={report?.metrics.latency_per_day ?? []}
          loading={loading}
          formatValue={(value) => `${value.toFixed(1)}ms`}
        />
        <RateCard
          title="Auth failure rate"
          description="Failed login attempts / total logins per day"
          dataKey="auth_failure_rate"
          data={report?.metrics.auth_failure_rate ?? []}
          loading={loading}
        />
      </section>
    </div>
  )
}