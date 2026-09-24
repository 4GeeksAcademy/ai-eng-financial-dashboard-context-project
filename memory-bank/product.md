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

## Stewardship y decisiones recientes

- Se eliminó la dependencia de un período fijo: `frontend/src/App.tsx` deriva el período desde los datos de la API y el encabezado usa `Selected period` como valor predeterminado (`06b55d1`).
- Se mantuvo explícito el límite de datos mock para no sobreinterpretar el dashboard como producto conectado a datos financieros reales.
- Las reglas de `.agents/rules/` y este memory-bank convierten esas decisiones en contexto reutilizable para futuras tareas del agent.

## Riesgos de cambio

- Cambiar el contrato de `/api/metrics` puede romper los cálculos client-side de KPI y datos mensuales.
- Cambiar el hostname del proxy debe evaluarse por separado para Compose y para ejecución directa en el host.
- Añadir persistencia o ingestión real requeriría actualizar esta descripción y las reglas de límites de mock data.

## Fuentes de evidencia

- `frontend/src/App.tsx`
- `frontend/src/lib/financial-utils.ts`
- `frontend/src/components/dashboard/`
- `backend/app/routes.py`
- `backend/tests/test_routes.py`
- `.agents/rules/03-mock-data-boundary.md`
