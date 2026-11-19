# Overview del producto — Financial Metrics Dashboard

> Verificado contra el código y los servicios en ejecución el 2026-11-19. Detalle de comprobaciones en
> `../context.md` y `../verification.md`.

## Qué es
Dashboard ejecutivo de métricas financieras de una empresa con dos líneas de negocio (B2B y B2C).
Es un proyecto de formación de 4Geeks Academy (ver `README.md`) cuyo objetivo es practicar dejar un repo
"listo para agentes"; no hay usuarios ni despliegue productivo.

## Qué ve el usuario (una sola pantalla, `frontend/src/App.tsx`)
- Cabecera "Financial Overview" con el periodo de los datos, derivado de los movimientos (`formatPeriodRange`).
- 4 KPIs (`kpi-row.tsx`): Total Income, Total Outcome, Profit y Profit Margin.
- Gráfica mensual ingresos vs. egresos (`income-outcome-chart.tsx`) y gráfica de margen % mensual
  (`profit-percent-chart.tsx`), cargadas con `React.lazy`.
- Estados de carga (skeleton) y error (`role="alert"`) si la API falla.

## Modelo de dominio
`FinancialMovement` (`backend/app/routes.py`, espejo en `frontend/src/lib/financial-types.ts`):

| Campo | Valores |
|---|---|
| `create_date` | fecha `YYYY-MM-DD` |
| `amount` | float positivo |
| `operation_type` | `income` \| `outcome` |
| `category` | `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `business_type` | `B2B` \| `B2C` |

## Origen de los datos
No hay base de datos. `generate_mock_movements(seed=42)` genera en cada request 360 movimientos
(12 meses × 30) para los 12 meses anteriores al mes actual. Los resultados son deterministas para un
mismo mes, pero el rango se desplaza con `date.today()`.

## API (FastAPI, `backend/app/routes.py`)
| Ruta | Para qué | Usada por la UI |
|---|---|---|
| `GET /health` | healthcheck | no |
| `GET /api/metrics` | movimientos filtrables por fecha, categoría, tipo | **sí** |
| `GET /api/metrics/facets` | valores de filtros y rango de fechas | no |
| `GET /api/metrics/summary` | income/outcome/net por día, semana o mes | no |
| `GET /api/metrics/categories/top` | top categorías por importe | no |
| `GET /api/metrics/comparison` | neto vs. periodo anterior (`start_date`, `end_date` obligatorios) | no |
| `GET /api/metrics/alerts` | meses con egresos sobre la media histórica × umbral | no |
| `GET /api/metrics/b2b`, `/b2c` | movimientos por línea de negocio | no |

Las rutas no usadas por la UI están especificadas para futuras funcionalidades en `frontend/specs/`.

## Cómo se ejecuta
`docker compose up --build` → frontend `http://localhost:5173`, API `http://localhost:8000`,
OpenAPI `http://localhost:8000/docs`, debugpy `:5678`. El frontend llama a `/api/...` y Vite lo reenvía
a `http://backend:8000` (`frontend/vite.config.ts`).
