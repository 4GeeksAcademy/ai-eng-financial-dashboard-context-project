/**
 * Types for the business reporting dashboard (GET /reporting/monthly-clinic-supply-performance).
 *
 * These are business KPIs from the HealthCore BRIEFING — not operational metrics.
 * Each field maps to a named KPI in the "KPIs a medir" section of the BRIEFING:
 *
 *   total_supply_cost        → Coste total de suministros (por clínica/mes)
 *   supply_consumption_count → Volumen de consumo de suministros
 *   critical_stockout_count  → Frecuencia de desabastecimiento crítico
 *   expiry_risk_count        → Cantidad de suministros próximos a vencer
 */

export interface ClinicKpi {
  clinic_id: string
  country: string
  month_start: string
  total_supply_cost: number
  supply_consumption_count: number
  critical_stockout_count: number
  expiry_risk_count: number
  currency: string
  computed_at: string | null
}

export interface ClinicKpiResponse {
  month_start: string
  clinics: ClinicKpi[]
}