# Stack tecnológico

Las versiones que siguen son las declaradas en los archivos del proyecto; no representan necesariamente versiones instaladas o resueltas en una ejecución.

## Frontend

- Lenguajes: TypeScript y JavaScript (configuración ESM en `package.json`); Node.js `24-alpine` como imagen del contenedor ([frontend/Dockerfile](../frontend/Dockerfile)).
- Aplicación: React y React DOM `^19.2.4`; Vite `^8.0.4` con `@vitejs/plugin-react`; TypeScript `~6.0.2` ([package.json](../frontend/package.json)).
- UI y gráficos: Tailwind CSS `^4.2.2` mediante `@tailwindcss/vite`, Recharts `^3.8.1` y `lucide-react` `^1.8.0` ([package.json](../frontend/package.json), [vite.config.ts](../frontend/vite.config.ts)).
- Utilidades declaradas: `clsx`, `tailwind-merge` y `class-variance-authority` ([package.json](../frontend/package.json)).
- Tooling declarado: scripts de Vite para desarrollo y preview, `tsc -b` + Vite para build, ESLint y Vitest ([package.json](../frontend/package.json)).

## Backend

- Lenguaje/runtime: Python 3.13 (`python:3.13-slim`) ([backend/Dockerfile](../backend/Dockerfile)).
- API: FastAPI y Uvicorn; los modelos de respuesta usan Pydantic ([requirements.txt](../backend/requirements.txt), [routes.py](../backend/app/routes.py)).
- Pruebas y depuración: pytest, pytest-cov, httpx y debugpy están declarados en `requirements.txt`. Las dependencias Python no tienen versiones fijadas en ese archivo.

## Infraestructura de desarrollo

- Docker Compose define servicios `frontend` y `backend`, con puertos publicados 5173, 8000 y 5678 ([docker-compose.yml](../docker-compose.yml)).
- El contenedor frontend ejecuta Vite en modo desarrollo; su proxy `/api` apunta a `http://backend:8000`, nombre interno de la red de Compose ([frontend/Dockerfile](../frontend/Dockerfile), [vite.config.ts](../frontend/vite.config.ts)).
- El contenedor backend inicia Uvicorn con recarga y debugpy ([backend/Dockerfile](../backend/Dockerfile)). Estas configuraciones y el README describen desarrollo; no acreditan preparación para producción ([README.es.md](../README.es.md)).

## Reproducibilidad

El Dockerfile del frontend ejecuta `npm install`; no se afirma aquí que las instalaciones sean reproducibles. Los rangos de `package.json` y las dependencias Python sin fijar no equivalen a un inventario de versiones efectivamente instaladas.
