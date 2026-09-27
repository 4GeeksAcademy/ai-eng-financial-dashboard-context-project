import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BusinessLineSummary, BusinessType } from "@/lib/financial-types";
import { formatCurrency, formatPercent } from "@/lib/financial-utils";

interface TopCategoriesTableProps {
  businessType: BusinessType;
  summary: BusinessLineSummary | null;
  loading?: boolean;
}

export function TopCategoriesTable({ businessType, summary, loading }: TopCategoriesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{businessType} — Top income categories</CardTitle>
        <CardDescription>
          Total: {formatCurrency(summary?.total_income ?? 0)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <caption className="sr-only">Top income categories for {businessType}</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2">Category</th>
              <th scope="col" className="py-2 text-right">Income</th>
              <th scope="col" className="py-2 text-right">% of {businessType}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 3 }, (_, index) => (
              <tr key={index}>
                <td colSpan={3} className="py-3"><Skeleton className="h-4 w-full" /></td>
              </tr>
            )) : !summary || summary.rows.length === 0 ? (
              <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No income categories for {businessType}.</td></tr>
            ) : summary.rows.map((row) => (
              <tr key={row.category} className="border-b border-border/50 last:border-0">
                <th scope="row" className="py-3 text-left font-medium capitalize">{row.category}</th>
                <td className="py-3 text-right tabular-nums">{formatCurrency(row.total_amount)}</td>
                <td className="py-3 text-right tabular-nums">{row.share_pct === null ? "—" : formatPercent(row.share_pct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
