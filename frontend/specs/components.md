# Especificación consolidada de componentes

Esta especificación define la capa frontend para las tres funcionalidades. No implementa React, hooks, `fetch` ni servicios API.

Los contratos se importan desde `./api-types` y `./param-types`. No inventar campos de respuesta.

## 1. Filtro global de fechas

### `DateRangeFilter`

Props:

```ts
interface DateRangeFilterProps {
  value: DateRangeFilter
  availableRange: Pick<FacetsResponse, "min_date" | "max_date"> | null
  status: "idle" | "loading" | "ready" | "error"
  errorMessage?: string | null
  disabled?: boolean
  onChange: (value: DateRangeFilter) => void
  onApply?: (value: DateRangeFilter) => void
}
```

Debe mostrar inputs accesibles `Fecha de inicio` y `Fecha de fin`, permitir valores vacíos y usar `min_date`/`max_date` de `FacetsResponse` como referencia y restricciones visuales. Las fechas usan `YYYY-MM-DD`; los valores vacíos se omiten de las URLs.

Un rango invertido (`start_date > end_date`) muestra validación y no dispara consultas. El componente permanece visible durante carga, error y vacío. La política definitiva de aplicación automática, submit o debounce es una decisión requerida antes de implementar.

Casos límite: ambas fechas vacías muestran todo; una sola fecha genera un rango abierto; facets fallida no permite inventar límites.

## 2. Alertas de anomalías

### `AnomalyAlertsSection`

Props mínimos:

```ts
interface AnomalyAlertsSectionProps {
  dateRange: DateRangeFilter
  initialThreshold?: AlertsParams["threshold"]
  businessType?: AlertsParams["business_type"]
}
```

### `AlertThresholdInput`

Props:

```ts
interface AlertThresholdInputProps {
  value: AlertsParams["threshold"]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  errorMessage?: string | null
  onChange: (value: AlertsParams["threshold"]) => void
}
```

Valores de producto: `0.01 <= threshold <= 1.0`, `step=0.01`, default `0.3`. Etiqueta accesible: `Umbral de alerta`.

### `AnomalyAlertsTable`

Props:

```ts
interface AnomalyAlertsTableProps {
  rows: AlertsResponse
  status: "idle" | "loading" | "success" | "empty" | "error"
  errorMessage?: string | null
  onRetry?: () => void
}
```

Debe colocarse bajo los gráficos, usar tabla semántica y conservarse visible en carga, error y vacío. Las columnas usan `period`, `outcome_total`, `baseline_average` e `increase_ratio * 100`.

El encabezado correcto según el contrato actual es `Promedio histórico anterior`: `baseline_average` no está verificado como media móvil de tres períodos. Un array vacío muestra un mensaje explícito, por ejemplo `No se detectaron anomalías para este umbral.`

## 3. Comparativa B2B vs B2C

### `BusinessComparisonPage`

Props:

```ts
interface BusinessComparisonPageProps {
  dateRange: DateRangeFilter
  availableFacets: FacetsResponse | null
}
```

Debe renderizar dos paneles paralelos, uno por `BusinessType`, y un único gráfico inferior.

### `BusinessCategoryTable`

Props:

```ts
interface BusinessCategoryTableProps {
  businessType: BusinessType
  rows: CategoryEntry[]
  groupTotalIncome: number
  status: "idle" | "loading" | "success" | "empty" | "error"
  errorMessage?: string | null
  onRetry?: () => void
}
```

Cada panel muestra hasta cinco filas con categoría, `total_amount` formateado como moneda y porcentaje calculado como `total_amount / groupTotalIncome * 100`. Si el denominador es cero, mostrar `N/D` (decisión de presentación adoptada para evitar `NaN`/`Infinity`). Si recibe menos de cinco filas, no fabricar filas.

### `BusinessIncomeComparisonChart`

Props:

```ts
interface BusinessIncomeComparisonChartProps {
  totals: Record<BusinessType, number>
  status: "idle" | "loading" | "success" | "empty" | "error"
  errorMessage?: string | null
}
```

Muestra únicamente los totales de ingresos B2B y B2C calculados sumando `MetricsSummaryItem.income`. No usa `net` ni `/api/metrics/comparison`.

Casos límite: tabla vacía muestra estado vacío; resumen vacío produce total cero; errores parciales deben identificarse sin presentar la otra sección como una comparativa completa.

## Reglas compartidas

- Todos los componentes deben tener etiquetas accesibles y estados explícitos `idle`, `loading`, `success`, `empty` y `error` según corresponda.
- Cambiar fechas invalida todos los datos del rango anterior y recarga las funcionalidades relacionadas.
- No implementar routing asumiendo una librería no verificada; la navegación de la nueva página queda como decisión de integración.
- No añadir propiedades API como `percentage`, `group_total`, `moving_average_3`, `b2b_total` o `b2c_total`.
