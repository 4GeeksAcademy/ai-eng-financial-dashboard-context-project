# Arquitectura

**Estado verificado:** 2026-11-12. Este documento describe el código presente; las reglas de `.agents/rules/` se consideran convenciones, no prueba de que una capacidad ya esté implementada.

## Vista general

```text
Navegador
  └─ Frontend React + TypeScript (Vite, :5173)
       └─ fetch GET /api/metrics
            └─ Proxy de desarrollo Vite: /api → http://backend:8000
                 └─ API FastAPI (:8000)
                      └─ movimientos simulados generados en memoria
```

Docker Compose define dos servicios, `frontend` y `backend`; no define base de datos ni otro servicio de almacenamiento. El frontend monta sus fuentes en `/app` y el backend también; el backend publica además el puerto `5678` para `debugpy`. Fuentes: [docker-compose.yml](../docker-compose.yml), [frontend/Dockerfile](../frontend/Dockerfile), [backend/Dockerfile](../backend/Dockerfile), [frontend/vite.config.ts](../frontend/vite.config.ts).

## Flujo de datos

1. [frontend/src/App.tsx](../frontend/src/App.tsx) solicita `GET /api/metrics` y maneja carga, error y éxito.
2. [backend/app/routes.py](../backend/app/routes.py) genera 360 movimientos simulados (30 por cada uno de los 12 meses) con `seed=42` para las rutas que los consultan. El año de esos movimientos depende de `date.today()`, por lo que las fechas no son un conjunto fijo de 2024.
3. En el cliente, [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts) calcula los KPI y agrupa los movimientos por mes.
4. [frontend/src/components/dashboard/](../frontend/src/components/dashboard/) presenta cuatro KPI y dos gráficos con Recharts.

La API devuelve modelos Pydantic definidos en [backend/app/routes.py](../backend/app/routes.py). El mismo módulo contiene modelos, funciones de transformación y endpoints; esto describe la implementación actual y difiere de la separación por capas recomendada en [.agents/rules/agente-reglas.md](../.agents/rules/agente-reglas.md).

## Rutas del backend

- `GET /health`
- `GET /api/metrics`
- `GET /api/metrics/facets`
- `GET /api/metrics/summary`
- `GET /api/metrics/categories/top`
- `GET /api/metrics/comparison`
- `GET /api/metrics/alerts`
- `GET /api/metrics/b2b`
- `GET /api/metrics/b2c`

Las rutas de métricas tienen filtros por fechas/categoría/tipo de operación, y varias admiten agrupación, tipo de negocio, límites o umbral. Los detalles de parámetros y respuestas están en [backend/app/routes.py](../backend/app/routes.py); las pruebas de contrato y filtros están en [backend/tests/test_routes.py](../backend/tests/test_routes.py).

## Límites de lo que se conoce

- El Compose y los Dockerfiles describen un entorno de desarrollo; no se encontró configuración de despliegue de producción en estas fuentes.
- Los datos de negocio de la API son simulados. No se encontró una capa de persistencia en los servicios o dependencias declarados.
- El proxy de Vite apunta al nombre de servicio `backend`, adecuado al Compose. No se verificó un proxy de producción.
