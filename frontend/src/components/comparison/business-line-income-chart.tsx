import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BusinessLineSummary } from "@/lib/financial-types";
import { formatCurrency } from "@/lib/financial-utils";

interface BusinessLineIncomeChartProps {
  data: Pick<BusinessLineSummary, "business_type" | "total_income">[];
  loading?: boolean;
}

interface TooltipPayload {
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-lg">
      <p className="mb-2 font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.color} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">Income:</span>
          <span className="ml-auto pl-4 font-medium text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function BusinessLineIncomeChart({ data, loading }: BusinessLineIncomeChartProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Income by business line</CardTitle></CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-[280px] w-full" /> : data.every((item) => item.total_income === 0) ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No income in the selected range.</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="business_type" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total_income" name="Income" fill="var(--chart-income)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
