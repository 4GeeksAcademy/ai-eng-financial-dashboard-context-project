/**
 * Business reporting dashboard — HealthCore monthly clinic supply KPIs.
 *
 * Displays ALL BRIEFING KPIs for a non-technical stakeholder (CEO/ops lead):
 *   total_supply_cost        → Coste total de suministros
 *   supply_consumption_count → Volumen de consumo de suministros
 *   critical_stockout_count  → Frecuencia de desabastecimiento crítico
 *   expiry_risk_count        → Cantidad de suministros próximos a vencer
 *
 * The data is fetched from /reporting/monthly-clinic-supply-performance
 * which reads from reporting.monthly_clinic_supply_performance populated
 * by the business performance pipeline (data/pipelines/pipeline.py).
 *
 * This dashboard never queries /telemetry/report — that's the operational
 * dashboard's domain.
 */

import { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardDescription, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchMonthlyClinicSupplyPerformance } from '@/services/reporting'
import type { ClinicKpi, ClinicKpiResponse } from '@/lib/reporting-types'

interface ReportingDashboardProps {
  period?: string
}

function formatMonth(iso: string): string {
  // "2026-06-01" → "Jun 2026"
  const [y, m] = iso.slice(0, 7).split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m, 10) - 1]} ${y}`
}

function formatCurrency(value: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : ''
  return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function KpiCard({ label, value, description, loading }: {
  label: string
  value: string
  description: string
  loading: boolean
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold">
          {loading ? '…' : value}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-xs text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  )
}

function aggregateTotals(clinics: ClinicKpi[]) {
  let totalSupplyCost = 0
  let totalConsumption = 0
  let totalStockouts = 0
  let totalExpiry = 0

  for (const c of clinics) {
    totalSupplyCost += c.total_supply_cost
    totalConsumption += c.supply_consumption_count
    totalStockouts += c.critical_stockout_count
    totalExpiry += c.expiry_risk_count
  }

  return {
    totalSupplyCost,
    totalConsumption,
    totalStockouts,
    totalExpiry,
  }
}

function ClinicRow({ clinic, currency }: { clinic: ClinicKpi; currency: string }) {
  return (
    <tr className="border-b border-border/40 text-sm">
      <td className="py-2 px-3 font-medium">{clinic.clinic_id}</td>
      <td className="py-2 px-3">{clinic.country}</td>
      <td className="py-2 px-3 text-right">{formatCurrency(clinic.total_supply_cost, currency)}</td>
      <td className="py-2 px-3 text-right">{clinic.supply_consumption_count}</td>
      <td className="py-2 px-3 text-right">
        <span className={clinic.critical_stockout_count > 0 ? 'text-destructive' : ''}>
          {clinic.critical_stockout_count}
        </span>
      </td>
      <td className="py-2 px-3 text-right">
        <span className={clinic.expiry_risk_count > 0 ? 'text-warning' : ''}>
          {clinic.expiry_risk_count}
        </span>
      </td>
      <td className="py-2 px-3 text-xs text-muted-foreground">{clinic.currency}</td>
    </tr>
  )
}

/**
 * Reporting dashboard: business KPIs for HealthCore leadership.
 *
 * Features:
 *   - Monthly period selector (defaults to most recent month with data)
 *   - Aggregate KPI cards (network-wide totals)
 *   - Per-clinic breakdown table
 *   - All KPI labels match the BRIEFING "KPIs a medir" section
 *   - Legible for a non-technical stakeholder (CEO / operations lead)
 */
export function ReportingDashboard({ period = 'Monthly' }: ReportingDashboardProps) {
  const [report, setReport] = useState<ClinicKpiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchMonthlyClinicSupplyPerformance(selectedMonth)
      .then((data) => {
        setReport(data)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        setError(`Could not load business KPIs. Has the pipeline been triggered? ${message}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [selectedMonth])

  const totals = useMemo(
    () => (report ? aggregateTotals(report.clinics) : null),
    [report],
  )

  const dominantCurrency = useMemo(() => {
    if (!report || report.clinics.length === 0) return 'USD'
    const counts = new Map<string, number>()
    for (const c of report.clinics) {
      counts.set(c.currency, (counts.get(c.currency) || 0) + 1)
    }
    let maxCount = 0
    let maxCurrency = 'USD'
    for (const [cur, count] of counts) {
      if (count > maxCount) {
        maxCount = count
        maxCurrency = cur
      }
    }
    return maxCurrency
  }, [report])

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Clinic Supply Performance
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {report
              ? `${formatMonth(report.month_start)} · ${report.clinics.length} clinic(s)`
              : period}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {report ? formatMonth(report.month_start) : period}
        </span>
      </div>

      {/* ── Error banner ──────────────────────────────────────────── */}
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      {/* ── KPI summary cards (aggregate totals) ─────────────────── */}
      {totals ? (
        <section aria-label="Network-wide KPI summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total supply cost"
            value={formatCurrency(totals.totalSupplyCost, dominantCurrency)}
            description="Sum of all inbound supply orders (coste total de suministros)"
            loading={false}
          />
          <KpiCard
            label="Consumption volume"
            value={totals.totalConsumption.toLocaleString()}
            description="Total supply dispensations across all clinics (volumen de consumo de suministros)"
            loading={false}
          />
          <KpiCard
            label="Critical stockouts"
            value={totals.totalStockouts.toLocaleString()}
            description="Times stock dropped below threshold (frecuencia de desabastecimiento crítico)"
            loading={false}
          />
          <KpiCard
            label="Expiry risk count"
            value={totals.totalExpiry.toLocaleString()}
            description="Supplies flagged near expiration (cantidad de suministros próximos a vencer)"
            loading={false}
          />
        </section>
      ) : loading ? (
        <section aria-label="Loading KPIs" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32 mt-1" />
              </CardHeader>
            </Card>
          ))}
        </section>
      ) : null}

      {/* ── Per-clinic breakdown table ───────────────────────────── */}
      {report && report.clinics.length > 0 ? (
        <section aria-label="Per-clinic breakdown">
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/60 text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="py-2 px-3 font-medium">Clinic</th>
                  <th className="py-2 px-3 font-medium">Country</th>
                  <th className="py-2 px-3 font-medium text-right">Supply cost</th>
                  <th className="py-2 px-3 font-medium text-right">Consumption</th>
                  <th className="py-2 px-3 font-medium text-right">Stockouts</th>
                  <th className="py-2 px-3 font-medium text-right">Expiry risk</th>
                  <th className="py-2 px-3 font-medium">Currency</th>
                </tr>
              </thead>
              <tbody>
                {report.clinics.map((clinic) => (
                  <ClinicRow key={clinic.clinic_id} clinic={clinic} currency={dominantCurrency} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Data sourced from <code className="text-xs">reporting.monthly_clinic_supply_performance</code> ·
            Trigger a pipeline run via <code className="text-xs">POST /reporting/pipeline-runs</code>
          </p>
        </section>
      ) : null}
    </div>
  )
}