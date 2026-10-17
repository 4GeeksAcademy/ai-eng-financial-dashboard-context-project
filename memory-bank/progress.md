# Estado del proyecto

Este documento separa comportamientos y limitaciones comprobados de los pasos sugeridos. Las pruebas mencionadas existen en el repositorio, pero no se ejecutaron durante esta revisión.

## Qué funciona

- El frontend consulta `GET /api/metrics` y representa estados de carga y error. Calcula KPI y agregados mensuales para mostrarlos junto con gráficos de ingresos/egresos y margen. ([frontend/src/App.tsx](../frontend/src/App.tsx), [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts), [frontend/src/components/dashboard/kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx), [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx))
- Las utilidades financieras tienen pruebas para totales, porcentajes, agregaciones mensuales y orden cronológico. ([frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts))
- FastAPI define modelos de respuesta y endpoints para movimientos, facetas, resúmenes, categorías principales, comparaciones, alertas y segmentos B2B/B2C. Los helpers comunes aplican filtros y orden cronológico. ([backend/app/routes.py](../backend/app/routes.py))
- Las pruebas backend cubren generación, filtros, orden y respuestas de varios endpoints. ([backend/tests/test_routes.py](../backend/tests/test_routes.py))
- Docker Compose define frontend y backend; Vite reenvía `/api` al backend en desarrollo. ([docker-compose.yml](../docker-compose.yml), [frontend/vite.config.ts](../frontend/vite.config.ts))

## Limitaciones actuales

- La API genera movimientos simulados; el flujo revisado no muestra una conexión con una fuente financiera real ni persistencia. ([backend/app/routes.py](../backend/app/routes.py))
- La pantalla principal solo consulta `/api/metrics`. Los filtros, comparaciones, alertas y otros endpoints existentes no están presentados como controles de esa interfaz. ([frontend/src/App.tsx](../frontend/src/App.tsx), [backend/app/routes.py](../backend/app/routes.py))
- El encabezado fija `2024 - Full Year`, pero las fechas generadas dependen de la fecha actual y cubren doce meses completos relativos a ella. ([frontend/src/App.tsx](../frontend/src/App.tsx), [backend/app/routes.py](../backend/app/routes.py))
- La agregación frontend convierte fechas sin hora con `new Date(...)` y getters locales; en algunas zonas horarias puede asignar una fecha al mes equivocado. Las pruebas actuales no cubren el primer día del mes. ([frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts), [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts))
- `generate_mock_movements` llama a `random.seed(seed)`, que modifica el estado aleatorio global. ([backend/app/routes.py](../backend/app/routes.py))
- `build_metrics_facets` accede al primer y último elemento de la lista ordenada sin manejar el caso de una lista vacía. El endpoint actual la llama con datos generados, pero la función no admite entradas vacías. ([backend/app/routes.py](../backend/app/routes.py))
- CORS permite cualquier origen, método y encabezado, además de credenciales; el alcance necesario no queda restringido en la configuración actual. ([backend/app/main.py](../backend/app/main.py))
- Los README mencionan `frontend/.env.example`, pero el archivo no existe en el repositorio. ([README.md](../README.md), [README.es.md](../README.es.md))

## Próximos pasos sugeridos

Estas son propuestas derivadas del código; no implican decisiones de producto ni cambios ya realizados.

1. Corregir la etiqueta del período o derivarla de las fechas efectivamente presentadas.
2. Tratar `create_date` como fecha de calendario sin conversión dependiente de zona horaria y añadir pruebas para límites de mes y año.
3. Usar un generador aleatorio local para conservar reproducibilidad sin alterar el estado global.
4. Definir y probar el comportamiento de `build_metrics_facets` cuando recibe una lista vacía.
5. Restringir CORS a los orígenes necesarios antes de un despliegue.
6. Decidir si los endpoints secundarios deben integrarse en la interfaz o documentarse como capacidades solo de API.
7. Corregir la referencia a `frontend/.env.example` o añadir ese archivo.
8. Ejecutar las verificaciones disponibles: `npm run lint`, `npm test` y `npm run build` desde `frontend`; `pytest` desde `backend`; y, si se requiere comprobar el conjunto, `docker compose up --build`. Los comandos están descritos en [AGENTS.md](../AGENTS.md) y sus scripts frontend en [frontend/package.json](../frontend/package.json).