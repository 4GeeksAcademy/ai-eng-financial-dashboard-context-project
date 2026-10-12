# Resumen del producto

## Hechos comprobables

Panel web de métricas financieras con frontend React/TypeScript y API FastAPI. El frontend carga movimientos desde `/api/metrics` y muestra cuatro KPI: ingresos, gastos, beneficio y margen; también presenta gráficos mensuales de ingresos frente a gastos y de margen. Los cálculos se realizan en el frontend sobre los movimientos recibidos. [App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx)

El backend genera movimientos simulados; no se declara almacenamiento financiero persistente. Un movimiento contiene fecha, importe, tipo (`income`/`outcome`), categoría y tipo de negocio (`B2B`/`B2C`). El generador crea 360 movimientos y asigna sus años con base en la fecha actual. [routes.py](../backend/app/routes.py), [docker-compose.yml](../docker-compose.yml)

La API también implementa filtros, facetas, resúmenes, categorías principales, comparaciones, alertas y rutas B2B/B2C. La pantalla principal observada solicita `/api/metrics`; no se debe asumir que las otras rutas ya están integradas en la interfaz. [routes.py](../backend/app/routes.py), [App.tsx](../frontend/src/App.tsx)

## Límites y aspectos no especificados

El encabezado del dashboard está fijado en `2024 - Full Year`, mientras que las fechas generadas dependen de la fecha actual. Por eso, no asumir que el título describe el rango real de los datos. [App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py)

El código revisado no especifica un perfil de usuario, datos reales de clientes, persistencia de transacciones ni una finalidad de producto más amplia que mostrar estas métricas. No describir esas cosas como funciones existentes.
