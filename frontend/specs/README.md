# Especificaciones del frontend

Este directorio describe tres funcionalidades del dashboard y sus contratos con la API. Las rutas, parámetros y respuestas de este documento se verificaron contra el OpenAPI publicado por `/docs`.

Los tipos compartidos están en:

- [`api-types.ts`](./api-types.ts): respuestas y valores enumerados.
- [`param-types.ts`](./param-types.ts): parámetros query usados por las funcionalidades.
- [`components.md`](./components.md): composición, props y estados de UI por funcionalidad.

Las fechas de query usan strings en formato `YYYY-MM-DD`. Los parámetros opcionales sin valor se omiten de la URL.

## 1. Filtro de rango de fechas

Especificación detallada: [`filtro-rango-fechas.md`](./filtro-rango-fechas.md).

### Endpoints y tipos

| Endpoint | Petición TypeScript | Respuesta `200` |
|---|---|---|
| `GET /api/metrics` | `DateRangeFilter` | `MetricsResponse` (`FinancialMovement[]`) |
| `GET /api/metrics/facets` | Sin parámetros query | `FacetsResponse` (`MetricsFacets`) |

`/api/metrics` también admite `category` y `operation_type`, pero esta funcionalidad solo añade `start_date` y `end_date`.

### Parámetros

| Endpoint | Parámetro | Tipo | Obligatorio | Valores y restricciones |
|---|---|---|---|---|
| `/api/metrics` | `start_date` | `string` | No | Fecha en formato `YYYY-MM-DD`. |
| `/api/metrics` | `end_date` | `string` | No | Fecha en formato `YYYY-MM-DD`. |
| `/api/metrics` | `category` | `Category` | No | `suppliers`, `sales`, `operational`, `administrative`, `others`. No lo controla esta funcionalidad. |
| `/api/metrics` | `operation_type` | `OperationType` | No | `income`, `outcome`. No lo controla esta funcionalidad. |
| `/api/metrics/facets` | — | — | — | No publica parámetros query. |

`FacetsResponse.min_date` y `FacetsResponse.max_date` proporcionan la referencia de fechas disponible. `/docs` no indica que la API rechace fechas fuera de ese rango ni que valide `start_date <= end_date`.

### Casos límite y UI

1. **Ambas fechas vacías:** omitir `start_date` y `end_date`; mostrar todos los movimientos devueltos y mantener visible la referencia `min_date`–`max_date`.
2. **Solo una fecha informada:** enviar únicamente ese parámetro. La UI debe mostrar los KPI y gráficos recalculados con la respuesta filtrada, sin inventar el límite ausente.
3. **Respuesta `200` vacía:** mostrar el dashboard sin datos para el rango, no conservar métricas del rango anterior ni presentar un error de red.
4. **Respuesta `422`:** mostrar un error visible de validación y no tratar la petición como una carga correcta.

## 2. Tabla de alertas de anomalías

Especificación detallada: [`alertas-anomalias.md`](./alertas-anomalias.md).

### Endpoint y tipos

| Endpoint | Petición TypeScript | Respuesta `200` |
|---|---|---|
| `GET /api/metrics/alerts` | `AlertsParams` | `AlertResponse` (`AlertEntry[]`) |

La funcionalidad usa `threshold`, `start_date` y `end_date`. No envía `group_by`, por lo que la API aplica `month`; tampoco expone actualmente un filtro `business_type`.

### Parámetros

| Parámetro | Tipo | Obligatorio | Predeterminado | Valores y restricciones |
|---|---|---|---|---|
| `threshold` | `number` | No | `0.3` | La API acepta valores desde `0` y no publica máximo. La UI restringe el valor a `0.01`–`1.0`. Se envía como ratio, no como porcentaje. |
| `group_by` | `string` | No | `month` | `day`, `week`, `month`. La funcionalidad usa el valor predeterminado. |
| `start_date` | `string` | No | — | Fecha en formato `YYYY-MM-DD`. |
| `end_date` | `string` | No | — | Fecha en formato `YYYY-MM-DD`. |
| `business_type` | `BusinessType` | No | — | `B2B`, `B2C`. La UI de esta funcionalidad no lo expone. |

Cada `AlertEntry` contiene:

- `period: string`.
- `outcome_total: number`.
- `baseline_average: number`.
- `increase_ratio: number`, expresado como ratio. Para mostrarlo como porcentaje, la UI calcula `increase_ratio * 100`.

### Casos límite y UI

1. **`AlertResponse` vacío:** mantener la tabla visible y mostrar un mensaje explícito de que no hay anomalías para el umbral y rango actuales.
2. **Umbral fuera de `0.01`–`1.0`:** mostrar validación junto al input y no enviar la petición, aunque la API admita `0`.
3. **Respuesta `422`:** mostrar un estado de error para la tabla; no sustituirlo por el estado vacío.
4. **Menos de tres períodos anteriores:** no presentar una fila como anomalía calculada con una media móvil de tres períodos. La API actual promedia todos los períodos anteriores, por lo que este requisito sigue pendiente de ajuste en el contrato.

## 3. Comparativa B2B frente a B2C

Especificación detallada: [`comparativa-b2b-b2c.md`](./comparativa-b2b-b2c.md).

### Endpoints y tipos

| Endpoint | Petición TypeScript | Respuesta `200` |
|---|---|---|
| `GET /api/metrics/categories/top` | `SegmentTopCategoriesParams` | `TopCategoriesResponse` (`CategoryEntry[]`) |
| `GET /api/metrics/summary` | `SegmentSummaryParams` | `MetricsSummaryResponse` (`MetricsSummaryItem[]`) |
| `GET /api/metrics/facets` | Sin parámetros query | `FacetsResponse` |

Los dos tipos de petición específicos de la comparativa se exportan desde [`param-types.ts`](./param-types.ts):

```ts
interface SegmentTopCategoriesParams extends TopCategoriesParams {
  business_type: BusinessType
}

interface SegmentSummaryParams extends DateRangeFilter {
  business_type: BusinessType
}
```

La UI realiza una petición por segmento (`B2B` y `B2C`) a `categories/top` y otra por segmento a `summary`, usando el mismo rango de fechas.

### Parámetros de `GET /api/metrics/categories/top`

| Parámetro | Tipo | Obligatorio | Predeterminado | Valores y restricciones |
|---|---|---|---|---|
| `operation_type` | `OperationType` | No | `outcome` | `income`, `outcome`. Esta funcionalidad debe enviar `income`. |
| `limit` | `number` | No | `5` | Entero entre `1` y `20`. Esta funcionalidad envía `5`. |
| `start_date` | `string` | No | — | Fecha en formato `YYYY-MM-DD`. |
| `end_date` | `string` | No | — | Fecha en formato `YYYY-MM-DD`. |
| `business_type` | `BusinessType` | No en la API; requerido por la vista | — | `B2B`, `B2C`. |

### Parámetros de `GET /api/metrics/summary`

| Parámetro | Tipo | Obligatorio | Predeterminado | Valores y restricciones |
|---|---|---|---|---|
| `group_by` | `string` | No | `month` | `day`, `week`, `month`. La vista puede omitirlo porque suma `income` de todos los períodos. |
| `start_date` | `string` | No | — | Fecha en formato `YYYY-MM-DD`. Debe coincidir con la petición de categorías. |
| `end_date` | `string` | No | — | Fecha en formato `YYYY-MM-DD`. Debe coincidir con la petición de categorías. |
| `category` | `Category` | No | — | Catálogo de `Category`. La vista debe omitirlo para obtener el total completo del segmento. |
| `operation_type` | `OperationType` | No | — | `income`, `outcome`. La vista puede omitirlo y usar el campo `income` de la respuesta. |
| `business_type` | `BusinessType` | No en la API; requerido por la vista | — | `B2B`, `B2C`. |

`GET /api/metrics/facets` no publica parámetros query. Su lista `categories` es global: `/docs` no permite obtener facetas distintas para B2B y B2C.

El porcentaje de una fila se deriva así:

```text
CategoryEntry.total_amount / total de MetricsSummaryItem.income del segmento
```

El gráfico usa los totales completos del resumen, no la suma de las categorías truncadas por `limit=5`.

### Casos límite y UI

1. **Menos de cinco categorías:** mostrar únicamente las filas devueltas; no crear categorías ni filas de relleno.
2. **Total de ingresos del segmento igual a cero:** no dividir por cero; mostrar el porcentaje como no disponible y un estado sin datos para ese segmento en el gráfico.
3. **`TopCategoriesResponse` vacío para un segmento:** mostrar el estado vacío en su tabla sin reutilizar filas del otro segmento.
4. **Respuesta `422`:** mostrar un error de carga de la comparativa y no calcular porcentajes ni gráfico con una respuesta inválida.
5. **Facetas por segmento:** no afirmar que una categoría global está disponible en ambos segmentos. La ampliación de facetas por `business_type` sigue pendiente si se mantiene ese requisito del PM.

## Error de validación común

Las rutas con parámetros documentan una respuesta `422` con el tipo `HTTPValidationError`. `detail`, cuando existe, contiene entradas `ValidationError` con:

- `loc: Array<string | number>`.
- `msg: string`.
- `type: string`.
- `input?: unknown`.
- `ctx?: Record<string, unknown>`.

Un error `422` debe mostrarse como error de petición; nunca como una respuesta correcta vacía.
