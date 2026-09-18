# Contrato de datos del frontend

**Estado:** Especificación previa a implementación  
**Fecha:** 2026-09-17  
**Fuente principal:** contrato OpenAPI expuesto en `/docs` y tipos de `frontend/specs/`

Este documento describe únicamente el contrato verificado para las tres funcionalidades del dashboard. No añade campos ni endpoints que no existan en OpenAPI.

## 1. Fuentes y convenciones

- `backend/app/routes.py` y el esquema OpenAPI de `/docs` son la fuente de verdad del contrato HTTP.
- `frontend/src/lib/financial-types.ts` contiene los tipos de dominio compartidos.
- `frontend/specs/api-types.ts` contiene las respuestas específicas de alertas, facetas y categorías.
- `frontend/specs/param-type.ts` contiene `DateRangeFilter`, `AlertsParams` y `TopCategoriesParams`.
- Las peticiones son `GET` y reciben respuestas JSON.
- Las fechas se envían como `YYYY-MM-DD` y los rangos son inclusivos.
- Los parámetros opcionales omitidos significan “sin filtrar” o activan el default del backend.
- `OperationType` solo admite `income` y `outcome`.
- `Category` solo admite `suppliers`, `sales`, `operational`, `administrative` y `others`.
- `BusinessType` solo admite `B2B` y `B2C`.
- Los importes y ratios se reciben como `number`; la moneda y el porcentaje son responsabilidad de la presentación.
- FastAPI serializa los campos `date` de las respuestas como cadenas ISO `YYYY-MM-DD`; el frontend no debe depender de la zona horaria del navegador para interpretarlos.
- La URL base de las peticiones es relativa (`/api/...`) para usar el proxy de Vite; no se construyen URLs absolutas en los componentes.
- Una respuesta HTTP no exitosa, un fallo de red o una respuesta que no pueda validarse como el tipo esperado se trata como **Error**, nunca como una respuesta vacía.
- Las peticiones se vuelven a ejecutar cuando cambia el rango válido o un filtro aplicable. Mientras llega la nueva respuesta se muestra **Carga** y no se mezclan datos de rangos distintos.

Tipos compartidos usados en las firmas:

```ts
import type {
  BusinessType,
  Category,
  FinancialMovement,
  OperationType,
} from "@/lib/financial-types"
import type {
  AlertResponse,
  FacetsResponse,
  TopCategoriesResponse,
} from "@/specs/api-types"
import type {
  AlertsParams,
  ApiDateString,
  DateRangeFilter,
  TopCategoriesParams,
} from "@/specs/param-type"
```

## 2. Funcionalidad 1 — Rango de fechas y dashboard principal

### 2.1 Endpoints consumidos

#### `GET /api/metrics/facets`

Se consulta para obtener los límites visuales del selector y los catálogos permitidos. No convierte automáticamente `min_date` y `max_date` en filtros activos.

- **Request:** sin parámetros (`Record<string, never>`).
- **Response:** `FacetsResponse`.

```ts
type GetFacetsRequest = Record<string, never>
type GetFacetsResponse = FacetsResponse
```

#### `GET /api/metrics`

Es la fuente de movimientos que el dashboard puede agregar para calcular KPIs y gráficos.

- **Request:**

```ts
interface MetricsParams extends DateRangeFilter {
  category?: Category
  operation_type?: OperationType
}
```

- **Response:**

```ts
type MetricsResponse = FinancialMovement[]
```

Parámetros verificados:

| Parámetro | Tipo TS | Obligatorio | Default | Valores y restricciones |
|---|---|---:|---|---|
| `start_date` | `ApiDateString` | No | — | Fecha ISO `YYYY-MM-DD`; inclusiva. |
| `end_date` | `ApiDateString` | No | — | Fecha ISO `YYYY-MM-DD`; inclusiva. |
| `category` | `Category` | No | — | `suppliers`, `sales`, `operational`, `administrative` u `others`. |
| `operation_type` | `OperationType` | No | — | `income` u `outcome`. |

Si no se envían fechas, se consulta todo el período disponible. El frontend debe rechazar un rango en el que `start_date > end_date` antes de construir la URL. El endpoint no acepta `business_type`.

La selección inicial no tiene rango activo: ambos controles comienzan vacíos y la primera petición omite `start_date` y `end_date`. Las facetas solo limitan los controles (`min_date` y `max_date`); no se copian automáticamente como valores seleccionados. Si el usuario borra un rango, se vuelve a este estado sin filtro.

Al construir cualquier query string, se omiten los parámetros `undefined`, `null` y vacíos. Los valores se codifican con `URLSearchParams` y se envían con los nombres exactos del contrato (`start_date`, `end_date`, `category` y `operation_type`).

### 2.2 Campos de respuesta

`FinancialMovement` contiene:

```ts
interface FinancialMovement {
  create_date: string
  amount: number
  operation_type: OperationType
  category: Category
  business_type: BusinessType
}
```

`FacetsResponse` contiene:

```ts
interface FacetsResponse {
  operation_types: OperationType[]
  business_types: BusinessType[]
  categories: Category[]
  min_date: string
  max_date: string
}
```

`min_date` y `max_date` son `string` en el tipo actual; el selector debe validarlos antes de usarlos como valores de un control de fecha.

### 2.3 Casos límite y comportamiento de UI

1. **Rango vacío:** `start_date` y `end_date` se omiten. La UI muestra el período completo disponible, usando las facetas como referencia, sin inventar fechas por defecto.
2. **Rango inválido (`start_date > end_date`):** no se ejecuta la petición. El selector conserva el último rango válido, marca ambos controles con un error accesible y permite corregirlo.
3. **Rango válido sin movimientos:** `/api/metrics` devuelve `[]`. La UI mantiene el dashboard visible, muestra KPIs en cero o un estado “Sin movimientos en el rango seleccionado”, y no presenta un error de red.
4. **Error de facetas o de movimientos:** se muestra un estado de error con opción de reintento. Si falla una consulta, no se debe presentar como si hubiera datos completos; el texto debe distinguir error de estado vacío.

En el primer render, si todavía no existe un rango válido anterior, un rango inválido deja los controles con los valores introducidos para que puedan corregirse, pero no renderiza datos como si fueran válidos. Tras haber cargado datos correctamente, un rango inválido conserva visualmente y en pantalla los últimos resultados válidos.

## 3. Funcionalidad 2 — Alertas de anomalías

### 3.1 Endpoint consumido

#### `GET /api/metrics/alerts`

```ts
type GetAlertsRequest = AlertsParams & {
  // Constante de integración para la vista aprobada.
  group_by?: "month"
  // Filtro opcional real del endpoint, si lo soporta el estado global.
  business_type?: BusinessType
}
type GetAlertsResponse = AlertResponse
```

La sección siempre envía `group_by=month` explícitamente. No ofrece un selector de agrupación ni envía `day` o `week`. `business_type` es un filtro real del endpoint y, si existe un filtro global activo, se propaga; si no existe, se omite.

Parámetros verificados:

| Parámetro | Tipo TS | Obligatorio | Default | Valores y restricciones |
|---|---|---:|---|---|
| `threshold` | `number` | No | `0.3` | Ratio decimal. Contrato actual: `>= 0`; regla objetivo de producto: `0.01–1.0`, inclusive. |
| `group_by` | `"day" \| "week" \| "month"` | No | `"month"` | La UI usa `"month"`; no debe aceptar otros valores en esta vista. |
| `start_date` | `ApiDateString` | No | — | Fecha inclusiva `YYYY-MM-DD`. |
| `end_date` | `ApiDateString` | No | — | Fecha inclusiva `YYYY-MM-DD`. |
| `business_type` | `BusinessType` | No | — | `B2B` o `B2C`, si se aplica el filtro global. |

Importante: el backend actualmente valida `threshold >= 0`, no el rango objetivo completo. La UI no debe enviar valores inferiores a `0.01`, superiores a `1.0`, vacíos o no numéricos. `0.3` se envía como `0.3`, no como `30`.

### 3.2 Respuesta

```ts
interface AlertEntry {
  period: string
  outcome_total: number
  baseline_average: number
  increase_ratio: number
}
type AlertResponse = AlertEntry[]
```

- `period` es el período agrupado; con `group_by=month` se espera `YYYY-MM`.
- `outcome_total` y `baseline_average` son importes.
- `increase_ratio` es un ratio decimal: `0.35` se presenta como `35.00%`.
- Una respuesta sin alertas válida es `[]`, nunca `null`.

La regla funcional solicita una media de los tres períodos anteriores. La implementación backend verificada actualmente usa el histórico acumulado anterior; esta diferencia debe permanecer visible en la documentación y no se debe ocultar con un tipo frontend.

### 3.3 Casos límite y comportamiento de UI

1. **Respuesta vacía (`[]`):** la sección, el título y el control de umbral permanecen visibles. La tabla se sustituye por `No se detectaron anomalías de gasto con el umbral actual.`; no se muestra como error.
2. **Menos de cuatro períodos agrupados o baseline no positivo:** no hay suficientes períodos para la regla de tres períodos o la media no permite calcular un ratio. La UI muestra estado vacío, no filas parciales ni porcentajes `NaN`/`Infinity`.
3. **Umbral vacío, no numérico o fuera de `0.01–1.0`:** no se ejecuta una petición con ese valor. El control muestra validación accesible y conserva el último valor válido, normalmente `0.3`.
4. **Error HTTP o de red:** la sección permanece en la página con un mensaje de error y botón de reintento, sin ocultar ni marcar como fallidos los KPIs y gráficos que sí hayan cargado.

El umbral se mantiene en estado local de la sección. Su valor inicial es `0.3`, se muestra como porcentaje (`30%`) si la UI usa un control porcentual, y se convierte a ratio decimal antes de llamar a la API. La petición solo se dispara con un valor numérico entre `0.01` y `1.0`, inclusive; durante una edición inválida se conserva el último valor válido y no se realiza una petición.

## 4. Funcionalidad 3 — Comparativa B2B vs B2C

La vista muestra siempre ambos grupos, en el orden B2B y B2C. Usa el mismo rango válido para todas las consultas.

La vista ejecuta las cinco peticiones necesarias con el mismo snapshot de filtros: una a `/api/metrics/facets`, dos a `/api/metrics/categories/top` y una a cada endpoint de movimientos (`/api/metrics/b2b` y `/api/metrics/b2c`). Las peticiones de categorías incluyen `operation_type=income`, `limit=5` y el `business_type` correspondiente. Las peticiones de movimientos incluyen `operation_type=income`; no incluyen `business_type`, porque el endpoint ya fija el grupo.

Si no hay rango activo, todas las peticiones omiten `start_date` y `end_date`. Si el rango es inválido, no se ejecuta ninguna de las cinco peticiones. Si falla cualquiera de las peticiones de la comparación, la vista completa se marca como error de comparación y no muestra una combinación de resultados parciales.

### 4.1 Endpoints consumidos

#### `GET /api/metrics/facets`

- **Request:** `Record<string, never>`.
- **Response:** `FacetsResponse`.
- **Uso:** límites de fecha y catálogo global de categorías.

`facets.categories` no está separado por grupo ni por operación. No existe `categories_by_business_type` en el contrato actual.

#### `GET /api/metrics/categories/top`

Se realizan dos peticiones, una por grupo:

```ts
interface BusinessTopCategoriesParams extends TopCategoriesParams {
  business_type: BusinessType
}

type BusinessTopCategoriesResponse = TopCategoriesResponse
```

URLs conceptuales:

```http
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C
```

Con rango activo se añaden `start_date` y `end_date`.

| Parámetro | Tipo TS | Obligatorio | Default | Valores y restricciones |
|---|---|---:|---|---|
| `operation_type` | `OperationType` | No | `outcome` | La comparación fija `income`. |
| `limit` | `number` | No | `5` | Entero entre `1` y `20`; la comparación fija `5`. |
| `start_date` | `ApiDateString` | No | — | Fecha inclusiva `YYYY-MM-DD`. |
| `end_date` | `ApiDateString` | No | — | Fecha inclusiva `YYYY-MM-DD`. |
| `business_type` | `BusinessType` | No en API; sí en la comparación | — | `B2B` o `B2C`. |

La respuesta contiene como máximo `limit` elementos, ordenados por total descendente según el comportamiento del endpoint:

```ts
interface CategoryEntry {
  category: Category
  operation_type: OperationType
  total_amount: number
}
type TopCategoriesResponse = CategoryEntry[]
```

#### `GET /api/metrics/b2b` y `GET /api/metrics/b2c`

Se consulta un endpoint por grupo para obtener todos los movimientos de ingresos y calcular el total de grupo:

```ts
interface BusinessMetricsParams extends DateRangeFilter {
  category?: Category
  operation_type?: OperationType
}
type BusinessMetricsResponse = FinancialMovement[]
```

La comparación fija `operation_type=income` y suma `amount` de todos los movimientos devueltos. Estos endpoints no requieren `business_type` porque ya representan un grupo.

Parámetros de ambos endpoints:

| Parámetro | Tipo TS | Obligatorio | Default | Valores y restricciones |
|---|---|---:|---|---|
| `start_date` | `ApiDateString` | No | — | Fecha inclusiva `YYYY-MM-DD`. |
| `end_date` | `ApiDateString` | No | — | Fecha inclusiva `YYYY-MM-DD`. |
| `category` | `Category` | No | — | Catálogo de cinco categorías válidas. |
| `operation_type` | `OperationType` | No | — | La comparación fija `income`. |

### 4.2 Cálculos y campos no devueltos por API

Para cada grupo:

```ts
const groupIncomeTotal = movements
  .filter((movement) => movement.operation_type === "income")
  .reduce((total, movement) => total + movement.amount, 0)

const percentage = groupIncomeTotal > 0
  ? (entry.total_amount / groupIncomeTotal) * 100
  : 0
```

`groupIncomeTotal` y `percentage` son cálculos de presentación; no son campos de `TopCategoryItem`. La suma debe usar todos los movimientos de `/api/metrics/b2b` o `/api/metrics/b2c`, no solo las cinco categorías visibles.

### 4.3 Casos límite y comportamiento de UI

1. **Un grupo sin ingresos:** el endpoint específico devuelve `[]` o movimientos sin ingresos. La tabla del grupo permanece visible con un mensaje como `No hay ingresos B2B en el rango seleccionado`, total `$0.00` y porcentajes `0.00%`; el gráfico conserva la barra del grupo en cero.
2. **Menos de cinco categorías:** la tabla muestra solo las categorías realmente devueltas. No rellena filas ficticias ni usa categorías hardcodeadas; conserva el encabezado y el nombre B2B/B2C.
3. **Ambos grupos con total cero:** ambas tablas permanecen visibles, cada porcentaje es `0.00%`, y el gráfico sigue mostrando exactamente B2B y B2C con valor cero junto a un mensaje contextual de ausencia de ingresos.
4. **Rango sin datos o rango inválido:** para un rango válido sin movimientos se muestra estado vacío coordinado, no error. Si `start_date > end_date`, no se consulta ningún endpoint y el selector muestra un error accesible conservando los últimos resultados válidos.
5. **Fallo parcial de comparación:** si falla una de las peticiones de categorías o movimientos, la UI muestra error de comparación y no presenta datos parciales como comparación completa. Un fallo de facetas debe identificarse separadamente porque impide establecer los límites/catálogos.

El filtro global `business_type`, si se ofrece en la aplicación, no se aplica a esta vista: la comparación debe mostrar siempre B2B y B2C. El filtro de categoría tampoco se aplica a los endpoints de esta sección, porque cambiaría el significado de `groupIncomeTotal`; las tablas siempre comparan todas las categorías de ingresos.

## 5. Endpoints verificados no consumidos por el flujo actual

Los siguientes endpoints existen en OpenAPI, pero no forman parte de las peticiones seleccionadas para las tres funcionalidades descritas:

### `GET /api/metrics/summary`

Devuelve `MetricsSummaryItem[]` y acepta `group_by`, fechas, `category`, `operation_type` y `business_type`.

```ts
interface MetricsSummaryItem {
  period: string
  income: number
  outcome: number
  net: number
}

interface SummaryParams extends DateRangeFilter {
  group_by?: "day" | "week" | "month"
  category?: Category
  operation_type?: OperationType
  business_type?: BusinessType
}
type SummaryResponse = MetricsSummaryItem[]
```

Parámetros: `group_by` es opcional y por defecto `month`; los demás son opcionales y usan los unions anteriores. Puede servir para una futura versión del dashboard o de alertas, pero la especificación actual usa `/api/metrics` para movimientos y fija `group_by=month` solo en alertas.

### `GET /api/metrics/comparison`

Devuelve comparación de neto entre períodos, no comparación de ingresos B2B/B2C:

```ts
interface ComparisonParams {
  start_date: ApiDateString
  end_date: ApiDateString
  business_type?: BusinessType
}

interface ComparisonResponse {
  current_period: number
  previous_period: number
  delta_abs: number
  delta_pct: number | null
}
```

`start_date` y `end_date` son obligatorios; `business_type` es opcional y admite `B2B` o `B2C`. No se usa para la comparativa solicitada porque el gráfico requerido compara ingresos totales calculados desde `/api/metrics/b2b` y `/api/metrics/b2c`, no el neto del período.

## 6. Matriz resumida de contratos

| Funcionalidad | Endpoint | Request TS | Response TS |
|---|---|---|---|
| Dashboard | `/api/metrics/facets` | `Record<string, never>` | `FacetsResponse` |
| Dashboard | `/api/metrics` | `MetricsParams` | `FinancialMovement[]` |
| Alertas | `/api/metrics/alerts` | `AlertsParams` + `group_by="month"` opcional `business_type` | `AlertResponse` |
| Comparativa | `/api/metrics/facets` | `Record<string, never>` | `FacetsResponse` |
| Comparativa | `/api/metrics/categories/top` × 2 | `BusinessTopCategoriesParams` | `TopCategoriesResponse` |
| Comparativa | `/api/metrics/b2b` | `BusinessMetricsParams` + `operation_type="income"` | `FinancialMovement[]` |
| Comparativa | `/api/metrics/b2c` | `BusinessMetricsParams` + `operation_type="income"` | `FinancialMovement[]` |
| No consumido actualmente | `/api/metrics/summary` | `SummaryParams` | `MetricsSummaryItem[]` |
| No consumido actualmente | `/api/metrics/comparison` | `ComparisonParams` | `ComparisonResponse` |

## 7. Campos o contratos que no existen

No deben consumirse ni tiparse como respuestas reales:

- `categories_by_business_type` en `FacetsResponse`.
- `group_total_amount` en `TopCategoryItem`.
- `business_type` como query parameter de `GET /api/metrics`.
- Un campo API `percentage` para las categorías.
- Un campo API con el total de ingresos del grupo.
- Un campo API que devuelva la suma de las cinco categorías visibles.

Los porcentajes, totales de grupo y mensajes de estado son responsabilidades de la capa de integración/presentación, usando únicamente los campos verificados.

## 8. Estados comunes de UI

Cada funcionalidad debe diferenciar visualmente y mediante texto:

- **Carga:** skeleton o indicador sin mostrar datos parciales como definitivos.
- **Datos:** contenido completo asociado al rango aplicado.
- **Vacío:** respuesta válida sin resultados; no debe tratarse como error.
- **Error:** fallo HTTP, de red o de validación; debe incluir un mensaje comprensible y reintento cuando proceda.

Los mensajes mínimos de error son: `No se pudieron cargar los datos del dashboard.`, `No se pudieron cargar las alertas.` y `No se pudo cargar la comparación B2B/B2C.`. El botón de reintento repite la última consulta válida con los mismos parámetros. Un resultado `[]` nunca activa esos mensajes.

## 9. Criterios de implementación cerrados

- La capa de integración es responsable de construir las URLs, validar rangos y umbrales, convertir respuestas JSON a los tipos de `frontend/specs/` y exponer estados `loading`, `data`, `empty` y `error`.
- Los componentes no llaman directamente a endpoints distintos de los enumerados en este documento.
- Los cálculos derivados se redondean únicamente al presentar: importes con dos decimales, porcentajes con dos decimales y ratios de alertas como porcentaje multiplicado por 100.
- Los resultados se consideran completos solo cuando han terminado correctamente todas las peticiones requeridas por la funcionalidad.
- No se añaden fallbacks con `mock-data.ts`, datos hardcodeados ni categorías ficticias cuando una respuesta está vacía o falla.

La implementación de componentes, cambios backend y correcciones de la validación de `threshold` quedan fuera de este documento de contrato.
