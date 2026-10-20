# Resumen del proyecto

- El repositorio se describe como un dashboard de métricas financieras con frontend React + TypeScript y backend FastAPI. Fuente: `README.es.md`.
- La aplicación React solicita `GET /api/metrics` y calcula KPI y datos mensuales para dos gráficos. Fuente: `frontend/src/App.tsx`.
- El backend genera 360 movimientos financieros ficticios usando la semilla `42` en las rutas de métricas. Fuente: `backend/app/routes.py`.
- El backend declara `/health` y rutas de métricas para movimientos, facets, resúmenes, categorías principales, comparación, alertas y segmentos B2B/B2C. Fuente: `backend/app/routes.py`.
- En desarrollo, Compose define los servicios `backend` y `frontend`; Vite reenvía `/api` a `http://backend:8000`. Fuente: `docker-compose.yml`, `frontend/vite.config.ts`.