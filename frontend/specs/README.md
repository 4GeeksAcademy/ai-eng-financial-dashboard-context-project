# Especificaciones del frontend

Este directorio describe tres funcionalidades del dashboard y sus contratos con la API. Las rutas, parámetros y respuestas de este documento se verificaron contra el OpenAPI publicado por `/docs`.

## Leer antes de implementar

### Estado actual

- El frontend solo solicita `GET /api/metrics` una vez al montar [`App.tsx`](../src/App.tsx).
- El filtro de fechas, la tabla de alertas, la comparativa y sus componentes todavía no están implementados.
- Los endpoints descritos aquí existen en el backend, pero trabajan con datos simulados y sin persistencia.
- [`api-types.ts`](./api-types.ts) y [`param-types.ts`](./param-types.ts) son contratos de referencia para estas specs. No se importan directamente desde la aplicación porque `tsconfig.app.json` solo incluye `frontend/src`.
- Al implementar, añadir o alinear los tipos de runtime en [`src/lib/financial-types.ts`](../src/lib/financial-types.ts). No mantener dos definiciones con formas distintas.

### Fuentes de verdad

| Tema | Fuente |
|---|---|
| Rutas, parámetros y formas HTTP actuales | `/docs` y `GET /openapi.json` |
| Comportamiento que debe mostrar la UI | Este README y las tres specs funcionales |
| Composición, props y estados | [`components.md`](./components.md) |
| Tipos de referencia verificados | [`api-types.ts`](./api-types.ts) y [`param-types.ts`](./param-types.ts) |
| Evidencia de comprobaciones realizadas | [`verification.md`](../../verification.md) |

Si el wording del PM contradice `/docs`, no renombrar datos para ocultar el desajuste. Aplicar las decisiones documentadas aquí y conservar el bloqueo explícito cuando el backend no puede cumplir el requisito.

### Decisiones cerradas para esta entrega

- El rango del dashboard principal es compartido por KPI, gráficos y alertas.
- La comparativa mantiene un rango independiente, inicialmente vacío.
- Fechas y umbral se aplican al confirmar con `blur` o `Enter`, no por cada carácter.
- La UI valida `start_date <= end_date` y limita las fechas a `min_date`–`max_date`.
- Alertas usa agrupación mensual y todas las líneas de negocio; no expone controles para `group_by` o `business_type`.
- La comparativa se actualiza de forma atómica: no mezcla respuestas nuevas, antiguas o parciales.
- “Nueva página” significa una segunda vista dentro de `App`, seleccionada mediante controles **Overview** y **B2B vs B2C**. No añadir una dependencia de routing ni prometer una URL independiente en este alcance.
- La vista inicial es `overview`. Al cambiar de vista, conservar en memoria el rango principal, el umbral de alertas y el rango independiente de la comparativa.
- `App` solicita facetas una vez y comparte `min_date` y `max_date` con ambas vistas. No duplicar la petición de facetas por componente.
- Si facetas falla, mostrar el dashboard o la comparativa sin filtro de fechas, deshabilitar los controles de rango y mostrar el error de facetas; las peticiones sin rango pueden continuar.
- Métricas y alertas comparten el rango aplicado, pero mantienen carga y error independientes. El fallo de alertas no oculta KPI y gráficos válidos.
- El texto visible nuevo sigue el idioma predominante del dashboard actual: inglés. El español de estas specs describe requisitos, no copy literal.
- Solo la respuesta correspondiente al último filtro aplicado puede actualizar la pantalla; una respuesta anterior no debe sobrescribir el estado vigente.
- No modificar el backend como parte de una implementación frontend salvo que la tarea lo solicite expresamente.

Los tipos compartidos están en:

- [`api-types.ts`](./api-types.ts): respuestas y valores enumerados.
- [`param-types.ts`](./param-types.ts): parámetros query usados por las funcionalidades.
- [`components.md`](./components.md): composición, props y estados de UI por funcionalidad.

Las fechas de query usan strings en formato `YYYY-MM-DD`. Los parámetros opcionales sin valor se omiten de la URL.

Las peticiones conservan el patrón actual:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
```

Cada helper debe comprobar `response.ok` antes de leer el JSON y distinguir carga, error, respuesta vacía y éxito.

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
5. **Fechas invertidas o fuera de facetas:** mostrar validación local y no ejecutar la petición.

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

Hasta que el backend garantice exactamente tres períodos, la columna visible se llama **Reference average**, no **3-period moving average**. La tabla puede integrarse con el contrato actual, pero la funcionalidad no cumple por completo el brief del PM.

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

La vista puede implementar tablas, porcentajes y gráfico con `categories/top` y `summary`. Sin embargo, no cumple la exigencia de “categorías disponibles por grupo desde facetas” hasta que `/api/metrics/facets` admita segmentación.

## Alcance implementable y bloqueos

| Funcionalidad | Implementable con la API actual | Bloqueo que no debe ocultarse |
|---|---|---|
| Filtro de rango | Sí | Ninguno para el flujo descrito. La validación de orden y rango pertenece a la UI. |
| Alertas | Parcialmente | `baseline_average` usa todos los períodos anteriores, no exactamente tres. |
| Comparativa B2B/B2C | Parcialmente | Facetas publica categorías globales y no categorías disponibles por segmento. |

Los bloqueos no impiden construir el resto de la UI, pero sí impiden declarar cumplimiento completo del wording del PM. Una sesión frontend no debe cambiar la fórmula ni el contrato del backend sin una solicitud explícita.

Si la tarea es exclusivamente frontend:

- Implementar alertas con la etiqueta **Reference average**, continuar con los demás estados y reportar el bloqueo de los tres períodos al finalizar; no detener toda la implementación.
- Implementar tablas y gráfico de la comparativa usando `categories/top` y `summary`; usar facetas solo para el rango global y reportar el bloqueo de facetas por segmento.
- No sustituir silenciosamente esos requisitos por claims de que ya están cumplidos.

## Orden recomendado de implementación

1. Alinear los contratos de runtime en `src/lib/financial-types.ts` y crear helpers de petición que conserven `API_BASE_URL` y `response.ok`.
2. Cargar facetas una vez en `App`, implementar `DateRangeControls` y conectar el rango a métricas.
3. Compartir el rango aplicado con `AlertsSection` e implementar umbral, tabla y estados.
4. Añadir el selector **Overview** / **B2B vs B2C** en `App` sin instalar un router.
5. Implementar la comparativa con peticiones atómicas para ambos segmentos.
6. Añadir pruebas focalizadas para construcción de query, cálculos derivados y casos límite.

No añadir una librería nueva si los componentes y utilidades existentes cubren la necesidad.

## Criterios de validación

Desde `frontend/`:

```bash
npm test
npm run lint
npm run build
```

Para lógica de fechas, ejecutar también:

```bash
TZ=America/Los_Angeles npm test
```

Las pruebas nuevas deben cubrir al menos:

- Omisión de parámetros vacíos y filtros de un solo extremo.
- Rechazo local de fechas invertidas o fuera de `min_date`–`max_date`.
- Diferencia entre respuesta vacía y error.
- Conversión de `increase_ratio` a porcentaje una sola vez.
- Porcentaje de categoría con total positivo y total cero.
- Atomicidad de la comparativa cuando una petición falla.

## Error de validación común

Las rutas con parámetros documentan una respuesta `422` con el tipo `HTTPValidationError`. `detail`, cuando existe, contiene entradas `ValidationError` con:

- `loc: Array<string | number>`.
- `msg: string`.
- `type: string`.
- `input?: unknown`.
- `ctx?: Record<string, unknown>`.

Un error `422` debe mostrarse como error de petición; nunca como una respuesta correcta vacía.
