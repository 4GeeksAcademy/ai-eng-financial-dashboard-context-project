# Descripción general

El proyecto es un dashboard de métricas financieras con frontend React y TypeScript y backend FastAPI. El README describe el producto como un dashboard financiero y documenta cómo iniciar los servicios con Docker Compose (`../README.es.md`, `../README.md`, `../docker-compose.yml`).

## Flujo de datos

1. `App.tsx` lee `VITE_API_BASE_URL` (vacío por defecto) y solicita `GET /api/metrics` (`../frontend/src/App.tsx`).
2. El componente mantiene estados de carga y error. Cuando recibe movimientos, calcula KPIs y agregados mensuales mediante funciones de `financial-utils.ts` (`../frontend/src/App.tsx`, `../frontend/src/lib/financial-utils.ts`).
3. La interfaz presenta cuatro indicadores y dos gráficos mensuales de ingresos/gastos y porcentaje de beneficio (`../frontend/src/components/dashboard/kpi-row.tsx`, `../frontend/src/components/dashboard/income-outcome-chart.tsx`, `../frontend/src/components/dashboard/profit-percent-chart.tsx`).
4. Vite reenvía las solicitudes `/api` a `http://backend:8000` en su configuración de desarrollo (`../frontend/vite.config.ts`).

## Backend

Las rutas declaran modelos Pydantic para movimientos, facetas, resúmenes, categorías, comparaciones y alertas (`../backend/app/routes.py`). Los movimientos se generan en memoria: el generador crea 30 por cada uno de 12 meses y usa fechas calculadas desde `date.today()`; las rutas de métricas llaman al generador con `seed=42` (`../backend/app/routes.py`). La ruta `/health` solo devuelve `{"status": "ok"}` y no genera movimientos (`../backend/app/routes.py`). En el código revisado no se observó almacenamiento persistente.

Además de `/api/metrics`, el backend declara `/health`, `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b` y `/api/metrics/b2c` (`../backend/app/routes.py`). El `App` revisado consume `/api/metrics`; no se observó que esta pantalla consuma los demás endpoints (`../frontend/src/App.tsx`).

## Alcance de la evidencia

Esta descripción procede de lectura estática de los archivos citados. No afirma que Docker Compose, el proxy o las rutas hayan sido ejercitados en ejecución.