import { useId, useState } from "react";
import { CalendarRange } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  DateRangeFilter as DateRangeValue,
  FacetsResponse,
} from "@/lib/financial-types";
import {
  formatISODate,
  parseISODate,
  validateDateRange,
  type DateRangeError,
} from "@/lib/financial-utils";

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  facets: FacetsResponse | null;
  loading?: boolean;
}

function describeError(
  error: DateRangeError,
  facets: FacetsResponse | null,
): string {
  switch (error) {
    case "start_after_end":
      return "Start date must be on or before end date.";
    case "start_before_min":
      return `Start date is before the earliest available date (${facets ? formatISODate(facets.min_date) : "unknown"}).`;
    case "end_after_max":
      return `End date is after the latest available date (${facets ? formatISODate(facets.max_date) : "unknown"}).`;
  }
}

const inputClassName =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground [color-scheme:dark] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";

export function DateRangeFilter({
  value,
  onChange,
  facets,
  loading,
}: DateRangeFilterProps) {
  const id = useId();
  const startId = `${id}-start`;
  const endId = `${id}-end`;
  const errorId = `${id}-error`;

  const [startDraft, setStartDraft] = useState<string>(value.start_date ?? "");
  const [endDraft, setEndDraft] = useState<string>(value.end_date ?? "");
  const [error, setError] = useState<DateRangeError | null>(null);

  const start = parseISODate(startDraft);
  const end = parseISODate(endDraft);

  function commit(nextStartDraft: string, nextEndDraft: string) {
    const next: DateRangeValue = {};
    const nextStart = parseISODate(nextStartDraft);
    const nextEnd = parseISODate(nextEndDraft);
    if (nextStart) next.start_date = nextStart;
    if (nextEnd) next.end_date = nextEnd;

    const validation = validateDateRange(next, facets);
    setError(validation);
    if (validation === null) onChange(next);
  }

  function handleClear() {
    setStartDraft("");
    setEndDraft("");
    commit("", "");
  }

  return (
    <section
      aria-label="Date range filter"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={startId} className="text-xs font-medium text-muted-foreground">
            Start date
          </label>
          <input
            id={startId}
            type="date"
            className={inputClassName}
            value={startDraft}
            min={facets?.min_date}
            max={end ?? facets?.max_date}
            aria-invalid={error === "start_after_end" || error === "start_before_min"}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setStartDraft(event.target.value);
              commit(event.target.value, endDraft);
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={endId} className="text-xs font-medium text-muted-foreground">
            End date
          </label>
          <input
            id={endId}
            type="date"
            className={inputClassName}
            value={endDraft}
            min={start ?? facets?.min_date}
            max={facets?.max_date}
            aria-invalid={error === "start_after_end" || error === "end_after_max"}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setEndDraft(event.target.value);
              commit(startDraft, event.target.value);
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={startDraft === "" && endDraft === ""}
          className="h-9 rounded-md border border-border bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarRange size={14} aria-hidden="true" />
        {facets ? (
          <span>
            Available data: {formatISODate(facets.min_date)} –{" "}
            {formatISODate(facets.max_date)}
          </span>
        ) : loading ? (
          <Skeleton className="h-4 w-48" />
        ) : (
          <span>Available range unavailable</span>
        )}
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="w-full rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground"
        >
          {describeError(error, facets)}
        </p>
      ) : null}
    </section>
  );
}
