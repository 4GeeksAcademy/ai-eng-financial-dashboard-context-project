# Componentes de las funcionalidades

Los componentes presentan datos; los cálculos financieros permanecen en `src/lib/financial-utils.ts`. Los nombres de API y parámetros indicados corresponden a `specs/api-types.ts` y `specs/param-types.ts`. Los tipos de resumen y parámetros de facetas señalados como pendientes deben añadirse allí antes de consumir esos contratos.

## 001 · Filtro por fechas

### `DateRangeFilter`

Props:

```ts
interface DateRangeFilterProps {
  value: { startDate: string; endDate: string };
  availableRange: { minDate: string; maxDate: string } | null;
  onChange: (value: { startDate: string; endDate: string }) => void;
  disabled?: boolean;
}
```

Renderizado condicional:
- Siempre muestra los dos inputs `date`, con límites disponibles `min_date` y `max_date` de `FacetsResponse`.
- Si solo hay fecha inicial, consulta con `start_date`; si solo hay fecha final, consulta con `end_date`. El input vacío se omite; nunca se envía `null` ni una cadena vacía. Si ambos están vacíos, no se envían fechas.
- Si ambas fechas existen y `startDate > endDate`, muestra validación y no solicita datos con ese rango.
- Mientras carga facetas, conserva los inputs y no inventa un rango disponible; ante error muestra el error sin ocultar el resto del dashboard.

### `DashboardHeader`

Props:

```ts
interface DashboardHeaderProps {
  period: string;
}
```

Renderizado condicional: muestra el período aplicado; no presenta un período fijo que contradiga las fechas seleccionadas o los datos devueltos.

### `App`

Props: ninguna (raíz de la vista).

Estado interno: `DateRangeFilterProps['value']`, `FinancialMovement[]`, `FacetsResponse | null`, `loading: boolean` y `error: string | null`.

Renderizado condicional: solicita `/api/metrics/facets` para el rango global y `/api/metrics` con `DateRangeFiler` para los movimientos. Rango inválido evita la solicitud; respuesta sin movimientos muestra estado sin datos en lugar de KPI y gráficos calculados; error de API se muestra sin bloquear el filtro. Con datos, actualiza KPI y gráficos existentes usando los movimientos filtrados.

## 002 · Alertas de anomalías

### `AlertsSection`

Props:

```ts
interface AlertsSectionProps {
  alerts: AlertEntry[] | null;
  threshold: number;
  onThresholdChange: (value: number) => void;
  loading: boolean;
  error: string | null;
}
```

`alerts` es `null` mientras no hay respuesta y `AlertEntry[]` después; `AlertEntry` y el alias actual `AlersResponse` están definidos en `api-types.ts`. La consulta usa `AlertsParams`, incluye `start_date`/`end_date` activos, fija `group_by: 'month'` y presenta `threshold` con valor inicial `0.3`, mínimo `0.01` y máximo `1.0`.

Renderizado condicional: muestra carga mientras espera respuesta; error si falla la consulta; tabla cuando hay alertas; y el mensaje explícito «No hay anomalías para este umbral y período» cuando la respuesta es `[]`. El umbral se valida en ese intervalo. La tabla muestra media de los tres meses anteriores; para los tres primeros meses seleccionados se permite usar meses de contexto previos al rango. Si no hay tres meses previos o su media es cero, ese período no genera alerta.

### `AnomaliesTable`

Props:

```ts
interface AnomaliesTableProps {
  rows: AlertEntry[];
}
```

Renderizado condicional: con filas, muestra período, gasto (`outcome_total`), media (`baseline_average`) e incremento porcentual (`increase_ratio * 100`). Con `rows.length === 0`, muestra explícitamente «No hay anomalías para este umbral y período»; no representa una tabla vacía sin explicación.

## 003 · Comparativa B2B vs B2C

### `BusinessComparisonPage`

Props: ninguna (vista de la comparativa).

Renderizado condicional: muestra un `DateRangeFilter` compartido y exactamente dos `BusinessComparisonPanel`, para `B2B` y `B2C`. Envía el mismo rango a cada solicitud de `TopCategoriesParams` y a los resúmenes. La página muestra carga/error por panel sin ocultar el otro; el gráfico aparece cuando hay respuesta de ambos totales.

### `BusinessComparisonPanel`

Props:

```ts
interface BusinessComparisonPanelProps {
  businessType: BusinessType;
  categories: CategoryEntry[] | null;
  totalIncome: number | null;
  loading: boolean;
  error: string | null;
}
```

`CategoryEntry` contiene `category`, `operation_type` y `total_amount`; se solicita con `operation_type: 'income'`, `limit: 5` y el `business_type` del panel. `totalIncome` procede de sumar `income` del resumen completo del grupo, no del top cinco. El tipo `SummaryEntry` (`period`, `income`, `outcome`, `net`) y `SummaryParams` deben añadirse a los contratos de `api-types.ts` y `param-types.ts`.

Renderizado condicional: presenta estado de carga o error sin reemplazar los datos del otro panel. Con categorías, muestra como máximo cinco filas y calcula cada porcentaje como `total_amount / totalIncome * 100`. Si `categories` es `[]`, muestra explícitamente «No hay categorías de ingreso para B2B en este período» o «No hay categorías de ingreso para B2C en este período», según `businessType`; no añade filas ficticias. Si el total es cero, muestra `0 %` para cada porcentaje.

### `TopCategoriesTable`

Props:

```ts
interface TopCategoriesTableProps {
  businessType: BusinessType;
  rows: CategoryEntry[];
  totalIncome: number;
}
```

Renderizado condicional: orden recibido del endpoint, hasta cinco categorías con nombre, importe y porcentaje del total completo del grupo. Si `rows` está vacío, muestra el estado vacío específico del negocio. No presupone que el endpoint devuelva cinco filas.

### `BusinessRevenueChart`

Props:

```ts
interface BusinessRevenueChartProps {
  b2bIncome: number;
  b2cIncome: number;
  loading: boolean;
  error: string | null;
}
```

Renderizado condicional: mientras falte alguno de los totales muestra carga; con ambos disponibles compara los ingresos totales B2B y B2C para el mismo rango; ante error muestra el estado de error, no valores parciales como si fueran una comparación completa.

### Contratos de API pendientes

- `AlertsParams` permite actualmente valores de `threshold >= 0` y el backend calcula la media de todos los períodos previos. Para cumplir este diseño, restringir el umbral a `0.01–1.0` y calcular la referencia con los tres meses anteriores en `backend/app/routes.py`; conservar `AlertEntry` como forma de respuesta.
- `FacetsResponse` actual contiene categorías globales y `/api/metrics/facets` no admite filtros. Para obtener categorías por negocio, añadir `FacetsParams` con `business_type` y `operation_type` en `param-types.ts`, actualizar el tipo/respuesta en `api-types.ts` y ampliar el endpoint.
- Añadir `SummaryEntry` y `SummaryParams` a `api-types.ts` y `param-types.ts` para tipar los totales completos por negocio. El endpoint `/api/metrics/summary` ya admite `business_type`, `operation_type`, `start_date` y `end_date`.
- `TopCategoriesParams` admite `limit` de hasta 20; el componente pide cinco, pero el backend devuelve como máximo cinco y puede devolver menos.

Referencias de implementación: [App.tsx](../src/App.tsx), [dashboard-header.tsx](../src/components/dashboard/dashboard-header.tsx), [kpi-row.tsx](../src/components/dashboard/kpi-row.tsx), [income-outcome-chart.tsx](../src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](../src/components/dashboard/profit-percent-chart.tsx), [financial-types.ts](../src/lib/financial-types.ts), [financial-utils.ts](../src/lib/financial-utils.ts), [financial-utils.test.ts](../src/lib/financial-utils.test.ts), [api-types.ts](api-types.ts), [param-types.ts](param-types.ts), [routes.py](../../backend/app/routes.py) y [test_routes.py](../../backend/tests/test_routes.py).