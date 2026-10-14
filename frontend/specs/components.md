# Especificación funcional de componentes del dashboard financiero

## 1. Estado de las fuentes y alcance

Este documento especifica tres funcionalidades solicitadas por producto: filtro de rango de fechas, tabla de alertas y comparativa B2B vs B2C. Es una especificación agnóstica de implementación: **no implementa React, gráficos, llamadas HTTP ni cambios de backend**.

### Fuentes verificadas

- Requisitos A–C proporcionados por PM en la solicitud que acompaña este documento. Cuando el backend no ofrece el campo o cálculo solicitado, se marca como decisión pendiente en vez de tratarlo como contrato.
- [OpenAPI vivo, Swagger UI](http://localhost:8000/docs) y documento OpenAPI servido en `http://localhost:8000/openapi.json`, consultados en la auditoría inicial del 2026-10-09. En esta revisión el servidor no estaba activo; los parámetros y response models se contrastaron además con `backend/app/routes.py`.
- Esquemas OpenAPI: `MetricsFacets`, `MetricsAlert`, `MetricsSummaryItem`, `TopCategoryItem`, `FinancialMovement` y `HTTPValidationError`.
- [Modelos y rutas backend](../../backend/app/routes.py), usados para aclarar el algoritmo real de alertas y el significado de los endpoints B2B/B2C. El código complementa OpenAPI; no cambia lo que el esquema declara.
- [Tipos financieros actuales](../src/lib/financial-types.ts), [App actual](../src/App.tsx), [utilidades financieras](../src/lib/financial-utils.ts) y componentes en [`src/components/dashboard/`](../src/components/dashboard/).

### Fuente `api-types.ts` y clasificación

Los DTOs response están en [`api-types.ts`](./api-types.ts) y los query params en [`param-types.ts`](./param-types.ts), contrastados con OpenAPI y `backend/app/routes.py`. Los tipos de props UI que siguen importan esas definiciones; no duplican los DTOs API.

- ✅ **Confirmado:** declarado en el OpenAPI servido (o comportamiento aclarado por implementación backend identificada expresamente).
- ❓ **Pendiente:** decisión de experiencia/cálculo que no establece el contrato, la petición de PM no resuelve por completo o depende de datos que la API no proporciona.
- Las reglas identificadas como **propuesta de UX** son criterios de esta especificación, no validaciones del backend.

### Tipos API exactos conocidos (respuestas en `api-types.ts`, parámetros en `param-types.ts`)

```ts
import type {
  AlertEntry,
  FacetsResponse,
  BusinessType,
  Category,
  CategoryEntry,
  FinancialMovement,
  GroupBy,
  HTTPValidationError,
  ISODate,
  MetricsComparison,
  MetricsSummaryItem,
  OperationType,
  ValidationError,
} from "./api-types";

import type {
  AlertsParams,
  DateRangeFilter,
  TopCategoriesParams,
} from "./param-types";
```

Las propiedades principales de las respuestas OpenAPI son requeridas y no nulas, excepto `MetricsComparison.delta_pct` que es requerido `number | null`. Los query params opcionales anulables se representan como `?: T | null`; las fechas usan `ISODate` (`string`, formato `YYYY-MM-DD`). `period` es string sin formato declarado y los importes son number sin unidad/moneda declarada.

---

## 2. Funcionalidad A — Filtro de rango de fechas

### A.1 Componentes y responsabilidad

1. **`DateRangeFilter`** — controles para seleccionar el extremo inicial y el final, validar/coherenciar la selección de UX y comunicar el rango vigente al coordinador de la vista.
2. **`AvailableDateRange`** — texto asociado que informa el rango disponible recibido de facets (`min_date` a `max_date`). Puede integrarse visualmente dentro de `DateRangeFilter`; es responsabilidad semántica separada.
3. **Coordinador de filtros de la página principal** — mantiene una selección y la aplica a movimientos y alertas; no realiza cálculos financieros. La nueva página comparativa reutiliza el filtro pero mantiene su propia selección de rango.

**Contexto:** colocar el filtro en la cabecera de filtros del dashboard, relacionado con el `DashboardHeader` existente. El encabezado actual solo muestra un período fijo y no implementa controles.

### A.2 Props y tipos

Los siguientes son **tipos de props propuestos para el contrato de componentes**. `ISODate` se importa del contrato wire; `DateRangeValue` y props son tipos UI y no DTOs de API:

```ts
import type { FacetsResponse, ISODate } from "./api-types";

type DateRangeValue = {
  startDate?: ISODate;
  endDate?: ISODate;
};

type DateRangeFilterProps = {
  value: DateRangeValue;
  availableRange: Pick<FacetsResponse, "min_date" | "max_date">;
  disabled?: boolean;
  onChange: (next: DateRangeValue) => void;
};

type AvailableDateRangeProps = Pick<FacetsResponse, "min_date" | "max_date">;
```

- `availableRange.min_date` y `max_date` se reciben como strings de fecha OpenAPI. Los valores seleccionados son opcionales e independientes en la interfaz: no se envía `null` como contrato de query; un extremo no seleccionado se omite.
- Estado inicial sin selección; ambos límites vacíos significan consultar el dataset completo. Aplicar inmediatamente cambios válidos.
- `disabled` permite representar carga de facets; `onChange` comunica la propuesta local. No prescribe implementación concreta.

### A.3 Contrato API y filtrado

- ✅ `GET /api/metrics/facets` no tiene parámetros y devuelve `FacetsResponse`, incluyendo `min_date` y `max_date` con formato `date`, y `categories` como enum global de cinco categorías.
- ✅ `GET /api/metrics` acepta `start_date` y `end_date` opcionales/anulables y es la fuente que alimenta los KPIs y gráficos actuales. La misma selección compartida debe modificar su resultado antes de recalcular ambos.
- ✅ `GET /api/metrics/alerts` acepta `start_date` y `end_date` opcionales/anulables, cada uno como fecha, más `threshold`, `group_by` y `business_type` opcionales; su baseline, sin embargo, no satisface el requisito PM de tres períodos.
- ✅ Para datos de grupo, `/api/metrics/b2b` y `/api/metrics/b2c` aceptan ambos extremos como query params opcionales, así como `category` y `operation_type` opcionales.
- ❌ `/api/metrics` no acepta `business_type`; no debe emplearse como si soportara filtro de segmento.
- La serialización de cada extremo seleccionado es exactamente `YYYY-MM-DD` (OpenAPI `format: date`). Los extremos ausentes no se incluyen en la consulta.
- El rango es inclusivo en backend para `create_date >= start_date` y `create_date <= end_date` en rutas que usan `filter_movements_by_date`.

### A.4 Reglas de UX y casos límite

Estas son reglas propuestas de UX y no restricciones añadidas al backend:

- **Un solo extremo seleccionado:** permitirlo. Enviar solamente `start_date` o solamente `end_date`; el backend filtra desde ese límite inclusive o hasta ese límite inclusive, respectivamente. No inventar el extremo faltante.
- **Fuera del rango de facets:** configurar `min=min_date` y `max=max_date` en ambos controles. Si un valor inválido llega por estado restaurado/programático, anunciar el error y no consultar; no recortar silenciosamente. El backend no declara validación de esos límites.
- **Rango invertido (`startDate > endDate`):** no emitir consultas con el rango; mostrar mensaje asociado al input final y conservar la selección para corrección. El backend no valida el orden: sus filtros inclusivos devolverían arrays vacíos, no error.
- Si un extremo coincide con el otro, el rango representa ese día. La inclusión del mismo día se apoya en el filtrado inclusivo de backend.
- Si facets carga, deshabilitar controles. Si falla, mostrar error/reintento y mantenerlos deshabilitados hasta obtener límites; no inventar status/copy de error de API.

### A.5 Visualización y accesibilidad

- Etiquetas visibles y asociadas a los campos: **Fecha inicial** y **Fecha final**. Los nombres accesibles no dependerán solo de placeholder.
- Usar controles nativos de fecha o patrón equivalente con teclado, foco visible y formato de intercambio ISO `YYYY-MM-DD`; la presentación localizada puede variar sin alterar el valor serializado.
- Comunicar el rango disponible junto a los controles, por ejemplo “Rango disponible: {min_date} – {max_date}”, con fechas presentadas sin cambiar su significado.
- Mensaje de validación del rango invertido conectado programáticamente al control relevante; no depender del color solamente.
- Actualizar inmediatamente todos los resultados asociados a un rango válido; durante la consulta mostrar carga y no presentar datos anteriores como pertenecientes al nuevo rango.

### A.6 Criterios de aceptación

1. Se presentan dos controles independientes con nombres accesibles y valores intercambiados como `YYYY-MM-DD`.
2. Facets se representa usando `min_date`/`max_date` y no un rango inventado; categorías de facets están disponibles para otros filtros, aunque esta funcionalidad no las modifica.
3. Al elegir solo fecha inicial, solo se entrega `start_date`; con solo fecha final, solo `end_date`; no se rellena el extremo opuesto.
4. Se previene el envío de una selección invertida y se muestra una explicación accesible, conforme a la regla UX propuesta.
5. Un valor fuera de `min_date`/`max_date` se bloquea en UI y no se envía; esto es validación UI, no una restricción atribuida al backend.
6. El estado de carga o error de facets no se presenta como respuesta HTTP específica no confirmada.
7. Un rango válido se envía también a `/api/metrics`; KPIs, gráfico ingreso/egreso y margen se recalculan solo con los movimientos recibidos para ese rango.

---

## 3. Funcionalidad B — Tabla de alertas de egresos

### B.1 Componentes y responsabilidad

1. **`AlertThresholdControl`** — edición del umbral de incremento, en rango de producto `[0.01, 1.0]` y con valor inicial de producto `0.3`.
2. **`OutcomeAlertsTable`** — tabla semántica que presenta las alertas recibidas y el estado explícito sin anomalías.
3. **`OutcomeAlertsSection`** — composición de umbral, resultados, carga y error; recibe el rango temporal compartido.

**Contexto:** sección analítica debajo de los gráficos existentes en la página principal, después del filtro de fecha. Es nueva; no existe componente de alertas en el frontend actual.

### B.2 Props y tipos

```ts
type AlertThreshold = number;
type AlertQuery = AlertsParams;

type AlertThresholdControlProps = {
  value: AlertThreshold;
  min: 0.01;
  max: 1.0;
  step: 0.01;
  disabled: boolean;
  error?: string;
  onChange: (value: AlertThreshold) => void;
};

type OutcomeAlertsTableProps = {
  rows: AlertEntry[];
  loading: boolean;
  error?: string;
};

type OutcomeAlertsSectionProps = {
  dateRange: DateRangeValue;
  threshold: AlertThreshold;
  rows: AlertEntry[];
  loading: boolean;
  error?: string;
  onThresholdChange: (value: AlertThreshold) => void;
  onRetry: () => void;
};
```

`AlertEntry` refleja el response OpenAPI de `/api/metrics/alerts`: `period`, `outcome_total`, `baseline_average`, `increase_ratio`, todos requeridos y numéricos salvo `period: string`. Las filas solicitadas por PM reutilizan esa forma, pero se derivan desde `MetricsSummaryItem` para calcular el baseline de tres períodos; no se presentan como respuesta directa de alerts.

- El query API `threshold` es `number`, mínimo documentado `0`, default API `0.3`; **no** declara máximo.
- El `[0.01, 1.0]` y default inicial de producto `0.3` son requisito del PM. El rango superior 1.0 es límite de UI, **no** restricción confirmada del backend. `0.3` coincide con el default del backend.
- Enviar siempre el valor visible, iniciando en `0.3`, para que la tabla corresponda exactamente al umbral mostrado.

### B.3 Columnas, unidades y derivaciones

La tabla contiene las columnas requeridas:

| Encabezado | Dato | Estado de contrato |
|---|---|---|
| Período | `AlertEntry.period: string` | Se deriva del bucket mensual de summary; OpenAPI no declara patrón de string. |
| Outcome registrado | `AlertEntry.outcome_total: number` | Se copia del `MetricsSummaryItem.outcome` para el período filtrado. La moneda/unidad no está declarada. |
| Media móvil de tres períodos anteriores | `AlertEntry.baseline_average: number` | Derivación desde `MetricsSummaryItem.outcome`: media aritmética de exactamente los tres buckets mensuales cronológicamente previos. No usar `baseline_average` de `/api/metrics/alerts`, que tiene semántica acumulada. |
| Incremento porcentual | `AlertEntry.increase_ratio: number` | Derivado `(outcome - baseline_average) / baseline_average`; mostrar `increase_ratio * 100` con un decimal. Comparación estricta `>` threshold. |

- **Discrepancia verificada:** `/api/metrics/alerts` calcula baseline acumulado de toda la historia anterior y solo entrega alertas según esa regla. La especificación resuelve la discrepancia sin renombrar el campo wire: consultar summary y crear la fila derivada conforme al algoritmo anterior.
- Para `group_by=month`, el backend serializa `period` como `YYYY-MM`; mantener orden cronológico devuelto por summary. La fila de alerta hereda esa clave de período.
- Importes: representar numéricamente sin afirmar USD u otra divisa. La UI actual formatea USD (`formatCurrency`), pero no existe evidencia de que sea moneda del contrato; no se puede trasladar ese supuesto a estas filas sin aprobación.
- Presentación de valores derivados: importes con dos decimales, ratio porcentual con un decimal, sin asumir código/símbolo de moneda.

### B.4 Umbral, fechas y sincronización

- Usar `/api/metrics/summary` como fuente para poder cumplir el baseline móvil PM; `/api/metrics/alerts` no implementa esa regla. Consulta mensual con fechas y sin filtros categóricos ni segmento.
- Inicializar el control visual a `0.3`; aceptar valores dentro de `[0.01, 1.0]` con paso `0.01`.
- Compartir `start_date`/`end_date` seleccionados por `DateRangeFilter`. Omitir cada query param no seleccionado.
- Al cambiar fechas o umbral, solicitar que los resultados representen la nueva combinación. No mostrar resultados obsoletos bajo controles nuevos; mantener indicador de carga.
- `group_by=month` es fijo. La consulta actual lleva el rango exacto seleccionado; la consulta histórica omite `start_date` y conserva `end_date` para obtener los meses previos sin incluir datos futuros.
- Para cada bucket mensual visible, calcular baseline con los tres meses calendario inmediatamente anteriores. Meses sin bucket dentro de la cobertura desde `facets.min_date` cuentan como `outcome=0`; no crear meses previos al dataset. Si no hay cobertura de tres meses, no emitir fila. El baseline debe ser mayor que cero; calcular ratio y emitir fila solo para `ratio > threshold`.
- En igualdad exacta con `threshold` no se emite fila: comparación estricta `>`.
- Si la serie actual está vacía o la derivación no produce alertas, mostrar el estado vacío definido abajo; no depender de `/api/metrics/alerts`.

### B.5 Estados y accesibilidad

- **Estado vacío obligatorio y explícito:** si después de derivar la respuesta no hay filas que excedan el umbral, mostrar “No se detectaron anomalías para el rango y umbral seleccionados”, no ocultar la tabla ni mostrar error.
- Estado cargando: mostrar indicación no interactiva o skeleton asociado al encabezado de sección; exponer estado de carga semánticamente y conservar controles utilizables según la política acordada.
- Estado de error: mensaje que indique que las alertas no pudieron cargarse y acción **Reintentar** conectada a `onRetry`. No especificar status HTTP, estructura distinta del `HTTPValidationError` documentado para 422 ni causa de error no conocida.
- La tabla usa `<table>` con `caption`, `<thead>`, `<th scope="col">` y filas semánticas; encabezados claros. No se comunica un resultado vacío como error.
- Umbral con `<label>` visible, escala ratio aclarada y error asociado para valor local inválido. Teclado y foco visibles.
- Si los resultados dependen de filtros, incluir rango y umbral activos en texto de contexto para evitar lectura desasociada.

### B.6 Criterios de aceptación

1. El control inicia en `0.3`, usa paso `0.01` y no permite valores menores que `0.01` ni mayores que `1.0`; se documenta que solo el mínimo API `0` está confirmado.
2. Se muestra una tabla con las cuatro columnas requeridas y sus campos de respuesta trazados.
3. `[]` produce un estado vacío explícito que identifica ausencia de anomalías; no produce un error ni una tabla aparentemente truncada.
4. Los filtros se aplican a las consultas summary; cada fila aparece solo tras comparar incremento con threshold usando `>`.
5. Baseline usa exactamente los tres buckets mensuales previos, omite alerta si faltan períodos previos o si baseline no es positivo.
6. Ratio se muestra como porcentaje multiplicado por 100 y redondeado a un decimal; los importes usan dos decimales sin símbolo de moneda.
7. Carga y error son estados de interfaz, sin fabricar códigos o payloads HTTP.

---

## 4. Funcionalidad C — Comparativa B2B vs B2C

### C.1 Componentes y responsabilidad

1. **`BusinessComparisonSection`** — compone el título, el filtro de fechas compartido y los resultados segmentados.
2. **`BusinessGroupPanel`** — contenedor para un grupo (`B2B` o `B2C`) con su tabla Top 5 y estado individual.
3. **`TopIncomeCategoriesTable`** — tabla de categorías de ingreso, total y porcentaje del grupo.
4. **`BusinessComparisonChart`** — único gráfico situado bajo ambas tablas, que compara el ingreso total de B2B frente a B2C en el rango. Fuente: summary separado por `business_type`; sumar todos sus campos `income`.

**Contexto:** nueva página del dashboard en la ruta `/comparison`, accesible desde un enlace visible “Comparativa B2B/B2C”. Reutiliza el control de fechas con selección independiente de la página principal. Distribuir dos paneles en paralelo cuando haya espacio y apilarlos en viewports estrechos; gráfico compartido debajo de los paneles. El responsive propuesto sigue el patrón actual de grid de una columna a `xl:grid-cols-2`.

### C.2 Props y tipos

```ts
type BusinessGroup = BusinessType; // "B2B" | "B2C"

type BusinessIncomeTotal = {
  group: BusinessGroup;
  totalIncome: number;
};

type BusinessGroupPanelProps = {
  group: BusinessGroup;
  rows: CategoryEntry[]; // contrato conocido para categories/top; consulta filtrada por business_type
  totalIncome: number | null;
  loading: boolean;
  error?: string;
};

type TopIncomeCategoriesTableProps = {
  rows: CategoryEntry[];
  group: BusinessGroup;
  totalIncome: number | null;
  loading: boolean;
  error?: string;
};

type DateRangeValue = {
  startDate?: ISODate;
  endDate?: ISODate;
};

type BusinessComparisonChartProps = {
  totals: BusinessIncomeTotal[];
  loading: boolean;
  errors?: Partial<Record<BusinessGroup, string>>;
  accessibleSummary: string;
};

type BusinessComparisonSectionProps = {
  dateRange: DateRangeValue;
  b2bRows: CategoryEntry[];
  b2cRows: CategoryEntry[];
  b2bTotalIncome: number | null;
  b2cTotalIncome: number | null;
  loadingGroups: Partial<Record<BusinessGroup, boolean>>;
  errors?: Partial<Record<BusinessGroup, string>>;
};
```

Los props anteriores son contratos de componente propuestos. `CategoryEntry` se corresponde con el esquema real de `/api/metrics/categories/top`, que contiene `category`, `operation_type` y `total_amount`; **no contiene porcentaje, grupo B2B/B2C ni periodo**. `BusinessType` son los valores del enum de OpenAPI.

### C.3 Compatibilidad del API y datos disponibles

- ✅ `/api/metrics/categories/top` admite `operation_type` (`income` o `outcome`), `limit` entero entre 1 y 20 (default 5), fechas y `business_type` opcional. Para solicitar categorías de ingreso por grupo, el contrato permite `operation_type=income`, `limit=5`, rango de fechas y `business_type=B2B` o `B2C`.
- ✅ `/api/metrics/b2b` y `/api/metrics/b2c` identifican el grupo en la ruta y devuelven `FinancialMovement[]`; esos movimientos también incluyen `business_type`. Los endpoints aceptan fechas, categoría y operación, pero no query param `business_type`.
- ✅ Facets ofrece `business_types` (`B2B`, `B2C`) y categorías globales disponibles. No acepta un grupo y no entrega categorías filtradas por grupo, ni totales ni porcentajes. La pertenencia real de categoría a cada grupo/rango se obtiene de la respuesta Top filtrada.
- ✅ El generador backend vigente produce ingresos únicamente en categorías `sales` y `others`; por tanto, con este dataset un Top 5 de ingresos puede devolver como máximo dos categorías por grupo, aunque el parámetro permita `limit=5`. No garantizar cinco filas.
- ❌ `CategoryEntry` no provee porcentaje ni total general; no atribuir esos valores a `/api/metrics/categories/top`.
- El porcentaje de cada fila se calcula como `total_amount / total_income * 100`, donde `total_income = sum(summary[].income)` de `/api/metrics/summary?business_type=<grupo>` con las mismas fechas y sin filtros `category`/`operation_type`. Es denominador de todos los ingresos del grupo, no solo Top 5. Mostrar un decimal.
- Si `total_income === 0`, mostrar `—` en porcentaje; no producir `NaN`, infinito ni `0%` supuesto. El total summary vacío significa “sin dato”, no cero.
- **Gráfico comparativo:** mostrar dos barras de importe total, una B2B y una B2C. Cada valor es `sum(summary[].income)` de su grupo y rango, con `group_by=month`, sin `category`/`operation_type`. No graficar porcentajes ni categorías en este chart.
- El backend devuelve como máximo `limit` elementos, ordenados por `total_amount` descendente. Con `limit=5`, puede devolver menos de cinco. En el dataset actual, solo `sales` y `others` son categorías de ingreso posibles.

### C.4 Tabla, menos de cinco categorías y estados vacíos

- Cada grupo tiene su propia tabla con columnas: **Categoría**, **Ingresos totales**, **Porcentaje del total del grupo**. `total_amount` proviene de Top; denominador es la suma de `income` summary para ese mismo grupo/rango. Omitir filtros de categoría/operación en summary y mostrar porcentaje con un decimal.
- Solo se aceptan elementos `operation_type === "income"`; el consumidor debe solicitar `operation_type=income` y nunca presentar `outcome` como ingreso.
- **Respuesta no vacía con menos de cinco categorías:** mostrar las filas recibidas, sin fabricar filas/categorías faltantes ni asumir que la ausencia equivale a cero. El backend tiene cinco categorías posibles globales, pero no garantiza cinco categorías con ingresos para cada segmento/rango.
- **Estado vacío Top 5 B2B:** cuando la respuesta válida del grupo B2B sea `[]`, mostrar estado vacío específico en su panel, por ejemplo “Sin categorías de ingreso para B2B en el rango seleccionado”. No mostrar filas placeholder como si fueran datos.
- **Estado vacío Top 5 B2C:** igual regla independiente para `[]` de B2C.
- Porcentaje: si denominador > 0, presentar con un decimal; si es cero, `—`; si el array summary está vacío, presentar “Sin datos de ingresos”. Importes con dos decimales, sin símbolo de divisa no confirmado.
- Errores y carga son independientes por grupo: una respuesta exitosa/vacía de B2B no debe ocultar ni convertir en error el resultado B2C, y viceversa.
- Gráfico: si ambos summaries están vacíos, mostrar un estado vacío accesible propio. Si un grupo está vacío, graficar solo el grupo con datos y no inventar cero para el otro.

### C.5 Sincronización temporal y presentación

- Una sola selección `DateRangeValue` alimenta ambas tablas, sus denominadores y el gráfico de totales. Si solo hay `startDate` o solo `endDate`, omitir el otro parámetro en cada endpoint.
- Para datos de tabla, la forma más directa conforme al OpenAPI observado es `/api/metrics/categories/top` con `operation_type=income`, `limit=5`, fechas seleccionadas y `business_type` correspondiente; la especificación no prescribe la implementación de transporte.
- Si se eligen endpoints dedicados B2B/B2C, estos devuelven movimientos, no cinco categorías agregadas; obtener Top 5 desde esos movimientos sería una derivación que requiere aceptación y cálculo formal, no un contrato de respuesta equivalente.
- El gráfico único se sitúa después de las dos tablas. Solicitar summary con las mismas fechas y un `business_type` por consulta; sumar `income` de todos los períodos para cada valor de barra. Eje de categorías/grupos: B2B y B2C; eje numérico: total de ingresos sin moneda etiquetada. No sumar solo filas Top 5.
- Si ambos summaries son `[]`, mostrar estado vacío textual. Si solo uno está vacío, mostrar la barra del grupo con datos y marcar al otro como sin datos, no como cero. Si summary devuelve filas con `income=0`, el cero sí es un valor disponible.
- Rango de fecha se aplica idénticamente a los dos grupos. La semántica de fechas inclusivas y rango invertido se rige por sección A.

### C.6 Accesibilidad y semántica

- Las dos secciones identifican grupo mediante encabezado visible (`B2B` y `B2C`) y headings anidados bajo un heading principal de comparativa.
- Cada tabla usa caption/heading que identifica también el grupo, estructura `<thead>`/`<th scope="col">` y encabezados explícitos.
- Montos y porcentajes deben tener texto legible; no usar solamente color, barras o posición para expresar diferencias.
- El gráfico compara dos totales monetarios (no series porcentuales por categoría), con título, resumen textual de ambos valores y acceso por teclado. Seguir el patrón actual Recharts `accessibilityLayer` solo si se implementa con esa librería; la especificación no obliga a escoger herramienta.
- Si no hay datos de un grupo, el estado vacío se anuncia como estado informativo y no se representa como fallo.
- El gráfico único tiene estado textual equivalente si ambos summaries están vacíos; si solo uno está vacío, conserva el total de la otra línea e identifica la ausente sin inferir cero.

### C.7 Criterios de aceptación

1. Se ofrece una nueva página accesible desde navegación del dashboard, con dos paneles identificados por `B2B` y `B2C` en paralelo cuando el viewport lo permita, y un único gráfico debajo de ambas tablas.
2. Cada tabla solicita exclusivamente `operation_type=income`, máximo cinco resultados, y recibe solo su segmento por `business_type` o ruta específica.
3. Una respuesta de cero a cuatro filas muestra exactamente las filas recibidas; no se completan filas artificiales.
4. `[]` de cada grupo muestra su propio estado vacío de Top 5; el otro grupo se conserva independientemente. El gráfico compara dos totales `sum(summary[].income)`; ambos summaries vacíos activan su estado vacío, y un summary vacío no se convierte en cero.
5. La fecha inicial/final es compartida por ambos grupos y por la vista del gráfico, omitiendo extremos ausentes.
6. Cada porcentaje usa todos los ingresos del grupo/rango como denominador, muestra un decimal y `—` cuando el total sea cero. El gráfico compara totales de ingreso B2B/B2C, nunca porcentajes o categorías.
7. Los errores parciales se distinguen por grupo y no se describen con payload/status no documentados.

---

## 5. Decisiones fijadas y discrepancias de contrato

1. **Tipos:** `api-types.ts` contiene respuestas wire y `param-types.ts` contiene parámetros; mantener ambos sincronizados con OpenAPI. La auditoría actual no pudo consultar el servidor local porque estaba detenido.
2. **Fechas:** vacías al inicio, actualización inmediata, límites min/max de facets y no consulta para valor externo o rango invertido.
3. **Alertas:** media de tres buckets mensuales previos desde summary; sin fila con historial insuficiente o baseline no positivo. No consumir el baseline acumulado de `/alerts`.
4. **Umbral:** rango UI `[0.01, 1.0]`, paso `0.01`, default visible `0.3`; el API declara mínimo `0` y no máximo.
5. **Comparativa:** porcentaje usa total de ingresos summary por grupo/rango, un decimal y `—` para denominador cero; gráfico muestra los dos totales B2B/B2C.
6. **Facets/carga:** facets entrega categorías globales; Top indica disponibilidad de cada grupo. Carga, error y vacío son estados separados, independientes por segmento.

## 6. Patrones observados para orientar implementación futura

- La aplicación actual compone secciones desde `App.tsx`; aún no tiene cliente API separado ni integra endpoints analíticos avanzados.
- Componentes existentes reciben props de datos y `loading`, delegan cálculos de negocio a `frontend/src/lib/`, y usan `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` y `Skeleton`.
- Los gráficos existentes ofrecen mensaje `role="status"` sin datos y emplean Recharts con `accessibilityLayer`.
- La disposición actual usa grid de una columna y dos columnas en pantallas amplias. Esta especificación reutiliza el patrón como guía, no como obligación de framework.
- Mantener lógica financiera en utilidades de dominio testeables, no dentro de componentes de presentación, conforme a [regla 03](../../.agents/rules/03-logica-metricas-frontend-en-lib.md).
