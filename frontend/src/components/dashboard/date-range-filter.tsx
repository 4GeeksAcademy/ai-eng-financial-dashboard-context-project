import type { DateRange, MetricsFacets } from "@/lib/financial-types";

interface DateRangeFilterProps {
  range: DateRange;
  facets: MetricsFacets | null;
  facetsLoading: boolean;
  facetsError: string | null;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({
  range,
  facets,
  facetsLoading,
  facetsError,
  onChange,
}: DateRangeFilterProps) {
  const invalidRange = Boolean(
    range.startDate && range.endDate && range.startDate > range.endDate,
  );

  return (
    <section
      aria-label="Date range filter"
      className="flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="grid w-full grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Start date
          <input
            type="date"
            value={range.startDate ?? ""}
            min={facets?.min_date}
            max={range.endDate ?? facets?.max_date}
            aria-invalid={invalidRange}
            onChange={(event) =>
              onChange({ ...range, startDate: event.target.value || undefined })
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          End date
          <input
            type="date"
            value={range.endDate ?? ""}
            min={range.startDate ?? facets?.min_date}
            max={facets?.max_date}
            aria-invalid={invalidRange}
            onChange={(event) =>
              onChange({ ...range, endDate: event.target.value || undefined })
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          />
        </label>
      </div>
      <div className="text-sm text-muted-foreground" aria-live="polite">
        {facetsLoading ? <p>Loading available dates...</p> : null}
        {facetsError ? <p role="alert">{facetsError}</p> : null}
        {facets ? (
          <p>
            Available: {facets.min_date} to {facets.max_date}
          </p>
        ) : null}
        {invalidRange ? (
          <p className="text-destructive" role="alert">
            Start date must be on or before end date.
          </p>
        ) : null}
      </div>
    </section>
  );
}