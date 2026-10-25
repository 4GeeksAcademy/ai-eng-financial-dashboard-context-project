# Contexto del producto

## Visión observada

El repositorio implementa un dashboard de métricas financieras con frontend React/TypeScript y backend FastAPI (`README.es.md`). La interfaz principal presenta tarjetas de ingresos, gastos, beneficio y margen, además de gráficos mensuales de ingresos frente a gastos y margen (`frontend/src/App.tsx`; `frontend/src/components/dashboard/kpi-row.tsx`; `frontend/src/components/dashboard/income-outcome-chart.tsx`; `frontend/src/components/dashboard/profit-percent-chart.tsx`).

## Funcionalidad visible

- La pantalla solicita movimientos financieros al endpoint `/api/metrics` y calcula KPI y agregados mensuales en el cliente (`frontend/src/App.tsx`; `frontend/src/lib/financial-utils.ts`).
- Los movimientos tienen fecha, importe, tipo de operación, categoría y segmento de negocio (`backend/app/routes.py`, modelo `FinancialMovement`; `frontend/src/lib/financial-types.ts`).
- El backend genera datos de ejemplo en memoria; en los endpoints inspeccionados utiliza `generate_mock_movements(seed=42)` (`backend/app/routes.py`). No se observa almacenamiento persistente en el código inspeccionado.
- Hay endpoints adicionales de facetas, resúmenes, categorías principales, comparación, alertas y datos B2B/B2C en `backend/app/routes.py`; no se observó que la página principal los consuma (`frontend/src/App.tsx`).

## Límites de lo que se afirma

La etiqueta de pantalla `2024 - Full Year` es fija (`frontend/src/App.tsx`), mientras el generador utiliza `date.today()` para derivar fechas (`backend/app/routes.py`). Por tanto, la etiqueta no demuestra que los datos recibidos correspondan a 2024. Este contexto describe el código del repositorio; no afirma usos, usuarios, objetivos comerciales, datos productivos ni despliegues.