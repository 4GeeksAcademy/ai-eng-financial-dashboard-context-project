# Especificación de componentes del dashboard

## Alcance y evidencia

Este documento describe los componentes y comportamientos frontend solicitados
para las tres funcionalidades. No modifica ni amplía el contrato del backend.

- **Verificado en el frontend:** [`../src/App.tsx`](../src/App.tsx) es la única
  vista principal; carga `/api/metrics`, calcula KPI y agregados mensuales, y
  muestra un mensaje de error si falla la petición.
- **Verificado en el frontend:** los componentes del dashboard son funciones
  exportadas con nombre y props declaradas mediante interfaces. Los gráficos
  reciben datos y `loading`, muestran `Skeleton` durante la carga y un estado
  vacío sin datos. Referencias:
  [`../src/components/dashboard/`](../src/components/dashboard/),
  [`../src/components/ui/skeleton.tsx`](../src/components/ui/skeleton.tsx).
- **Verificado en el frontend:** `computeKPIs`, `computeMonthlyData`,
  `formatCurrency` y `formatPercent` están en
  [`../src/lib/financial-utils.ts`](../src/lib/financial-utils.ts).
- **Verificado en el frontend:** `formatPercent(value)` agrega `%` y presenta
  `value.toFixed(1)`; espera puntos porcentuales, por ejemplo `30` para `30%`.
  `formatCurrency(value)` usa `en-US`, USD y cero decimales, por lo que redondea
  los centavos en pantalla. El contrato de movimientos no declara moneda, por
  lo que USD es la convención existente de UI, no una garantía de OpenAPI.
- **Verificado:** no se encontró un router, navegación ni dependencia de
  routing en `frontend/src` o `frontend/package.json`.
- **Verificado contra OpenAPI y el backend:** `/api/metrics` acepta fechas
  opcionales; `/api/metrics/facets` devuelve las facetas y fechas globales;
  `/api/metrics/alerts` devuelve un array `MetricsAlert`; y
  `/api/metrics/categories/top` devuelve un array `TopCategoryItem`.
  Los contratos TypeScript existentes están en
  [`api-types.ts`](./api-types.ts) y [`param-types.ts`](./param-types.ts);
  la implementación backend está en
  [`../../backend/app/routes.py`](../../backend/app/routes.py).
- **Verificado en la exploración de Fase 1:** las fechas son inclusivas; las
  fechas invertidas o sin coincidencias pueden producir `200` con un array
  vacío. Facetas no acepta filtros de fecha. El backend actual no calcula la
  media móvil limitada a tres períodos solicitada por producto.

Las reglas de periodicidad, vacíos e historial que siguen están marcadas como
**decisiones de especificación propuestas**. No son semántica garantizada por
OpenAPI.

## Estructura común y convenciones

### Composición y navegación

- `App` administra la página activa, el rango compartido y su error de
  validación, las facetas, los movimientos cargados, el umbral válido y en
  edición, los datos derivados y los estados de petición. Los componentes de
  presentación reciben esos datos por props y emiten cambios mediante
  callbacks; no realizan solicitudes HTTP.
- Añadir `DashboardNavigation`, controlado por `App`, con dos destinos:
  **Dashboard** y **Comparativa B2B/B2C**. Al no existir router, cambiar la vista
  mediante estado local, sin añadir una dependencia de routing ni inventar
  rutas URL.
- Conservar el rango seleccionado al cambiar de vista. Cada vista muestra el
  mismo componente de rango en su parte superior; en la comparativa ese único
  rango controla ambas solicitudes por segmento y el gráfico.
- Seguir el patrón observado: componentes exportados con nombre, interfaces de
  props, modelos reutilizados de `../src/lib/financial-types.ts` y datos
  entregados por props. Los componentes de presentación no realizan llamadas
  HTTP.
- Para las interfaces de esta especificación, reutilizar `BusinessType` y
  `FinancialMovement` de
  [`../src/lib/financial-types.ts`](../src/lib/financial-types.ts),
  `DateRangeFilter` de [`param-types.ts`](./param-types.ts), y
  `FacetsResponse` / `TopCategoriesResponse` de
  [`api-types.ts`](./api-types.ts). No redefinir esos aliases.
  `RollingAlertRow` sí es un modelo derivado distinto: no reutiliza
  `AlertEntry` para atribuir al servidor la semántica de la media móvil.

Interfaz propuesta para la navegación:

```ts
type DashboardPage = "dashboard" | "comparison";

interface DashboardNavigationProps {
  activePage: DashboardPage;
  onPageChange: (page: DashboardPage) => void;
}
```

Usar botones accesibles con estado seleccionado explícito (`aria-current` o
semántica equivalente). `activePage` y su setter pertenecen a `App`.

### Estado visual compartido

- Mostrar skeletons para los datos que aún se están cargando; seguir el patrón
  de `KPICard`, `IncomeOutcomeChart` y `ProfitPercentChart`.
- Mostrar un error explícito y una opción de reintento si falla una petición.
  No sustituir errores por arrays vacíos ni presentar un resultado parcial como
  una comparación completa.
- Distinguir “no hay movimientos para este rango” de “no se encontraron
  anomalías”. Los gráficos mantienen su estado vacío; la tabla de alertas
  muestra un mensaje explícito de ausencia de anomalías.
- Una respuesta vacía válida no es un error HTTP. Los KPI derivados de una
  lista vacía siguen la convención actual de `computeKPIs` (valores cero);
  gráficos, tablas y paneles muestran su estado vacío correspondiente.
- Al cambiar rápidamente fechas o página, `App` debe cancelar la petición
  anterior con `AbortController` cuando sea posible y asociar cada conjunto de
  peticiones a una clave/ronda de solicitud. Solo se publican respuestas cuyo
  identificador siga siendo el actual. Las cancelaciones intencionales no se
  muestran como errores; errores reales sí. Esto impide que una respuesta lenta
  sobrescriba datos del filtro más reciente.
- Al reintentar, volver a solicitar el recurso fallido usando el rango vigente.
  No reutilizar datos de un rango anterior como si fueran del rango nuevo:
  mostrar skeleton hasta completar la ronda vigente o mostrar el error
  correspondiente.
- Si falla `/api/metrics` para el dashboard, `App` muestra un error con botón
  de reintento que vuelve a cargar movimientos para el rango válido actual.
  Una respuesta exitosa con `[]` se representa como estado vacío, no como error.

## Funcionalidad 1 — Filtro de fechas

**Objetivo:** filtrar de forma compartida KPI, gráficos y alertas por fechas
opcionales, conservando el acceso al intervalo global del dataset.

### Componente y props

Propuesta: `DateRangeControls`, ubicado en
`frontend/src/components/dashboard/date-range-controls.tsx`, inmediatamente
debajo del encabezado y antes de KPI, gráficos o contenido de alertas.

```ts
interface DateRangeControlsProps {
  range: DateRangeFilter;
  facets: FacetsResponse | null;
  facetsLoading: boolean;
  facetsError: string | null;
  rangeError: string | null;
  onRangeChange: (range: DateRangeFilter) => void;
  onRetryFacets: () => void;
}
```

`DateRangeFilter` y `FacetsResponse` se importan de las especificaciones de
tipos existentes. `App` obtiene y conserva rango, facetas y estado de petición;
`DateRangeControls` recibe esos valores por props, representa los inputs y
notifica cada edición con `onRangeChange`. No mantiene una copia divergente.

### Comportamiento

- Mostrar dos inputs de fecha (`type="date"`): **Desde** y **Hasta**. Cada valor
  no vacío usa el formato `YYYY-MM-DD`.
- Representar un input borrado como parámetro omitido, no como string vacío.
  Sin ambas fechas, mostrar todo el dataset.
- Con solo `start_date`, incluir movimientos desde esa fecha; con solo
  `end_date`, incluir movimientos hasta esa fecha. Los dos límites son
  inclusivos.
- Obtener `min_date` y `max_date` de `/api/metrics/facets` y mostrarlos como
  intervalo disponible del dataset. Son límites globales: facetas no admite
  filtros de fecha y no cambia al seleccionar otro rango.
- Aplicar cada cambio válido al estado compartido y actualizar KPI, gráficos y
  alertas. Enviar solo los parámetros no vacíos a `/api/metrics` cuando se
  utilice filtrado en servidor para los datos visibles. Las filas de alertas y
  el total del mes evaluado respetan el rango visible; cargar además los meses
  previos necesarios fuera de ese rango exclusivamente para la línea base.
- **Decisión propuesta — fechas invertidas:** si ambas fechas existen y
  `start_date > end_date`, mantener el valor editado en los inputs, establecer
  `rangeError`, marcar el campo relacionado con `aria-invalid` y asociar el
  mensaje mediante `aria-describedby`. `App` no inicia ni publica solicitudes
  para ese rango; borra o invalida resultados anteriores para que no parezcan
  corresponder a la selección inválida. Al corregir el rango, limpiar el error
  y cargar datos para la nueva selección.
- **Decisión propuesta — fechas fuera del intervalo de facetas:** no
  autocorregir ni limitar silenciosamente la selección. Mostrar siempre los
  límites globales como referencia; permitir el rango y dejar que el filtro
  produzca los movimientos coincidentes. Si no hay ninguno, mostrar el estado
  vacío. Los límites de facetas no son validaciones del backend.
- Mientras carga facetas, mostrar skeleton para el intervalo de disponibilidad.
  Si falla facetas, informar el error, no inventar `min_date` o `max_date`, y
  ofrecer un control de reintento que invoque `onRetryFacets`. El rango se
  conserva; un error de facetas no se convierte en un error de métricas.
- Durante la actualización de datos, usar skeletons en KPI y gráficos. Si la
  petición falla, mostrar error y reintento conservando el rango seleccionado.
  Si responde sin movimientos, mostrar KPI en cero y estados vacíos en gráficos
  y alertas.
- Casos límite: borrar ambas fechas restablece el dataset completo; proporcionar
  solo una fecha aplica solo ese límite; una fecha fuera del intervalo puede
  producir resultados parciales o estado vacío; un rango invertido nunca genera
  una petición.

#### Estados de la funcionalidad

- **Éxito:** con rango válido y respuesta de movimientos, mostrar KPI y gráficos
  calculados solo con datos visibles, además de las fechas globales de facetas.
- **Carga:** skeleton para las facetas iniciales y para KPI/gráficos mientras
  se resuelve la petición del rango vigente.
- **Error:** mensaje explícito y reintento para facetas o movimientos fallidos;
  conservar el rango y no mostrar datos del filtro anterior como actuales.
- **Vacío:** si el filtro válido no coincide con movimientos, mantener KPI en
  cero y estados vacíos en gráficos y alertas.

`/api/metrics` entrega los movimientos filtrados. `computeKPIs` y
`computeMonthlyData` deben operar solo sobre los movimientos del rango visible;
los meses anteriores cargados exclusivamente para dar contexto a las alertas
no se incluyen en KPI ni gráficos.

## Funcionalidad 2 — Alertas de anomalías

**Objetivo:** mostrar outcomes mensuales que superan un umbral editable respecto
de la media aritmética de los tres meses calendario completos anteriores.

### Componente y datos

Propuesta: `AnomalyAlertsSection`, situado debajo de los dos gráficos actuales,
con control de umbral y tabla. Recibe filas calculadas por frontend, no una
respuesta del servidor presentada como si tuviera otra semántica.

Props propuestas:

```ts
interface AnomalyAlertsSectionProps {
  rows: RollingAlertRow[] | null;
  thresholdDraft: string;
  appliedThreshold: number;
  validationError: string | null;
  loading: boolean;
  error: string | null;
  onThresholdDraftChange: (value: string) => void;
  onRetry: () => void;
}

interface RollingAlertRow {
  period: string;
  outcomeTotal: number;
  baselineAverage: number;
  increaseRatio: number;
}
```

`RollingAlertRow` es un modelo derivado del frontend. No debe tratarse como
`AlertEntry` de `api-types.ts`: ese tipo describe `baseline_average` según el
contrato real del backend, no la media móvil de tres meses.

`App` administra `thresholdDraft` (texto exactamente como se edita),
`appliedThreshold` (último número válido), `validationError` y los datos de
movimientos. `AnomalyAlertsSection` representa el input mediante props y emite
el texto sin parsearlo con `onThresholdDraftChange`.

### Validación del umbral

- Inicializar `thresholdDraft` con `"0.3"` y `appliedThreshold` con `0.3`.
- Usar un campo de texto con `inputMode="decimal"` para conservar literalmente
  estados transitorios (vacío o texto no numérico); validar su contenido como
  número antes de actualizar `appliedThreshold`. Etiquetarlo como umbral
  numérico y no convertir el borrador directamente en `number` en cada tecla.
  `type="text"` es deliberado: `type="number"` puede sanear texto no numérico
  como valor vacío, impidiendo distinguirlo del borrado intencional.
- En cada edición conservar el texto literal. No convertir `""` en cero.
  Validar el borrador: debe ser no vacío, convertible a número finito y estar
  entre `0.01` y `1.0`, inclusive.
- Campo vacío, texto no numérico, `NaN`/infinito, valor menor que `0.01` o mayor
  que `1.0`: establecer `validationError`, mantener `appliedThreshold` y los
  últimos resultados válidos en estado, pero pasar `rows={null}` mientras el
  borrador sea inválido. No mostrar la tabla previa como resultado del borrador
  inválido ni iniciar una petición de alertas. Mostrar mensaje junto al input,
  `aria-invalid="true"` y `aria-describedby` hacia el mensaje.
- Si el usuario corrige el campo a un valor válido, limpiar el error, actualizar
  `appliedThreshold`, recalcular inmediatamente desde los movimientos cargados
  y entregar las filas correspondientes a ese valor. Los resultados anteriores
  se conservan durante la edición inválida, pero permanecen ocultos hasta que
  haya un umbral válido.
- El umbral es ratio: `0.3` significa 30%. El producto exige el rango UI
  `[0.01, 1.0]`; OpenAPI permite `threshold >= 0` y no declara máximo. Al usar
  el cálculo frontend, la validación del rango de producto no se delega al
  endpoint.

### Límite del contrato actual y estrategia propuesta

- **Verificado:** `/api/metrics/alerts` devuelve un array con `period`,
  `outcome_total`, `baseline_average` e `increase_ratio`. El backend calcula
  `baseline_average` sobre todos los períodos anteriores disponibles en el
  resumen filtrado, omite períodos sin movimientos y no garantiza una ventana
  de tres. Por tanto, esa respuesta **no cumple** directamente la media móvil
  pedida por el PM.
- **Estrategia frontend propuesta, sin cambios de backend:** obtener de
  `/api/metrics` el rango visible más el historial anterior requerido. Para un
  primer mes visible `M`, fijar `historyStart` al primer día del mes que está
  tres meses antes de `M`; pedir
  `/api/metrics?start_date=historyStart&end_date=<fin de la selección>` cuando
  existan esos límites. No pasar el `start_date` visible como límite inferior
  de esa petición, pues truncaría la historia necesaria. Si la selección no
  tiene inicio, cargar desde el comienzo conocido del dataset; también es
  posible cargar el dataset completo actual y limitar la salida visible en
  frontend. Los parámetros de fechas son opcionales en `/api/metrics`.
- Agrupar los movimientos por `create_date` y conservar solo registros
  `operation_type === "outcome"` para el cálculo.
- **Decisión propuesta — alcance:** no restringir el cálculo por
  `business_type`; interpretar las alertas como correspondientes al dashboard
  completo, porque el requisito del PM no especifica un segmento.
  Sumar `amount` sin redondeo intermedio. La suma de outcomes del mes visible
  usa los movimientos cuyas fechas estén dentro del rango seleccionado, ambos
  extremos incluidos.
- Para cada fila mensual visible, calcular cada uno de los tres totales de
  referencia con todos los outcomes del mes calendario completo, aunque el
  mes de referencia esté fuera del rango visible. No aplicar el filtro de
  inicio visible a esos tres meses. Así se evita comparar un mes visible
  parcial con referencias accidentalmente recortadas por ese mismo límite.
- Para los tres totales, calcular primero la suma mensual individual y luego
  `baselineAverage = (previousMonth1 + previousMonth2 + previousMonth3) / 3`.
  No promediar movimientos individuales ni redondear las sumas antes de obtener
  la media; redondear únicamente al presentar.
- El primer mes visible usa la misma regla que los siguientes: outcome visible
  recortado al rango y tres meses calendario completos anteriores como
  referencia. Los meses posteriores usan sus tres meses calendario completos
  inmediatamente anteriores. El historial sirve para el cálculo, no para
  añadir filas fuera del rango.
- Aplicar el rango seleccionado a los meses y movimientos que se muestran. El
  historial anterior al rango se utiliza **solo** para calcular la línea base.
  No mostrar esos meses históricos como anomalías del rango seleccionado.
- Si se decide usar `/api/metrics/alerts` en paralelo para otros fines, no
  combinar ni etiquetar sus `baseline_average` como la media móvil de tres
  meses. Para que el backend fuera fuente de esa tabla tendría que cambiar su
  algoritmo/contrato y OpenAPI.

### Decisiones de especificación propuestas para el cálculo

1. **Periodicidad mensual:** agrupar por mes calendario, con clave interna
   `YYYY-MM`. Cada fila representa un mes; el umbral se compara con su gasto
   (`outcome`) mensual. Esto fija la periodicidad que el requisito del PM dejó
   abierta; no es una restricción de `/api/metrics/alerts`, cuyo `group_by`
   también permite día y semana.
2. **Ventana exacta:** para cada mes evaluable, calcular la media aritmética de
   los tres meses calendario inmediatamente anteriores. Aplicar una alerta
   solo si `baselineAverage > 0` y
   `(outcomeTotal - baselineAverage) / baselineAverage > threshold`.
   La comparación estricta `>` coincide con la ruta existente, aunque el
   cálculo de ventana será diferente.
3. **Menos de tres períodos previos:** no producir alerta para ese mes. No
   reducir la ventana a uno o dos meses ni cambiar silenciosamente el
   denominador.
4. **Meses sin movimientos y cobertura:** entre el mes de `min_date` y el mes
   de `max_date`, completar un mes sin registros con `outcome = 0`; incluir ese
   cero en la ventana de tres. No crear meses anteriores al comienzo ni
   posteriores al final conocido del dataset como ceros. Si una petición no
   cubre los tres meses de referencia completos, marcar la línea base como no
   disponible y no producir la alerta. La API solo expone fechas mínima y
   máxima observadas, no límites de cobertura ni una marca de completitud por
   mes. Por tanto, tratar los meses internos ausentes como cero y asumir
   cobertura continua son decisiones de producto; si esa suposición no se
   aprueba, el backend debe exponer cobertura o el frontend no puede distinguir
   un cero real de un hueco de datos.
5. **Media igual a cero:** el incremento relativo no está definido; no
   producir alerta ni porcentaje para ese mes. No dividir por cero ni mostrar
   `Infinity`.
6. **Primera fecha visible e historial:** calcular el primer mes visible con
   los tres meses anteriores cargados aunque estén fuera del rango que se
   presenta. Si el dataset no contiene tres meses previos disponibles, aplicar
   la regla de insuficiencia y no producir alerta.
7. **Rango parcial:** los movimientos del mes actual de la selección se
   recortan por las fechas exactas elegidas. Los tres meses usados como
   referencia son meses calendario completos anteriores al mes evaluado.
   Solo se muestran filas cuyo período intersecta el rango seleccionado.
8. **Umbral inválido:** `threshold` es un ratio; el default es `0.3` (30%).
   El input numérico acepta valores entre `0.01` y `1.0`, inclusive, conforme
   al PM. Rechazar vacío, no numérico o fuera de rango con error accesible y no
   recalcular hasta corregirlo. Ese rango es una regla de UI: OpenAPI solo
   declara mínimo `0` y ningún máximo.

### Presentación y estados

- Columnas de tabla: **Período**, **Outcome registrado**, **Media móvil
  (3 períodos)** e **Incremento porcentual**.
- Para el porcentaje, pasar `increaseRatio * 100` a `formatPercent`; la función
  ya agrega `%` y usa un decimal. No multiplicar por 100 dentro de
  `formatPercent` ni volver a multiplicar un valor que ya esté en puntos
  porcentuales.
- `formatCurrency` es consistente con las tarjetas actuales y muestra USD, pero
  redondea a dólares enteros. El contrato no especifica la moneda, por lo que
  USD solo está verificado como convención de la UI existente. Calcular siempre
  con los valores numéricos sin formatear. El contrato contiene importes
  decimales; si producto requiere visualizar centavos exactos o la moneda no es
  USD, el helper actual no es suficiente y habrá que acordar formato/moneda en
  una tarea de implementación.
- Durante la carga, mostrar skeleton de la tabla. Si falla la petición de
  movimientos, mostrar error y reintento. Si el umbral es inválido, mostrar el
  error de validación y no la tabla previa. Si no hay movimientos, indicar que
  no hay datos para el rango; si hay datos pero ninguna fila supera el umbral,
  mostrar explícitamente “No se encontraron anomalías para este rango y
  umbral”.
- **Éxito:** con umbral válido, historial suficiente y anomalías, mostrar las
  filas ordenadas por período con los cuatro valores calculados.
- **Carga:** mostrar skeleton mientras se carga el historial requerido; cambiar
  solo el umbral no requiere una llamada de red si esos movimientos ya están
  disponibles.
- **Error:** si falla la lectura de movimientos, mostrar error y reintento; no
  interpretar el fallo como ausencia de anomalías.
- **Vacío:** diferenciar rango sin movimientos, umbral inválido, historial
  insuficiente y rango con movimientos sin anomalías. No presentar tabla de un
  umbral anterior durante la edición inválida.

### Dependencias y limitaciones

- La respuesta de `/api/metrics/alerts` no sirve por sí sola para el requisito
  de media móvil de tres meses.
- La estrategia propuesta depende de poder cargar los movimientos históricos
  previos al rango. El endpoint actual no pagina y la verificación observó 360
  movimientos simulados; cargar toda la historia en frontend es viable para
  ese dataset, pero puede no escalar si el backend pasa a datos grandes o
  paginados.
- `min_date` y `max_date` informan extremos observados, no completitud del
  historial. Interpretar un mes interno sin movimientos como cero es una
  decisión de producto; la API no permite distinguir “cero movimientos” de
  “mes sin datos por falta de cobertura”.

## Funcionalidad 3 — Comparativa B2B vs B2C

**Objetivo:** comparar ingresos y categorías principales de ambos segmentos
para el mismo rango de fechas, usando el total completo de cada grupo como
denominador.

### Página y componentes

Propuesta de vista `BusinessComparisonPage`, seleccionada mediante
`DashboardNavigation` y estado local de `App`.

`App` administra `range`, facetas y estados de petición. La página recibe esos
valores y el resultado de cada segmento por props; los hijos no hacen llamadas
HTTP.

```ts
interface BusinessSegmentComparisonData {
  categories: TopCategoriesResponse;
  groupIncomeTotal: number;
}

interface BusinessSegmentLoadState {
  data: BusinessSegmentComparisonData | null;
  loading: boolean;
  error: string | null;
}

interface BusinessComparisonPageProps {
  range: DateRangeFilter;
  rangeError: string | null;
  facets: FacetsResponse | null;
  facetsLoading: boolean;
  facetsError: string | null;
  b2b: BusinessSegmentLoadState;
  b2c: BusinessSegmentLoadState;
  onRangeChange: (range: DateRangeFilter) => void;
  onRetryFacets: () => void;
  onRetrySegment: (businessType: BusinessType) => void;
}

interface BusinessComparisonPanelProps {
  businessType: BusinessType;
  data: BusinessSegmentComparisonData | null;
  loading: boolean;
  error: string | null;
}

interface TopIncomeCategoriesTableProps {
  categories: TopCategoriesResponse | null;
  groupIncomeTotal: number | null;
  loading: boolean;
  error: string | null;
}

interface IncomeComparisonChartProps {
  b2bIncomeTotal: number | null;
  b2cIncomeTotal: number | null;
  loading: boolean;
  error: string | null;
}
```

`BusinessComparisonPage` compone el control de fechas, los dos paneles y el
gráfico. `BusinessComparisonPanel` presenta el nombre del segmento, su total y
`TopIncomeCategoriesTable`; la tabla calcula porcentajes con el denominador
recibido. En carga o error no se inventan arrays vacíos ni totales cero; con
éxito, una lista vacía y un total cero son respuestas válidas. `rangeError` se
recibe desde `App` y se pasa al control de fechas. `IncomeComparisonChart` solo
presenta los dos totales recibidos.
`null` en un total significa que no hay resultado válido para dibujar, no que el
importe sea cero. Los datos se tipan con `BusinessType`, `TopCategoriesResponse`
y `DateRangeFilter` ya definidos.

- Incluir un único `DateRangeControls` en la parte superior de la vista. El
  mismo rango controla las dos solicitudes de categorías, las dos solicitudes
  de movimientos por segmento y el gráfico.
- Mostrar dos `BusinessComparisonPanel` en una grilla paralela en pantallas
  amplias; apilarlos en pantallas estrechas. Un panel corresponde a B2B y el
  otro a B2C.
- Cada panel contiene una `TopIncomeCategoriesTable` con columnas **Categoría**,
  **Total de ingresos** y **% del total de ingresos del grupo**; presentar hasta
  cinco filas en el orden de ranking devuelto por la API.
- Mostrar un único `IncomeComparisonChart` para comparar el total de ingresos
  B2B frente al total de ingresos B2C. No duplicar el gráfico dentro de cada
  panel.

### Contratos y cálculos

- Para cada `BusinessType`, solicitar
  `/api/metrics/categories/top?operation_type=income&limit=5&business_type=...`
  y agregar los mismos `start_date` y `end_date` seleccionados. Recibir
  `TopCategoriesResponse` (`CategoryEntry[]`).
- Obtener el denominador completo por grupo con
  `/api/metrics/b2b?operation_type=income` y
  `/api/metrics/b2c?operation_type=income`, también con las fechas
  seleccionadas. Recibir `FinancialMovement[]` y sumar `amount` de todos los
  movimientos devueltos en cada respuesta.
- Calcular por fila
  `categoryPercentage = total_amount / groupIncomeTotal * 100`. No asumir que
  la suma del top cinco equivale al total del grupo. Si el total es cero,
  mostrar `—` para el porcentaje (decisión de presentación: la división no está
  definida). El gráfico usa los mismos totales completos obtenidos de los
  endpoints segmentados.
- Los endpoints segmentados devuelven movimientos completos y sus fechas son
  opcionales. El endpoint de categorías devuelve `CategoryEntry[]`, acepta
  `operation_type`, `limit`, `business_type` y fechas. OpenAPI documenta
  `limit` entre 1 y 20, default 5; la lista puede contener menos de cinco
  entradas.
- Las categorías de `/api/metrics/facets` son globales, no diferenciadas por
  segmento. No construir dos listas de facetas por grupo a partir de esa
  respuesta. La ruta de categorías top filtrada por `business_type` proporciona
  los resultados observados para cada panel. El backend actual genera ingresos
  solo en `sales` y `others`, así que en los datos verificados los paneles
  pueden tener dos filas aunque `limit=5`.

### Loading, errores y datos vacíos

- **Éxito:** cuando las dos respuestas de cada segmento están completas para el
  rango vigente, mostrar ambos paneles, porcentajes y el único gráfico con los
  totales completos.
- Mostrar skeleton independiente en cada panel durante su carga y en el único
  gráfico comparativo.
- Cargar las solicitudes de categorías y movimientos de cada segmento con los
  mismos parámetros. Si una de las dos falla, ese segmento queda con
  `data: null`, muestra error y permite reintentar solo ese segmento. No calcular
  su porcentaje a partir de una respuesta parcial. El panel del otro segmento
  puede seguir mostrando su resultado válido para el mismo rango.
- Si solo un segmento está completo, `IncomeComparisonChart` recibe `null` para
  el segmento fallido y muestra un estado de comparación incompleta; no
  representa el fallo como un total cero. Al reintentar, mantener el rango y
  solo sustituir datos cuando ambas solicitudes de ese segmento terminen con
  éxito y sigan perteneciendo a la ronda vigente.
- Si un segmento no tiene ingresos en el rango, mostrar total cero y estado
  vacío para sus categorías. Si ambos segmentos carecen de ingresos, el gráfico
  muestra un estado vacío; si solo uno tiene total cero, comparar ese cero con
  el total disponible del otro grupo.
- **Carga:** skeleton en los paneles/series aún pendientes; no reutilizar datos
  de otro rango.
- **Error:** error y reintento en el segmento fallido; el otro panel válido se
  conserva, pero el gráfico muestra comparación incompleta si falta cualquiera
  de los dos totales.
- **Vacío:** hasta cinco categorías (posiblemente menos) por grupo; tabla vacía
  cuando no hay ingresos; si ambos totales son cero, estado vacío en el gráfico.
- Al cambiar fechas mientras hay solicitudes activas, invalidar respuestas
  anteriores con cancelación y/o identificador de solicitud. Vaciar los datos
  asociados al rango anterior o mantenerlos ocultos; nunca etiquetarlos con el
  rango nuevo. Si el rango está invertido, no solicitar ninguno de los cuatro
  recursos.

### Formato y casos límite

- Usar el formato de `formatCurrency` para importes y mantener los valores sin
  redondear para sumas y porcentajes. Ese helper muestra USD sin centavos; no
  satisface una exigencia de precisión visual a dos decimales.
- Mostrar el porcentaje con un decimal usando `formatPercent` sobre
  `categoryPercentage` (ya calculado en puntos porcentuales; no volver a
  multiplicar por 100).
- Casos límite: el endpoint puede devolver menos de cinco categorías; con
  denominador cero mostrar `—`; un segmento fallido no invalida el panel
  correcto pero sí impide dibujar una comparación completa; un segmento sin
  ingresos tiene total cero y estado vacío.

## Referencias de contrato consultadas

- `GET /docs` y `GET /openapi.json` respondieron `200` durante esta fase.
- OpenAPI confirma:
  - `/api/metrics/facets`: objeto `MetricsFacets`, sin parámetros de consulta.
  - `/api/metrics`: array de `FinancialMovement`; fechas opcionales.
  - `/api/metrics/alerts`: array de `MetricsAlert`; `threshold >= 0` (default
    `0.3`), `group_by` `day | week | month` (default `month`), fechas y
    `business_type` opcionales.
  - `/api/metrics/categories/top`: array de `TopCategoryItem`; `operation_type`
    (`income | outcome`, default `outcome`), `limit` de 1 a 20 (default 5),
    fechas y `business_type` opcionales.
  - `/api/metrics/b2b` y `/api/metrics/b2c`: arrays de `FinancialMovement`;
    fechas, categoría y tipo de operación opcionales.
