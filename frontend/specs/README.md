# Specs de frontend — entregable Fase 2

Paquete de especificación de tres funcionalidades. **Esta carpeta contiene solo specs — sin
componentes React, sin `fetch`, sin cambios en el backend.** Un agente que implemente debería
poder construir las tres funcionalidades a partir de esta carpeta + el repo, sin volver a
investigar la API.

Todos los datos de API de aquí se verificaron contra el contrato OpenAPI en vivo (`GET
/openapi.json`, Swagger UI en `http://localhost:8000/docs`) y `backend/app/routes.py` en la fase
anterior. Donde la verificación previa corrigió una suposición, se usa el dato corregido y se marca.

## Las tres funcionalidades

1. **Filtro de rango de fechas del dashboard** — acotar el dashboard existente a una ventana `start_date` / `end_date`.
2. **Tabla de alertas de anomalías** — una card del dashboard que lista períodos cuyo gasto superó su media histórica acumulada, con un control de sensibilidad.
3. **Comparación B2B vs B2C** — una vista nueva que compara los ingresos (total + por categoría) entre los dos segmentos de negocio.

## Archivos de esta carpeta

| Archivo | Qué es |
|---|---|
| [`api-types.ts`](./api-types.ts) | Tipos TypeScript que reflejan 1:1 los schemas de **respuesta** de la API. Copia estricta de `/docs → Schemas`. |
| [`param-types.ts`](./param-types.ts) | Tipos para los **query parameters** de cada endpoint usado. Solo contrato de API. |
| [`view-types.ts`](./view-types.ts) | Shapes **derivados** calculados en el frontend (porcentajes, modelos ensamblados). No los devuelve ningún endpoint. |
| [`endpoints.md`](./endpoints.md) | Referencia de endpoints: método, ruta, params, restricciones, defaults, tipo de respuesta, evidencia, gotchas. |
| [`components.md`](./components.md) | Specs de componentes: nombres, props, comportamiento, estados, casos límite, y cómo se integra cada feature en `App.tsx`. |
| `README.md` | Este archivo: spec a nivel de funcionalidad, casos límite, convenciones, decisiones de diseño, dudas abiertas y checklist de implementación. |

Orden de lectura: `README.md` → `endpoints.md` → `api-types.ts` / `param-types.ts` / `view-types.ts` → `components.md`.

## Cómo mapea esto al codebase (datos verificados que necesita quien implemente)

- **Frontend:** React 19 + TypeScript + Vite, solo modo oscuro (`frontend/src/App.tsx:46` hard-codea `class="dark"`). Tailwind v4 vía `@tailwindcss/vite`, config en `frontend/src/index.css` (sin `tailwind.config.js`). Primitivos estilo shadcn en `frontend/src/components/ui/`.
- **Estado:** todo en `frontend/src/App.tsx` vía `useState` / `useEffect`, pasado hacia abajo por props. Sin librería de estado. Sin router (`frontend/package.json` no tiene `react-router*`).
- **Flujo de datos actual:** `App.tsx` `fetchFinancialData()` (`:15-21`) → `GET /api/metrics` **sin params**, una vez al montar → `computeKPIs` / `computeMonthlyData` (`frontend/src/lib/financial-utils.ts`) → `<KPIRow>`, `<IncomeOutcomeChart>`, `<ProfitPercentChart>`.
- **Red:** solo `fetch` nativo. Dev/Codespaces usa `/api/...` relativo (proxy de Vite → `http://backend:8000`, `frontend/vite.config.ts:11-15`). `VITE_API_BASE_URL` solo para un origen distinto (`App.tsx:13`).
- **Errores:** un único `.catch()` en toda la app (`App.tsx:35-39`) que descarta el error y pone un mensaje fijo en español; no se loguea nada. Las features nuevas reutilizan este patrón (`.agents/rules/error-handling.md`).
- **Helpers existentes:** `formatCurrency` (USD, 0 decimales), `formatPercent` (1 decimal + `%`) — `frontend/src/lib/financial-utils.ts:69-80`.
- **Convenciones a seguir:** ver [`components.md` §0](./components.md) — provienen de `.agents/rules/`.

## Nota sobre los `.ts` de `frontend/specs/` vs `frontend/src/`

`frontend/specs/` **no** está en `frontend/tsconfig.app.json` (`"include": ["src"]`), así que
`tsc -b` no lo compila. Estos `.ts` son artefactos de spec. En la implementación, los enums y los
tipos de respuesta deben reconciliarse con `frontend/src/lib/financial-types.ts` (que ya declara
`OperationType`, `Category`, `BusinessType`, `FinancialMovement` de forma idéntica) — lo más
probable extendiendo ese archivo en vez de importar desde `specs/`. `GroupBy` y los tipos de
respuesta de facets / summary / alerts / top-categories son nuevos.

---

# Feature 1 — Filtro de rango de fechas del dashboard

**Objetivo:** que el usuario pueda restringir todo el dashboard (KPIs + gráficas) a una ventana de fechas.

- **Endpoints:** `GET /api/metrics/facets` (una vez, para los límites) + `GET /api/metrics` (refetch con `start_date` / `end_date`).
- **Params:** `MetricsParams` (extiende `DateRangeFilter`) — `start_date?`, `end_date?` (ambos ISO `YYYY-MM-DD`, ambos opcionales). `category?` / `operation_type?` existen en el endpoint pero están fuera del alcance de esta feature.
- **Respuestas:** `MetricsFacets` (límites) y `FinancialMovement[]` (los datos filtrados, ya ordenados por `create_date` asc).
- **Límites:** `MetricsFacets.min_date` / `max_date`. **Dinámicos** — el backend genera fechas relativas a "hoy". Nunca hard-codearlos; leerlos siempre de facets.
- **Componente:** `DateRangeFilter` (`components.md` → Feature 1). Dos `<input type="date">` nativos, `min`/`max` nativos desde los límites, Limpiar opcional, clamp ante inversión.
- **Sin `business_type`** en `/api/metrics` — un filtro por segmento no es parte de esta feature.

### Casos límite

| Caso | Manejo |
|---|---|
| Facets aún cargando | `DateRangeFilter` renderiza un `<Skeleton>`; sin inputs todavía. |
| Falló el fetch de facets (`bounds === null`) | Inputs deshabilitados + nota "Rango de fechas no disponible"; el dashboard sigue funcionando sin filtro. *(revisable)* |
| Ninguna fecha seleccionada | Dataset completo (comportamiento actual). Sin botón Limpiar. |
| Solo `start_date` o solo `end_date` | Rango semiabierto válido; se pasa tal cual. |
| El rango seleccionado no contiene movimientos | No lo maneja el filtro. Las KPI cards muestran `—`, las gráficas muestran "No data available to display" (comportamiento existente). El filtro mantiene la selección para que el usuario pueda ampliarla. |
| `start_date > end_date` (escritura manual) | Clamp del otro límite para que coincida. *(decisión de diseño — revisable)* |
| `min_date === max_date` | Los inputs permiten solo esa fecha. Aceptable. |
| El refetch falla tras cambiar el filtro | Banner de error rojo existente + mensaje en español; los últimos datos buenos pueden quedarse en pantalla. No cambiar esto. |

---

# Feature 2 — Tabla de alertas de anomalías

**Objetivo:** aflorar los períodos en los que `outcome` se disparó respecto a su media histórica
acumulada, con una sensibilidad controlada por el usuario.

- **Endpoint:** `GET /api/metrics/alerts`.
- **Params:** `AlertsParams` (extiende `DateRangeFilter`) — `threshold?` (number), `group_by?` (default `'month'`), `start_date?` / `end_date?` (heredados de `DateRangeFilter`; los aporta el filtro de fechas del dashboard — la Feature 1 acota también la Feature 2), `business_type?`.
- **Respuesta:** `MetricsAlert[]` — `{ period, outcome_total, baseline_average, increase_ratio }`, ascendente por período.
- **Semántica verificada (`backend/app/routes.py:219-240`):**
  - `baseline_average` = **media acumulada de `outcome` sobre TODOS los períodos anteriores** (media expandente). **NO** una media móvil de 3 períodos.
  - `increase_ratio = (outcome_total - baseline_average) / baseline_average`. Es un **ratio** (`0.7353` = +73,53 %), no un porcentaje formateado.
  - Una fila existe solo cuando `increase_ratio > threshold` (y una guarda interna `baseline_average > 0`).
  - El **primer período** de la serie nunca es una alerta.
- **Componente:** `AnomalyAlertsCard` + `ThresholdControl` (`components.md` → Feature 2).

### `threshold` — API vs UI (mantener separado)

| | Valor |
|---|---|
| **API** | `type: number`, `minimum: 0`, **sin máximo**, default `0.3`. Rechaza `< 0` y no numérico con 422. |
| **UI (decisión de producto)** | slider `0.01`–`1.0`, paso `0.01`, default `0.3`. |

El rango de la UI es una decisión de producto, no un límite de la API. Se documenta en comentarios
en `param-types.ts` y se muestra al usuario (tooltip / texto de ayuda). **No** se codifica como un
tipo más estrecho.

### Casos límite

| Caso | Manejo |
|---|---|
| `data.length === 0` | **Común** con thresholds altos. Estado vacío de aspecto intencional dentro de la card ("Ningún período superó un incremento del {threshold}%."). No es un error. |
| `loading` | `<Card>` + skeleton de cabecera + bloque skeleton de tabla. |
| Falta el primer período en `data` | Esperado. No sintetizarlo. |
| `increase_ratio` enorme (p. ej. +500 %) | `formatPercent` maneja el número; asegurar que la celda hace wrap. |
| `group_by` = `week` / `day` | La etiqueta `period` cambia de forma. La UI v1 ofrece solo `month`; mantener el tipo abierto. *(revisable)* |
| Slider arrastrado rápido | Debounce del refetch (~250–300 ms). *(decisión de diseño)* |
| `threshold` fuera de 0.01–1.0 (programático) | Clamp para visualización; no rechazar. |
| Filtro de fechas del dashboard (Feature 1) | Acota también la Feature 2: `start_date` / `end_date` se pasan siempre a `/api/metrics/alerts`. |

---

# Feature 3 — Comparación B2B vs B2C

**Objetivo:** una vista nueva que compara **ingresos** entre B2B y B2C — total por segmento y un
desglose por categoría con la cuota de cada una.

- **Endpoints:** `GET /api/metrics/categories/top` — **dos llamadas**, una por segmento:
  `?operation_type=income&business_type=B2B&limit=20` y `…&business_type=B2C&limit=20`.
  `GET /api/metrics/facets` da `business_types` (`["B2B","B2C"]`) si hay que descubrir la lista de segmentos en vez de hard-codearla.
- **Params:** `TopCategoriesParams` (extiende `DateRangeFilter`) — `operation_type?` (**hay que enviar `'income'`**, el default de la API es `outcome`), `limit?` (**usar `20`** para traer todas las categorías → denominador real), `business_type?` (uno por llamada), `start_date?` / `end_date?` (heredados de `DateRangeFilter`; los aporta el filtro de fechas **propio** de la vista B2B/B2C).
- **Respuesta:** `TopCategoryItem[]` — `{ category, operation_type, total_amount }`, ordenado por `total_amount` desc, truncado a `limit`.
- **Ausencias verificadas:** la respuesta **no tiene campo `business_type`** ni **campo de porcentaje**. El llamador etiqueta cada resultado según qué llamada hizo; el llamador calcula los porcentajes.
- **Modelo derivado:** `SegmentIncomeBreakdown` / `CategoryShare` / `SegmentComparison` (`view-types.ts`). `incomeTotal = Σ total_amount`; `percent = incomeTotal > 0 ? total_amount / incomeTotal * 100 : 0`.
- **Componentes:** `SegmentComparisonView` → dos `SegmentPanel` (+ `SegmentComparisonSummary` opcional) — `components.md` → Feature 3.
- **Total de ingresos del grupo, fuente alternativa:** `GET /api/metrics/summary?business_type=<seg>` y luego `Σ item.income` da el mismo número (verificado igual). Usarla si además se quiere un desglose por período; si no, la suma con `limit=20` es suficiente.

### Routing

La app no tiene router. **Decidido en revisión:** la vista se monta con un **toggle dentro de
`App.tsx`** (`'dashboard' | 'comparison'`). **No** se añade `react-router-dom`. Las specs de
componentes son agnósticas al montaje.

### Casos límite

| Caso | Manejo |
|---|---|
| `loading` | Dos skeletons de `<Card>` uno al lado del otro. |
| Un segmento sin ingresos en el rango | `incomeTotal === 0`, `categories === []`. El panel muestra `$0` + "Sin ingresos registrados para {segmento}". |
| Ambos segmentos vacíos | Un estado vacío combinado, no dos paneles a `$0`. *(decisión de diseño — revisable)* |
| `percent` con `incomeTotal === 0` | Forzar `0` (guarda contra división por cero, replicar `financial-utils.ts:31,59`). |
| `Σ percent` ≠ 100 (redondeo) | Dejarlo. No normalizar. |
| `operation_type` omitido por error | Devolvería el ranking de **outcome** y un "total de ingresos" incorrecto. El helper / punto de llamada hace `operation_type: 'income'` explícito y no opcional. |
| Solo vuelven `sales` + `others` (datos mock actuales) | No hard-codear ese conjunto. Renderizar lo que venga. |
| Una categoría ≈ 100 % | La barra topa en 100 %. |
| Filtro de fechas propio de la vista | Añadir `start_date` / `end_date` a ambas llamadas `categories/top`. |

---

# Convenciones y restricciones globales

- **Restricciones de API** (las impone el backend, provocan 422): fechas `YYYY-MM-DD`; `threshold >= 0`; `limit` entero 1–20; enums exactamente `income|outcome`, `B2B|B2C`, `suppliers|sales|operational|administrative|others`, `day|week|month`.
- **Restricciones de UI** (decisiones de producto, no están en la API): slider de threshold de alerts 0.01–1.0; inputs de fecha acotados a `facets.min_date`/`max_date`; agrupación de la Feature 2 fijada a `month` en v1.
- **Alcance del filtro de fechas** (decidido): el filtro de fechas del dashboard acota **F1 y F2**; la vista B2B vs B2C (**F3**) tiene su **propio** filtro de fechas, independiente del dashboard.
- **No**: añadir un cliente HTTP, añadir una librería de estado, añadir `react-router` sin visto bueno, añadir `tailwind.config.js`, hard-codear colores, cambiar el patrón de manejo de errores, hard-codear el rango de fechas o el conjunto de categorías, modificar el backend.
- **Reconciliar en la implementación**: los enums/`FinancialMovement` de `specs/api-types.ts` duplican `frontend/src/lib/financial-types.ts` — extender ese archivo, no importar desde `specs/`.

---

# Decisiones de diseño tomadas aquí (no dictadas por el brief)

1. **Archivos de spec extra.** El brief exige `api-types.ts`, `param-types.ts`, `components.md`, `README.md`. Se añadieron `view-types.ts` (shapes derivados, para que `api-types.ts` sea un espejo puro de la API según el requisito de "separar API/UI") y `endpoints.md` (referencia de contrato escaneable, imitando cómo el repo separa `.agents/rules/` y `memory-bank/` en archivos enfocados).
2. **`FacetsParams = Record<string, never>`** en vez de omitir un tipo — documenta "sin params" explícitamente y sigue siendo importable.
3. **Params opcionales-nullables modelados como `field?: T`** (sin `| null`). El llamador construye query strings; "ausente" es el único estado "sin valor".
4. **Campos de fecha como `string`** (no un `IsoDateString` marcado) — coincide con `frontend/src/lib/financial-types.ts:6`.
5. **Routing de la Feature 3 = toggle de vista dentro de `App.tsx`** (opción B), no `react-router`. Mínimo, respeta `.agents/rules`. **Confirmado en revisión.**
6. **Manejo de inversión de la Feature 1 = clamp** del límite opuesto, en vez de bloquear-con-error o hacer swap.
7. **Lectura del threshold de la Feature 2 mostrada como porcentaje** (`30.0%`), para casar con la columna "Incremento" de la tabla.
8. **Tinte de severidad de la Feature 2** en la celda "Incremento" usando tokens existentes, por buckets a 0.5 / 1.0. Opcional; quitar si no se quiere.
9. **Refetch de la Feature 2 con debounce** ~250–300 ms en el slider de threshold.
10. **Agrupación de la Feature 2 fijada a `month`** en v1 (coincide con el default de la API); el tipo queda abierto.
11. **`SegmentComparisonSummary` de la Feature 3** (qué segmento lidera, por cuánto) — añadido como extra; opcional.
12. **"Ambos segmentos vacíos" de la Feature 3 → un estado vacío combinado** en vez de dos paneles a `$0`.
13. **Helpers nuevos propuestos en `frontend/src/lib/`** (`formatRatioAsPercent`, `formatDateLabel`, `comparison-utils.assembleSegmentBreakdown`) en vez de lógica dentro de componentes — sigue `.agents/rules/frontend-components-and-state.md` R9.
14. **Componentes de la Feature 3 en una nueva carpeta `frontend/src/components/comparison/`**, imitando la agrupación existente de `dashboard/`.

# Decidido en revisión

1. **Routing de la Feature 3** → toggle de vista dentro de `App.tsx` (`'dashboard' | 'comparison'`). No se añade `react-router`.
2. **Alcance del filtro de fechas** → el filtro de fechas del dashboard acota **F1 y F2**. La vista B2B vs B2C (**F3**) tiene su **propio** filtro de fechas, independiente del dashboard.
3. **"Porcentaje" de la Feature 3** → porcentaje de cada categoría respecto al total de ingresos de **su propio segmento** (no sobre el total combinado).
4. **"Ingresos totales" de la Feature 3** → total de ingresos de cada segmento calculado desde `categories/top` con `operation_type=income` y `limit=20`.
5. **Wording "media móvil"** → corregido en estas specs: el backend usa una **media acumulada / histórica** de todos los períodos anteriores, no una media móvil de 3.

# Pendiente de revisión humana antes de la Fase 3

1. **Agrupación de la Feature 2.** "Tabla de alertas de anomalías" no especificó `group_by`. v1 asume mensual. Confirmar.
2. **Ubicación de la nueva card de alertas** en el dashboard (fila nueva a ancho completo vs. celda del grid).
3. **Límites del slider de threshold (0.01–1.0).** Decisión de producto; confirmar, y confirmar si se quiere un afford. de "mostrar todo" (threshold 0).
4. **Ubicación de `frontend/specs/`.** ¿Dejarla como carpeta de specs no compilada, o mover los `.ts` a `src/` para que `tsc -b` los cubra?
