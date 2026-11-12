# Memoria del proyecto

## Overview del producto

Este repositorio implementa un dashboard de métricas financieras con un frontend React/TypeScript y una API FastAPI. La interfaz solicita `GET /api/metrics`, calcula KPIs y agregados mensuales, y presenta tarjetas y gráficos de ingresos/gastos y porcentaje de beneficio ([App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts)).

La API genera movimientos simulados: usa la semilla `42`, genera 30 movimientos por mes para los 12 meses completos anteriores a la fecha de ejecución y ordena los resultados por fecha. La semilla permite reproducir los movimientos para una fecha dada, pero el rango temporal cambia con la fecha de ejecución ([routes.py](../backend/app/routes.py)).

El frontend consume `GET /api/metrics`. El backend también declara rutas de facets, resumen, categorías, comparación, alertas, B2B y B2C, pero no se observan conectadas desde la interfaz actual ([App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py)). Docker Compose define servicios para frontend y backend; no declara una base de datos ([docker-compose.yml](../docker-compose.yml)).

## Stack tecnológico

| Área | Tecnología | Evidencia |
|---|---|---|
| Lenguajes | TypeScript/JavaScript en frontend; Python en backend | [frontend/package.json](../frontend/package.json), [backend/app/main.py](../backend/app/main.py) |
| Frontend | React, Vite, Tailwind CSS, Recharts | Dependencias en [frontend/package.json](../frontend/package.json); configuración Vite en [vite.config.ts](../frontend/vite.config.ts) |
| Backend/API | FastAPI, Pydantic, Uvicorn | [requirements.txt](../backend/requirements.txt), [routes.py](../backend/app/routes.py) |
| Infraestructura local | Docker Compose; contenedores frontend y backend | [docker-compose.yml](../docker-compose.yml), [Dockerfile](../backend/Dockerfile) |
| Calidad y pruebas | TypeScript, ESLint, Vitest; pytest, pytest-cov, httpx | [frontend/package.json](../frontend/package.json), [requirements.txt](../backend/requirements.txt) |
| Depuración | debugpy en la imagen del backend | [Dockerfile](../backend/Dockerfile) |

## Límites de esta descripción

Los movimientos se generan en el backend. El repositorio no muestra integración con bancos, datos de clientes, autenticación ni almacenamiento persistente; no se deben atribuir esas capacidades al producto.
