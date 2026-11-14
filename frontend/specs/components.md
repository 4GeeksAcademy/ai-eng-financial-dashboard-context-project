# Componentes por funcionalidad

Este documento define la composición de UI de las tres funcionalidades. Los contratos de API y casos límite están en [`README.md`](./README.md); las formas TypeScript están en [`api-types.ts`](./api-types.ts) y [`param-types.ts`](./param-types.ts).

## Patrones existentes que se conservan

- [`App.tsx`](../src/App.tsx) coordina actualmente la carga, transforma los datos y mantiene los estados `loading` y `error`.
- Los componentes de [`components/dashboard/`](../src/components/dashboard/) son presentacionales y reciben datos por props.
- `KPIRow`, `IncomeOutcomeChart` y `ProfitPercentChart` ya aceptan estado de carga; los gráficos y tarjetas usan `Skeleton`.
- Las peticiones deben conservar `VITE_API_BASE_URL`, comprobar `response.ok` y propagar el estado HTTP en los errores.
- Carga, error, respuesta vacía y éxito son estados distintos. Una lista vacía con HTTP `200` no es un error.

Los componentes nuevos de dashboard deben ubicarse junto a los existentes en `frontend/src/components/dashboard/`. Esta spec no fija una librería de routing ni una carpeta de páginas porque el proyecto aún no tiene navegación configurada.

## 1. Filtro de rango de fechas

### Composición

```text
App (existente, contenedor de datos)
├── DashboardHeader (existente)
├── DateRangeControls (nuevo)
├── KPIRow (existente)
├── IncomeOutcomeChart (existente)
└── ProfitPercentChart (existente)
```

### `DateRangeControls`

Componente presentacional para los inputs de fecha y la referencia del dataset. No realiza peticiones.

```ts
interface DateRangeControlsProps {
  value: DateRangeFilter
  availableRange: Pick<FacetsResponse, 'min_date' | 'max_date'> | null
  disabled: boolean
  validationMessage?: string
  onApply: (value: DateRangeFilter) => void
}
```

Responsabilidades:

- Renderizar inputs etiquetados para `start_date` y `end_date`.
- Mantener valores temporales de los dos inputs hasta que formen un filtro válido.
- Emitir mediante `onApply` strings `YYYY-MM-DD` o eliminar la propiedad cuando un input quede vacío.
- Mostrar `min_date` y `max_date` como referencia, no como una validación garantizada por la API.
- Mostrar `validationMessage` junto a los controles.
- Deshabilitar los inputs cuando `disabled` sea `true`.

No debe:

- Construir URLs.
- Ejecutar `fetch`.
- Recalcular KPI o series.
- Inventar una fecha ausente cuando solo se complete un extremo.

Decisiones cerradas:

- Aplicar el filtro al confirmar un input completo mediante `blur` o `Enter`; no solicitar por cada carácter escrito.
- Permitir solo una fecha inicial o solo una fecha final, porque ambos parámetros son opcionales en la API.
- Si existen ambas fechas, exigir `start_date <= end_date`; mostrar validación local y no llamar a `onApply` cuando el orden sea inválido.
- Usar `min_date` y `max_date` como atributos y referencia visible. Una fecha fuera de ese rango es inválida en la UI y no se envía, aunque `/docs` no publique esa validación.
- Limpiar ambos inputs aplica `{}` y vuelve a solicitar el conjunto completo.

### Responsabilidad de `App`

`App` pasa de una carga única a coordinar:

1. `GET /api/metrics/facets` para obtener `FacetsResponse`.
2. `GET /api/metrics` con `DateRangeFilter` para obtener `MetricsResponse`.
3. `computeKPIs` y `computeMonthlyData` sobre la misma respuesta filtrada.

Cuando cambia el filtro, KPI y gráficos deben derivarse del nuevo `MetricsResponse`; no se filtran por separado en cada componente.

### Estados visibles

| Estado | UI |
|---|---|
| Facetas cargando | Inputs visibles; referencia de rango en estado de carga. |
| Métricas cargando | Controles deshabilitados y esqueletos existentes en KPI y gráficos. |
| Sin movimientos | KPI derivados de la lista vacía y gráficos sin puntos; no mostrar datos del rango anterior. |
| Error `422` | Mensaje visible asociado al filtro; no tratarlo como estado vacío. |
| Error de red | Mantener el aviso global existente. |

## 2. Tabla de alertas de anomalías

### Composición

```text
AlertsSection (nuevo, contenedor de estado)
├── AlertsThresholdControl (nuevo)
└── AlertsTable (nuevo)
```

### `AlertsSection`

Coordina el umbral, el rango activo y los estados de la petición.

```ts
interface AlertsSectionProps {
  dateRange: DateRangeFilter
}
```

Responsabilidades:

- Mantener `threshold` con valor inicial `0.3`.
- Validar en UI el intervalo `0.01`–`1.0`.
- Solicitar `GET /api/metrics/alerts` con `AlertsParams`.
- Pasar el resultado, carga y error a los componentes presentacionales.
- Volver a solicitar alertas cuando cambien el umbral válido o el rango activo.

No debe presentar `baseline_average` como media móvil de tres períodos hasta que el contrato pendiente garantice ese cálculo.

### `AlertsThresholdControl`

```ts
interface AlertsThresholdControlProps {
  value: number
  disabled: boolean
  validationMessage?: string
  onCommit: (value: NonNullable<AlertsParams['threshold']>) => void
}
```

Responsabilidades:

- Renderizar un input numérico con mínimo de UI `0.01`, máximo `1.0` y valor inicial `0.3`.
- Explicar que el valor se envía como ratio.
- Mantener el texto temporal mientras el usuario edita.
- Confirmar un número mediante `onCommit` al hacer `blur` o pulsar `Enter`.
- Mostrar la validación local y no llamar a `onCommit` con valores vacíos, no numéricos o fuera de rango.

### `AlertsTable`

```ts
interface AlertsTableProps {
  entries: AlertResponse
  loading: boolean
  error: string | null
}
```

Columnas y campos:

| Columna | Campo |
|---|---|
| Período | `period` |
| Gasto registrado | `outcome_total` |
| Media de referencia | `baseline_average` |
| Incremento porcentual | `increase_ratio * 100` |

Responsabilidades:

- Usar una tabla semántica con encabezados para las cuatro columnas.
- Formatear `outcome_total` y `baseline_average` como moneda.
- Convertir `increase_ratio` a porcentaje solo para presentarlo.
- Mostrar un esqueleto de tabla durante la carga.
- Mantener la estructura de la tabla y mostrar una fila de estado vacío cuando `entries.length === 0`.
- Mostrar el error de petición dentro de la sección; no convertirlo en estado vacío.

Decisiones cerradas:

- La tabla usa agrupación mensual: no envía `group_by` y acepta el valor predeterminado `month`.
- La tabla cubre todas las líneas de negocio: no envía `business_type`.
- Un cambio válido de umbral se aplica al confirmar el input; no se solicita por cada carácter.
- El encabezado de la tercera columna será **Media de referencia** mientras la API no garantice tres períodos. La funcionalidad no se considera conforme al brief del PM hasta que el backend calcule exactamente los tres anteriores.
- `increase_ratio` se multiplica por `100` una sola vez para presentarlo; el valor enviado como `threshold` permanece en formato ratio.

### Estados visibles

| Estado | UI |
|---|---|
| Umbral inválido | Mensaje junto al input; no se ejecuta la petición. |
| Cargando | Esqueleto de tabla y control deshabilitado. |
| Sin alertas | Fila: no hay anomalías para el umbral y rango actuales. |
| Error `422` o de red | Mensaje de error dentro de la sección. |
| Éxito | Una fila por `AlertEntry`. |

## 3. Comparativa B2B frente a B2C

### Composición

```text
BusinessComparisonPage (nuevo, contenedor de datos)
├── DateRangeControls (compartido)
├── BusinessCategoryTable (nuevo, instancia B2B)
├── BusinessCategoryTable (nuevo, instancia B2C)
└── BusinessIncomeComparisonChart (nuevo)
```

`BusinessComparisonPage` representa la nueva vista solicitada. Cómo se llega a ella queda pendiente de la futura decisión de navegación.

### `BusinessComparisonPage`

Responsabilidades:

- Mantener un único `DateRangeFilter` para toda la comparativa.
- Solicitar `categories/top` para B2B y B2C con `operation_type=income` y `limit=5`.
- Solicitar `summary` para B2B y B2C con el mismo rango.
- Sumar `MetricsSummaryItem.income` para obtener el total completo de cada segmento.
- Calcular el porcentaje de cada `CategoryEntry` sobre el total de su segmento.
- No usar la suma del top como total del gráfico.
- Solicitar `FacetsResponse` para el rango global, sin presentarlo como facetas específicas por segmento.

Tipos de petición exportados por [`param-types.ts`](./param-types.ts):

```ts
interface SegmentTopCategoriesParams extends TopCategoriesParams {
  business_type: BusinessType
}

interface SegmentSummaryParams extends DateRangeFilter {
  business_type: BusinessType
}
```

### `BusinessCategoryTable`

El mismo componente se usa una vez para B2B y otra para B2C.

```ts
interface BusinessCategoryTableProps {
  businessType: BusinessType
  entries: TopCategoriesResponse
  totalIncome: number
  loading: boolean
  error: string | null
}
```

Columnas:

| Columna | Fuente |
|---|---|
| Categoría | `CategoryEntry.category` |
| Total de ingresos | `CategoryEntry.total_amount` |
| Porcentaje del grupo | `total_amount / totalIncome` |

Responsabilidades:

- Identificar claramente el segmento mediante `businessType`.
- Mostrar como máximo las filas devueltas por la API; no rellenar hasta cinco.
- Formatear importes como moneda.
- Mostrar el porcentaje como no disponible cuando `totalIncome === 0`.
- Mostrar su propio estado vacío o error sin reutilizar datos del otro segmento.

### `BusinessIncomeComparisonChart`

```ts
interface BusinessIncomeComparisonChartProps {
  b2bIncome: number
  b2cIncome: number
  loading: boolean
  error: string | null
}
```

Responsabilidades:

- Comparar únicamente los totales completos obtenidos de `MetricsSummaryResponse`.
- Etiquetar explícitamente B2B y B2C.
- Mostrar un esqueleto durante la carga.
- Mostrar un estado sin datos cuando ambos totales sean cero.
- No renderizar valores derivados de una respuesta inválida o parcial como si la comparativa estuviera completa.

Decisiones cerradas:

- La comparativa se carga de forma atómica: las dos tablas y el gráfico pasan a éxito solo cuando las cuatro peticiones de categorías y resumen han terminado correctamente.
- Si falla cualquiera de esas cuatro peticiones, conservar el rango seleccionado, mostrar un error común y no presentar la combinación de datos nuevos y antiguos como una comparativa válida.
- Cada porcentaje usa el total completo de ingresos del mismo segmento y rango obtenido de `MetricsSummaryResponse`.
- El gráfico usa esos mismos dos totales completos.
- Una respuesta de categorías con menos de cinco filas es válida; no se rellenan filas.
- `FacetsResponse.categories` se considera un catálogo global. Las filas B2B/B2C proceden de `TopCategoriesResponse`; la exigencia del PM de facetas específicas por segmento permanece bloqueada hasta que la API admita `business_type` en facetas.
- `BusinessComparisonPage` define la vista, pero no introduce una librería de routing. La integración de navegación se mantiene fuera de esta especificación de componentes para no imponer infraestructura inexistente.

### Estados visibles

| Estado | UI |
|---|---|
| Cargando | Esqueletos para ambas tablas y el gráfico. |
| Segmento sin categorías | Estado vacío solo en la tabla de ese segmento. |
| Total del segmento igual a cero | Porcentajes no disponibles y total cero en el gráfico. |
| Respuesta inválida o incompleta | Error visible; no presentar una comparativa completa. |
| Menos de cinco categorías | Mostrar solo las filas recibidas. |
| Facetas globales | Usarlas únicamente para el rango y catálogo global; no afirmar disponibilidad por segmento. |

## Componentes compartidos y límites

- `DateRangeControls` se comparte entre el dashboard principal y la comparativa.
- `Card` y `Skeleton` existentes deben reutilizarse para mantener el lenguaje visual.
- Los componentes presentacionales no ejecutan peticiones ni conocen `API_BASE_URL`.
- Los contenedores no deben confundir una respuesta vacía con un error.
- La media móvil de tres períodos y las facetas por segmento siguen siendo dependencias pendientes del backend; la UI no debe ocultar esos desajustes mediante etiquetas engañosas.
