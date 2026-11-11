/**
 * Types for the operational telemetry report (GET /telemetry/report).
 *
 * These mirror the JSON served by the backend analysis pipeline.  They are
 * operational metrics (volume, errors, latency, auth failures) — not business
 * KPIs: the business metrics belong to the Data Pipelines milestone.
 */

export interface TelemetryPeriod {
  from: string
  to: string
}

export interface EventsPerDayPoint {
  date: string
  event_type: string
  event_count: number
}

export interface ErrorRatePoint {
  date: string
  error_rate: number
}

export interface LatencyPerDayPoint {
  date: string
  avg_ms: number
}

export interface AuthFailureRatePoint {
  date: string
  auth_failure_rate: number
}

export interface TelemetryMetrics {
  events_per_day: EventsPerDayPoint[]
  error_rate: ErrorRatePoint[]
  latency_per_day: LatencyPerDayPoint[]
  auth_failure_rate: AuthFailureRatePoint[]
}

export interface TelemetryReport {
  period: TelemetryPeriod
  metrics: TelemetryMetrics
}