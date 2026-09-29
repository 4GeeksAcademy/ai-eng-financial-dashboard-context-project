# Informe de Hallazgos — Backend Financial Dashboard API

> **Fecha:** 2026-08-29
> **Servidor:** corriendo en `http://localhost:8000`
> **Documentación interactiva:** `http://localhost:8000/docs` (Swagger UI) | `http://localhost:8000/openapi.json` (OpenAPI Schema)

---

## 1. Estado del Backend

El backend está construido con **FastAPI (Python 3.13)** y se ejecuta correctamente con Uvicorn en modo recarga. Utiliza datos mock generados proceduralmente con una semilla fija (`seed=42`), lo que garantiza datos reproducibles idénticos en cada ejecución.

---

## 2. Endpoints de la API — Mapeo Completo

La API expone **8 endpoints operativos** bajo el router `APIRouter`:

### 2.1. Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Verifica que el servidor esté operativo. |

**Respuesta:** `{"status": "ok"}`

---

### 2.2. Métricas Base

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/metrics` | Devuelve todos los movimientos financieros. |

**Parámetros (opcionales):**
- `start_date` (date) — Filtro por fecha inicial
- `end_date` (date) — Filtro por fecha final
- `category` (enum: suppliers, sales, operational, administrative, others)
- `operation_type` (enum: income, outcome)

**Modelo de respuesta:** `FinancialMovement[]`
```json
{
  "create_date": "2025-08-01",
  "amount": 1234.56,
  "operation_type": "income",
  "category": "sales",
  "business_type": "B2B"
}
```

---

### 2.3. Facets (Metadatos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/metrics/facets` | Devuelve las facetas/filtros disponibles. |

**Respuesta:** `MetricsFacets`
```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-08-01",
  "max_date": "2026-07-28"
}
```

---

### 2.4. Summary (Resumen Agregado)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/metrics/summary` | Resumen de ingresos/gastos/neto agregado por periodo. |

**Parámetros:**
- `group_by` (enum: day, week, month) — **default:** `month`
- `start_date`, `end_date`, `category`, `operation_type`, `business_type`

**Respuesta:** `MetricsSummaryItem[]`
```json
{
  "period": "2025-08",
  "income": 84954.57,
  "outcome": 82189.37,
  "net": 2765.20
}
```

---

### 2.5. Top Categories

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/metrics/categories/top` | Top N categorías por tipo de operación. |

**Parámetros:**
- `operation_type` (income|outcome) — **default:** `outcome`
- `limit` (int, 1-20) — **default:** `5`
- `start_date`, `end_date`, `business_type`

**Respuesta:** `TopCategoryItem[]`
```json
{
  "category": "sales",
  "operation_type": "income",
  "total_amount": 1132097.38
}
```

---

### 2.6. Comparison (Comparación entre Periodos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/metrics/comparison` | Compara el valor neto de dos periodos consecutivos. |

**Parámetros (requeridos):**
- `start_date` (date) — **requerido**
- `end_date` (date) — **requerido**
- `business_type` (opcional)

**Respuesta:** `MetricsComparison`
```json
{
  "current_period": 164830.61,
  "previous_period": 70392.14,
  "delta_abs": 94438.47,
  "delta_pct": 134.16
}
```

> El endpoint calcula automáticamente el periodo anterior de la misma duración.

---

### 2.7. Alerts (Alertas de Gastos Anómalos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/metrics/alerts` | Detecta periodos con gastos inusualmente altos. |

**Parámetros:**
- `threshold` (float >= 0) — **default:** `0.3` (30% de incremento)
- `group_by` — **default:** `month`
- `start_date`, `end_date`, `business_type`

**Respuesta:** `MetricsAlert[]`
```json
{
  "period": "2025-12",
  "outcome_total": 103378.98,
  "baseline_average": 65227.42,
  "increase_ratio": 0.5849
}
```

---

### 2.8. Endpoints por Tipo de Negocio

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/metrics/b2b` | Movimientos filtrados solo para B2B. |
| `GET` | `/api/metrics/b2c` | Movimientos filtrados solo para B2C. |

**Parámetros (opcionales):** `start_date`, `end_date`, `category`, `operation_type`

---

## 3. Modelos de Datos (Pydantic)

| Modelo | Campos |
|--------|--------|
| `FinancialMovement` | `create_date: date`, `amount: float`, `operation_type`, `category`, `business_type` |
| `MetricsFacets` | `operation_types[]`, `business_types[]`, `categories[]`, `min_date`, `max_date` |
| `MetricsSummaryItem` | `period: str`, `income: float`, `outcome: float`, `net: float` |
| `TopCategoryItem` | `category`, `operation_type`, `total_amount: float` |
| `MetricsComparison` | `current_period`, `previous_period`, `delta_abs`, `delta_pct?` |
| `MetricsAlert` | `period`, `outcome_total`, `baseline_average`, `increase_ratio` |

**Tipos literales (enums):**
- `OperationType`: `income` | `outcome`
- `Category`: `suppliers` | `sales` | `operational` | `administrative` | `others`
- `BusinessType`: `B2B` | `B2C`
- `GroupBy`: `day` | `week` | `month`

---

## 4. Funcionalidades Internas (Backend)

| Función | Propósito |
|---------|-----------|
| `generate_mock_movements(seed)` | Genera 360 movimientos mock (30 por mes, 12 meses) |
| `filter_movements_by_date()` | Filtra por rango de fechas |
| `filter_movements()` | Filtra combinando fecha, categoría y tipo de operación |
| `ensure_chronological_order()` | Ordena movimientos por fecha |
| `build_metrics_facets()` | Extrae todos los valores únicos de tipos/categorías/fechas |
| `summarize_movements()` | Agrupa por día/semana/mes y calcula income/outcome/net |
| `build_top_categories()` | Agrega montos por categoría y devuelve el top N |
| `calculate_net_value()` | Suma income - outcome |
| `detect_outcome_alerts()` | Detecta periodos donde los gastos superan el promedio histórico en un threshold |

---

## 5. Salon de la Verdad — Pruebas

El backend incluye pruebas con **pytest** y **TestClient** de FastAPI:

| Test | Lo que verifica |
|------|-----------------|
| `test_generate_mock_movements_returns_full_year_sorted_data` | 360 movimientos ordenados |
| `test_filter_movements_by_date_includes_range_edges` | Filtro incluye bordes |
| `test_health_endpoint_returns_ok` | `/health` → 200 + `{"status":"ok"}` |
| `test_metrics_endpoint_respects_date_filters` | Filtro por fecha funciona |
| `test_b2b_endpoint_only_returns_b2b_records` | Solo B2B + ordenados |
| `test_b2c_endpoint_only_returns_b2c_records` | Solo B2C + ordenados |
| `test_metrics_endpoint_filters_by_category` | Filtro por categoría |
| `test_metrics_endpoint_filters_by_operation_type` | Filtro por tipo operación |
| `test_b2b_endpoint_combines_new_filters` | Filtros combinados B2B |

---

## 6. Hallazgos y Observaciones

### ✅ Fortalezas
1. **API bien estructurada** con rutas claras y semánticas (`/api/metrics/*`).
2. **Documentación automática** vía Swagger UI (`/docs`) y OpenAPI (`/openapi.json`) — lista para consumo del frontend.
3. **Datos reproducibles** gracias a `seed=42` — ideal para desarrollo y pruebas.
4. **Filtros flexibles** en casi todos los endpoints (fechas, categorías, tipos, business types).
5. **Cobertura de pruebas** con pytest y TestClient.
6. **CORS abierto** (`allow_origins=["*"]`) — facilita integración con frontend.

### ⚠️ Áreas de Mejora
1. **Sin descripciones en los endpoints** — los campos `summary` y `description` están vacíos en OpenAPI, lo que empobrece la documentación.
2. **Sin documentación en los parámetros** — no hay `description` en los `Query` parameters.
3. **Datos mock** — no hay conexión a base de datos real; todo es generado en memoria.
4. **Ruta `/api/metrics/b2b` y `/api/metrics/b2c`** — son redundantes ya que el parámetro `business_type` en `/api/metrics/summary` y `/api/metrics` ya permite filtrar por tipo de negocio.
5. **No hay autenticación/authorization** — la API es completamente abierta.
6. **El endpoint `/api/metrics` no tiene paginación** — devuelve todos los movimientos (360 registros) sin límite.

---

## 7. Conexión con el Frontend

El frontend (`frontend/src/`) ya tiene componentes que consumirían estos endpoints:

| Componente Frontend | Endpoint API Relacionado |
|---------------------|--------------------------|
| `income-outcome-chart.tsx` | `/api/metrics/summary` |
| `profit-percent-chart.tsx` | Posiblemente `/api/metrics/summary` |
| `kpi-card.tsx` / `kpi-row.tsx` | `/api/metrics/comparison`, `/api/metrics/summary` |
| `dashboard-header.tsx` | `/api/metrics/facets` |

Los tipos definidos en `frontend/src/lib/financial-types.ts` están alineados con los modelos Pydantic del backend.

---

## 8. Conclusión

El backend de **Financial Metrics API** es funcional, completo para prototipado y perfectamente alineado con el frontend existente. La documentación interactiva en `/docs` permite explorar y probar todos los endpoints en tiempo real. La API provee todas las funcionalidades necesarias para un dashboard financiero: resúmenes por periodo, comparación entre periodos, top categorías, alertas de gastos anómalos y filtros por tipo de negocio.