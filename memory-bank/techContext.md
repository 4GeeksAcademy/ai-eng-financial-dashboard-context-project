# Tech Context

## Stack tecnologico completo

## Frontend

- React 19 + React DOM 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4 con plugin oficial para Vite
- Recharts para visualizacion de series
- Lucide React para iconografia
- clsx + tailwind-merge para composicion de clases
- class-variance-authority disponible para variantes de componentes

## Backend

- Python 3.13 slim en contenedor
- FastAPI
- Uvicorn standard
- Pydantic para modelos de contrato
- debugpy para debugging remoto

## Testing y calidad

- Backend: pytest, pytest-cov, httpx/TestClient
- Frontend: Vitest, @vitest/coverage-v8
- Lint frontend: ESLint flat config + typescript-eslint + plugins React Hooks y React Refresh

## Infraestructura y entorno de desarrollo

- Docker Compose para levantar servicios frontend y backend.
- Frontend corre en puerto 5173.
- Backend corre en puerto 8000.
- Puerto 5678 expuesto para debugpy en backend.
- Montaje de volumenes para desarrollo en caliente en ambos servicios.
- Frontend usa proxy de Vite para redirigir rutas /api a backend dentro de red Docker.

## Arquitectura tecnica

- Arquitectura de servicios separados:
  - Servicio frontend (SPA)
  - Servicio backend (REST API)
- Comunicacion por HTTP JSON.
- CORS habilitado en backend.
- Sin capa de base de datos en el estado actual.

## Dependencias clave por modulo

## Backend requirements

- fastapi
- uvicorn[standard]
- debugpy
- pytest
- pytest-cov
- httpx

## Frontend dependencias runtime

- react
- react-dom
- recharts
- lucide-react
- clsx
- tailwind-merge
- class-variance-authority

## Frontend devDependencies destacadas

- vite
- @vitejs/plugin-react
- tailwindcss
- @tailwindcss/vite
- typescript
- vitest
- eslint y ecosistema typescript-eslint

## Scripts importantes

## Frontend

- dev: inicia Vite en desarrollo
- build: type check y build de produccion
- lint: analisis estatico
- test: ejecucion de pruebas Vitest
- test:coverage: pruebas con cobertura

## Backend

- No hay pyproject con scripts; se usa pytest y uvicorn via Docker/terminal.

## Flujo de ejecucion local recomendado

1. Levantar servicios con docker compose up --build.
2. Frontend disponible en localhost:5173.
3. Backend disponible en localhost:8000.
4. Docs de API en localhost:8000/docs.

## Riesgos y consideraciones tecnicas actuales

- API usa datos mock en memoria (sin persistencia).
- CORS configurado de forma permisiva para desarrollo.
- Uso de float para montos financieros en backend.
- Parte de la API no esta integrada todavia en la UI.
