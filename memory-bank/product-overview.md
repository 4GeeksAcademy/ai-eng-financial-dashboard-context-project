# Visión general del producto

Verificado contra el commit `c06ab07`.

## Qué es

- ✅ Dashboard de métricas financieras con frontend en React + TypeScript y backend en FastAPI (`README.md`). Es un proyecto de práctica de 4Geeks Academy (`README.md`, último párrafo).
- ✅ **No es un producto con usuarios reales:** los datos son simulados y se generan en memoria; no hay base de datos, persistencia ni autenticación (búsqueda en el código sin resultados).

## Qué muestra la pantalla (`frontend/src/App.tsx`)

- ✅ Cabecera «Financial Overview» / «Executive metrics dashboard» con una etiqueta de periodo (`components/dashboard/dashboard-header.tsx`).
- ✅ 4 tarjetas: **Total Income**, **Total Outcome**, **Profit** y **Profit Margin** (`components/dashboard/kpi-row.tsx`).
- ✅ 2 gráficas de líneas mensuales: **Income vs. Outcome** y **Profit Margin %** (`income-outcome-chart.tsx`, `profit-percent-chart.tsx`).
- ✅ Estados: esqueletos mientras carga; un aviso rojo si falla la petición (`App.tsx:35-39`); «No data available to display» si no hay datos.
- ✅ Tema oscuro fijo (`<main className="dark …">`, `App.tsx:46`). La interfaz está en inglés, salvo el aviso de error, en español.

## Modelo de datos: movimiento financiero

| Campo | Valores | Dónde se define |
|---|---|---|
| `create_date` | fecha `YYYY-MM-DD` | `FinancialMovement` en `backend/app/routes.py`; espejo en `frontend/src/lib/financial-types.ts` |
| `amount` | número (sin moneda en el backend) | igual |
| `operation_type` | `income` o `outcome` | igual |
| `category` | `suppliers`, `sales`, `operational`, `administrative`, `others` | igual |
| `business_type` | `B2B` o `B2C` | igual |

## Cómo se calculan los números (en el navegador)

- ✅ `computeKPIs` (`frontend/src/lib/financial-utils.ts`): suma los ingresos y los gastos; `profit` = ingresos − gastos; `profitPercent` = beneficio / ingresos × 100, o 0 si no hay ingresos.
- ✅ `computeMonthlyData`: agrupa por mes con la clave `YYYY-MM` sacada del texto de la fecha (corregido en la Fase 3; antes dependía de la zona horaria).
- ✅ `formatCurrency` muestra siempre dólares (`USD`) sin decimales.

## Datos simulados (`generate_mock_movements(seed=42)` en `backend/app/routes.py`)

- ✅ 360 movimientos: 12 meses × 30, ordenados por fecha. Los importes son deterministas (semilla 42).
- ✅ **Las fechas dependen de hoy:** son los 12 meses anteriores al mes actual (`_year_for_month`), con días del 1 al 28. Con hoy = 2026-10-09 (ejecutado): de 2025-10-02 a 2026-09-28.
- ✅ Cada movimiento es ingreso con probabilidad 45–70 % según el mes. Ingresos: categoría `sales` (90 %) u `others`, importe 800–12 000. Gastos: `suppliers`, `operational`, `administrative` u `others`, importe 500–9 000. `B2B` con probabilidad 0,55.
- ✅ Cada petición regenera los datos.

## API (`backend/app/routes.py`)

| Ruta | Parámetros | Devuelve |
|---|---|---|
| `GET /health` | — | `{"status":"ok"}` |
| `GET /api/metrics` | `start_date`, `end_date`, `category`, `operation_type` | lista de movimientos ordenada por fecha |
| `GET /api/metrics/facets` | — | tipos, categorías, `min_date` y `max_date` |
| `GET /api/metrics/summary` | `group_by` (`day`/`week`/`month`), fechas, `category`, `operation_type`, `business_type` | `period`, `income`, `outcome`, `net` |
| `GET /api/metrics/categories/top` | `operation_type`, `limit` (1–20), fechas, `business_type` | categorías por importe total |
| `GET /api/metrics/comparison` | `start_date` y `end_date` obligatorios, `business_type` | neto del periodo, del anterior de igual duración y su diferencia |
| `GET /api/metrics/alerts` | `threshold` (≥ 0, 0,3 por defecto), `group_by`, fechas, `business_type` | periodos cuyo gasto supera la media de los anteriores en más del umbral |
| `GET /api/metrics/b2b`, `/b2c` | como `/api/metrics` | movimientos de ese tipo de negocio |

- ✅ **El frontend solo usa `GET /api/metrics`** (`App.tsx:16`). Las otras 8 rutas no las consume nadie en este repo.
- ❓ La documentación interactiva en `http://localhost:8000/docs` es la de FastAPI por defecto; no se ejecutó.
