# Producto y stack

## Producto

El proyecto es un dashboard de métricas financieras. El frontend presenta un resumen ejecutivo con ingresos, gastos, beneficio y margen de beneficio, además de dos gráficos mensuales. El README lo describe como un dashboard financiero con frontend React + TypeScript y backend FastAPI. Evidencia: [README.es.md](../README.es.md), [README.md](../README.md), [frontend/src/App.tsx](../frontend/src/App.tsx), [frontend/src/components/dashboard/kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx) y [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx).

La aplicación actual consume `GET /api/metrics`, calcula los KPIs y agrupa los movimientos por mes en el frontend. Evidencia: [frontend/src/App.tsx](../frontend/src/App.tsx) y [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts).

El backend implementa más funcionalidades que las usadas por la pantalla actual: filtros, facets, resúmenes por día/semana/mes, categorías principales, comparación, alertas y endpoints B2B/B2C. Estas rutas existen en [backend/app/routes.py](../backend/app/routes.py), pero `App.tsx` solo solicita `/api/metrics`; por tanto, no se debe afirmar que esas rutas estén integradas en el dashboard actual.

## Stack declarado

- Frontend: React, React DOM, TypeScript y Vite. Evidencia: [frontend/package.json](../frontend/package.json), [frontend/src/main.tsx](../frontend/src/main.tsx) y [frontend/vite.config.ts](../frontend/vite.config.ts).
- Visualización: Recharts. Evidencia: [frontend/package.json](../frontend/package.json) y los componentes de gráficos en [frontend/src/components/dashboard/](../frontend/src/components/dashboard/).
- UI y utilidades de clases: Tailwind CSS mediante el plugin de Vite, `clsx`, `tailwind-merge` y `class-variance-authority`. Evidencia: [frontend/package.json](../frontend/package.json), [frontend/vite.config.ts](../frontend/vite.config.ts), [frontend/src/index.css](../frontend/src/index.css) y [frontend/src/lib/utils.ts](../frontend/src/lib/utils.ts).
- Iconos: Lucide React. Evidencia: [frontend/package.json](../frontend/package.json) y [frontend/src/components/dashboard/](../frontend/src/components/dashboard/).
- Backend: FastAPI, Uvicorn y Pydantic (usado por FastAPI para los modelos declarados). Evidencia: [backend/requirements.txt](../backend/requirements.txt), [backend/app/main.py](../backend/app/main.py) y [backend/app/routes.py](../backend/app/routes.py).
- Desarrollo y depuración backend: `debugpy`, configurado en [backend/Dockerfile](../backend/Dockerfile).
- Contenedores: imágenes Node 24 Alpine y Python 3.13 slim, coordinadas por Docker Compose. Evidencia: [frontend/Dockerfile](../frontend/Dockerfile), [backend/Dockerfile](../backend/Dockerfile) y [docker-compose.yml](../docker-compose.yml).
- Testing: Vitest para el frontend y pytest, pytest-cov y httpx para el backend. Evidencia: [frontend/package.json](../frontend/package.json) y [backend/requirements.txt](../backend/requirements.txt).

No se documenta aquí ninguna base de datos, CI/CD, hook de Git, formatter obligatorio, umbral de cobertura o política formal de versionado porque no está demostrado por la evidencia revisada.
