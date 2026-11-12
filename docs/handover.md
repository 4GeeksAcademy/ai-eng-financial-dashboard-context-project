# Guía de incorporación

## Producto y estructura

Panel de métricas financieras con frontend React y TypeScript y backend Python con FastAPI. El panel calcula indicadores y gráficos a partir de movimientos simulados.

- [`frontend/src`](../frontend/src): entrada React, componentes del dashboard, tipos y cálculos financieros.
- [`backend/app`](../backend/app): aplicación FastAPI, endpoints y generación de movimientos.
- [`backend/tests`](../backend/tests) y [`frontend/src/lib/financial-utils.test.ts`](../frontend/src/lib/financial-utils.test.ts): pruebas de backend y cálculos del frontend.
- [`docker-compose.yml`](../docker-compose.yml): servicios de desarrollo `frontend` y `backend`.

## Flujo de datos

[`App.tsx`](../frontend/src/App.tsx) solicita `GET /api/metrics`. Por defecto, el proxy de [`vite.config.ts`](../frontend/vite.config.ts) reenvía `/api` al backend; `VITE_API_BASE_URL` permite indicar otra base. [`routes.py`](../backend/app/routes.py) genera movimientos simulados, los filtra y ordena. El frontend calcula los indicadores y los agrupa por mes con [`financial-utils.ts`](../frontend/src/lib/financial-utils.ts), para alimentar las tarjetas y los gráficos.

## Ejecución validada

Desde la raíz del repositorio, con Docker y Docker Compose disponibles:

```bash
docker compose up --build
```

Este procedimiento, documentado en el [README](../README.es.md), arrancó ambos servicios en el Codespace. Compose publica el frontend en `5173`, la API en `8000` y el depurador del backend en `5678`. En Codespaces, abre los puertos `5173` y `8000` desde la pestaña **Puertos**. `Ctrl+C` detiene los servicios iniciados en primer plano.

## Rutas comprobadas

- `GET /health`: respondió `{"status":"ok"}`.
- `GET /api/metrics`: respondió HTTP 200 directamente y a través del proxy del frontend.
- `GET /docs`: respondió HTTP 200 y corresponde a la documentación de la API.

Estas comprobaciones se realizaron desde el Codespace, no desde un navegador externo. Los resultados y limitaciones están en [verification.md](../verification.md).
