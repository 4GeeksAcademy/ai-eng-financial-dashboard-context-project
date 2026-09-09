# Specs de componentes — Features 1, 2, 3

Solo especificaciones. **Sin código React, sin `fetch`, sin cambios en el backend.** El agente
que implemente escribirá los componentes después, siguiendo las convenciones de abajo y el
contrato de la API de [`endpoints.md`](./endpoints.md).

Los tipos referenciados aquí viven en [`api-types.ts`](./api-types.ts), [`param-types.ts`](./param-types.ts)
y [`view-types.ts`](./view-types.ts).

---

## 0. Convenciones que TODO componente nuevo debe seguir

Derivadas de `.agents/rules/` (ya en el repo). Son de peso — varias las impone `tsc`, el resto la revisión.

| Regla | Origen |
|---|---|
| Nombres de archivo en kebab-case; un concepto de componente por archivo. Los componentes de dominio van en `frontend/src/components/dashboard/` (F1, F2) y en una nueva `frontend/src/components/comparison/` (F3, imita el precedente de `dashboard/`). | `.agents/rules/frontend-structure-and-imports.md` R1–R2 |
| Export nombrado (`export function`), nunca `export default`. | `.agents/rules/frontend-components-and-state.md` R5 |
| Props tipadas como `interface <NombreComponente>Props`. | ídem, R6 |
| Todo componente de datos acepta `loading?: boolean` y renderiza su PROPIO `<Skeleton>` (`@/components/ui/skeleton`). Sin spinner global. | ídem, R7 |
| Alias `@/` para imports entre carpetas, relativo solo dentro de una carpeta. Los imports de solo-tipo usan `import { type X } from '...'`. | `.agents/rules/frontend-structure-and-imports.md` R3–R4 |
| Sin librería de estado nueva. El estado vive en `App.tsx` y baja por props. La lógica pura nueva → funciones en `frontend/src/lib/*.ts`, no dentro de componentes. | `.agents/rules/frontend-components-and-state.md` R8–R9 |
| Solo clases utilitarias de Tailwind + `cn()` (`@/lib/utils`). Colores vía tokens `var(--…)` de `frontend/src/index.css`; nunca hex hard-codeado. La app hoy es solo modo oscuro (`App.tsx:46`) pero igualmente usar los tokens. | `.agents/rules/styling.md` R1–R2 |
| Sin `axios` / cliente HTTP. El agente que implemente extiende el `fetch` existente de `App.tsx`. Mantener el único `.catch()` + mensaje fijo en español; NO añadir `console.error`. | `.agents/rules/error-handling.md` |
| Los helpers puros nuevos llevan un `*.test.ts` co-ubicado (Vitest, `describe`/`it`, fixtures inline). | `.agents/rules/testing.md` |

### Reutilizar, no reconstruir

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` — `@/components/ui/card`
- `Skeleton` — `@/components/ui/skeleton`
- `formatCurrency(value: number)` (USD, 0 decimales) y `formatPercent(value: number)` (1 decimal + `%`) — `@/lib/financial-utils` (`frontend/src/lib/financial-utils.ts:69-80`)
- Iconos — `lucide-react` (ya es dependencia)
- Aspecto de estado vacío — el texto centrado y atenuado de `income-outcome-chart.tsx` / `profit-percent-chart.tsx` ("No data available to display")
- Banner de error — la caja con borde rojo de `App.tsx:51-55` (solo `App.tsx` la renderiza; las features nuevas reutilizan el mismo estado `error`)

### Formateadores que quizá haya que AÑADIR a `frontend/src/lib/financial-utils.ts`

Seguir el estilo de las funciones que ya hay ahí. Todos opcionales — añadir solo si el componente lo necesita.

- `formatRatioAsPercent(ratio: number): string` → `formatPercent(ratio * 100)` con un `+` delante para valores positivos. Usado para `MetricsAlert.increase_ratio` y la lectura del threshold. (O simplemente llamar `formatPercent(x * 100)` inline.)
- `formatDateLabel(iso: string): string` → fecha legible para un resumen de rango de solo lectura (Feature 1). Imitar `formatMonthYearLabel` del mismo archivo.

---

## Feature 1 — Filtro de rango de fechas del dashboard

### Componente: `DateRangeFilter`

`frontend/src/components/dashboard/date-range-filter.tsx`

```
interface DateRangeFilterProps {
  bounds: DateRangeBounds | null   // de MetricsFacets.min_date / max_date; null hasta que carguen los facets
  value: DateRange                 // selección actual; {} === sin filtro
  onChange: (next: DateRange) => void
  loading?: boolean                // facets aún cargando -> renderizar <Skeleton>
  disabled?: boolean               // p. ej. los datos del dashboard se están recargando
}
```

`DateRange` y `DateRangeBounds` están en `view-types.ts`.

### Comportamiento

- Dos controles `<input type="date">`: **Desde** y **Hasta**.
- Los atributos nativos `min` / `max` vienen de `bounds` y del otro campo:
  - Desde: `min = bounds.min`, `max = value.endDate ?? bounds.max`
  - Hasta: `min = value.startDate ?? bounds.min`, `max = bounds.max`
- Al cambiar, mapear string vacío → `undefined` y llamar a `onChange` con el `DateRange` actualizado
  (omitir las claves `undefined`).
- **Clamp ante inversión (decisión de diseño — ver README §"Decisiones de diseño"):** si el usuario
  pone `Desde` posterior al `Hasta` actual, poner también `Hasta = Desde` (y simétricamente). Los
  `min`/`max` nativos ya evitan la mayoría; el clamp cubre la escritura manual.
- Un control **Limpiar** (botón de texto) aparece solo cuando `value.startDate || value.endDate`;
  llama a `onChange({})`.
- Ambos límites opcionales: `{ startDate }` solo o `{ endDate }` solo son válidos y pasan tal cual
  a `MetricsParams`.

### Estados / casos límite

| Estado | Expectativa |
|---|---|
| `loading` (facets sin cargar) | Renderizar un `<Skeleton>` del tamaño de los dos inputs (estilo skeleton de KPICard). Sin inputs todavía. |
| `bounds === null` y no está `loading` (falló el fetch de facets) | Renderizar los inputs **deshabilitados** con una nota atenuada "Rango de fechas no disponible". El dashboard sigue funcionando sin filtro. *(revisable — también podría ocultarse el filtro entero)* |
| `value === {}` (sin fechas) | Inputs vacíos, sin botón Limpiar, el dashboard muestra el dataset completo (comportamiento actual). |
| El rango seleccionado no tiene movimientos | NO se maneja aquí. Las KPI cards ya renderizan `—` y las gráficas ya muestran "No data available to display". El filtro mantiene la selección para que el usuario pueda ampliarla. |
| `min_date === max_date` (dataset degenerado) | Ambos inputs permiten solo esa fecha. Aceptable. |

### Integración en `App.tsx` (spec para el agente que implemente — NO implementar ahora)

Actual: `fetchFinancialData()` (`App.tsx:15-21`) llama a `/api/metrics` **sin params**, una vez al
montar (`useEffect(…, [])`). La Feature 1 requiere, solo en `App.tsx`:

1. Estado nuevo: `dateRange: DateRange` y `bounds: DateRangeBounds | null`.
2. Fetch `GET /api/metrics/facets` una vez al montar → setear `bounds` desde `min_date` / `max_date`.
3. Dar a `fetchFinancialData` un argumento `params: MetricsParams`; serializar `start_date` /
   `end_date` en el query string (saltar `undefined`).
4. Añadir `dateRange` a las deps del `useEffect` de datos → refetch de `/api/metrics` al cambiar →
   recalcular `computeKPIs` / `computeMonthlyData` como hoy.
5. Renderizar `<DateRangeFilter>` junto a `<DashboardHeader>`.
6. Mantener el comportamiento del banner `error` sin cambios (un refetch fallido muestra el mismo mensaje).

Este es el **único** cambio en archivos existentes que implica la Feature 1.

---

## Feature 2 — Tabla de alertas de anomalías

### Componente: `AnomalyAlertsCard`

`frontend/src/components/dashboard/anomaly-alerts-card.tsx`

```
interface AnomalyAlertsCardProps {
  data: MetricsAlert[]
  loading?: boolean
  threshold: number                       // threshold actual de la UI (0.01–1.0, ver abajo)
  onThresholdChange: (next: number) => void
  groupBy?: GroupBy                        // default 'month'; solo contexto de visualización
}
```

### Subcomponente: `ThresholdControl` (puede ir inline o en su propio archivo `threshold-control.tsx`)

```
interface ThresholdControlProps {
  value: number
  onChange: (next: number) => void
}
```

- `<input type="range" min={0.01} max={1} step={0.01}>`, value ligado a `value`,
  `onChange(Number(e.target.value))`.
- Lectura numérica al lado, mostrada como porcentaje: `formatPercent(value * 100)` → p. ej. `30.0%`.
  *(revisable — podría mostrarse el `0.30` crudo)*
- **API vs UI — decirlo en el texto de la UI / un tooltip:** el rango 0.01–1.0 es una decisión de
  producto. La API acepta `0` (marcaría todos los períodos salvo el primero) y cualquier valor `> 1`.
  Si producto quiere luego "mostrar todo", bajar el `min` del control; nada cambia en el servidor.

### Layout de la card

`<Card>` → `<CardHeader>` (título "Alertas de anomalías" + descripción breve, p. ej. "Períodos en
los que el gasto superó su media histórica acumulada") → `ThresholdControl` → tabla.

### Columnas de la tabla (orden fijo)

| Columna | Valor | Formato |
|---|---|---|
| Período | `alert.period` | string tal cual (`"2026-03"`). Opcionalmente embellecer cuando `groupBy === 'month'`. |
| Gasto (outcome) | `alert.outcome_total` | `formatCurrency` |
| Baseline (media) | `alert.baseline_average` | `formatCurrency` |
| Incremento | `alert.increase_ratio` | `formatPercent(alert.increase_ratio * 100)`, con `+` delante |

- Las filas llegan **ascendentes por período** desde la API — renderizar en el orden recibido. El
  orden en cliente es opcional y no requerido para v1.
- **Tinte de severidad (decisión de diseño — revisable):** tintar el fondo de la celda *Incremento*
  con un token existente (`var(--destructive)` / `var(--outcome-badge)`) a baja opacidad, por
  buckets: `>= 1.0` fuerte · `0.5–1.0` medio · `< 0.5` sutil. Sin tokens de color nuevos. Si la
  revisión prefiere una tabla plana, quitar el tinte — nada más depende de él.

### Estados / casos límite

| Estado | Expectativa |
|---|---|
| `loading` | `<Card>` + `<Skeleton>` de cabecera + un bloque skeleton donde va la tabla (estilo skeleton de gráfica). |
| `data.length === 0` | **Caso común con thresholds altos.** Estado vacío dentro de la card: p. ej. "Ningún período superó un incremento del {threshold como %}." Atenuado, centrado, mismo estilo que el texto vacío de las gráficas. Debe leerse como intencional, no como error. |
| El primer período de la serie nunca aparece | Garantía del backend (`routes.py:225-226`). NO sintetizar una fila para él. |
| `increase_ratio` muy grande (p. ej. `5.0` → +500 %) | `formatPercent` (`toFixed(1)`) lo maneja; asegurar que la celda hace wrap en vez de desbordar. |
| `groupBy` es `'week'` / `'day'` | `period` pasa a `"2026-W12"` / `"2026-03-05"`. La UI v1 expone solo `month` (default de la API); mantener el prop/tipo abierto. *(revisable — el wording del PM no especificó agrupación.)* |
| `threshold` llega fuera de 0.01–1.0 (programáticamente) | Clamp solo para visualización; no rechazar. |

### Integración en `App.tsx` (spec — NO implementar ahora)

- Estado nuevo: `alertsThreshold: number` (default de UI **0.3**), `alerts: MetricsAlert[]`, y su
  propio flag `loading`.
- Fetch `GET /api/metrics/alerts` con `{ threshold: alertsThreshold, group_by: 'month' }`.
  Refetch al cambiar `alertsThreshold` — **debounce** (~250–300 ms) para que arrastrar el slider
  no sature la API (decisión de diseño — ver README).
- Renderizar `<AnomalyAlertsCard>` como bloque nuevo: o una fila a ancho completo bajo la
  `<section>` de gráficas existente o una nueva celda del grid. La ubicación es decisión de diseño (README).
- **El filtro de fechas del dashboard (Feature 1) acota también la Feature 2:** pasar siempre
  `start_date` / `end_date` del `dateRange` compartido a `/api/metrics/alerts`.

---

## Feature 3 — Comparación B2B vs B2C

### Routing: toggle en `App.tsx` (decidido)

Verificado: `frontend/package.json` no tiene `react-router*`; `App.tsx` renderiza una sola vista.

**Decidido en revisión:** la "nueva página" se monta con un **toggle de vista dentro de `App.tsx`**
(`useState<'dashboard' | 'comparison'>` que dirige un pequeño nav). **No** se añade `react-router-dom`
— el proyecto no tiene router y sumar una dependencia solo para esta vista es innecesario.

Las specs de componentes de abajo son agnósticas al montaje — idénticas bajo una ruta o una pestaña.

### Componente: `SegmentComparisonView`

`frontend/src/components/comparison/segment-comparison-view.tsx`

```
interface SegmentComparisonViewProps {
  data: SegmentComparison | null   // { b2b, b2c }; null hasta que resuelvan ambas llamadas
  loading?: boolean
  dateRange: DateRange             // filtro de fechas PROPIO de esta vista (no el del dashboard)
  onDateRangeChange: (next: DateRange) => void
}
```

Renderiza un encabezado + dos `<SegmentPanel>` en un grid responsive (`grid-cols-1 xl:grid-cols-2`,
igual que la `<section>` de gráficas existente en `App.tsx:61-67`) + un `SegmentComparisonSummary` opcional.

La vista incluye su **propio** `<DateRangeFilter>` (el mismo componente que la Feature 1, `bounds`
de los mismos facets globales). Su valor **no** se comparte con el filtro de fechas del dashboard.

### Componente: `SegmentPanel`

`frontend/src/components/comparison/segment-panel.tsx`

```
interface SegmentPanelProps {
  breakdown: SegmentIncomeBreakdown   // { segment, incomeTotal, categories: CategoryShare[] }
  loading?: boolean
}
```

`<Card>` →
- `<CardHeader>`: título = `breakdown.segment` (`"B2B"` / `"B2C"`), descripción "Ingresos por categoría".
- Número principal: `formatCurrency(breakdown.incomeTotal)`.
- Lista de categorías (ya ordenada por `total_amount` desc): cada fila → etiqueta de categoría ·
  `formatCurrency(total_amount)` · `formatPercent(percent)` (`percent` ya es 0–100) · barra opcional
  con `width: {percent}%` usando un token existente.

**Sin resultados de top categorías** (`breakdown.categories.length === 0`): este mismo spec aplica
a **cada** panel por separado (B2B y B2C). El panel renderiza el número principal
`formatCurrency(breakdown.incomeTotal)` (será `$0` si `incomeTotal === 0`) y, donde iría la lista,
el texto atenuado y centrado "Sin ingresos registrados para {segmento}". No se renderiza tabla ni barras.

### Componente: `SegmentComparisonSummary` (decisión de diseño — revisable)

Callout pequeño: qué segmento tiene más ingresos y por cuánto — absoluto (`formatCurrency`) y
relativo (`formatPercent`), calculado en cliente con guarda contra división por cero. Quitarlo si
la revisión no lo quiere.

### Ensamblado de datos (spec para el agente que implemente — NO implementado aquí)

Dos llamadas, una por segmento:

```
GET /api/metrics/categories/top?operation_type=income&business_type=B2B&limit=20
GET /api/metrics/categories/top?operation_type=income&business_type=B2C&limit=20
```

- `operation_type=income` es **obligatorio y explícito** — el default de la API es `outcome`.
- `limit=20` es deliberado — devuelve todas las categorías para que el denominador sea el total
  real del grupo. NO usar `limit=5` aquí.
- Por segmento: `incomeTotal = Σ items.total_amount`;
  `categories = items.map(i => ({ category: i.category, total_amount: i.total_amount,
  percent: incomeTotal > 0 ? (i.total_amount / incomeTotal) * 100 : 0 }))`.
- Poner esto en un helper puro (p. ej. `frontend/src/lib/comparison-utils.ts`,
  `assembleSegmentBreakdown(items: TopCategoryItem[], segment: BusinessType): SegmentIncomeBreakdown`)
  con un `*.test.ts` co-ubicado.
- Añadir `start_date` / `end_date` del filtro de fechas **propio** de la vista B2B/B2C a ambas llamadas.

### Estados / casos límite

| Estado | Expectativa |
|---|---|
| `loading` | Dos skeletons de `<Card>` uno al lado del otro. |
| Un segmento no tiene ingresos en el rango | `incomeTotal === 0`, `categories === []`. El panel muestra `formatCurrency(0)` y, donde iría la lista, "Sin ingresos registrados para {segmento}". |
| **Ambos** segmentos vacíos (p. ej. un rango de fechas sin datos) | Un estado vacío combinado ("Sin ingresos en el período seleccionado"), no dos paneles a "$0". *(decisión de diseño — revisable)* |
| `percent` con `incomeTotal === 0` | Debe ser `0` (guarda). Replicar `frontend/src/lib/financial-utils.ts:31,59`. |
| `Σ percent` ≠ exactamente 100 (redondeo de visualización) | Dejarlo. Mostrar cada `formatPercent` de forma independiente. NO normalizar a 100. |
| Solo vuelven `sales` + `others` (datos mock actuales para income) | NO hard-codear ese conjunto — renderizar las categorías que devuelva la API. |
| Una sola categoría ≈ 100 % | La barra topa en 100 %. Vale. |

### Integración en `App.tsx` (spec — NO implementar ahora)

- Estado del toggle de vista: `view: 'dashboard' | 'comparison'`.
- Cuando `view === 'comparison'`: lanzar ambas llamadas a `categories/top`, ensamblar
  `SegmentComparison`, renderizar `<SegmentComparisonView>`.
- Reutilizar el mismo estado `error` + mensaje en español ante fallo.
- La Feature 3 mantiene su **propio** estado `DateRange` (independiente del `dateRange` del
  dashboard). Se pasa a ambas llamadas `categories/top`.
