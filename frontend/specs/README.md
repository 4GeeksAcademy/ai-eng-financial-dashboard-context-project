# Contrato de datos — funcionalidades analíticas del dashboard

> **Estado:** especificación para una implementación futura; no es código ejecutable ni una declaración de que estas funcionalidades ya existan en la UI.
>
> **Fuentes TypeScript:** [`api-types.ts`](./api-types.ts) contiene los tipos de respuesta wire y [`param-types.ts`](./param-types.ts) los parámetros query, derivados del OpenAPI consultado y contrastados con modelos backend el 2026-10-09. No son un cliente ni validación runtime. Para requisitos de UI se usa [`components.md`](./components.md).

## 1. Propósito y alcance

Establecer nombres de campos, parámetros, tipos, restricciones y comportamientos de datos para implementar posteriormente:

1. filtro compartido de rango de fechas para todos los datos de la página principal;
2. tabla de alertas de egresos;
3. vista comparativa de ingresos y categorías B2B vs B2C.

Este documento es **exclusivamente una especificación**. El futuro coding agent:

- **No debe implementar React en esta fase**, ni agregar o alterar componentes runtime.
- **No debe añadir llamadas de red** ni cliente API.
- **No debe modificar el backend** ni infra/configuración.
- Debe usar literalmente los nombres verificados: `start_date`, `end_date`, `business_type`, `group_by`, `threshold`, `operation_type`, `limit`; los campos de respuesta documentados en §7.
- Ante discrepancia entre este documento, tipos TypeScript, backend o respuesta viva, debe contrastar primero [`/docs`](http://localhost:8000/docs) y el OpenAPI JSON servido, luego actualizar el contrato antes de implementar. No debe resolver discrepancias inventando/renombrando campos.
- Debe mantener cálculos financieros derivados en utilidades de dominio frontend (`src/lib/`) y componentes de presentación simples, conforme a las reglas del repositorio; esta entrega no implementa esa lógica.

No se especifica aquí transporte, librería gráfica, estilo visual, textos localizados finales ni arquitectura de implementación. Los props/composición visual y criterios funcionales detallados están en [`components.md`](./components.md).

## 2. Fuentes de verdad y referencias a `/docs`

### Orden de autoridad

1. **Contrato publicado vigente:** [Swagger UI `/docs`](http://localhost:8000/docs) y [`/openapi.json`](http://localhost:8000/openapi.json), backend `Financial Metrics API` v`0.1.0`, inspeccionados el `2026-10-09` mientras el servicio local estaba activo. En la auditoría actual el backend no estaba activo; las rutas se contrastaron también con sus declaraciones de código.
2. **Comportamiento de negocio no expresable en OpenAPI:** [rutas/modelos backend](../../backend/app/routes.py). Se cita como evidencia de implementación, no como validación declarada por OpenAPI.
3. **Requisitos y comportamiento UI:** [`components.md`](./components.md), que recoge la petición de producto, patrones existentes y decisiones no cerradas.
4. **Patrones de frontend actuales:** [`App.tsx`](../src/App.tsx), [`financial-types.ts`](../src/lib/financial-types.ts), [`financial-utils.ts`](../src/lib/financial-utils.ts) y [`components/dashboard/`](../src/components/dashboard/). La aplicación hoy solo consume `/api/metrics`; sus movimientos alimentan KPIs y ambos gráficos, por lo que el filtro de fecha debe aplicarse a esa consulta existente además de las vistas nuevas.
5. **[`api-types.ts`](./api-types.ts) y [`param-types.ts`](./param-types.ts):** el primero contiene respuestas wire y el segundo query params; los tipos UI actuales en `src/lib/financial-types.ts` son distintos y no sustituyen modelos API.

**No copiar modelos desde nombres supuestos:** §7 referencia respuestas de `components.schemas` y parámetros de `/openapi.json` en los dos archivos TypeScript. Los query params opcionales anulables se representan como `?: T | null`; en URL, omitir el parámetro cuando no hay valor y no serializar literalmente la cadena `"null"`.

## 3. Convenciones de fechas, números, porcentajes y parámetros

### Fechas

- Tipo wire/API: string en formato OpenAPI `date`, serialización `YYYY-MM-DD`.
- Los extremos `start_date` y `end_date` son opcionales para las rutas listadas salvo `/api/metrics/comparison`, que exige ambos.
- En backend, las funciones de filtrado usadas por movimientos aplican inclusividad: `create_date >= start_date` y `create_date <= end_date`.
- `MetricsFacets.min_date`/`max_date` describen los límites observados en facets; OpenAPI no declara que el servidor rechace consultas fuera de esos límites.
- El contrato no valida explícitamente `start_date <= end_date`. La UI bloquea la consulta para rangos invertidos; esto es regla de interfaz, no validación atribuida al backend.

### Números y porcentaje

- OpenAPI declara los montos y ratios como `number`; no declara moneda, escala decimal de presentación ni límites para estos campos.
- `MetricsAlert.increase_ratio` del endpoint existente se devuelve como ratio fraccional `(outcome - baseline) / baseline`, redondeado a 4 decimales; no se usa para la tabla PM porque su baseline es acumulado. La fila PM deriva el ratio con media móvil desde summary.
- `/api/metrics/comparison` usa `delta_pct` como porcentaje numérico (cálculo del backend: `(delta_abs / abs(previous_net)) * 100`, dos decimales) o `null` cuando el neto previo es cero. Ese endpoint no es necesario para las tres tablas/gráficos solicitados, pero su tipo se incluye para integridad del catálogo.
- Top de categoría y agregados de movimiento devuelven importe sin currency code. El formateador USD actual en UI no prueba que la moneda de la API sea USD.
- `CategoryEntry` no contiene “porcentaje del total del grupo” ni el total del grupo. §6 especifica la derivación basada en summary y el total usado por el gráfico.

### Query params y estados

- Los parámetros se envían con los nombres y valores literales listados en §8.
- Default solo cuando no se envía el parámetro: `threshold=0.3`, `group_by=month` en alerts; `group_by=month` en summary; `operation_type=outcome`, `limit=5` en categories/top.
- La UI de alertas inicia en `0.3`, con rango `[0.01,1.0]` y paso `0.01`; OpenAPI de `/alerts` solo confirma `minimum=0` y no máximo. El umbral se aplica en el cálculo derivado desde summary.
- Éxito con `[]` es respuesta válida sin filas; no equivale a fallo HTTP. Los endpoints de parámetros declaran `422 HTTPValidationError` para errores de validación; el esquema `detail` es opcional y no cubre un contrato exhaustivo de fallos operacionales/red.
- Respuestas de arrays incluyen cero o más elementos salvo que el código declare otra cosa; un límite de 5 significa hasta 5, no garantía de exactamente 5.

## 4. Funcionalidad 1: filtro de rango de fechas

El control de la página principal obtiene límites disponibles desde `GET /api/metrics/facets` y publica una selección compartida por los movimientos actuales y alertas. Dos campos opcionales no implican que se complete automáticamente el otro extremo. La nueva página comparativa reutiliza el control con su propia selección, aplicada a sus tablas y gráfico.

### Contrato

- Fuente del rango: `MetricsFacets.min_date`, `MetricsFacets.max_date`.
- Valores de UI (`DateRangeValue`) se convierten a query params `start_date`, `end_date` con formato ISO date.
- Destinos: `/api/metrics` para recalcular KPIs, gráfico ingreso/egreso y margen; `/api/metrics/summary` para derivar alertas de la página principal. La página comparativa usa `/api/metrics/categories/top` por grupo y `/api/metrics/summary` para porcentajes y total del gráfico.
- Si solo existe un extremo, enviarlo y omitir el otro. Si ambos están vacíos, omitir ambos; las rutas opcionales usan el dataset sin recorte temporal. No sustituir extremos por `min_date`/`max_date`.
- La ruta `/api/metrics/facets` no tiene query params y devuelve también listas de enums disponibles. `facets` no filtra ni modifica la respuesta de las demás rutas.
- `/api/metrics` no acepta `business_type`; no usarla para simular la segmentación. Sus fechas sí filtran todos los movimientos que alimentan la página principal.

### Reglas UX que no son validación del backend

- Los inputs limitan selección a `min_date`/`max_date`; un estado fuera de esos límites produce error y no consulta, sin recortar silenciosamente.
- En rango invertido, no solicitar y presentar error asociado a campos; el backend no valida ni rechaza explícitamente el orden.
- Un mismo día para ambos extremos es rango inclusivo de ese día, acorde al filtro backend.
- Estado inicial: ambos campos vacíos, así la primera consulta conserva todo el dataset. La actualización es inmediata al cambiar un valor válido; no hay botón Aplicar. Los inputs usan `min=min_date`, `max=max_date`; si el estado llega externamente fuera de esos límites, se informa y no se consulta hasta corregirlo.

## 5. Funcionalidad 2: tabla de alertas

### Petición/respuesta y regla observada

- El requisito PM de media móvil de tres períodos **no coincide** con `GET /api/metrics/alerts`: su `baseline_average` es la media de todos los períodos anteriores y la ruta solo devuelve anomalías según esa otra regla. No se usará ese resultado como contrato de la tabla solicitada.
- Fuente para cumplir el outcome PM: `GET /api/metrics/summary?group_by=month` devuelve `MetricsSummaryItem[]` con `period` y `outcome`. Pedir una serie con el rango elegido para valores actuales y una serie histórica hasta `end_date` (omitiendo `start_date`) para disponer de los tres meses previos completos. Si no hay `start_date`, la serie histórica y la de actuales pueden ser la misma respuesta.
- Para cada período incluido en la serie actual, buscar exactamente los tres meses calendario inmediatamente anteriores en la serie histórica. Los meses sin bucket dentro del rango de datos se completan con `outcome=0`; no crear períodos anteriores a `facets.min_date`. Si faltan meses previos cubiertos por el dataset, no mostrar alerta para ese período. `baseline_average` es la media aritmética de esos tres `outcome`; si es `<= 0`, no se calcula alerta. Calcular `increase_ratio = (outcome - baseline_average) / baseline_average`; emitir fila solo si `increase_ratio > threshold` (estricto).
- Crear filas de presentación con `period`, `outcome_total` (outcome actual), `baseline_average` (media móvil calculada) e `increase_ratio` (ratio fraccional). Conservan nombres de `AlertEntry`, pero son valores derivados, **no** respuesta wire de `/api/metrics/alerts`.
- La serie histórica usa `group_by=month`, mismo `end_date` y mismo `business_type` si se establece; omite `start_date` para incluir baseline anterior al rango visible. Los períodos mostrados siguen limitados a la consulta actual con ambos extremos seleccionados.

### Umbral

- API: `threshold: number`, opcional, default `0.3`, `minimum=0`; no máximo OpenAPI.
- UI: mostrar inicialmente `0.3`; aceptar `[0.01, 1.0]` con paso `0.01`. Enviar el valor explícitamente en el cálculo derivado.
- `increase_ratio === threshold` no produce fila: la comparación es estrictamente `>`.

### Render

- Columnas: Período (`period`, mensual), Outcome registrado (`outcome_total`), Media móvil de los tres períodos anteriores (`baseline_average`) e incremento porcentual (`increase_ratio * 100`). Mostrar importes con dos decimales, porcentaje con un decimal y sin símbolo de moneda porque la API no declara moneda.
- Si la derivación desde summary no produce filas, estado explícito “sin anomalías” para los filtros/umbral vigentes, no error.
- Error de transporte/servidor: estado de error separado. Una solicitud inválida puede devolver 422; no inferir códigos ni mensajes para fallos no documentados.

## 6. Funcionalidad 3: comparativa B2B vs B2C

### Top cinco de ingresos

- Usar `/api/metrics/categories/top` para agregados por categoría, con query params `operation_type=income`, `limit=5`, rango opcional y `business_type=B2B` o `B2C`. Son dos consultas lógicas con filtros de grupo diferentes. El endpoint suma por categoría y ordena por total descendente; solo devuelve categorías presentes, hasta limit.
- Respuesta `TopCategoriesResponse` (`CategoryEntry[]`): `category`, `operation_type`, `total_amount`. No incluye `business_type`, periodo, porcentaje de grupo ni total general. `business_type` se conoce por la consulta que produjo cada array.
- Mostrar solo filas devueltas. Array vacío válido en una respuesta individual se representa como “sin categorías de ingreso” para ese grupo; de 1 a 4 filas son datos parciales válidos, no error ni ceros artificiales.
- Para el dataset backend actual hay solo dos categorías de ingreso generadas (`sales` y `others`), así que los Top 5 reales pueden devolver como máximo dos filas por grupo. El contrato `limit=5` sigue siendo un máximo y no garantiza cinco.
- No presentar ingreso `outcome`: fijar `operation_type=income` explícitamente porque el default real del endpoint es `outcome`.

### Porcentaje y gráfico

- El porcentaje solicitado se define respecto de todos los ingresos del grupo en el rango, incluidas categorías fuera del Top 5. Para cada segmento, obtener summary con `business_type` y las mismas fechas; omitir `category` y `operation_type`; calcular `total_income = sum(summary[].income)` y `percentage = total_amount / total_income * 100`. Mostrar porcentaje con un decimal. La API no entrega este campo: es una derivación de consumidor.
- Si `total_income` es cero, mostrar `—` en porcentaje. No fabricar `0%`, `NaN` ni infinito. Los importes se muestran con dos decimales y sin símbolo de moneda no declarado por API.
- El gráfico único compara **ingresos totales**, no porcentajes por categoría: pedir summary sin `category` ni `operation_type` para cada `business_type`, sumar `income` sobre todos los períodos del mismo rango y mostrar dos barras (`B2B`, `B2C`) en una sola escala de importe. Esta regla evita truncamiento por el límite Top 5 y usa el mismo total que sirve de denominador en las tablas.
- `/api/metrics/facets` devuelve `categories` globales y no acepta `business_type`; no puede producir listas de categorías específicas de cada grupo. Usar esa lista como enum global de categorías. La disponibilidad real por grupo y rango se deriva de las filas devueltas por su llamada a Top categories; no inferirla de facets.
- Si una respuesta summary por grupo es `[]`, tratar el total como no disponible, no como cero. En una tabla Top vacía, mostrar estado por grupo; el gráfico presenta barras solo para grupos con datos y un estado vacío propio si ambos summaries están vacíos.

### Alternativas de datos verificadas

- `/api/metrics/b2b` y `/api/metrics/b2c` devuelven `FinancialMovement[]` ya segregados por ruta y aceptan fecha, categoría y operación; no reciben `business_type` como parámetro. Para Top 5 existe la ruta agregada `categories/top`; para totales del gráfico y denominadores se usa summary segregado por `business_type`.
- Errores y arrays vacíos son estados diferentes y por grupo: un `[]` B2B no elimina una respuesta B2C satisfactoria; un error en una consulta no debe presentarse como “sin categorías”. El comportamiento visual parcial se detalla en `components.md`.

## 7. Tipos TypeScript de respuestas y parámetros

[`api-types.ts`](./api-types.ts) contiene las respuestas derivadas de OpenAPI; [`param-types.ts`](./param-types.ts) contiene los query params. Los nombres solicitados por el ejercicio se exportan literalmente y los tipos mantienen las formas wire requeridas.

```ts
import type {
  AlertEntry,
  AlertsResponse,
  BusinessType,
  Category,
  CategoryEntry,
  FacetsResponse,
  FinancialMovement,
  GroupBy,
  HTTPValidationError,
  ISODate,
  MetricsComparison,
  MetricsSummaryItem,
  OperationType,
  TopCategoriesResponse,
  ValidationError,
} from "./api-types";

import type {
  AlertsParams,
  ComparisonParams,
  DateRangeFilter,
  MetricsParams,
  MetricsSummaryParams,
  SegmentMovementsParams,
  TopCategoriesParams,
} from "./param-types";

// Datos UI/props no son DTOs API; se muestran para distinguir camelCase local.
export interface DateRangeValue {
  startDate?: ISODate;
  endDate?: ISODate;
}
```

La interfaz de alertas deriva `AlertEntry` desde summary según la regla móvil definida en §5; no debe sustituirla por `baseline_average` del endpoint `/alerts`. El porcentaje de tablas y los totales del gráfico son derivaciones desde summary conforme a §6. Los tipos wire no convierten estas reglas derivadas en campos del API.

## 8. Tabla de endpoints, métodos, parámetros y tipos

En la tabla, “respuesta” es el `response_model` 200; las rutas muestran también 422 en OpenAPI para errores de validación cuando tienen parámetros. Los parámetros omitidos usan el default indicado o semántica no filtrada. Los query params opcionales `date | None` en FastAPI se expresan como `string(date) | null` en el esquema; la forma recomendada de URL cuando no hay selección es omitir el parámetro.

| Funcionalidad/uso | Método y ruta | Parámetros de query exactos | Respuesta 200 |
|---|---|---|---|
| Facets y límites disponibles | `GET /api/metrics/facets` | Ninguno | `FacetsResponse` |
| Movimientos de toda la página principal | `GET /api/metrics` | `start_date?: date | null`; `end_date?: date | null`; `category?: Category | null`; `operation_type?: OperationType | null` | `FinancialMovement[]` |
| Alertas PM (valor actual y baseline) | `GET /api/metrics/summary` (consulta actual + histórica según §5) | `group_by=month`; extremos del rango actual; histórico omite `start_date`; sin `category`, `operation_type` ni `business_type` | `MetricsSummaryItem[]`, transformado a filas derivadas |
| Denominador de porcentaje y total para gráfico comparativo | `GET /api/metrics/summary` (una consulta por grupo) | `group_by=month`; extremos compartidos; `business_type=B2B` o `B2C`; sin `category` ni `operation_type` | `MetricsSummaryItem[]` |
| Top 5 ingresos de cada segmento | `GET /api/metrics/categories/top` (dos filtros `business_type`) | `operation_type=income`; `limit=5`; `start_date?: date | null`; `end_date?: date | null`; `business_type=B2B` o `B2C` | `TopCategoriesResponse` |
| Endpoint de alertas existente, incompatible con baseline PM | `GET /api/metrics/alerts` | `threshold?: number` (default 0.3, min 0); `group_by?: GroupBy` (default `month`); fechas y `business_type` opcionales/anulables | `AlertsResponse`; no usar como fuente de la tabla de tres períodos |
| Comparación de periodo (ruta existente; auxiliar, no resuelve Top 5/alertas) | `GET /api/metrics/comparison` | `start_date: date` (required); `end_date: date` (required); `business_type?: BusinessType | null` | `MetricsComparison` |
| Alternativa: movimientos B2B | `GET /api/metrics/b2b` | `start_date?: date | null`; `end_date?: date | null`; `category?: Category | null`; `operation_type?: OperationType | null`; **no** `business_type` | `FinancialMovement[]` |
| Alternativa: movimientos B2C | `GET /api/metrics/b2c` | `start_date?: date | null`; `end_date?: date | null`; `category?: Category | null`; `operation_type?: OperationType | null`; **no** `business_type` | `FinancialMovement[]` |
| Datos existentes generales (no segmentados) | `GET /api/metrics` | `start_date?: date | null`; `end_date?: date | null`; `category?: Category | null`; `operation_type?: OperationType | null`; **no** `business_type` | `FinancialMovement[]` |

Ruta auxiliar revisada para evitar confusión: `GET /api/metrics/comparison` exige `start_date: date` y `end_date: date`, acepta `business_type?: BusinessType | null` y devuelve `MetricsComparison`; no proporciona Top 5 ni baseline móvil. No se necesita para estos requisitos. A diferencia de las fechas opcionales de los otros endpoints, en comparison `start_date`/`end_date` son requeridos y no anulables.

## 9. Restricciones de validación y valores por defecto

| Campo | Restricción verificada OpenAPI/backend | Default API | Restricción de producto/UI o pendiente |
|---|---|---|---|
| `start_date`, `end_date` | En alerts, summary, categories/top, b2b/b2c y metrics: opcionales y anulables (`date | null`). En comparison: obligatorios, no anulables. Fechas inclusivas en filtros revisados. No hay validación backend de orden ni límites facets. | Ausente (`None`) salvo comparison, requerido | Campos vacíos omiten query; UI impide valores fuera de facets y rangos invertidos. |
| `threshold` | `number`, minimum 0, sin maximum API en `/alerts` | `0.3` | UI/calculado: `[0.01,1.0]`, inicia `0.3`, paso `0.01`. |
| `group_by` | enum `day`, `week`, `month` | `month` | Funcionalidad de alertas fija `month` para que tres períodos signifique tres meses. |
| `business_type` | enum `B2B`, `B2C`; opcional en alerts, summary, categories/top y comparison. En b2b/b2c la ruta fija el grupo, no query param. | Ausente | Consultar summary y top por separado para cada grupo en la comparativa. |
| `operation_type` | enum `income`, `outcome` | categories/top=`outcome`; opcional en otras rutas indicadas | En tabla de ingresos siempre enviar explícitamente `income`. |
| `limit` | entero entre 1 y 20 | `5` | Solicitar 5; la respuesta puede tener menos de 5. |
| campos de modelos | Todos requeridos salvo `MetricsComparison.delta_pct` que acepta null. | N/A | No asumir importes o porcentaje como currency/formato particular. |

Los endpoints listados declaran respuesta `422` con `HTTPValidationError` en OpenAPI; `detail` es opcional según el esquema y sus elementos requieren `loc`, `msg`, `type`, con `input` y `ctx` opcionales. No extrapolar ese schema como contrato para fallos de red, 5xx u otros errores no descritos. Para un request con valor `null` explícito, aunque OpenAPI admite nulabilidad en parámetros opcionales, preferir omitirlo de la URL.

## 10. Casos límite y estados de interfaz

Los resultados vacíos solo deben tratarse como tales cuando la respuesta HTTP es exitosa y el payload array es `[]`. Un fallo tiene estado independiente; no convertir excepción/422 en una tabla vacía. Los comportamientos marcados como UX son propuestas, no reglas que el API imponga.

| Funcionalidad | Condición inicial y parámetros | Resultado esperado en la interfaz | Regla contractual / estado |
|---|---|---|---|
| Fechas | Ningún control seleccionado; facets cargado; omitir `start_date` y `end_date` | Ambos inputs vacíos; página principal y vistas analíticas muestran el dataset completo. | Fechas opcionales; no sustituir por límites de facets. |
| Fechas | Solo `startDate=2025-04-10`; sin fin | Mostrar inicio seleccionado; solicitar con `start_date=2025-04-10`, omitir `end_date`. Aplicar límite inclusivo inferior. | `date` opcional, filtrado `>=`. |
| Fechas | Solo `endDate=2025-04-10`; sin inicio | Mostrar fin seleccionado; omitir `start_date`, enviar `end_date=2025-04-10`; límite inclusivo superior. | `date` opcional, filtrado `<=`. |
| Fechas | Inicio `2025-04-12`, fin `2025-04-10` | Mostrar error accesible y no emitir consulta hasta corregir. | UI valida; API no documenta orden/rechazo. |
| Fechas | Fecha anterior a `min_date` o posterior a `max_date` | Input restringido por min/max; estado restaurado inválido se anuncia y no consulta. | Facets informa límites; API no valida dichos límites. |
| Alertas | Menos de tres períodos cronológicos previos | No producir fila para ese período; sigue apareciendo si otro período posterior sí reúne tres baselines y supera el umbral. | Baseline exige exactamente tres buckets mensuales completos previos. |
| Alertas | Baseline de tres períodos es `0` | Omitir la alerta por división indefinida; no presentar infinito. | Regla derivada requiere baseline `> 0`. |
| Alertas | Incremento es igual a threshold | No producir fila. | Comparación estricta `>`. |
| Alertas | Ninguna fila derivada supera threshold | Mostrar estado explícito “No se detectaron anomalías…”. | Estado vacío derivado; no depende de respuesta `[]` de `/api/metrics/alerts`. |
| Alertas | Error HTTP/red (p. ej. 422 de parámetro inválido, o fallo de red) | Estado de error visible separado, sin decir “sin anomalías”; permitir reintento si se aprueba. | 422/HTTPValidationError declarado para validación; fallos red no son response model. |
| B2B/B2C | B2B responde `[]`; B2C devuelve dos filas | Panel B2B informa que no hay categorías; panel B2C muestra exactamente dos filas; gráfico global no inventa dato faltante. | Cada grupo se consulta independientemente; array top puede tener menos de limit; vacío no es fallo. |
| B2B/B2C | Grupo responde 1–4 categorías | Mostrar solo esos registros y no placeholders con ceros. | Top categories devuelve hasta limit y solo categorías existentes con movimiento filtrado. |
| B2B/B2C | Total de ingreso de grupo es cero | Mostrar `—` en porcentaje; el total del gráfico puede mostrar el cero si summary devuelve buckets. | Denominador definido como suma de todos los `income`; no dividir por cero. |
| B2B/B2C | Facets no distingue categorías por grupo | Usar `facets.categories` como enum global y las respuestas Top para disponibilidad de cada grupo/rango. | `/facets` no acepta `business_type`; no inventar listas segmentadas. |
| B2B/B2C | Ambos summaries están vacíos / solo uno vacío | Ambos vacíos: estado vacío del gráfico. Uno vacío: graficar solo el grupo con datos y señalar el otro como no disponible, no como cero. | Diferenciar ausencia de datos de valor numérico cero. |
| B2B/B2C | Respuesta válida `[]` frente a fallo en el request de un grupo | `[]`: vacío informativo de ese grupo. Fallo: error de ese grupo; conservar estado/datos del otro grupo. | Estado HTTP y payload son distintos; implementación debe preservar independencia. |

## 11. Decisiones fijadas y discrepancias verificadas

1. **Tipos:** `api-types.ts` contiene modelos de respuesta y `param-types.ts` los parámetros query, con los nombres y nulabilidad documentados en §7.
2. **Fechas:** ambas vacías inicialmente, aplicación inmediata; la vista principal filtra `/api/metrics` y alertas; la página comparativa tiene selección propia.
3. **Alertas:** mensual, media de los tres buckets previos, baseline mayor que cero, razón estrictamente mayor que threshold. `/api/metrics/alerts` no sirve como fuente por su baseline acumulado; se deriva desde summary.
4. **Comparativa:** porcentaje sobre todo ingreso del grupo/rango; gráfico de dos totales desde summary. `/api/metrics/facets` entrega categorías globales, no segmentadas.
5. **Verificación live:** el servicio no estaba activo durante esta auditoría; se inspeccionaron los handlers actuales en `backend/app/routes.py`. Antes de implementar, volver a consultar `/docs` y reconciliar cualquier deriva.

## 12. Criterios de aceptación para implementación futura

La implementación futura podrá considerarse contractualmente aceptable cuando:

1. Haya reconciliado este contrato con `api-types.ts` y OpenAPI vigente; cualquier diferencia de campos/enum/query haya sido resuelta antes de programar.
2. Los filtros serialicen fechas ISO `YYYY-MM-DD`; vacíos muestran todo, un extremo filtra inclusivamente, y la página principal aplica el rango a `/api/metrics` además de alerts. La nueva página comparativa conserva su propio rango.
3. Fechas fuera de facets o rango invertido presentan validación accesible y no emiten solicitud; no se atribuye esa regla al backend.
4. El control de alertas aplica `threshold` entre 0.01 y 1.0 con paso 0.01, inicio 0.3; se usa summary mensual, con tres meses de historial previo cuando sea necesario.
5. Filas de alertas calculan media de tres períodos anteriores, exigen baseline > 0 y usan comparación estricta `>`; no se etiqueta como tal el baseline acumulado del endpoint `/alerts`.
6. Top de cada grupo use `operation_type=income`, `limit=5`, su fecha compartida y `business_type` correcto; muestre cero o menos de cinco sin rellenar categorías.
7. Porcentajes usan `sum(summary[].income)` por grupo/rango como denominador, presentan un decimal y `—` para cero. El único gráfico de la página nueva compara los dos totales de ingreso B2B/B2C, no porcentajes/categorías.
8. Carga, éxito vacío y error sean visualmente y semánticamente distintos; los fallos de un segmento no escondan el resultado del otro.
9. La comparativa esté disponible en `/comparison` desde navegación visible, con dos paneles paralelos y un gráfico compartido debajo; tablas/gráfico tengan estados vacíos y resumen textual accesibles; controles fecha/umbral tengan label, teclado, foco y mensajes asociados.
10. La lógica financiera derivada resida en utilidades testeables bajo `frontend/src/lib/`, conforme a reglas actuales; se prueben casos positivos, vacíos, límites y errores sin cambiar ni duplicar contrato.
11. En la fase actual no se agreguen componentes React, llamadas de red, cambios backend, runtime, dependencias o commits.

---

## Referencias cruzadas

- Especificación funcional, props y reglas detalladas: [`components.md`](./components.md).
- Contrato OpenAPI en vivo: [`/docs`](http://localhost:8000/docs) · [`/openapi.json`](http://localhost:8000/openapi.json).
- Modelos/rutas backend: [`routes.py`](../../backend/app/routes.py).
- Tipos de UI existentes: [`financial-types.ts`](../src/lib/financial-types.ts).
- App y utilidades existentes: [`App.tsx`](../src/App.tsx) · [`financial-utils.ts`](../src/lib/financial-utils.ts).
- Evidencia técnica/prácticas revisadas: [`FASE2_BUENAS_PRACTICAS.md`](../../FASE2_BUENAS_PRACTICAS.md).
