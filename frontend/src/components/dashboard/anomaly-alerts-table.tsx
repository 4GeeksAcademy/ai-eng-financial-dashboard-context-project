import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlertResponse } from "@/lib/financial-types";
import {
  formatCurrency,
  formatIncreaseRatio,
  formatPeriodLabel,
} from "@/lib/financial-utils";

interface AnomalyAlertsTableProps {
  alerts: AlertResponse;
  /** Threshold the `alerts` were fetched with. */
  threshold: number;
  loading?: boolean;
  /** Rendered in the card header, e.g. the threshold input. */
  controls?: ReactNode;
}

const COLUMNS = ["Period", "Outcome", "3-period average", "Increase"] as const;
const SKELETON_ROWS = 3;

export function AnomalyAlertsTable({
  alerts,
  threshold,
  loading,
  controls,
}: AnomalyAlertsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-[var(--outcome-badge-fg)]" aria-hidden="true" />
          Spending anomalies
        </CardTitle>
        <CardDescription>
          Months whose outcome spiked above the average of the previous 3 months.
        </CardDescription>
        {controls ? <CardAction>{controls}</CardAction> : null}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                {COLUMNS.map((column, index) => (
                  <th
                    key={column}
                    scope="col"
                    className={`py-2 font-medium ${index === 0 ? "pr-4 text-left" : "px-4 text-right"}`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: SKELETON_ROWS }, (_, row) => (
                  <tr key={row} className="border-b border-border/50">
                    {COLUMNS.map((column) => (
                      <td key={column} className="py-3 pr-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="py-8 text-center">
                    <p className="text-foreground">
                      No spending anomalies above {formatIncreaseRatio(threshold)} for
                      the selected period.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      The first 3 months of the range have no baseline and are never
                      flagged.
                    </p>
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.period} className="border-b border-border/50 last:border-0">
                    <th scope="row" className="py-3 pr-4 text-left font-medium text-foreground">
                      {formatPeriodLabel(alert.period)}
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(alert.outcome_total)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {formatCurrency(alert.baseline_average)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-[var(--outcome-badge-fg)]">
                      {formatIncreaseRatio(alert.increase_ratio)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
