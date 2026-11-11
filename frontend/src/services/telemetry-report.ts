/**
 * Telemetry report API service.
 *
 * Fetches the operational report from GET /telemetry/report.  The endpoint
 * computes metrics server-side (Pandas pipeline with a 60s cache) and this
 * service just parses the JSON for the dashboard components.
 */

import type { TelemetryReport } from '@/lib/telemetry-types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function fetchTelemetryReport(
  startDate?: string,
  endDate?: string,
): Promise<TelemetryReport> {
  const params = new URLSearchParams()
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)

  const query = params.toString()
  const url = `${API_BASE_URL}/telemetry/report${query ? `?${query}` : ''}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch telemetry report: ${response.status}`)
  }

  return (await response.json()) as TelemetryReport
}