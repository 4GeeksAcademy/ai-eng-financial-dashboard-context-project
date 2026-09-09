---
name: metrics-api-contract
description: Contrato verificado de la API de métricas (FastAPI) de ESTE repo (9 endpoints GET) y la frontera de tipos frontend/specs ↔ frontend/src ↔ backend. Úsala al implementar en el frontend las Features 1–3 de frontend/specs/, al cablear cualquier fetch a /api/metrics*, o al razonar sobre una respuesta de métricas o un 422. La fuente de verdad del comportamiento es backend/app/routes.py.
---

# Contrato de la API de métricas (este repo)

## Objetivo

Digest operativo del contrato **real y verificado** de la API de métricas de este repositorio, para que un agente pueda implementar en el frontend las Features 1–3 especificadas en `frontend/specs/` (filtro de rango de fechas, alertas de anomalías, B2B vs B2C) y cualquier `fetch` a `/api/metrics*` **sin re-derivar el contrato desde 6 archivos de specs + `routes.py` cada vez**, y sin los errores silenciosos típicos.

- Fuente de verdad del **comportamiento**: `backend/app/routes.py` (ejercitado por `backend/tests/test_routes.py`).
- Fuente de verdad del **contrato de frontend documentado**: `frontend/specs/`.
- Cuando ambos discrepan, **manda `routes.py`** — señala la discrepancia, no sigas la documentación en silencio (ver *Gotchas críticos*).

## Cuándo usarla

- Al implementar o revisar cualquiera de las 3 features de `frontend/specs/` (`README.md`, `endpoints.md`, `components.md`).
- Al añadir o cambiar un `fetch` a `/api/metrics*` en cualquier parte de `frontend/src/`.
- Al razonar sobre la forma de una respuesta de métricas, su garantía de orden, o un `422`.
- Al escribir helpers puros en `frontend/src/lib/*` que consuman estas respuestas.

No es para: cambios de backend (prohibidos en estas tareas), guía genérica de REST/FastAPI/React/TypeScript, accesibilidad, rendimiento de React, o CI/CD — eso lo cubren `accessibility`, `vercel-react-best-practices` y `deployment-pipeline-design`.

## Entradas

- La feature o el endpoint en cuestión (p. ej. `"filtro de fechas de la Feature 1"`, `"GET /api/metrics/alerts"`).
- Opcionalmente: el fragmento de código que se está escribiendo, o la sección relevante de `frontend/specs/`.

## Procedimiento / Reglas

1. Identifica a qué endpoint(s) toca la tarea → lee su bloque en *Contrato de endpoints*.
2. Construye la petición: envía solo los params que necesitas; **omite** un param para obtener su default del backend. Nunca envíes un `null` literal — "ausente" es el único estado "sin valor" (`frontend/specs/param-types.ts:9-13`).
3. Aplica cada ítem de *Gotchas críticos* que aplique al endpoint.
4. Tipos: sigue *Reconciliación de tipos* — extiende `frontend/src/lib/financial-types.ts`; nunca importes de `frontend/specs/`.
5. Fechas: nunca hard-codees un año o una fecha; toma los límites de `GET /api/metrics/facets` (ver *Reglas de fechas*).
6. Errores: mantén el patrón existente — el único `.catch()` con el mensaje fijo en español de `App.tsx`; sin `console.error` (`.agents/rules/error-handling.md` R2).
7. **No** modifiques `backend/`. **No** modifiques los contratos de `frontend/specs/` salvo que una tarea lo autorice explícitamente.

## Reglas de fechas

- Todos los datos mock se generan relativos a `date.today()`: `generate_mock_movements(seed=42)` fija `today = date.today()` (`backend/app/routes.py:97`), y `_year_for_month(month, today)` pone los meses `< today.month` en el año actual y el resto en el año anterior (`routes.py:65-68`). Efecto neto: una ventana rodante de ~12 meses que termina alrededor del mes actual. Confirmado por ejecución real en `memory-bank/project-summary.md:73-74`.
- Por tanto `MetricsFacets.min_date` / `max_date` son **dinámicos** — cambian de un día a otro. Nunca los hard-codees, ni ningún año (`frontend/specs/api-types.ts:77-83`, `frontend/specs/endpoints.md:34`).
- Los tests asertan fechas de forma dinámica, nunca por año literal: `movements[0].create_date`, `base_response.json()[0]["create_date"]` (`backend/tests/test_routes.py:21,39`). Haz lo mismo en cualquier test nuevo.
- Tamaño fijo: 12 meses × 30 movimientos = **360** por dataset (`routes.py:99-102`, `test_routes.py:15`).
- Inconsistencia conocida — **no** la "arregles" como parte de una feature: el header del dashboard está hard-codeado `period="2024 - Full Year"` (`frontend/src/App.tsx:49`) mientras los datos son relativos al año actual/anterior. Documentado en `memory-bank/project-summary.md:78-81` y `memory-bank/status.md:30`.

## Contrato de endpoints

Todos los endpoints son `GET`. Las rutas de negocio viven bajo `/api/metrics…`; `/health` es la única sin el prefijo (`memory-bank/conventions.md` #25). Cada ruta declara un `response_model=` explícito + anotación de retorno (`.agents/rules/backend-api-contract.md` R2). Cada endpoint regenera `generate_mock_movements(seed=42)` por petición (`routes.py:255,264,277,295,311,350,370,386`). Los fallos de validación → `HTTP 422`, cuerpo `HTTPValidationError` = `{ detail: [{ type, loc, msg, … }] }` (`frontend/specs/endpoints.md:8`); el backend no añade manejo de errores propio (`.agents/rules/error-handling.md` R1).

### 1 · `GET /health` — `routes.py:243-245`
- Params: ninguno.
- Respuesta: `{ "status": "ok" }` (200, incondicional / shallow).
- Gotcha: no está bajo `/api`; no forma parte de las features.

### 2 · `GET /api/metrics` — `routes.py:248-259` — Feature 1
- Params (todos opcionales, default `None`): `start_date`, `end_date` (`YYYY-MM-DD`, **inclusivos**: `create_date >= start_date`, `create_date <= end_date`), `category` (`Category`), `operation_type` (`OperationType`).
- Respuesta: `FinancialMovement[]`, ordenado por `create_date` **ascendente** (`ensure_chronological_order`, `routes.py:259`).
- **Gotcha:** **no** acepta `business_type` — el param no existe en esta ruta (`routes.py:249-253`, `endpoints.md:22`). Para una vista por segmento usa `/api/metrics/b2b` / `/b2c` o `/api/metrics/summary?business_type=`.
- Tipo de params: `MetricsParams extends DateRangeFilter` (`frontend/specs/param-types.ts:53-56`). Tipo de respuesta: `FinancialMovement` (`frontend/specs/api-types.ts:52-59`).

### 3 · `GET /api/metrics/facets` — `routes.py:262-265` — Features 1 y 3
- Params: **ninguno**. Cualquier query param que se pase devuelve `200` y se ignora en silencio (`routes.py:263`, `endpoints.md:31`).
- Respuesta: `MetricsFacets = { operation_types, business_types, categories, min_date, max_date }` (`routes.py:30-35`).
  - `categories` es una lista **global** construida a partir de un set sobre todos los movimientos (`routes.py:150-158`) — **no** por `business_type`.
  - `min_date` / `max_date` = primer / último `create_date` del dataset completo → **dinámicos** (ver *Reglas de fechas*).
- Valores verificados: `operation_types` = `["income","outcome"]`, `business_types` = `["B2B","B2C"]`, `categories` = `["administrative","operational","others","sales","suppliers"]` (`test_routes.py:104-118`).
- Tipo de params: `FacetsParams = Record<string, never>` (`param-types.ts:64`).

### 4 · `GET /api/metrics/summary` — `routes.py:268-284` — Feature 1 (agregada) y Feature 3 (cross-check)
- Params (todos opcionales): `group_by` (`GroupBy`, **default `"month"`**), `start_date`, `end_date`, `category`, `operation_type`, `business_type`.
- Respuesta: `MetricsSummaryItem[] = { period, income, outcome, net }[]`, `net = income - outcome`, ordenado por `period` **ascendente** (`routes.py:179-187`).
  - El formato de `period` depende de `group_by`: `day` → `YYYY-MM-DD`; `week` → `YYYY-Www` (p. ej. `2026-W12`); `month` → `YYYY-MM` (`routes.py:169-175`).
  - `business_type` filtra la agregación a un segmento; los items de la respuesta **no** indican de qué segmento son (`routes.py:278-280`, `endpoints.md:49`).
- **Matiz doc-vs-código:** `endpoints.md:48` dice que el campo `income` va "desglosado con independencia de este filtro". Comportamiento real (`routes.py:281-284` → `filter_movements` se ejecuta antes que `summarize_movements`): pasar `operation_type` acota primero el conjunto de movimientos, así que el lado no seleccionado **suma `0`** (p. ej. `operation_type=income` → cada item tiene `outcome` en `0` y `net == income`). Sigue el código.
- Tipo de params: `SummaryParams extends DateRangeFilter` (`param-types.ts:72-82`).

### 5 · `GET /api/metrics/categories/top` — `routes.py:287-302` — Feature 3
- Params: `operation_type` (`OperationType`, **default `"outcome"`**), `limit` (`int`, `ge=1`, `le=20`, **default `5`**), `start_date`, `end_date`, `business_type`.
- Respuesta: `TopCategoryItem[] = { category, operation_type, total_amount }[]`, ordenado por `total_amount` **descendente**, truncado a `limit` (`routes.py:200-208`).
- **Gotchas:**
  - La Feature 3 compara **ingresos**, así que **debes enviar `operation_type=income` explícito** — omitirlo devuelve el ranking de gasto (outcome) (`routes.py:289`, `param-types.ts:116-120`, `components.md:256`).
  - Usa `limit=20` para obtener **todas** las categorías, de modo que la cuota por categoría del cliente se calcule contra el total real del grupo; **no** uses `limit=5` aquí (`components.md:257-258`, `view-types.ts:69-75`).
  - La respuesta **no tiene campo `business_type`** ni **campo de porcentaje** — el llamador etiqueta cada resultado según qué llamada hizo y calcula `percent = total_amount / Σ total_amount` en el cliente (`api-types.ts:143-148`).
  - `limit` fuera de `1..20` → `422` (`routes.py:290`).
  - Con `operation_type=income` solo tienen datos `sales` + `others`; con `outcome`, cuatro categorías (`routes.py:79,82`, `endpoints.md:94`).
- Tipo de params: `TopCategoriesParams extends DateRangeFilter` (`param-types.ts:115-130`); tipos de vista derivados `CategoryShare` / `SegmentIncomeBreakdown` / `SegmentComparison` (`view-types.ts:51-85`).

### 6 · `GET /api/metrics/comparison` — `routes.py:305-339` — NO la usan las Features 1–3
- Params: `start_date` **obligatorio**, `end_date` **obligatorio** (`Query(...)`, `routes.py:307-308`) — el **único** endpoint con params obligatorios; `business_type` opcional.
- Respuesta: `MetricsComparison = { current_period, previous_period, delta_abs, delta_pct }`; `delta_pct` es `null` cuando `previous_period == 0` (`routes.py:330-332`).
- Semántica: compara el valor **neto** (`income - outcome`) de `[start_date, end_date]` frente a la ventana inmediatamente anterior de la **misma duración** — `previous_end = start_date - 1 día`, `previous_start = previous_end - (end_date - start_date)` (`routes.py:321-327`). **No** es una comparación B2B/B2C.
- Falta cualquiera de las dos fechas → `422` (`test_routes.py:157-170` siempre envía ambas).

### 7 · `GET /api/metrics/alerts` — `routes.py:342-359` — Feature 2
- Params: `threshold` (`float`, `ge=0`, **sin cota superior**, **default `0.3`** — `routes.py:344`), `group_by` (`GroupBy`, default `"month"`), `start_date`, `end_date`, `business_type` (todos opcionales).
- Respuesta: `MetricsAlert[] = { period, outcome_total, baseline_average, increase_ratio }[]`, ordenado por `period` **ascendente** (`routes.py:219-240`).
- Semántica (`detect_outcome_alerts`, `routes.py:219-240`):
  - `baseline_average` = **media acumulada / expandente** del `outcome` sobre **todos los períodos anteriores** (`sum(historical_outcomes) / len(historical_outcomes)`, `routes.py:227`). **NO** es una media móvil de 3 períodos (`endpoints.md:70`; la redacción previa de "media móvil" se corrigió en las specs — `frontend/specs/README.md:189`).
  - El **primer período** de la serie nunca se evalúa / nunca es alerta — `historical_outcomes` está vacío en la primera iteración y se le hace `append` solo *después* del check (`routes.py:225-226,239`).
  - Una fila se devuelve solo cuando `increase_ratio > threshold` (estricto), con una guarda interna `baseline_average > 0` (`routes.py:228-230`).
  - `increase_ratio = (outcome_total - baseline_average) / baseline_average` — un **ratio, no un porcentaje ya formateado**: `0.7353` significa +73,53 % (`routes.py:229`, `api-types.ts:123-128`). Mostrar como `formatPercent(increase_ratio * 100)`.
- API vs UI: la API acepta `threshold = 0` y cualquier valor `> 1`. El slider `0.01–1.0` es una **decisión de producto** (`components.md:133-139`) — no lo codifiques como un tipo más estrecho (`param-types.ts:96-102`).
- `threshold < 0` o no numérico → `422`.
- Tipo de params: `AlertsParams extends DateRangeFilter` (`param-types.ts:91-106`); tipo de respuesta `MetricsAlert` (`api-types.ts:109-129`).

### 8 · `GET /api/metrics/b2b` — `routes.py:362-375` — NO la usan las Features 1–3
### 9 · `GET /api/metrics/b2c` — `routes.py:378-391` — NO la usan las Features 1–3
- Params (ambas): `start_date`, `end_date`, `category`, `operation_type` (todos opcionales). Sin param `business_type` — el segmento *es* la ruta.
- Respuesta: `FinancialMovement[]` filtrado a `business_type == "B2B"` / `"B2C"`, ordenado por `create_date` **ascendente** (`routes.py:369-375` / `:385-391`, `test_routes.py:52-69`).
- La Feature 3 usa `categories/top` por segmento en su lugar (menos post-proceso) — `endpoints.md:105`.

## Gotchas críticos (checklist)

- **Las fechas son relativas a `date.today()`** — nunca hard-codees un año/fecha; lee `facets.min_date` / `max_date` (`routes.py:65-68,97`).
- `/api/metrics` **no tiene** param `business_type` (`routes.py:249-253`).
- `/api/metrics/facets` **no acepta filtros**; su lista `categories` es **global**, no por segmento (`routes.py:150-158,263`).
- `/api/metrics/categories/top` tiene `operation_type` con default `"outcome"` → las vistas de ingresos **deben enviar `operation_type=income`** explícito, y `limit=20` para obtener todas las categorías (`routes.py:289-290`).
- `alerts.baseline_average` es una **media acumulada (expandente)**, no una media móvil; el **primer período nunca es alerta** (`routes.py:225-227,239`).
- `alerts.increase_ratio` es un **ratio**, no un porcentaje formateado (`routes.py:229`).
- `/api/metrics/comparison` **requiere** `start_date` y `end_date` (`routes.py:307-308`); los params de fecha del resto de endpoints son opcionales.
- Omitir un param opcional ≠ enviar `null`. Construye el query string; "ausente" es el único "sin valor" (`param-types.ts:9-13`).
- Errores de validación → **`422 HTTPValidationError`** `{ detail: [...] }`; el backend no añade nada (`.agents/rules/error-handling.md` R1).
- Enums exactos (backend `Literal`, `routes.py:11-15`): `operation_type` ∈ `income|outcome`; `business_type` ∈ `B2B|B2C`; `category` ∈ `suppliers|sales|operational|administrative|others`; `group_by` ∈ `day|week|month`; fechas `YYYY-MM-DD`.
- Los movimientos de ingreso solo tienen `category` `sales` (≈90 %) u `others` (≈10 %) (`routes.py:79`). No hard-codees un conjunto de categorías en la UI — renderiza lo que devuelva la API (`components.md:276`).
- **Cuando la documentación/specs y `routes.py` discrepan, `routes.py` (comportamiento verificado) es la fuente de verdad** — señala la discrepancia, no sigas la doc en silencio. Casos conocidos: la redacción del `income` "independiente del filtro" en `/api/metrics/summary` (endpoint 4 de arriba); algunas refs `routes.py:NN` / `financial-utils.ts:69-80` dentro de `frontend/specs/` son previas al commit `22d6260` y pueden estar corridas unas líneas (el comportamiento descrito no cambia).

## Reconciliación de tipos

- `frontend/specs/` es un **paquete de artefactos spec-only** (entregable de la Fase 2). **No** está en `frontend/tsconfig.app.json` (`"include": ["src"]`), así que `tsc -b` nunca lo compila (`frontend/specs/README.md:41-48`).
- **Nunca importes tipos desde `frontend/specs/` a `frontend/src/`.** En la implementación, **extiende / reutiliza `frontend/src/lib/financial-types.ts`** (`frontend/specs/README.md:44-48`, `api-types.ts:20-25`).
  - `financial-types.ts` ya declara `OperationType`, `Category`, `BusinessType`, `FinancialMovement`, `KPIMetrics`, `MonthlyDataPoint` (`frontend/src/lib/financial-types.ts:1-25`).
  - Enums / formas de respuesta que aún no están ahí (`GroupBy`, `MetricsFacets`, `MetricsSummaryItem`, `MetricsAlert`, `TopCategoryItem`): añádelos a `financial-types.ts`, reflejando `routes.py` con exactitud. Los modelos derivados/de vista (`DateRange`, `DateRangeBounds`, `CategoryShare`, `SegmentIncomeBreakdown`, `SegmentComparison`) van en `financial-types.ts` o en un `frontend/src/lib/*.ts` hermano, siguiendo el precedente de `KPIMetrics` / `MonthlyDataPoint`.
- Tres homónimos — mantenlos distintos:

  | Nombre | Qué es | Forma | Fuente |
  |---|---|---|---|
  | `DateRange` | estado de **vista** del filtro en el frontend | `{ startDate?: string; endDate?: string }` (camelCase) | `frontend/specs/view-types.ts:25-30` |
  | `DateRangeFilter` (tipo) | contrato de **query params** compartido por 4 endpoints | `{ start_date?: string; end_date?: string }` (snake_case) | `frontend/specs/param-types.ts:39-44` |
  | `DateRangeFilter` (componente) | el componente React del date-picker (Feature 1) | `interface DateRangeFilterProps` | `frontend/specs/components.md:48-62` |

  Cuando ambos tipos `DateRange*` estén en alcance, importa uno con alias (`param-types.ts:34-37`).
- Los params opcionales de la API se modelan **sin `| null`** — `field?: T`, ausente = default (`param-types.ts:9-13`).
- Las convenciones de componente para cualquier cosa nueva viven en `frontend/specs/components.md:12-27`, que reformulan `.agents/rules/` (archivos en kebab-case, exports nombrados, `interface <Nombre>Props`, `<Skeleton>` propio, alias `@/`, imports de solo-tipo, tokens Tailwind `var(--…)`, reutilizar `formatCurrency` / `formatPercent` de `@/lib/financial-utils`). Esta skill no las repite — síguelas desde ahí.

## Salidas esperadas

Al aplicarla a una tarea, produce:

- La petición exacta: método + ruta, params a **enviar** vs **omitir**, y el default del backend asumido para cada uno omitido.
- La forma de la respuesta, el significado de los campos y la garantía de orden.
- El subconjunto de *Gotchas críticos* que aplica, señalado explícitamente.
- El movimiento de tipos: qué tipo añadir a / reutilizar de `frontend/src/lib/financial-types.ts`, y cualquier alias de homónimo necesario.
- Cualquier discrepancia doc/spec-vs-código relevante para la tarea, tomando `routes.py` como verdad.

Esta skill no produce código de aplicación; restringe y dirige la implementación.

## Criterios de aceptación

- [ ] Para cada endpoint que toca la tarea: ruta, params (obligatorios vs opcionales), defaults, restricciones, forma y orden de la respuesta coinciden con `backend/app/routes.py`.
- [ ] Se afirma y se respeta "Las fechas son relativas a `date.today()` — no hard-codear"; los límites vienen de `/api/metrics/facets`.
- [ ] Se aborda cada gotcha crítico que aplique: sin `business_type` en `/api/metrics`; `operation_type=income` + `limit=20` en `categories/top` para vistas de ingresos; baseline de media expandente; el primer período no es alerta; `increase_ratio` tratado como ratio; `comparison` envía ambas fechas; sin `null` literal.
- [ ] No se importa ningún tipo desde `frontend/specs/`; los tipos nuevos extienden `frontend/src/lib/financial-types.ts`; `DateRange` / `DateRangeFilter` (tipo de params) / `DateRangeFilter` (componente) se mantienen distintos.
- [ ] No se modifican `backend/` ni `frontend/specs/`.
- [ ] Cualquier contradicción doc-vs-código encontrada se señala, con `routes.py` como fuente de verdad.
- [ ] Las afirmaciones importantes citan `archivo:línea`; no se añade consejo genérico de REST / FastAPI / React / TypeScript.
