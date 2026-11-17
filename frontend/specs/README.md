# Especificaciones frontend — Financial Dashboard

## Objetivo y alcance

Este directorio define el contrato de datos y el comportamiento esperado para:

1. Filtrar el dashboard por fechas y mostrar el intervalo global del dataset.
2. Mostrar alertas de gastos con un umbral editable y una media de los tres
   períodos anteriores.
3. Comparar ingresos y categorías principales de los segmentos B2B y B2C.

Esta fase documenta especificaciones; no implementa componentes React, llamadas
HTTP ni cambios del backend. La aplicación existente usa React 19, TypeScript,
Vite, Tailwind CSS y Recharts; el backend usa FastAPI/Pydantic. El frontend
actual consume `/api/metrics` desde [`../src/App.tsx`](../src/App.tsx) y calcula
KPI y agregados mensuales en
[`../src/lib/financial-utils.ts`](../src/lib/financial-utils.ts).

### Documentos y guía para el coding agent

- [`api-types.ts`](./api-types.ts): modelos de respuestas de facetas, alertas y
  categorías top. Alertas y categorías top son arrays JSON, no envoltorios.
- [`param-types.ts`](./param-types.ts): tipos compartidos para fechas y
  parámetros de alertas/categorías.
- [`components.md`](./components.md): contratos de componentes, flujo de datos,
  estados visuales y decisiones de interfaz propuestas.
- [`../../backend/app/routes.py`](../../backend/app/routes.py): implementación
  que debe consultarse para confirmar semántica API; no cambiarla como parte de
  la implementación frontend.

Al implementar, reutilizar estos tipos y los de
[`../src/lib/financial-types.ts`](../src/lib/financial-types.ts); mantener el
estado de filtros y solicitudes en `App`; pasar datos por props; distinguir
errores de respuestas vacías; y evitar publicar respuestas de filtros
obsoletos. No presentar decisiones propuestas como garantías del backend.
Validar fechas y el rango de umbral del producto en frontend: TypeScript usa
`string` para fechas y el backend acepta un rango de umbral más amplio.

## Evidencia y contrato común

Se consultaron `GET /docs` y `GET /openapi.json` en el backend activo el
**2026-11-15**; ambos respondieron `200`. Las formas descritas a continuación
se contrastaron con OpenAPI y con
[`routes.py`](../../backend/app/routes.py). Las respuestas de ejemplo son
observaciones del dataset simulado en esa fecha, no datos fijos del producto.

Los movimientos tienen esta forma (todos los campos son requeridos):

```json
{
  "create_date": "2026-01-01",
  "amount": 6434.18,
  "operation_type": "outcome",
  "category": "operational",
  "business_type": "B2C"
}
```

`amount` es numérico y no tiene moneda declarada en el contrato. Las uniones
permitidas son `operation_type: income | outcome`, `category: suppliers |
sales | operational | administrative | others` y `business_type: B2B | B2C`.
Las fechas de query usan formato `YYYY-MM-DD`.

| Endpoint | Parámetros de query documentados | Respuesta de éxito | Componente/coordinador consumidor |
|---|---|---|---|
| `GET /api/metrics/facets` | Ninguno | Objeto `MetricsFacets`: `operation_types: OperationType[]`, `business_types: BusinessType[]`, `categories: Category[]`, `min_date: date`, `max_date: date`. | `App` solicita facetas; `DateRangeControls` muestra intervalo y catálogo global. |
| `GET /api/metrics` | `start_date?`, `end_date?` (`date`); `category?`; `operation_type?` (`income` o `outcome`). | `FinancialMovement[]`. No acepta `business_type`. | `App` coordina dashboard e historial de alertas; KPI/gráficos y `AnomalyAlertsSection` reciben datos derivados. |
| `GET /api/metrics/summary` | `group_by?` (`day`, `week` o `month`, default `month`); `start_date?`, `end_date?`; `category?`; `operation_type?`; `business_type?`. | Array `MetricsSummaryItem[]`: `period: string`, `income: number`, `outcome: number`, `net: number`. | Ningún componente hoy; `App` solo sería consumidor si se aprueba y tipa esta alternativa. |
| `GET /api/metrics/alerts` | `threshold?` (number, mínimo 0, default 0.3, sin máximo declarado); `group_by?` (`day`, `week` o `month`, default `month`); `start_date?`, `end_date?`; `business_type?` (`B2B` o `B2C`). | Array `MetricsAlert[]`: `period: string`, `outcome_total: number`, `baseline_average: number`, `increase_ratio: number`. | `App` coordina; `AnomalyAlertsSection` presenta filas por props. No usar como media móvil de tres períodos. |
| `GET /api/metrics/categories/top` | `operation_type?` (`income` o `outcome`, default `outcome`); `limit?` (integer 1–20, default 5); `start_date?`, `end_date?`; `business_type?` (`B2B` o `B2C`). | Array `TopCategoryItem[]`: `category`, `operation_type`, `total_amount`. | `App` coordina una llamada por segmento; `BusinessComparisonPage` recibe y `TopIncomeCategoriesTable` presenta. |
| `GET /api/metrics/b2b` y `/api/metrics/b2c` | `start_date?`, `end_date?`, `category?`, `operation_type?`. El segmento lo determina la ruta. | `FinancialMovement[]`. | `App` coordina; `BusinessComparisonPanel` y `IncomeComparisonChart` reciben los totales derivados. |

En las rutas con parámetros, OpenAPI documenta `200` y `422` por error de
validación. El cuerpo de validación tiene `detail: [{ loc, msg, type, ... }]`.
Facetas no declara parámetros y OpenAPI solo enumera su respuesta `200`; errores
de red o del servidor no se describen como respuestas de negocio en estos
contratos.

`DateRangeFilter` representa `start_date?: string` y `end_date?: string`.
Ambos límites son inclusivos y cada uno puede omitirse. El tipo documenta el
formato, pero `string` no lo valida en compilación. Facetas no acepta fechas ni
segmento: sus listas y `min_date`/`max_date` son globales para el dataset.

Respuesta de facetas observada:

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-11-01",
  "max_date": "2026-10-28"
}
```

El backend genera 360 movimientos simulados (30 por mes en su ventana móvil de
12 meses, con fechas de día 1 a 28). El rango de fechas cambia con la fecha del
servidor; no debe codificarse el ejemplo anterior ni confundirse con la etiqueta
actual fija `2024 - Full Year` de `App`.

## Funcionalidad 1 — Filtro de fechas

### Contrato y efecto

- Consultar `GET /api/metrics/facets` una vez para mostrar `min_date` y
  `max_date`. No enviar filtros: facetas no los admite y representa el dataset
  completo.
- Consultar `GET /api/metrics` con `start_date` y/o `end_date` no vacíos. Los
  parámetros `category` y `operation_type` existen en el contrato, pero no son
  parte del filtro de fechas solicitado.
- `start_date` incluye movimientos desde esa fecha; `end_date` incluye hasta
  esa fecha. Sin límites, la API retorna el dataset disponible.
- Calcular KPI y gráficos únicamente con los movimientos del rango visible. Las
  facetas siguen mostrando el intervalo global. Para las alertas, cualquier
  historial anterior cargado se reserva al cálculo de referencia y no debe
  agregarse a los KPI/gráficos visibles.
- `computeKPIs([])` produce totales cero. `computeMonthlyData` agrega los meses
  que tienen movimientos; no rellena meses ausentes con cero.

### Casos y estados visuales

1. **Ambas fechas vacías:** omitir ambos parámetros; solicitar todo el dataset.
2. **Solo fecha inicial:** enviar solo `start_date`; aplicar límite inferior
   inclusivo.
3. **Solo fecha final:** enviar solo `end_date`; aplicar límite superior
   inclusivo.
4. **Fechas invertidas:** el backend no las rechaza: una consulta real con
   `start_date > end_date` respondió `200 []`. La propuesta en
   [`components.md`](./components.md) es conservar la edición, mostrar error
   accesible e impedir la solicitud desde la UI. Es una decisión frontend, no
   una validación API.
5. **Rango sin movimientos:** respuesta válida `200 []`; mostrar KPI en cero y
   estados vacíos, no un error de API. Se comprobó también con un rango fuera
   del dataset observado.
6. **Error de API:** los parámetros inválidos (por ejemplo, fecha mal formada)
   producen `422`; mostrar el error y una opción de reintento sin sustituirlo
   por una lista vacía. Fallas de red/servidor deben conservar su estado
   explícito.

Una fecha fuera de `min_date`/`max_date` no es inválida según OpenAPI; no
autolimitarla silenciosamente. La interfaz puede mostrar el intervalo de
facetas como referencia y representar una respuesta vacía.
Durante la carga inicial de facetas, mostrar un estado de carga para el
intervalo global; mientras carga `/api/metrics`, usar skeletons en KPI/gráficos.
Un fallo de facetas no debe confundirse con un fallo de movimientos.

## Funcionalidad 2 — Alertas de anomalías

### Contrato real de alertas y diferencia de producto

`GET /api/metrics/alerts` retorna un array JSON `MetricsAlert[]` con `period`,
`outcome_total`, `baseline_average` e `increase_ratio`. Para `group_by`, los
períodos son día (`YYYY-MM-DD`), semana ISO (`YYYY-Www`) o mes (`YYYY-MM`).
Los filtros temporales son inclusivos. El `business_type` es opcional; al
omitirlo, se consideran ambos segmentos.

El backend construye un resumen únicamente para períodos con movimientos.
`detect_outcome_alerts` calcula cada `baseline_average` como la media de los
outcomes de **todos los períodos anteriores disponibles** en ese resumen
filtrado, no como la media de los tres períodos inmediatamente anteriores.
Un período con movimientos solo de ingresos sí aparece con outcome cero; un
período sin movimientos no aparece y no aporta un cero. El primer período no
tiene baseline. Solo se devuelve una alerta cuando la baseline es positiva y
`increase_ratio > threshold`. El backend redondea `outcome_total` y
`baseline_average` a 2 decimales, e `increase_ratio` a 4.

Por tanto, el endpoint existente **no satisface por sí solo** la media móvil de
tres períodos pedida por producto. `AlertEntry` documenta la respuesta real; no
debe presentarse como una media móvil de tres.

### Parámetros, umbral y cálculo propuesto

- OpenAPI acepta `threshold >= 0`, default `0.3`, sin máximo declarado.
  Producto exige en la UI `0.01 <= threshold <= 1.0`; aplicar esa validación en
  frontend. `0.3` representa un incremento relativo del 30%.
- `group_by` permite `day`, `week`, `month`; el requisito de producto no fija
  explícitamente la periodicidad. `components.md` propone meses calendario,
  decisión que debe mantenerse identificada como propuesta hasta aprobación.
- `AlertsParams` modela las fechas, `threshold`, `group_by` y `business_type`;
  el endpoint **no** admite `operation_type` ni `limit`.
- El backend también ofrece `GET /api/metrics/summary`, que agrupa por período
  (`period`, `income`, `outcome`, `net`) y permite fechas, `group_by`, categoría,
  tipo de operación y segmento. No está tipado en `api-types.ts` ni seleccionado
  por `components.md`; la propuesta aprobada usa movimientos de `/api/metrics`.
  Si se prefiere el resumen para derivar alertas, actualizar primero el
  contrato y la especificación, y no filtrar `operation_type` si hace falta
  conservar períodos con ingresos pero sin outcomes. El resumen también omite
  períodos sin movimientos y no informa cobertura.
- Si se implementa el cálculo en frontend según la propuesta, cargar los
  movimientos visibles y el historial de los tres meses calendario completos
  previos al primer mes visible mediante `/api/metrics`. No filtrar por
  `operation_type` al obtener ese historial si se necesita diferenciar un mes
  con movimientos pero sin gastos (cero) de uno sin movimientos. Agrupar por
  fecha y sumar solo `outcome` para los totales.
- Para una fila visible, usar su outcome recortado al rango exacto seleccionado
  y la media aritmética de los tres totales completos de los meses anteriores.
  El historial sirve solo para baseline; no se muestran como filas fuera del
  rango. Si falta cualquiera de los tres períodos, no reducir la ventana. Si
  baseline es cero, no dividir ni producir incremento relativo.
- Las reglas de meses ausentes, cobertura y rango parcial están detalladas como
  propuestas en [`components.md`](./components.md), no están garantizadas por
  OpenAPI. Facetas solo devuelve extremos observados; la API no expone cobertura
  mensual ni permite diferenciar con certeza un cero real de un hueco de datos.
- El umbral debe mantener el texto transitorio separado del último valor
  numérico válido. En entrada inválida, informar el error accesiblemente,
  ocultar filas anteriores como si correspondieran al valor inválido y no
  enviar una petición inválida.

Mostrar carga, error con reintento y un estado vacío explícito cuando no haya
alertas. Distinguir rango sin movimientos, historial insuficiente, baseline
cero, umbral inválido y rango con movimientos sin anomalías. No interpretar un
error API como una respuesta sin alertas.

La tabla de producto presenta período, outcome registrado, media móvil e
incremento porcentual. `increase_ratio` llega como ratio (`0.3` = 30%); para
`formatPercent`, que espera puntos porcentuales, multiplicar por 100 una sola
vez al presentar.

### Ejemplos matemáticos (datos inventados)

Los siguientes importes son **inventados únicamente para ilustrar el algoritmo**;
no son respuestas reales de la API ni valores del dataset verificado. Se asume
que cada importe es el outcome total de un mes calendario completo:

| Período | Outcome inventado |
|---|---:|
| Mes anterior 3 | 100 |
| Mes anterior 2 | 120 |
| Mes anterior 1 | 80 |

Media móvil: `(100 + 120 + 80) / 3 = 100`. Con `threshold = 0.3` (30%):

- **Sin alerta:** gasto del mes evaluado `125`; incremento
  `(125 - 100) / 100 = 0.25` (25%). `0.25 > 0.3` es falso.
- **Con alerta:** gasto del mes evaluado `140`; incremento
  `(140 - 100) / 100 = 0.40` (40%). `0.40 > 0.3` es verdadero.

La comparación propuesta es estricta; una baseline cero no permite calcular el
ratio y no produce alerta.

## Funcionalidad 3 — Comparativa B2B/B2C

### Consultas y cálculo

Mostrar dos paneles paralelos, uno B2B y otro B2C, y un único gráfico con los
totales completos de ingresos de ambos grupos. Un solo rango de fechas controla
las consultas de los dos paneles y el gráfico.

Para cada segmento:

1. Solicitar `/api/metrics/categories/top` con
   `operation_type=income`, `limit=5`, `business_type=B2B|B2C` y las mismas
   fechas seleccionadas. La respuesta es `TopCategoriesResponse`, un array de
   `{ category, operation_type, total_amount }`, posiblemente vacío o con menos
   de cinco elementos.
2. Solicitar `/api/metrics/b2b` o `/api/metrics/b2c` con
   `operation_type=income` y las mismas fechas. Sumar `amount` de todos los
   `FinancialMovement[]` para el total completo del grupo; usar ese valor para
   el gráfico y como denominador de cada categoría.
3. Calcular el porcentaje con
   `total_amount / groupIncomeTotal * 100`. Si el total es cero, no dividir;
   la propuesta visual es mostrar `—`. Pasar el porcentaje calculado a
   `formatPercent` directamente: ya son puntos porcentuales.

Facetas enumera categorías globales y segmentos globales; **no** proporciona
categorías asociadas a cada segmento. El filtro `business_type` está disponible
en categorías top, mientras que las rutas `/b2b` y `/b2c` ya fijan el segmento y
no aceptan ese parámetro.

El requisito comercial menciona categorías obtenidas de facetas. Esto es
compatible para mostrar el catálogo global, pero no permite derivar listas o
rankings separados B2B/B2C. Para las filas de cada panel, la especificación usa
el endpoint de categorías top filtrado por segmento; si producto exige que
facetas sea la única fuente de categorías, falta un contrato de facetas por
segmento.

### Precisión del supuesto sobre el top cinco

El contrato actual limita `Category` a cinco valores y `limit=5` puede devolver
todas las categorías presentes. En la solicitud en vivo verificada, cada
segmento tenía dos categorías de ingreso; la suma de su top coincidió con la
suma de los movimientos de ingreso de `/api/metrics/b2b` o `/api/metrics/b2c`.
Esto describe la taxonomía y el dataset actuales, no un campo de total de grupo
que devuelva categorías top. Mantener el endpoint segmentado como fuente
explícita del denominador evita depender de que el conjunto de categorías siga
limitado a cinco, de la semántica de ranking y del redondeo de cada categoría.

### Estados y errores parciales

Compartir el mismo rango entre ambos paneles, categorías y gráfico. Cargar
ambos segmentos sin presentar uno como cero si su solicitud falla. Si falla
cualquiera de las solicitudes de un segmento, no calcular su porcentaje a
partir de datos parciales; conservar el panel válido del otro segmento y
presentar comparación incompleta en el gráfico. Reintentar el segmento fallido
con el rango vigente. Una respuesta exitosa sin ingresos es total cero y lista
vacía, no un error.

## Matriz de trazabilidad

En **Estado**, “Verificado” significa que la evidencia confirma el requisito
del PM o el contrato descrito; no significa que la interfaz ya esté
implementada. “Contradicción” señala que la API actual no satisface ese
requisito. “Decisión pendiente” identifica una interpretación o regla propuesta
que necesita aprobación y no debe atribuirse al backend.

| Requisito del PM | Endpoint | Tipo TypeScript | Componente | Regla de validación | Evidencia | Estado |
|---|---|---|---|---|---|---|
| Fechas `start_date` y `end_date` opcionales, formato `YYYY-MM-DD`; sin fechas se muestra todo el dataset; límites inclusivos. | `/api/metrics` | `DateRangeFilter`; `FinancialMovement[]` | `DateRangeControls`; `App` | Omitir entradas vacías; validar formato; incluir ambos extremos. | OpenAPI `/api/metrics`; `filter_movements_by_date` en [`routes.py`](../../backend/app/routes.py); solicitudes reales con límites parciales. | Verificado |
| Mostrar `min_date` y `max_date` globales a partir de facetas. | `/api/metrics/facets` | `FacetsResponse` | `App`; `DateRangeControls` | No adjuntar fechas: facetas no admite filtros y sus límites son globales. | Esquema OpenAPI `MetricsFacets`; GET real `200`; [`api-types.ts`](./api-types.ts). | Verificado |
| El rango afecta KPI, gráficos y alertas; historial anterior al rango solo sirve para la baseline. | `/api/metrics` | `FinancialMovement[]`; `RollingAlertRow` (derivado) | `App`; KPI/gráficos; `AnomalyAlertsSection` | Separar filas visibles del historial; ignorar respuestas obsoletas. | PM Funcionalidad 1; [`components.md`](./components.md); [`App.tsx`](../src/App.tsx) aún no implementa filtros. | Decisión pendiente |
| Fechas invertidas y fuera del intervalo global no deben mostrar resultados antiguos como actuales. | `/api/metrics` | `DateRangeFilter` | `DateRangeControls`; `App` | Propuesta UI: no consultar si inicio > fin; fuera de facetas no limitar silenciosamente. | Código de filtrado y GET real invertido `200 []`; OpenAPI fecha opcional. | Decisión pendiente |
| Mostrar estados de carga, error/reintento y vacío para el filtro. | `/api/metrics`; `/api/metrics/facets` | `FinancialMovement[]`; `FacetsResponse` | `App`; `DateRangeControls` | `200 []` es vacío válido; `422` o fallo de red es error, no lista vacía. | PM Funcionalidad 1; OpenAPI `422`; respuestas reales `200 []` y `422`; [`components.md`](./components.md). | Verificado |
| Tabla con período, gasto registrado, media de los tres períodos previos e incremento porcentual. | `/api/metrics` para datos/historial; `/api/metrics/alerts` es la ruta de alertas existente | `RollingAlertRow` (derivado); `AlertEntry` para la respuesta real | `App`; `AnomalyAlertsSection` | Calcular exactamente tres períodos completos; regla mensual propuesta; incremento relativo contra threshold. | PM Funcionalidad 2; `detect_outcome_alerts` en [`routes.py`](../../backend/app/routes.py); [`components.md`](./components.md). | Decisión pendiente |
| `baseline_average` de `/api/metrics/alerts` representa los tres períodos previos. | `/api/metrics/alerts` | `AlertEntry`; `AlertsResponse` | `App`; `AnomalyAlertsSection` | No mostrar `baseline_average` del backend como media de tres períodos: usa todos los períodos anteriores disponibles. | OpenAPI `MetricsAlert`; implementación `detect_outcome_alerts` en [`routes.py`](../../backend/app/routes.py). | Contradicción |
| Umbral predeterminado `0.3` y editable entre `0.01` y `1.0`. | `/api/metrics/alerts` si se usa; cálculo de tres períodos propuesto en frontend | `AlertsParams`; draft de texto en `AnomalyAlertsSection` | `App`; `AnomalyAlertsSection` | Rechazar vacío, texto no numérico, no finito y valores fuera de rango; ocultar resultados previos con draft inválido. | PM Funcionalidad 2; OpenAPI solo impone mínimo `0` y no declara máximo; [`param-types.ts`](./param-types.ts). | Contradicción |
| Estado vacío explícito si no existen anomalías. | `/api/metrics` para el cálculo propuesto | `RollingAlertRow[]` | `AnomalyAlertsSection` | Distinguir rango sin movimientos, historial insuficiente, baseline cero y rango sin anomalías. | PM Funcionalidad 2; estados propuestos en [`components.md`](./components.md). | Verificado |
| Definir periodicidad, meses sin movimientos y suficiencia del historial para baseline. | `/api/metrics`; alternativa `/api/metrics/summary` | `FinancialMovement[]`; `MetricsSummaryItem[]` no modelado en `specs` | `App`; `AnomalyAlertsSection` | No rellenar huecos con cero sin aceptar la regla de cobertura; no acortar la ventana. | Resumen backend omite períodos sin movimientos; facetas solo informa extremos; [`components.md`](./components.md). | Decisión pendiente |
| Dos paneles B2B/B2C con hasta cinco categorías de ingreso por segmento. | `/api/metrics/categories/top` | `TopCategoriesParams`; `TopCategoriesResponse` | `App`; `BusinessComparisonPage`; `BusinessComparisonPanel`; `TopIncomeCategoriesTable` | `operation_type=income`, `limit=5`, segmento válido y mismo rango para ambos. | OpenAPI `TopCategoryItem`; respuesta real filtrada por segmento; [`api-types.ts`](./api-types.ts). | Verificado |
| Usar facetas para el catálogo de categorías y obtener rankings por segmento. | `/api/metrics/facets`; `/api/metrics/categories/top` | `FacetsResponse`; `TopCategoriesResponse` | `App`; `BusinessComparisonPage`; `TopIncomeCategoriesTable` | Facetas es global; para ranking B2B/B2C usar categorías top con `business_type`. | OpenAPI/código: facetas no tiene query params; categorías top admite `business_type`. | Decisión pendiente |
| Porcentaje sobre el total completo y un único gráfico de ingresos B2B frente a B2C. | `/api/metrics/b2b`; `/api/metrics/b2c`; `/api/metrics/categories/top` | `FinancialMovement[]`; `TopCategoriesResponse` | `App`; `BusinessComparisonPanel`; `TopIncomeCategoriesTable`; `IncomeComparisonChart` | Sumar todos los ingresos del endpoint segmentado; no usar el ranking como fuente del total; no dividir por cero. | OpenAPI y rutas segmentadas; solicitudes reales; las categorías top cubrieron todos los ingresos de esta fixture, no necesariamente futuras ampliaciones. | Verificado |
| Compartir fechas entre paneles/gráfico y gestionar carga, errores parciales y reintentos. | Categorías top y rutas `/b2b`, `/b2c` | `BusinessSegmentLoadState` en `components.md` | `App`; `BusinessComparisonPage`; paneles y gráfico | Vincular respuestas al rango vigente; un segmento fallido no se presenta como cero ni produce porcentajes parciales. | PM Funcionalidad 3; [`components.md`](./components.md); la interfaz aún no está implementada en [`App.tsx`](../src/App.tsx). | Decisión pendiente |

## Auditoría integral y decisiones pendientes

### Conclusiones contrastadas

- **Alineado:** las propiedades de `FacetsResponse`, `AlertEntry`,
  `CategoryEntry` y sus aliases de respuesta coinciden con los esquemas
  `MetricsFacets`, `MetricsAlert` y `TopCategoryItem` de OpenAPI.
- **Alineado:** `DateRangeFilter`, `AlertsParams` y `TopCategoriesParams`
  representan los parámetros y enumeraciones comprobados; las respuestas
  de alertas y categorías son arrays.
- **Discrepancia material, correctamente señalada en `components.md`:**
  `baseline_average` de `/api/metrics/alerts` no es la ventana fija de tres
  períodos. El cálculo frontend descrito es una estrategia propuesta, no una
  capacidad existente de ese endpoint.
- **Alternativa de agregación no incorporada:** existe `/api/metrics/summary`
  con agregados por día/semana/mes, pero no tiene tipos en las especificaciones
  actuales y también omite períodos sin movimientos. No sustituir
  `/api/metrics` por esta ruta sin actualizar y aprobar el contrato.
- **Diferencia API/producto:** el UI exige umbral `[0.01, 1.0]`; el backend
  acepta cualquier número desde cero y no declara máximo. El frontend debe
  rechazar valores fuera del rango de producto.
- **Decisión sin contrato API:** el PM pide tres períodos anteriores sin fijar
  su periodicidad; la especificación elige meses. Debe confirmarse que “período”
  significa mes calendario.
- **Limitación para baseline:** no hay metadatos de cobertura mensual. Completar
  meses ausentes con cero es una decisión de negocio y requiere aceptación; si
  no se acepta, el backend necesita exponer cobertura.
- **Alcance de categorías por segmento:** facetas solo es global. Las
  categorías top sí admiten `business_type`; este endpoint es la fuente
  verificable para la tabla segmentada. Confirmar esta interpretación si
  “categorías obtenidas de facetas” se entiende como requisito literal.
- **Etiqueta de periodo:** `App` muestra `2024 - Full Year`, pero los
  movimientos verificados abarcan una ventana móvil que, en esta revisión,
  iba de noviembre de 2025 a octubre de 2026. Producto debe decidir cómo
  presentar la etiqueta con filtros, sin inferir que 2024 es el rango correcto.
- **Formato monetario:** la API no incluye moneda. `formatCurrency` usa USD y
  redondea a dólares enteros; `formatPercent` espera puntos porcentuales y no
  multiplica por 100. Confirmar moneda y si se requieren centavos antes de
  fijar formato final. Ver
  [`financial-utils.ts`](../src/lib/financial-utils.ts).
- **Riesgo de agregación mensual existente:** `computeMonthlyData` parsea
  `YYYY-MM-DD` con `new Date(...)` y luego usa getters de hora local. En zonas
  horarias negativas, fechas al inicio del mes pueden agruparse en el mes
  anterior. El coding agent debe tratar fechas como fechas de calendario y
  probar límites de mes antes de reutilizar esta función en alertas.
- **Cobertura de datos de prueba:** el generador actual crea 30 movimientos por
  mes; los meses completamente vacíos no aparecen en la fixture estándar. Los
  casos de cero movimientos por período deben cubrirse con datos de prueba
  explícitos al implementar.
- **Cambio de UX requerido:** la aplicación existente no muestra controles de
  fecha, vistas comparativas ni reintentos; `components.md` los especifica
  como trabajo futuro, no como comportamiento ya implementado.

### Evidencia HTTP de esta revisión

Además de `/docs` y `/openapi.json` con `200`, se verificaron solicitudes
reales:

- `/api/metrics/facets`: `200`, objeto con las cinco propiedades esperadas.
- `/api/metrics?start_date=2026-01-01&end_date=2026-01-31`: `200`, array de 30
  movimientos. Parámetros parciales `start_date` o `end_date` también
  respondieron `200`.
- Rango invertido y rango sin coincidencias: `200 []`.
- Fecha mal formada y `threshold=-0.1`: `422`.
- `/api/metrics/alerts`: `200`, array de alertas con los cuatro campos
  documentados.
- `/api/metrics/summary?group_by=month&start_date=2025-11-01&end_date=2026-01-31`:
  `200`, array de `MetricsSummaryItem` con `period`, `income`, `outcome` y
  `net`.
- B2B/B2C con `operation_type=income`: `200`, arrays de movimientos; las
  respuestas de categorías top filtradas por grupo fueron arrays de dos
  elementos en este dataset.

Estos resultados son muestras del backend activo, no garantías de datos
estables. OpenAPI define el contrato; el código de rutas define la semántica
actual; las decisiones de interfaz están identificadas aparte en
[`components.md`](./components.md).
