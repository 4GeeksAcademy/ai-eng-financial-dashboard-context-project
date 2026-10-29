import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MetricsAlert } from "@/lib/financial-types";
import { formatCurrency, formatPercent } from "@/lib/financial-utils";

interface OutcomeAlertsProps {
  threshold: string;
  alerts: MetricsAlert[];
  loading: boolean;
  error: string | null;
  rangeInvalid: boolean;
  onThresholdChange: (value: string) => void;
}

export function OutcomeAlerts({
  threshold,
  alerts,
  loading,
  error,
  rangeInvalid,
  onThresholdChange,
}: OutcomeAlertsProps) {
  const parsedThreshold = Number(threshold);
  const invalidThreshold =
    threshold === "" || parsedThreshold < 0.01 || parsedThreshold > 1;

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base font-semibold">Outcome alerts</CardTitle>
        <label className="flex items-center gap-2 text-sm font-medium">
          Alert threshold
          <input
            aria-label="Alert threshold"
            aria-invalid={invalidThreshold}
            type="number"
            min="0.01"
            max="1"
            step="0.01"
            value={threshold}
            onChange={(event) => onThresholdChange(event.target.value)}
            className="h-9 w-24 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          />
        </label>
      </CardHeader>
      <CardContent>
        {invalidThreshold ? (
          <p role="alert" className="mb-3 text-sm text-destructive">
            Enter a ratio from 0.01 to 1.0.
          </p>
        ) : null}
        {rangeInvalid ? (
          <p role="status" className="py-8 text-center text-sm text-muted-foreground">
            Correct the date range to load alerts.
          </p>
        ) : null}
        {loading ? (
          <p role="status" className="py-8 text-center text-sm text-muted-foreground">
            Loading alerts...
          </p>
        ) : null}
        {!loading && error ? (
          <p role="alert" className="py-8 text-center text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {!loading && !error && !invalidThreshold && !rangeInvalid && alerts.length === 0 ? (
          <p role="status" className="py-8 text-center text-sm text-muted-foreground">
            No anomalies found for this range and threshold.
          </p>
        ) : null}
        {!loading && !error && !invalidThreshold && !rangeInvalid && alerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th scope="col" className="px-3 py-2 font-medium">Period</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Outcome</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Previous 3-month average</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Increase</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.period} className="border-b border-border last:border-0">
                    <th scope="row" className="px-3 py-3 font-medium">{alert.period}</th>
                    <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(alert.outcome_total)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(alert.baseline_average)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatPercent(alert.increase_ratio * 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}