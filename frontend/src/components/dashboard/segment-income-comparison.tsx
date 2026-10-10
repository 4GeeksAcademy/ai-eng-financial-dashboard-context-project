import type { BusinessType } from "@/lib/financial-types";
import type { FinancialMovement } from "@/lib/financial-types";
import type { TopCategoriesResponse } from "../../../specs/api-types";
import type { DataRangeFilter, TopCategoriesParams } from "../../../specs/param-types";
import { formatCurrency } from "@/lib/financial-utils";

interface SegmentIncomeData {
  /** Segment whose income data is shown. */
  business_type: BusinessType;
  /** Top income categories from one GET /api/metrics/categories/top request. */
  categories: TopCategoriesResponse;
  /** Full income movements used to derive the segment total/percentage denominator. */
  movements: FinancialMovement[];
}

interface SegmentIncomeComparisonProps {
  /** The shared optional date filter applied to both B2B and B2C. */
  dateRange: DataRangeFilter;
  /** Both segments, each represented by its own API-shaped category response and movements. */
  segments: [SegmentIncomeData, SegmentIncomeData];
  /** API-shaped query params for the top-income-categories requests per segment. */
  categoryParams: [TopCategoriesParams, TopCategoriesParams];
  loading?: boolean;
}

function getIncomeTotal(movements: FinancialMovement[]): number {
  return movements.reduce((total, movement) => total + movement.amount, 0);
}

export function SegmentIncomeComparison({
  dateRange,
  segments,
  categoryParams,
  loading = false,
}: SegmentIncomeComparisonProps) {
  const b2b = segments.find((segment) => segment.business_type === "B2B");
  const b2c = segments.find((segment) => segment.business_type === "B2C");
  const totalB2B = b2b ? getIncomeTotal(b2b.movements) : 0;
  const totalB2C = b2c ? getIncomeTotal(b2c.movements) : 0;
  const maxTotal = Math.max(totalB2B, totalB2C, 1);

  return (
    <section aria-labelledby="segment-comparison-title" className="space-y-6">
      <header>
        <h2 id="segment-comparison-title" className="text-xl font-semibold">
          Comparativa de ingresos B2B vs B2C
        </h2>
        <p className="text-sm text-muted-foreground">
          {dateRange.start_date ?? "Sin fecha inicial"} — {dateRange.end_date ?? "Sin fecha final"}
        </p>
      </header>

      {loading ? (
        <p role="status" className="py-8 text-center text-sm text-muted-foreground">
          Cargando comparación…
        </p>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {[b2b, b2c].map((segment, index) => {
              const businessType: BusinessType = index === 0 ? "B2B" : "B2C";
              const total = businessType === "B2B" ? totalB2B : totalB2C;
              const categories = segment?.categories ?? [];
              return (
                <section key={businessType} className="overflow-hidden rounded-lg border border-border/60 bg-card">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h3 className="font-semibold">{businessType}</h3>
                    <span className="text-xs text-muted-foreground">
                      {categoryParams[index].operation_type ?? "income"} · top {categoryParams[index].limit ?? 5}
                    </span>
                  </div>
                  {categories.length === 0 ? (
                    <p className="p-5 text-sm text-muted-foreground">
                      No hay ingresos por categoría para este segmento y rango.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[420px] text-left text-sm">
                        <thead className="text-xs uppercase text-muted-foreground">
                          <tr>
                            <th className="px-4 py-2">Categoría</th>
                            <th className="px-4 py-2">Ingresos</th>
                            <th className="px-4 py-2">% del segmento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((entry) => (
                            <tr key={entry.category} className="border-t border-border/50">
                              <td className="px-4 py-3">{entry.category}</td>
                              <td className="px-4 py-3">{formatCurrency(entry.total_amount)}</td>
                              <td className="px-4 py-3">
                                {total > 0
                                  ? `${((entry.total_amount / total) * 100).toFixed(2)}%`
                                  : "No disponible"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <p className="border-t border-border px-4 py-3 text-sm font-medium">
                    Total ingresos: {formatCurrency(total)}
                  </p>
                </section>
              );
            })}
          </div>

          <section aria-label="Comparación de ingresos totales" className="rounded-lg border border-border/60 bg-card p-5">
            <h3 className="mb-4 font-semibold">Ingresos totales por segmento</h3>
            <div className="space-y-4">
              {(["B2B", "B2C"] as const).map((businessType) => {
                const total = businessType === "B2B" ? totalB2B : totalB2C;
                return (
                  <div key={businessType} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3">
                    <span className="text-sm font-medium">{businessType}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(total / maxTotal) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm tabular-nums">{formatCurrency(total)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
