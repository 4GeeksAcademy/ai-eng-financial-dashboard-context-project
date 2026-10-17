# Stack y estructura técnica

## Tecnologías

- **Frontend:** React y TypeScript, servido en desarrollo con Vite. El dashboard usa Recharts para gráficos y Tailwind CSS mediante el plugin de Vite. Dependencias y scripts: [frontend/package.json](../frontend/package.json); configuración: [frontend/vite.config.ts](../frontend/vite.config.ts).
- **Backend:** FastAPI con modelos Pydantic, ejecutado con Uvicorn. La imagen parte de Python 3.13; dependencias: [backend/Dockerfile](../backend/Dockerfile), [backend/requirements.txt](../backend/requirements.txt), aplicación: [backend/app/main.py](../backend/app/main.py).
- **Entorno conjunto:** Docker Compose define los servicios frontend y backend: [docker-compose.yml](../docker-compose.yml).

## Estructura relevante

- `frontend/src/components/dashboard`: componentes de métricas y gráficos.
- `frontend/src/lib`: tipos financieros, utilidades de cálculo, pruebas de utilidades y datos mock.
- `frontend/src/App.tsx`: carga los movimientos y presenta los KPI y gráficos.
- `backend/app`: aplicación FastAPI, modelos y rutas.
- `backend/tests`: pruebas del backend; la suite de rutas está en [backend/tests/test_routes.py](../backend/tests/test_routes.py).

## Comandos documentados

Desde la raíz:

```sh
docker compose up --build
```

Desde `frontend`:

```sh
npm run dev
npm run build
npm run lint
npm test
npm run test:coverage
```

Los scripts están definidos en [frontend/package.json](../frontend/package.json). Desde `backend`, se puede ejecutar `pytest`; está incluido en [backend/requirements.txt](../backend/requirements.txt).

Las URLs documentadas son `http://localhost:5173` para el frontend, `http://localhost:8000` para la API y `http://localhost:8000/docs` para su documentación interactiva. Fuente: [README.md](../README.md).

## Comunicación frontend-backend

1. El frontend calcula `API_BASE_URL` desde `VITE_API_BASE_URL`, con cadena vacía como valor por defecto, y solicita `GET /api/metrics`. Fuente: [frontend/src/App.tsx](../frontend/src/App.tsx).
2. En desarrollo, Vite reenvía las solicitudes que comienzan por `/api` a `http://backend:8000`. Fuente: [frontend/vite.config.ts](../frontend/vite.config.ts).
3. En Compose, los servicios se llaman `frontend` y `backend`; publican los puertos `5173` y `8000`, respectivamente. Fuente: [docker-compose.yml](../docker-compose.yml).
4. FastAPI registra el router de rutas; `GET /api/metrics` devuelve una lista de movimientos financieros validada por `FinancialMovement`. Fuentes: [backend/app/main.py](../backend/app/main.py), [backend/app/routes.py](../backend/app/routes.py).

## Nota de configuración

Los README mencionan `frontend/.env.example`, pero ese archivo no está presente en el repositorio. No asumir que existe; la variable `VITE_API_BASE_URL` sí se lee en `frontend/src/App.tsx`.