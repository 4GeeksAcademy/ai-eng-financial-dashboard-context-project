# Contexto tecnológico

## Stack y dependencias

- **Frontend:** React y React DOM 19, TypeScript, Vite y Recharts están declarados en `frontend/package.json`. El proyecto también utiliza Tailwind CSS y su plugin Vite (`frontend/package.json`; `frontend/vite.config.ts`).
- **Backend:** FastAPI, Uvicorn y debugpy están declarados en `backend/requirements.txt`; los modelos de respuesta usan Pydantic a través de FastAPI (`backend/app/routes.py`).
- **Pruebas:** Vitest y cobertura Vitest en `frontend/package.json`; pytest, pytest-cov y httpx en `backend/requirements.txt`.

## Persistencia y datos

No se configura una base de datos en `docker-compose.yml` ni se observa integración de almacenamiento persistente en los módulos inspeccionados. Las rutas llaman al generador de movimientos de ejemplo en memoria (`backend/app/routes.py`, `generate_mock_movements` y endpoints). Esta afirmación se limita a los archivos revisados.

## Docker y ejecución

- `docker-compose.yml` define los servicios `frontend` y `backend`, publica puertos `5173`, `8000` y `5678`, y monta los directorios fuente como volúmenes.
- `frontend/Dockerfile` usa `node:24-alpine` e inicia Vite en `0.0.0.0:5173`.
- `backend/Dockerfile` usa `python:3.13-slim`; su comando inicia debugpy en `5678` y Uvicorn en `0.0.0.0:8000` con `--reload`.
- Los README indican `docker compose up --build` y documentan las URLs locales del frontend, backend y OpenAPI (`README.md`; `README.es.md`).

Los archivos especifican la configuración prevista; este documento no afirma que se hayan iniciado contenedores o comprobado puertos del host.