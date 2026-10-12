# Contexto tecnico

## Stack y estructura

- **Frontend:** React, TypeScript y Vite; Recharts dibuja los graficos. Entrada: `frontend/src/main.tsx`; pantalla y carga: `frontend/src/App.tsx`; tipos, calculos y pruebas: `frontend/src/lib/`; componentes: `frontend/src/components/dashboard/`. Dependencias y scripts: [package.json](../frontend/package.json).
- **Backend:** FastAPI y Pydantic, servido por Uvicorn. Aplicacion: `backend/app/main.py`; modelos, datos simulados y rutas: [routes.py](../backend/app/routes.py); pruebas: `backend/tests/`; dependencias: [requirements.txt](../backend/requirements.txt).
- **Contenedores:** [docker-compose.yml](../docker-compose.yml) define `frontend` (puerto 5173) y `backend` (8000 y 5678). No declara una base de datos.

## Ejecucion y pruebas

Desde la raiz, el README documenta:

```bash
docker compose up --build
```

Desde `frontend/`, los scripts disponibles son `npm run dev`, `npm test`, `npm run build`, `npm run lint`, `npm run test:watch` y `npm run test:coverage`, segun [package.json](../frontend/package.json). Desde `backend/`, ejecutar `pytest` para las pruebas de `tests/`.

Direcciones locales documentadas: frontend `http://localhost:5173`, API `http://localhost:8000`, documentacion `http://localhost:8000/docs`; la API tambien expone `/health`.

## Comunicacion

La pantalla [App.tsx](../frontend/src/App.tsx) solicita `GET /api/metrics`, recibe movimientos y calcula los KPI y datos mensuales en el frontend. El backend genera 360 movimientos simulados por solicitud, ordenados por fecha; usa semilla `42`, pero asigna los años respecto a `date.today()`. No considerar estos datos como transacciones persistentes.

[Vite](../frontend/vite.config.ts) escucha en `0.0.0.0:5173` y reenvia `/api` a `http://172.18.0.1:8000` con `changeOrigin`. El archivo contiene un comentario indicando que se cambio el destino porque el anterior no cargaba el frontend. No sustituir este destino sin probar la conectividad desde el entorno previsto. Compose usa `depends_on` para ordenar el inicio, pero no declara una comprobacion de disponibilidad del backend.

La ruta consumida por la pantalla principal es `/api/metrics`. El backend implementa ademas rutas analiticas, pero no asumir que la interfaz las consume.

## Verificacion

Los scripts y pruebas descritos arriba estan declarados en el proyecto; su presencia no implica que se hayan ejecutado. Para validar una integracion, comprobar la interfaz en `:5173`, `/health`, `/docs` y una solicitud del frontend a `/api/metrics`.
