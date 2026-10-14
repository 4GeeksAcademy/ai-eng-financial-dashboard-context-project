# Product Overview

## Que es el producto
Es un dashboard de metricas financieras con frontend en React + TypeScript y backend en FastAPI.

Evidencia:
- [README.md](../README.md)
- [README.es.md](../README.es.md)
- [frontend/src/App.tsx](../frontend/src/App.tsx)
- [backend/app/main.py](../backend/app/main.py)

## Que problema resuelve
Permite visualizar de forma consolidada movimientos financieros y metricas derivadas (ingresos, egresos, profit y margen), con filtros y endpoints analiticos en backend.

Evidencia:
- [frontend/src/components/dashboard/kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx)
- [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx)
- [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx)
- [backend/app/routes.py](../backend/app/routes.py)

## Flujo principal
1. El frontend inicia en [frontend/src/main.tsx](../frontend/src/main.tsx) y monta [frontend/src/App.tsx](../frontend/src/App.tsx).
2. La app solicita datos a /api/metrics desde [frontend/src/App.tsx](../frontend/src/App.tsx).
3. En desarrollo, Vite proxya /api hacia backend mediante [frontend/vite.config.ts](../frontend/vite.config.ts).
4. El backend atiende rutas en [backend/app/routes.py](../backend/app/routes.py), generando y filtrando movimientos mock.
5. El frontend calcula KPIs y serie mensual con [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts) y renderiza tarjetas y graficos.

## Funcionalidades verificadas
1. Endpoint de salud /health.
2. Endpoint base /api/metrics con filtros por fecha, categoria y tipo de operacion.
3. Endpoints adicionales: facets, summary, categories/top, comparison, alerts, b2b y b2c.
4. Render de dashboard con KPI row, grafico Income vs Outcome y grafico Profit Margin.
5. Formateo de moneda y porcentaje en frontend.

Evidencia:
- [backend/app/routes.py](../backend/app/routes.py)
- [backend/tests/test_routes.py](../backend/tests/test_routes.py)
- [frontend/src/App.tsx](../frontend/src/App.tsx)
- [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts)
- [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts)

## Funcionalidades no verificadas
1. Ejecucion runtime de tests en este levantamiento de Fase 4 (no se ejecutaron tests en esta fase).
2. Comportamiento de configuracion de entorno en frontend/.env.example, porque su contenido no fue legible desde las herramientas disponibles del entorno.
3. Integracion frontend con endpoints avanzados distintos de /api/metrics en la UI actual.

Evidencia:
- [frontend/src/App.tsx](../frontend/src/App.tsx) (solo consume /api/metrics)
- [frontend/.env.example](../frontend/.env.example) (archivo no legible por restriccion del entorno)

## Usuarios (solo si existe evidencia)
No existe una definicion formal de usuarios finales en documentos de producto del repositorio.
Como evidencia debil, la UI usa el texto "Executive metrics dashboard", pero eso no constituye especificacion formal de audiencia.

Evidencia:
- [frontend/src/components/dashboard/dashboard-header.tsx](../frontend/src/components/dashboard/dashboard-header.tsx)
- [README.md](../README.md)
- [README.es.md](../README.es.md)

## Fuente de datos
La fuente de datos operativa del backend es un generador mock deterministico con seed (42) por endpoint.

Evidencia:
- [backend/app/routes.py](../backend/app/routes.py)

## Evidencia utilizada
- [README.md](../README.md)
- [README.es.md](../README.es.md)
- [docker-compose.yml](../docker-compose.yml)
- [frontend/src/main.tsx](../frontend/src/main.tsx)
- [frontend/src/App.tsx](../frontend/src/App.tsx)
- [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts)
- [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts)
- [frontend/src/components/dashboard/dashboard-header.tsx](../frontend/src/components/dashboard/dashboard-header.tsx)
- [frontend/src/components/dashboard/kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx)
- [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx)
- [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx)
- [frontend/vite.config.ts](../frontend/vite.config.ts)
- [backend/app/main.py](../backend/app/main.py)
- [backend/app/routes.py](../backend/app/routes.py)
- [backend/tests/test_routes.py](../backend/tests/test_routes.py)
