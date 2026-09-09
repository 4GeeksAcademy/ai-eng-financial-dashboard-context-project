# Endpoints — contrato real usado por estas specs

Referencia rápida para el agente que implemente. Todo verificado contra el contrato OpenAPI en vivo (`GET /openapi.json`, Swagger UI en `http://localhost:8000/docs`) y contra `backend/app/routes.py`. **No modificar el backend.**

- Base URL en local/Codespaces: rutas relativas `/api/...` (el proxy de Vite reenvía a `http://backend:8000`, ver `frontend/vite.config.ts:11-15`). Solo se usa `VITE_API_BASE_URL` si se apunta a otro origen (`frontend/src/App.tsx:13`).
- Todos los endpoints son `GET`.
- Todos los parámetros listados son `required: false` salvo que se indique. Un parámetro ausente = no enviado = el backend aplica su default.
- Errores de validación → `HTTP 422` con cuerpo `HTTPValidationError` (`{ detail: [{ type, loc, msg, ... }] }`). El backend **no** tiene manejo de errores propio; toda la validación es de FastAPI/Pydantic (`.agents/rules/error-handling.md`).
- Fechas: formato `date` → string `YYYY-MM-DD`.

---

## `GET /api/metrics` — movimientos crudos (Feature 1)

| Parámetro | Tipo | Restricción API | Default API | Notas |
|---|---|---|---|---|
| `start_date` | `string` (date) | — | (ninguno) | Inclusivo. `create_date >= start_date` |
| `end_date` | `string` (date) | — | (ninguno) | Inclusivo. `create_date <= end_date` |
| `category` | enum `Category` | `suppliers\|sales\|operational\|administrative\|others` | (ninguno) | |
| `operation_type` | enum `OperationType` | `income\|outcome` | (ninguno) | |

- **No acepta `business_type`** (verificado, `routes.py:248-254`).
- Respuesta: `FinancialMovement[]`, ordenado por `create_date` ascendente (`routes.py:259`).
- Tipo params: `MetricsParams` (`param-types.ts`, extiende `DateRangeFilter`). Tipo respuesta: `FinancialMovement` (`api-types.ts`).
- Evidencia: `/docs → GET /api/metrics`.

---

## `GET /api/metrics/facets` — opciones de filtro + rango de fechas (Features 1 y 3)

- **Sin parámetros.** Cualquier query param (p. ej. `business_type`) devuelve `200` y se ignora en silencio (verificado, `routes.py:262-265`).
- Respuesta: `MetricsFacets` = `{ operation_types, business_types, categories, min_date, max_date }`.
  - `categories` es una **lista global**, no separada por `business_type` (verificado, `routes.py:150-158`).
  - `min_date` / `max_date` son **dinámicos** (el backend genera fechas relativas a "hoy"). No hard-codear.
- Tipo params: `FacetsParams = Record<string, never>`. Tipo respuesta: `MetricsFacets`.
- Evidencia: `/docs → GET /api/metrics/facets`.

---

## `GET /api/metrics/summary` — agregados por período (Feature 1 vista agregada; Feature 3 cross-check)

| Parámetro | Tipo | Restricción API | Default API | Notas |
|---|---|---|---|---|
| `group_by` | enum `GroupBy` | `day\|week\|month` | `month` | Cambia el formato de `period` en la respuesta |
| `start_date` | `string` (date) | — | (ninguno) | |
| `end_date` | `string` (date) | — | (ninguno) | |
| `category` | enum `Category` | — | (ninguno) | |
| `operation_type` | enum `OperationType` | — | (ninguno) | El campo `income` de la respuesta viene desglosado con independencia de este filtro |
| `business_type` | enum `BusinessType` | `B2B\|B2C` | (ninguno) | Filtra al segmento; la respuesta **no** etiqueta a qué segmento pertenece |

- Respuesta: `MetricsSummaryItem[]` = `{ period, income, outcome, net }[]`, ordenado por `period` ascendente (`routes.py:186`).
- Para Feature 3: `?business_type=B2B` y sumar `income` de todos los items = total de ingresos B2B (equivalente a sumar `total_amount` de `categories/top` con `limit=20`).
- Tipo params: `SummaryParams` (extiende `DateRangeFilter`). Tipo respuesta: `MetricsSummaryItem`.
- Evidencia: `/docs → GET /api/metrics/summary`.

---

## `GET /api/metrics/alerts` — anomalías de gasto (Feature 2)

| Parámetro | Tipo | Restricción API | Default API | Notas |
|---|---|---|---|---|
| `threshold` | `number` (float) | `minimum: 0`, **sin máximo** | `0.3` | `-0.5` → 422; `abc` → 422. Ver "API vs UI" abajo |
| `group_by` | enum `GroupBy` | `day\|week\|month` | `month` | Cambia el formato de `period` |
| `start_date` | `string` (date) | — | (ninguno) | |
| `end_date` | `string` (date) | — | (ninguno) | |
| `business_type` | enum `BusinessType` | `B2B\|B2C` | (ninguno) | |

- Respuesta: `MetricsAlert[]` = `{ period, outcome_total, baseline_average, increase_ratio }[]`, ordenado por `period` ascendente (`routes.py:225-239`).
- Semántica verificada (`routes.py:219-240`):
  - `baseline_average` = media **acumulada** del `outcome` de **todos** los períodos anteriores (expanding mean). **NO** es una media móvil de 3 períodos.
  - El **primer período** de la serie nunca aparece como alerta.
  - Una fila aparece solo si `increase_ratio > threshold`, donde `increase_ratio = (outcome_total - baseline_average) / baseline_average`.
  - Además hay una guarda interna `baseline_average > 0`.
- **API vs UI para `threshold`:**
  - API: `number ≥ 0`, sin límite superior, default `0.3`.
  - UI (decisión de producto, ver `components.md`): slider `0.01`–`1.0`, paso `0.01`, default `0.3`. Esta restricción **no** existe en el backend y **no** se codifica en los tipos.
- Tipo params: `AlertsParams` (extiende `DateRangeFilter`). Tipo respuesta: `MetricsAlert`.
- Evidencia: `/docs → GET /api/metrics/alerts`.

---

## `GET /api/metrics/categories/top` — ranking de categorías por importe (Feature 3)

| Parámetro | Tipo | Restricción API | Default API | Notas |
|---|---|---|---|---|
| `operation_type` | enum `OperationType` | `income\|outcome` | **`outcome`** | **Feature 3 exige enviar `income` explícito** (verificado) |
| `limit` | `integer` | `minimum: 1`, `maximum: 20` | `5` | Fuera de rango → 422. Usar `20` para traer todas las categorías |
| `start_date` | `string` (date) | — | (ninguno) | |
| `end_date` | `string` (date) | — | (ninguno) | |
| `business_type` | enum `BusinessType` | `B2B\|B2C` | (ninguno) | Una llamada por segmento |

- Respuesta: `TopCategoryItem[]` = `{ category, operation_type, total_amount }[]`, ordenado por `total_amount` descendente, truncado a `limit` (`routes.py:200-208`).
- **No** hay campo `business_type` ni campo de porcentaje en la respuesta (verificado). El % se calcula en el cliente: `total_amount / Σ(total_amount con limit=20)`.
- Con `operation_type=income` solo existen 2 categorías con datos (`sales`, `others`); con `outcome`, 4. `limit=20` devuelve todas las que haya.
- Tipo params: `TopCategoriesParams` (extiende `DateRangeFilter`). Tipo respuesta: `TopCategoryItem` → modelo derivado `CategoryShare` / `SegmentIncomeBreakdown` (`view-types.ts`).
- Evidencia: `/docs → GET /api/metrics/categories/top`.

---

## Fuera de alcance (existen en el backend, NO se usan en estas specs)

| Endpoint | Por qué se excluye |
|---|---|
| `GET /api/metrics/comparison` (`MetricsComparison`) | Verificado: compara **período actual vs. período anterior** del valor **neto**, con `start_date` y `end_date` **obligatorios**. No compara B2B vs B2C. |
| `GET /api/metrics/b2b`, `GET /api/metrics/b2c` (`FinancialMovement[]`) | Devuelven movimientos crudos de un segmento. El camino elegido para Feature 3 es `categories/top` (menos post-proceso); para Feature 1, el dashboard ya usa `/api/metrics`. |
| `GET /health` | Health check; sin relación con estas features. |

Si una implementación futura necesita alguno de estos, añadir sus tipos entonces — no ahora.
