import { useEffect, useState } from "react";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { BusinessLineIncomeChart } from "./business-line-income-chart";
import { TopCategoriesTable } from "./top-categories-table";
import { fetchTopCategories } from "@/lib/api";
import type { BusinessLineSummary, BusinessType, DateRangeFilter as DateRangeValue, FacetsResponse, TopCategoriesResponse } from "@/lib/financial-types";
import { buildBusinessLineSummary } from "@/lib/financial-utils";

interface ComparisonPageProps {
  dateRange: DateRangeValue;
  facets: FacetsResponse | null;
  facetsLoading?: boolean;
  onDateRangeChange: (next: DateRangeValue) => void;
}

const BUSINESS_TYPES: BusinessType[] = ["B2B", "B2C"];

export function ComparisonPage({ dateRange, facets, facetsLoading, onDateRangeChange }: ComparisonPageProps) {
  const [entries, setEntries] = useState<Partial<Record<BusinessType, TopCategoriesResponse>>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadedQueryKey, setLoadedQueryKey] = useState<string | null>(null);
  const queryKey = `${dateRange.start_date ?? ""}:${dateRange.end_date ?? ""}`;

  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled(BUSINESS_TYPES.map(async (businessType) => {
      const response = await fetchTopCategories({ operation_type: "income", limit: 5, business_type: businessType, ...dateRange }, controller.signal);
      return [businessType, response] as const;
    }))
      .then((results) => {
        if (controller.signal.aborted) return;
        const loadedEntries: Partial<Record<BusinessType, TopCategoriesResponse>> = {};
        let failed = false;
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            loadedEntries[BUSINESS_TYPES[index]] = result.value[1];
          } else if (!controller.signal.aborted) {
            failed = true;
          }
        });
        setEntries(loadedEntries);
        setError(failed ? "Could not load one or more business lines." : null);
        setLoadedQueryKey(queryKey);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("Could not load the business comparison.");
          setLoadedQueryKey(queryKey);
        }
      });
    return () => controller.abort();
  }, [dateRange, queryKey]);

  const summaries: Partial<Record<BusinessType, BusinessLineSummary>> = {};
  for (const businessType of BUSINESS_TYPES) {
    if (loadedQueryKey === queryKey && entries[businessType]) {
      summaries[businessType] = buildBusinessLineSummary(businessType, entries[businessType], facets);
    }
  }
  const loading = loadedQueryKey !== queryKey;

  return (
    <section aria-label="B2B versus B2C comparison" className="flex flex-col gap-6">
      <DateRangeFilter value={dateRange} onChange={onDateRangeChange} facets={facets} loading={facetsLoading} />
      {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">{error}</div> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {BUSINESS_TYPES.map((businessType) => (
          <TopCategoriesTable
            key={businessType}
            businessType={businessType}
            summary={summaries[businessType] ?? null}
            loading={loading}
          />
        ))}
      </div>
      <BusinessLineIncomeChart
        data={BUSINESS_TYPES.flatMap((businessType) =>
          summaries[businessType] ? [summaries[businessType]!] : [],
        )}
        loading={loading}
      />
    </section>
  );
}
