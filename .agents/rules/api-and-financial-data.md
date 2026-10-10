# Regla: Contratos API y datos financieros

## Alcance

Aplica a endpoints FastAPI, modelos de request/response, filtros, agregaciones y estructuras de datos del frontend.

## Justificación basada en el repositorio

- `backend/app/routes.py` define los modelos Pydantic y las rutas `/api/metrics`, facets, summary, categorías, comparison, alerts y segmentos B2B/B2C.
- `frontend/src/lib/financial-types.ts` declara `FinancialMovement`, `KPIMetrics` y `MonthlyDataPoint`.
- Los endpoints generan movimientos de ejemplo con `generate_mock_movements(seed=42)`; dicha función usa `random.seed`, que altera el estado global del módulo.
- `_year_for_month` deriva los años de las fechas a partir de la fecha actual; `frontend/src/App.tsx` construye el periodo visible con el primer y último mes de `monthlyData`.

## Guía específica del proyecto

1. Al cambiar un contrato, actualiza el modelo Pydantic en `backend/app/routes.py`, los tipos afectados en `frontend/src/lib/financial-types.ts` y las pruebas correspondientes.
2. Conserva validaciones mediante tipos `Literal` y parámetros FastAPI tipados cuando se añadan valores permitidos o filtros.
3. Evita duplicar cálculos de filtrado/agregación entre endpoints; reutiliza las funciones auxiliares de `backend/app/routes.py` o extrae una abstracción si crece el módulo.
4. Si se conserva la generación reproducible de datos, usa un generador aleatorio local en lugar de cambiar el estado global mediante `random.seed`.
5. Mantén la etiqueta temporal del dashboard sincronizada con el periodo devuelto; actualmente `App.tsx` la deriva de los extremos de `monthlyData`, no de un año fijo.
6. No presentes los datos generados por `generate_mock_movements` como persistidos o provenientes de una base de datos.
