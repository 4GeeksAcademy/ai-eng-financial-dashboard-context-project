import type { AlertsParams } from "../../../specs/param-types";
import type { AlertsResponse } from "../../../specs/api-types";
import { formatCurrency } from "@/lib/financial-utils";

interface AlertsTableProps {
  /** Alert rows exactly as returned by GET /api/metrics/alerts. */
  alerts: AlertsResponse;
  /** API-shaped query state; threshold remains a ratio and dates are inclusive. */
  params: AlertsParams;
  /** Emits API-shaped query values when the threshold changes. */
  onParamsChange: (params: AlertsParams) => void;
  loading?: boolean;
}

export function AlertsTable({
  alerts,
  params,
  onParamsChange,
  loading = false,
}: AlertsTableProps) {
  const threshold = params.threshold ?? 0.3;
  return (
    <section aria-labelledby="expense-alerts-title" className="rounded-lg border border-border/60 bg-card p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="expense-alerts-title" className="text-base font-semibold">
            Alertas de gastos
          </h2>
          <p className="text-sm text-muted-foreground">
            El promedio compara cada periodo con todos los periodos anteriores del rango.
          </p>
        </div>
        <label className="grid gap-1 text-xs text-muted-foreground">
          Umbral de incremento (%)
          <input
            aria-label="Umbral de incremento porcentual"
            className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            type="number"
            min={1}
            max={100}
            step={1}
            value={Math.round(threshold * 100)}
            onChange={(event) => {
              const percent = event.currentTarget.valueAsNumber;
              if (Number.isFinite(percent) && percent >= 1 && percent <= 100) {
                onParamsChange({ ...params, threshold: percent / 100 });
              }
            }}
          />
        </label>
      </div>

      {loading ? (
        <p role="status" className="py-8 text-center text-sm text-muted-foreground">
          Cargando alertas…
        </p>
      ) : alerts.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No hay alertas de gastos para el rango y el umbral seleccionados.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Periodo</th>
                <th className="px-3 py-2">Gastos del periodo</th>
                <th className="px-3 py-2">Promedio histórico de gastos anteriores</th>
                <th className="px-3 py-2">Incremento porcentual</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.period} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-3">{alert.period}</td>
                  <td className="px-3 py-3">{formatCurrency(alert.outcome_total)}</td>
                  <td className="px-3 py-3">{formatCurrency(alert.baseline_average)}</td>
                  <td className="px-3 py-3">{(alert.increase_ratio * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
