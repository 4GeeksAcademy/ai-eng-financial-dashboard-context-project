# Contexto técnico

## Stack

- **Frontend:** React y TypeScript con Vite. Usa Recharts para los gráficos y Vitest para pruebas. Los scripts están en [frontend/package.json](../frontend/package.json).
- **Backend:** Python con FastAPI y Uvicorn; las dependencias están en [backend/requirements.txt](../backend/requirements.txt) y el contenedor en [backend/Dockerfile](../backend/Dockerfile).
- **Entorno integrado:** Docker Compose define los servicios `frontend` y `backend` en [docker-compose.yml](../docker-compose.yml).

## Estructura principal

- `frontend/src/main.tsx`: punto de entrada de React.
- `frontend/src/App.tsx`: carga `/api/metrics`, gestiona carga/error y compone el dashboard.
- `frontend/src/components/dashboard/`: tarjetas KPI y gráficos.
- `frontend/src/lib/financial-types.ts`: tipos TypeScript para los movimientos y datos del dashboard.
- `frontend/src/lib/financial-utils.ts`: cálculos KPI y agregación mensual.
- `frontend/src/lib/financial-utils.test.ts`: pruebas de los cálculos frontend.
- `backend/app/main.py`: crea la aplicación FastAPI y registra el router.
- `backend/app/routes.py`: modelos Pydantic, endpoints, generación de movimientos, filtros, orden y agregaciones.
- `backend/tests/test_routes.py`: pruebas de salud y rutas de métricas.

## Comunicación frontend-backend

1. `App.tsx` hace una petición a `/api/metrics`; `VITE_API_BASE_URL` puede usarse como prefijo opcional.
2. Vite reenvía `/api` a `http://backend:8000`, según [frontend/vite.config.ts](../frontend/vite.config.ts).
3. En Docker Compose, `backend` es el nombre del servicio; esta resolución no está garantizada si Vite se ejecuta fuera de la red de Compose.
4. FastAPI define `/health` y endpoints bajo `/api/metrics`, incluidos filtros, facets, resúmenes, categorías principales, comparaciones, alertas y segmentos B2B/B2C. La documentación interactiva está en `/docs`.

## Datos y cálculos

- Las rutas generan datos de ejemplo con semilla `42`: 30 movimientos por cada uno de 12 meses. Los años se asignan respecto a `date.today()`; no son un período calendario fijo ni datos persistidos en el flujo revisado.
- El frontend calcula beneficio como ingresos menos egresos. El porcentaje es beneficio dividido por ingresos, o cero cuando no hay ingresos.
- El título del dashboard está fijado en `2024 - Full Year`; no debe usarse como fuente del período real de los datos.
- Los modelos de respuesta del backend y los tipos TypeScript son contratos duplicados y deben mantenerse sincronizados.

## Comandos

Ejecutar desde la raíz del repositorio:

```bash
docker compose up --build
```

Con los servicios levantados:

```bash
docker compose exec backend pytest
docker compose exec frontend npm test
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
```

Los comandos están documentados en [README.es.md](../README.es.md) y sus scripts frontend en [frontend/package.json](../frontend/package.json). No se afirma que se hayan ejecutado durante esta revisión.

## Verificación manual

- Frontend: `http://localhost:5173`
- API: `http://localhost:8000/health` y `http://localhost:8000/api/metrics`
- Documentación de API: `http://localhost:8000/docs`
