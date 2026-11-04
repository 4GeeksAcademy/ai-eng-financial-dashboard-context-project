/**
 * Business reporting API service.
 *
 * Fetches the business KPI report from GET /reporting/monthly-clinic-supply-performance.
 * This endpoint serves the data produced by the business performance pipeline
 * (data/pipelines/pipeline.py) and consumed by the Part 3 dashboard.
 *
 * Separation from telemetry:
 *   - /telemetry/report → operational metrics (volume, errors, latency)
 *   - /reporting/monthly-clinic-supply-performance → business KPIs (cost, consumption, stockouts, expiry)
 */

import type { ClinicKpiResponse } from '@/lib/reporting-types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function fetchMonthlyClinicSupplyPerformance(
  month?: string,
): Promise<ClinicKpiResponse> {
  const params = new URLSearchParams()
  if (month) params.set('month', month)

  const query = params.toString()
  const url = `${API_BASE_URL}/reporting/monthly-clinic-supply-performance${query ? `?${query}` : ''}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch reporting KPIs: ${response.status}`)
  }

  return (await response.json()) as ClinicKpiResponse
}