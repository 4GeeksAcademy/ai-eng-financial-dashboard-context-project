# Especificación de tipos: filtro de rango de fechas

## Objetivo

Representar el filtro opcional de fecha del dashboard sin convertir los valores del control a `Date` como representación principal.

## Tipos propuestos

```ts
interface DateRangeFilter {
  startDate: string
  endDate: string
}

type DateFilterStatus =
  | "idle"
  | "loading-facets"
  | "loading-metrics"
  | "error"

interface AvailableDateRange {
  minDate: string
  maxDate: string
}
```

- `startDate` y `endDate` usan `YYYY-MM-DD`; `""` significa no seleccionado.
- Estado inicial: `{ startDate: "", endDate: "" }`.
- `AvailableDateRange` se deriva de `min_date` y `max_date` de `GET /api/metrics/facets`.
- El estado debe conservar selección, rango disponible, datos actuales, error presentable y si el resultado está vacío.

## Evidencia de API

- ✅ `/api/metrics/facets` devuelve `min_date` y `max_date` con formato `date` según OpenAPI/runtime.
- ✅ `/api/metrics` acepta `start_date` y `end_date` opcionales con formato `date`.
- ❌ No existe evidencia de campos `date_range`, `earliest_date` o `latest_date`.
- ❓ No está verificado que los extremos sean inclusivos ni cuál sea la semántica de un rango parcial; no debe codificarse esa afirmación en el tipo.
