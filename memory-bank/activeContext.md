# Active Context

## Estado actual

Implementado en código:

- API FastAPI con health check, movimientos simulados y endpoints de métricas (`backend/app/routes.py`).
- Dashboard que solicita `/api/metrics`, calcula KPI y series mensuales, y muestra estados de carga/error (`frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts`).
- Pruebas backend con pytest y pruebas de utilidades frontend con Vitest (`backend/tests/test_routes.py`, `frontend/src/lib/financial-utils.test.ts`).

La presencia de código y pruebas no certifica que los servicios o las pruebas se hayan ejecutado correctamente.

## Gaps comprobables

- El encabezado pasa el período fijo `2024 - Full Year`, mientras que el backend asigna fechas relativas a la fecha actual (`frontend/src/App.tsx`, `backend/app/routes.py`).
- La agrupación mensual usa `new Date(create_date)` y getters de hora local; las pruebas existentes no cubren una fecha ISO del primer día de mes (`frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts`).
- La prueba de comparación del backend verifica las claves de respuesta, pero no los valores calculados (`backend/tests/test_routes.py`).
- La prueba automatizada del frontend cubre utilidades; no hay pruebas de `App` o de la petición HTTP en los archivos de test localizados bajo `frontend/src`.

## Siguientes prioridades técnicas

1. Preservar el mes de calendario al agrupar fechas ISO y añadir una prueba para el día 1.
2. Hacer que el período del encabezado corresponda con las fechas de los movimientos.
3. Probar los valores de comparación y cubrir estados de respuesta de la petición en frontend.

Estas prioridades se derivan de los gaps enumerados; no representan un roadmap de producto.
