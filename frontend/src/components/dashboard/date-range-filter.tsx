import type { ChangeEvent } from "react";
import type { DataRangeFilter, ISODateString } from "../../../specs/param-types";
import type { FacetResponse } from "../../../specs/api-types";

function isISODateString(value: string): value is ISODateString {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

interface DateRangeFilterProps {
  /** Current optional inclusive API date bounds. */
  value: DataRangeFilter;
  /** Global date bounds and available facets from GET /api/metrics/facets. */
  facets: FacetResponse | null;
  /** Called with API-shaped YYYY-MM-DD bounds; blank inputs remove the property. */
  onChange: (value: DataRangeFilter) => void;
  disabled?: boolean;
}

export function DateRangeFilter({
  value,
  facets,
  onChange,
  disabled = false,
}: DateRangeFilterProps) {
  const updateDate =
    (key: keyof DataRangeFilter) => (event: ChangeEvent<HTMLInputElement>) => {
      const nextDate = event.currentTarget.value;
      const nextValue: DataRangeFilter = { ...value };
      if (isISODateString(nextDate)) {
        nextValue[key] = nextDate;
      } else {
        delete nextValue[key];
      }
      onChange(nextValue);
    };

  const invalidRange = Boolean(
    value.start_date && value.end_date && value.start_date > value.end_date,
  );

  return (
    <fieldset className="flex flex-wrap items-end gap-3" disabled={disabled}>
      <legend className="mb-2 text-sm font-medium">Rango de fechas</legend>
      <label className="grid gap-1 text-xs text-muted-foreground">
        Fecha de inicio
        <input
          aria-label="Fecha de inicio"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          type="date"
          value={value.start_date ?? ""}
          min={facets?.min_date}
          max={facets?.max_date}
          onChange={updateDate("start_date")}
        />
      </label>
      <label className="grid gap-1 text-xs text-muted-foreground">
        Fecha de fin
        <input
          aria-label="Fecha de fin"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          type="date"
          value={value.end_date ?? ""}
          min={facets?.min_date}
          max={facets?.max_date}
          onChange={updateDate("end_date")}
        />
      </label>
      {facets ? (
        <p className="pb-2 text-xs text-muted-foreground">
          Datos disponibles: {facets.min_date} — {facets.max_date}
        </p>
      ) : null}
      {invalidRange ? (
        <p role="alert" className="w-full text-sm text-destructive">
          La fecha de inicio no puede ser posterior a la fecha de fin.
        </p>
      ) : null}
    </fieldset>
  );
}
