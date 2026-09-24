# Descripción del producto

## Qué es

El repositorio implementa un dashboard de métricas financieras con un frontend React + TypeScript y un backend FastAPI.

## Flujo actual verificado

1. `frontend/src/App.tsx` solicita datos a `${VITE_API_BASE_URL}/api/metrics`; cuando la variable no existe, la URL base es vacía.
2. El frontend calcula en cliente los KPI mediante `computeKPIs`.
3. El frontend agrupa los movimientos por mes mediante `computeMonthlyData`.
4. La interfaz muestra encabezado, KPI, gráfico de ingresos/egresos y gráfico de porcentaje de beneficio.
5. El período mostrado se deriva de los años presentes en las fechas recibidas por la API.

## Datos actuales

El backend genera movimientos mock en memoria mediante `generate_mock_movements(seed=42)` en `backend/app/routes.py`.

Las pruebas verifican que la generación produce 360 movimientos ordenados. No hay evidencia de una base de datos, persistencia, autenticación o ingestión de datos financieros reales en la configuración revisada.

Por tanto, el producto actual debe describirse como un dashboard conectado a una API de datos mock, no como un sistema financiero persistente.

## Fuentes de evidencia

- `frontend/src/App.tsx`
- `frontend/src/lib/financial-utils.ts`
- `frontend/src/components/dashboard/`
- `backend/app/routes.py`
- `backend/tests/test_routes.py`
- `.agents/rules/03-mock-data-boundary.md`
