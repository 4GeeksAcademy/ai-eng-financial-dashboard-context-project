# Product Context

## Resumen

Dashboard web de métricas financieras. La interfaz muestra ingresos, gastos, beneficio y porcentaje de beneficio, además de gráficos mensuales de ingresos/gastos y margen. Evidencia: `frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts` y los componentes importados por `App.tsx`.

## Datos y API

- El frontend consulta `GET /api/metrics` en `frontend/src/App.tsx`.
- `backend/app/routes.py` define `/health` y endpoints para movimientos, facetas, resúmenes, categorías principales, comparación, alertas y filtros B2B/B2C.
- Los endpoints generan movimientos simulados mediante `generate_mock_movements(seed=42)`; la función crea 30 movimientos por cada uno de los 12 meses.
- No se afirma aquí que el producto use o no use una base de datos: las rutas revisadas demuestran generación simulada, pero no prueban la arquitectura completa del repositorio.

## Límites de evidencia

No hay evidencia revisada que establezca usuarios objetivo, despliegue de producción, resultados comerciales ni un roadmap de funcionalidades. No inferirlos.
