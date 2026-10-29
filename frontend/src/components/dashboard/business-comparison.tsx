import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  BusinessType,
  CategoryRevenueItem,
  DateRange,
  MetricsFacets,
  MetricsSummaryItem,
  TopCategoryItem,
} from "@/lib/financial-types";
import {
  computeCategoryPercentages,
  computeTotalIncome,
  formatCurrency,
  formatPercent,
} from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const BUSINESS_TYPES: BusinessType[] = ["B2B", "B2C"];

interface BusinessGroupData {
  businessType: BusinessType;
  totalIncome: number;
  availableCategories: string[];
  categories: CategoryRevenueItem[];
}

interface ComparisonData {
  groups: BusinessGroupData[];
}

interface ComparisonResult {
  key: string;
  data?: ComparisonData;
  error?: string;
}

interface BusinessComparisonProps {
  range: DateRange;
  facets: MetricsFacets | null;
  facetsLoading: boolean;
  facetsError: string | null;
  rangeInvalid: boolean;
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function fetchBusinessGroup(
  businessType: BusinessType,
  range: DateRange,
  facets: MetricsFacets,
  signal: AbortSignal,
): Promise<BusinessGroupData> {
  const categoryParams = new URLSearchParams({
    operation_type: "income",
    limit: "5",
    business_type: businessType,
  });
  const summaryParams = new URLSearchParams({
    group_by: "month",
    operation_type: "income",
    business_type: businessType,
  });
  if (range.startDate) {
    categoryParams.set("start_date", range.startDate);
    summaryParams.set("start_date", range.startDate);
  }
  if (range.endDate) {
    categoryParams.set("end_date", range.endDate);
    summaryParams.set("end_date", range.endDate);
  }

  const [topCategories, summary] = await Promise.all([
    fetchJson<TopCategoryItem[]>(
      `${API_BASE_URL}/api/metrics/categories/top?${categoryParams}`,
      signal,
    ),
    fetchJson<MetricsSummaryItem[]>(
      `${API_BASE_URL}/api/metrics/summary?${summaryParams}`,
      signal,
    ),
  ]);
  const availableCategories = facets.categories_by_business_type[businessType];
  const totalIncome = computeTotalIncome(summary);
  const categories = computeCategoryPercentages(
    topCategories.filter((item) => availableCategories.includes(item.category)),
    totalIncome,
  );

  return {
    businessType,
    totalIncome,
    availableCategories,
    categories,
  };
}

export function BusinessComparison({
  range,
  facets,
  facetsLoading,
  facetsError,
  rangeInvalid,
}: BusinessComparisonProps) {
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const requestKey = JSON.stringify([
    range.startDate ?? null,
    range.endDate ?? null,
    facets?.categories_by_business_type ?? null,
  ]);

  useEffect(() => {
    if (rangeInvalid || facetsLoading || !facets || facetsError) return;

    const controller = new AbortController();
    Promise.all(
      BUSINESS_TYPES.map((businessType) =>
        fetchBusinessGroup(businessType, range, facets, controller.signal),
      ),
    )
      .then((groups) => {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, data: { groups } });
        }
      })
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, error: "Could not load the B2B/B2C comparison." });
        }
      });

    return () => controller.abort();
  }, [range, facets, facetsLoading, facetsError, rangeInvalid, requestKey]);

  const currentResult = result?.key === requestKey ? result : null;
  const comparison = currentResult?.data ?? null;
  const error = facetsError ?? currentResult?.error ?? null;
  const loading =
    !rangeInvalid && !error && (facetsLoading || (!currentResult && Boolean(facets)));
  const chartData = comparison?.groups.map((group) => ({
    businessType: group.businessType,
    totalIncome: group.totalIncome,
  })) ?? [];

  return (
    <section aria-label="B2B and B2C revenue comparison" className="flex flex-col gap-4">
      {rangeInvalid ? (
        <p role="status" className="text-sm text-muted-foreground">
          Correct the date range to load the comparison.
        </p>
      ) : null}
      {loading ? (
        <p role="status" className="py-8 text-center text-sm text-muted-foreground">
          Loading comparison...
        </p>
      ) : null}
      {!rangeInvalid && !loading && error ? (
        <p role="alert" className="py-8 text-center text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {!rangeInvalid && !loading && !error && comparison ? (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {comparison.groups.map((group) => (
              <Card key={group.businessType} className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">
                    {group.businessType} income categories
                  </CardTitle>
                  <CardDescription>
                    Total income: {formatCurrency(group.totalIncome)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {group.categories.length === 0 ? (
                    <p role="status" className="py-6 text-center text-sm text-muted-foreground">
                      {group.availableCategories.length === 0
                        ? `No income categories available for ${group.businessType}.`
                        : `No income in this range for ${group.businessType}.`}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[400px] border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th scope="col" className="px-3 py-2 font-medium">Category</th>
                            <th scope="col" className="px-3 py-2 text-right font-medium">Income</th>
                            <th scope="col" className="px-3 py-2 text-right font-medium">Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.categories.map((category) => (
                            <tr key={category.category} className="border-b border-border last:border-0">
                              <th scope="row" className="px-3 py-3 font-medium capitalize">
                                {category.category}
                              </th>
                              <td className="px-3 py-3 text-right tabular-nums">
                                {formatCurrency(category.total_amount)}
                              </td>
                              <td className="px-3 py-3 text-right tabular-nums">
                                {formatPercent(category.percentage)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Total income by business type</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.every((item) => item.totalIncome === 0) ? (
                <p role="status" className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                  No income available to compare for this range.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.6} />
                    <XAxis dataKey="businessType" axisLine={false} tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="totalIncome" name="Total income" fill="var(--chart-income)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </section>
  );
}