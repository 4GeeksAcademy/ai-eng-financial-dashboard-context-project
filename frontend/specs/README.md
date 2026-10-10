# Especificaciones funcionales del dashboard

Este documento reúne las tres funcionalidades solicitadas para el dashboard. Los nombres de parámetros y campos entre código se mantienen según el contrato de la API; las etiquetas de producto se expresan en español.

## 1. Filtro de rango de fechas en el dashboard principal

### Objetivo

Permitir acotar los movimientos y métricas del dashboard principal a un rango de fechas, mostrando también los límites temporales disponibles en los datos.

### Interfaz y comportamiento

- Añadir dos controles de fecha: **Fecha de inicio** y **Fecha de fin**.
- Ambos son opcionales y usan el formato de calendario `YYYY-MM-DD`.
- Si uno o ambos controles están vacíos, no se envía el parámetro correspondiente. Si ambos están vacíos, se muestran todos los datos disponibles.
- Mostrar junto a los controles el rango disponible, obtenido de `min_date` y `max_date` de facets. El rango se presenta como información de referencia; los límites reales provienen de la API, no de fechas codificadas en la interfaz.
- Las fechas seleccionadas filtran el dashboard principal de forma inclusiva: el día de inicio y el día de fin forman parte del rango.
- Validar que, cuando ambas fechas estén informadas, la fecha de inicio no sea posterior a la fecha de fin. No enviar un rango invertido.
- Al modificar o limpiar una fecha, actualizar los datos y mantener visibles los controles y sus valores actuales. Los estados de carga y error deben distinguirse del resultado vacío.

### Contrato de datos

Rutas confirmadas en la documentación OpenAPI de FastAPI (`/docs`):

1. `GET /api/metrics/facets` devuelve `min_date` y `max_date` (`YYYY-MM-DD`), además de los conjuntos disponibles `operation_types`, `business_types` y `categories`. No tiene parámetros query ni cuerpo de solicitud.
2. `GET /api/metrics` devuelve movimientos y acepta `start_date` y `end_date` opcionales, inclusivos y con formato de fecha ISO `YYYY-MM-DD`; también admite `category`, `operation_type` y `business_type` opcionales.
3. La respuesta de `/api/metrics` contiene movimientos, no KPIs ya agregados. El dashboard conserva sus cálculos actuales a partir de los movimientos filtrados.

### Tipos TypeScript de solicitud y respuesta

Los tipos de respuesta son los del contrato documentado en `frontend/specs/api-types.ts` y `frontend/src/lib/financial-types.ts`. `facets` no requiere params; `/metrics` recibe query params (sin body):

```ts
import type { BusinessType, Category, OperationType, FinancialMovement } from "../src/lib/financial-types";
import type { DataRangeFilter } from "./param-types";

// GET /api/metrics/facets
// Solicitud: sin query params ni body.
type FacetsResponse = import("./api-types").FacetResponse;

// GET /api/metrics
type MetricsRequest = DataRangeFilter & {
	category?: Category;
	operation_type?: OperationType;
	business_type?: BusinessType;
};
type MetricsResponse = FinancialMovement[];
```

Imports para esos alias: `FacetResponse` desde `frontend/specs/api-types.ts`; `DataRangeFilter` e `ISODateString` desde `frontend/specs/param-types.ts`; y `Category`, `OperationType`, `BusinessType` y `FinancialMovement` desde `frontend/src/lib/financial-types.ts`. `MetricsRequest` es la forma del query descrita por OpenAPI, no un tipo exportado adicional.

### Valores válidos y restricciones de parámetros

| Parámetro | Tipo TS | Valores/restricciones | Comportamiento |
|---|---|---|---|
| `start_date` | `ISODateString` opcional | Fecha válida `YYYY-MM-DD`; no tiene límite propio adicional en la API. La UI limita el selector a `facets.min_date`…`facets.max_date`. | Inclusivo; omitido si está vacío. |
| `end_date` | `ISODateString` opcional | Mismas restricciones que `start_date`. | Inclusivo; omitido si está vacío. |
| `category` | `Category` opcional | `suppliers`, `sales`, `operational`, `administrative`, `others`. | Solo se envía si otra interacción la selecciona. |
| `operation_type` | `OperationType` opcional | `income` o `outcome`. | Solo se envía si otra interacción lo selecciona. |
| `business_type` | `BusinessType` opcional | `B2B` o `B2C`. | Solo se envía si otra interacción lo selecciona. |

La API filtra de forma inclusiva y no declara una validación de orden entre ambas fechas. La interfaz no envía rangos invertidos. Los tipos `ISODateString` expresan formato, pero la validación de calendario real (por ejemplo, rechazar `2026-02-31`) corresponde al control de fecha y al backend.

### Criterios de aceptación

- Con ambos campos vacíos, la consulta no incluye `start_date` ni `end_date` y se muestran todos los datos devueltos.
- Una fecha informada se envía bajo el nombre de parámetro correspondiente y con formato `YYYY-MM-DD`.
- Los límites mostrados junto a los controles corresponden a `facets.min_date` y `facets.max_date`.
- El rango es inclusivo y uno invertido se valida antes de consultar.
- Limpiar ambos campos restaura la vista sin restricción de fechas.

### Casos límite y resultado esperado en UI

1. **Ambas fechas vacías:** omitir los dos parámetros, cargar el conjunto completo y mostrar el rango disponible desde facets. No presentar el resultado como error.
2. **Solo una fecha informada:** enviar solo `start_date` o solo `end_date`; mostrar datos desde/hasta ese límite inclusivo.
3. **Inicio posterior al fin:** no enviar la solicitud; mantener los controles editables y mostrar validación junto al rango.
4. **Rango válido sin movimientos (incluido rango dentro de los límites globales pero vacío):** KPIs y gráficas muestran estado sin datos, no valores inventados ni error de transporte.

## 2. Tabla de alertas de gastos

### Objetivo

Mostrar, debajo de las gráficas del dashboard principal, los periodos en los que los gastos exceden el umbral proporcional seleccionado, junto a su contexto de periodos anteriores.

### Interfaz y comportamiento

- Presentar una tabla con las columnas: **Periodo**, **Gastos del periodo**, **Promedio histórico de gastos anteriores** e **Incremento porcentual**.
- Añadir un control de umbral que acepte razones proporcionales desde `0.01` hasta `1.0`, inclusive, con valor inicial `0.3` (30 %). La interfaz puede mostrar el valor como porcentaje, pero la consulta envía una razón: por ejemplo, `30 %` se envía como `0.3`.
- Aplicar a las alertas las fechas activas en el filtro del dashboard principal. Si las fechas están vacías, omitir ambos parámetros y considerar todos los datos.
- Si la consulta devuelve `[]`, mostrar un estado vacío explícito, por ejemplo: “No hay alertas de gastos para el rango y el umbral seleccionados”. No presentarlo como error.
- Formatear los importes como moneda y `increase_ratio` como porcentaje multiplicándolo por 100 una sola vez. El periodo debe conservar el formato que corresponda a la agrupación (`YYYY-MM` por defecto mensual).

### Contrato de datos y discrepancia conocida

- Ruta confirmada en `/docs`: `GET /api/metrics/alerts`. No lleva body.
- Cada elemento de respuesta contiene `period`, `outcome_total`, `baseline_average` e `increase_ratio`. En la presentación, `outcome` significa gastos; `increase_ratio` es una razón proporcional.
- **Decisión para esta versión:** la columna muestra `baseline_average` con la etiqueta **Promedio histórico de gastos anteriores**. El backend calcula el promedio de todos los periodos anteriores del resumen filtrado; no es una media móvil de tres periodos. Se prioriza el contrato verificable de la API y no se presenta este valor con una semántica distinta.
- El umbral solicitado por producto (`0.01`–`1.0`) es más restrictivo que el mínimo API (`0`). La validación de interfaz debe aplicar el rango de producto sin afirmar que esos límites los impone la API.

### Tipos TypeScript de solicitud y respuesta

```ts
import type { AlertsParams } from "./param-types";
import type { AlertsResponse } from "./api-types";

// GET /api/metrics/alerts (query string; sin body)
type AlertsRequest = AlertsParams;
type AlertsResponseBody = AlertsResponse;
```

`AlertsParams` y el alias de respuesta `AlertsResponse` están definidos en `param-types.ts` y `api-types.ts`, respectivamente. El tipo de fila es `AlertEntry`.

### Valores válidos y restricciones de parámetros

| Parámetro | Tipo TS | Valores/restricciones OpenAPI | Regla de producto/UI |
|---|---|---|---|
| `threshold` | `number` opcional | `>= 0`, default `0.3`; sin máximo API. Es razón: `0.3` = 30 %. | Control porcentaje entero 1–100 inclusive, paso de 1; default `0.3`, enviado como razón. |
| `group_by` | `MetricsGroupBy` opcional | `day`, `week`, `month`; default `month`. | Si no se ofrece selector, omitir para usar mensual. |
| `start_date`, `end_date` | `ISODateString` opcionales | `YYYY-MM-DD`, sin límite ni orden mínimo/máximo declarado por el endpoint. | Compartir el rango de la función 1 y omitir cada límite vacío. |
| `business_type` | `BusinessType` opcional | `B2B` o `B2C`. | No filtrar por segmento salvo que una selección lo solicite. |

La respuesta es `AlertsResponse` (`AlertEntry[]`): `period: string`, `outcome_total: number`, `baseline_average: number`, `increase_ratio: number`. El `period` usa `YYYY-MM-DD` (día), `YYYY-Www` (semana ISO) o `YYYY-MM` (mes). La API retorna solo alertas con incremento estrictamente mayor que `threshold`; no incluye las filas que no dispararon alerta.

### Criterios de aceptación

- El valor inicial es `0.3`; solo se aceptan valores del intervalo inclusivo `0.01`–`1.0` en la interfaz.
- La consulta usa `threshold` como razón proporcional y propaga las fechas seleccionadas cuando existan.
- Los gastos de la fila proceden de `outcome_total`; la columna de incremento representa `increase_ratio × 100`.
- La columna de promedio muestra `baseline_average` y se identifica como promedio histórico acumulado de periodos anteriores, no como ventana móvil de tres.
- Se muestra un estado vacío explícito cuando no hay alertas y estados diferenciados para carga y error.

### Casos límite y resultado esperado en UI

1. **Respuesta vacía (`[]`):** mostrar “No hay alertas de gastos para el rango y el umbral seleccionados”; no dibujar filas ficticias ni indicar error.
2. **Primer periodo o baseline acumulado cero:** no hay baseline positivo y el backend omite una alerta; si no quedan filas, mostrar el estado vacío normal.
3. **Incremento exactamente igual al umbral:** no se considera alerta (la condición es `>` estricta); no anunciar coincidencia como alerta.
4. **Umbral inferior a 1 %, superior a 100 % o no numérico:** impedir la actualización del query, conservar el último valor válido y mostrar validación del control.
5. **Error HTTP/JSON:** mostrar mensaje de error separado del estado vacío, conservar el umbral y las fechas para permitir reintentar.

## 3. Página comparativa B2B vs B2C

### Objetivo

Ofrecer una página para comparar los ingresos de los segmentos B2B y B2C en un rango de fechas común, tanto por principales categorías como en un gráfico de totales.

### Interfaz y comportamiento

- Añadir una página o vista identificable como **Comparativa B2B vs B2C**.
- Incluir un filtro de fechas compartido para ambos segmentos. Las fechas usan `YYYY-MM-DD`, son inclusivas y pueden quedar vacías para abarcar todos los datos disponibles.
- Presentar en paralelo una tabla B2B y una tabla B2C. Cada tabla lista hasta cinco categorías principales de **ingresos**, con: nombre de categoría, total de ingresos de esa categoría y porcentaje del total de ingresos del segmento para el rango seleccionado.
- Presentar un gráfico comparativo de los ingresos totales B2B y B2C para el mismo rango. El valor del gráfico debe representar ingresos (`income`), no neto ni ingresos más gastos.
- Usar las categorías disponibles de `GET /api/metrics/facets` como referencia para etiquetas/filtros; facets devuelve categorías globales y no una lista separada por segmento.
- Mantener los filtros, periodos y unidades consistentes entre tablas y gráfico. Diferenciar los estados sin datos de carga y error.

### Contrato de datos y cálculo

Rutas confirmadas en `/docs`:

1. `GET /api/metrics/categories/top`: obtener categorías principales usando `operation_type=income`, `limit=5`, las fechas seleccionadas y `business_type=B2B` o `business_type=B2C`. Se requieren dos solicitudes, una por segmento.
2. `GET /api/metrics`: obtener todos los movimientos de ingresos por segmento para el total del gráfico y el denominador del porcentaje.
3. `GET /api/metrics/facets`: obtener categorías y rango global disponible. No admite filtros ni query params.
4. Cada respuesta de top categories es una lista ordenada por `total_amount` descendente; un elemento contiene `category`, `operation_type` y `total_amount`. Puede devolver menos de cinco elementos.
5. El endpoint top no devuelve el total de ingresos del segmento ni un porcentaje por categoría. El denominador se define como la suma de los importes de todos los movimientos `income` del segmento en el rango seleccionado; el porcentaje de una categoría es `total_amount / total_ingresos_del_segmento × 100`.
6. No usar la suma de las cinco filas top como denominador. Usar movimientos completos obtenidos mediante `GET /api/metrics` con `operation_type=income`, `business_type=<B2B|B2C>` y fechas cuando estén informadas. Si el total del segmento es cero, indicar que el porcentaje no está disponible (no dividir por cero).
7. La suma puede calcularse en la capa de lógica financiera del frontend; no atribuir esos totales o porcentajes a los campos de la respuesta de top categories.
8. Facets devuelve categorías y límites globales `min_date`/`max_date`; no acepta `business_type`, fechas ni otros filtros y no ofrece categorías específicas por segmento.

### Tipos TypeScript de solicitud y respuesta

```ts
import type { BusinessType, Category, OperationType, FinancialMovement } from "../src/lib/financial-types";
import type { DataRangeFilter, TopCategoriesParams } from "./param-types";
import type { FacetResponse, TopCategoriesResponse } from "./api-types";

// Cada segmento hace una solicitud GET /api/metrics/categories/top
type TopCategoriesRequest = TopCategoriesParams;
type TopCategoriesResponseBody = TopCategoriesResponse;

// Una solicitud GET /api/metrics por segmento para total y denominador
type SegmentMovementsRequest = DataRangeFilter & {
	operation_type: "income";
	business_type: BusinessType;
};
type SegmentMovementsResponse = FinancialMovement[];

// Facets: sin query params ni body
type SegmentFacetsResponse = FacetResponse;
```

Los nombres `TopCategoriesParams`, `TopCategoriesResponse`, `DataRangeFilter` y `FacetResponse` son los aliases de Fase 2. `FinancialMovement[]` está definido en `frontend/src/lib/financial-types.ts`. Las formas `SegmentMovementsRequest` y `SegmentMovementsResponse` describen el uso de este feature, sin ampliar los tipos exportados de Fase 2.

### Valores válidos y restricciones de parámetros

| Parámetro | Tipo TS | Valores/restricciones OpenAPI | Uso en comparativa |
|---|---|---|---|
| `operation_type` (top) | `OperationType` opcional | `income` o `outcome`, default API `outcome`. | Obligatorio semánticamente para la función: `income`. |
| `limit` | `number` opcional | Entero de 1 a 20; default API `5`. | `5`, máximo solicitado por el producto. |
| `start_date`, `end_date` | `ISODateString` opcionales | `YYYY-MM-DD`, inclusivos; sin relación de orden validada explícitamente por esta ruta. | Rango compartido; omitir límites vacíos. |
| `business_type` | `BusinessType` opcional | `B2B` o `B2C`. | Obligatorio semánticamente en cada solicitud, un valor distinto por tabla. |
| `operation_type` (movimientos) | `OperationType` opcional | `income` o `outcome`. | `income` para no mezclar gastos con ingresos. |
| `category` (movimientos) | `Category` opcional | `suppliers`, `sales`, `operational`, `administrative`, `others`. | Omitir: se necesitan todos los movimientos de ingreso. |

La respuesta de top categories es `TopCategoriesResponse` (`CategoryEntry[]`), con `category`, `operation_type` y `total_amount`. La respuesta de movimientos es `FinancialMovement[]`, con `create_date`, `amount`, `operation_type`, `category` y `business_type`. Facets responde `FacetResponse`.

### Decisiones cerradas para esta especificación

- Las fechas vacías significan todos los datos disponibles. Cuando hay una sola fecha, se envía únicamente ese límite y el backend aplica el otro extremo abierto.
- Las dos tablas usan la lista top-five agregada, mientras que el gráfico y el denominador de porcentajes usan movimientos completos filtrados por `operation_type=income` y segmento.
- La tabla de alertas presenta el `baseline_average` contractual como **Promedio histórico de gastos anteriores**. Se descarta para esta versión el wording de media móvil de tres periodos porque no coincide con el cálculo vigente de la API.
- El umbral de alertas es un control de porcentaje entero del 1 % al 100 % (paso de 1 %), convertido a razón decimal antes de enviarlo; default 30 % (`0.3`). Así se evita que la UI sugiera precisión inferior a la que especifica el brief.

### Criterios de aceptación

- Las tablas solicitan `operation_type=income`, `limit=5` y el `business_type` correcto para cada lado.
- Las dos tablas y el gráfico comparten el mismo rango de fechas.
- Las filas se ordenan por `total_amount` descendente y muestran categoría, importe y porcentaje del total de ingresos de su segmento.
- El porcentaje usa el total de todos los ingresos del segmento, no el subtotal de las cinco categorías principales.
- El gráfico compara ingresos totales B2B y B2C; no usa los agregados de top-five como si fueran el total.
- Un segmento sin movimientos tiene un estado vacío explícito y no produce porcentajes inválidos.

### Casos límite y resultado esperado en UI

1. **Cero ingresos en un segmento:** mostrar total `0`; mostrar porcentaje como “No disponible” (no dividir por cero) y un estado sin categorías si la lista está vacía.
2. **Menos de cinco categorías o ninguna:** mostrar las filas recibidas en su orden; para `[]`, mostrar mensaje vacío únicamente en la tabla de ese segmento, manteniendo disponible el otro segmento.
3. **Una fecha vacía o ambas vacías:** enviar solo el límite informado o ninguno; tablas, totales y gráfico usan el mismo rango lógico.
4. **Categoría top con total mayor al total derivado de movimientos:** tratarlo como inconsistencia de datos; no ocultar ni normalizar silenciosamente el valor y mostrar estado de error de consistencia en la vista comparativa.
5. **Falla de una solicitud de segmento:** indicar qué segmento no pudo cargarse; no presentar una comparación completa como si el segmento fallido tuviera total cero.

## Referencias del contrato

- Tipos de respuesta: [`api-types.ts`](./api-types.ts).
- Tipos de parámetros: [`param-types.ts`](./param-types.ts).
- Especificaciones detalladas previas: [`top-categories.md`](./top-categories.md), [`outcome-alerts.md`](./outcome-alerts.md) y [`period-comparison.md`](./period-comparison.md).
