# Tech Stack

## Arquitectura general
La arquitectura implementada es una aplicacion web con dos servicios coordinados por Docker Compose:
1. Frontend Vite + React que sirve la interfaz.
2. Backend FastAPI que expone API REST de metricas.

Responsabilidad:
- El frontend consume /api y presenta dashboard.
- El backend genera/filtra/agrega movimientos financieros y devuelve respuestas tipadas.

Evidencia:
- [docker-compose.yml](../docker-compose.yml)
- [frontend/src/App.tsx](../frontend/src/App.tsx)
- [backend/app/main.py](../backend/app/main.py)
- [backend/app/routes.py](../backend/app/routes.py)

## Frontend
1. React 19 + React DOM: render de UI y estado de la app.
2. Vite: servidor dev/build y proxy de /api a backend en desarrollo.
3. TypeScript: tipado de modelos financieros y utilidades.
4. Recharts: visualizacion de series (income/outcome y margen).
5. Tailwind CSS v4 + utilidades de estilo: sistema de estilos y tokens.

Responsabilidad por archivo:
- Entrada/montaje: [frontend/src/main.tsx](../frontend/src/main.tsx)
- Orquestacion UI y fetch: [frontend/src/App.tsx](../frontend/src/App.tsx)
- Config de bundler/proxy: [frontend/vite.config.ts](../frontend/vite.config.ts)
- Tipos y calculos: [frontend/src/lib/financial-types.ts](../frontend/src/lib/financial-types.ts), [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts)
- Graficos: [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx), [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx)
- Estilos base: [frontend/src/index.css](../frontend/src/index.css)

## Backend
1. FastAPI: framework HTTP para exponer endpoints.
2. Pydantic (via FastAPI): validacion y contratos de respuesta.
3. Uvicorn: servidor ASGI.
4. debugpy: depuracion remota en el comando de arranque del contenedor backend.

Responsabilidad por archivo:
- Bootstrap API y CORS: [backend/app/main.py](../backend/app/main.py)
- Modelos, filtros, agregaciones y rutas: [backend/app/routes.py](../backend/app/routes.py)
- Dependencias Python: [backend/requirements.txt](../backend/requirements.txt)

## Infraestructura
1. Docker Compose define y conecta los servicios frontend y backend.
2. Dockerfile frontend instala dependencias npm y ejecuta vite dev.
3. Dockerfile backend instala requirements y ejecuta uvicorn con debugpy.

Evidencia:
- [docker-compose.yml](../docker-compose.yml)
- [frontend/Dockerfile](../frontend/Dockerfile)
- [backend/Dockerfile](../backend/Dockerfile)

## Dependencias principales
### Frontend
- react, react-dom: framework de UI.
- recharts: graficos del dashboard.
- lucide-react: iconografia.
- class-variance-authority, clsx, tailwind-merge: composicion de clases.

Evidencia:
- [frontend/package.json](../frontend/package.json)

### Backend
- fastapi: API framework.
- uvicorn[standard]: servidor.
- debugpy: depuracion.
- httpx: dependencia para testing/cliente HTTP.

Evidencia:
- [backend/requirements.txt](../backend/requirements.txt)

## Herramientas de testing
1. Backend: pytest, pytest-cov y TestClient de FastAPI.
2. Frontend: vitest (run/watch/coverage).

Evidencia:
- [backend/requirements.txt](../backend/requirements.txt)
- [backend/tests/test_routes.py](../backend/tests/test_routes.py)
- [frontend/package.json](../frontend/package.json)
- [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts)

## Herramientas de desarrollo
1. ESLint + typescript-eslint + plugins de React para calidad de codigo.
2. TypeScript con reglas noUnusedLocals/noUnusedParameters/noFallthroughCasesInSwitch.
3. Alias de imports @ en Vite/TS.

Evidencia:
- [frontend/eslint.config.js](../frontend/eslint.config.js)
- [frontend/tsconfig.app.json](../frontend/tsconfig.app.json)
- [frontend/tsconfig.node.json](../frontend/tsconfig.node.json)
- [frontend/vite.config.ts](../frontend/vite.config.ts)

## Archivos utilizados como evidencia
- [docker-compose.yml](../docker-compose.yml)
- [frontend/package.json](../frontend/package.json)
- [frontend/vite.config.ts](../frontend/vite.config.ts)
- [frontend/src/main.tsx](../frontend/src/main.tsx)
- [frontend/src/App.tsx](../frontend/src/App.tsx)
- [frontend/src/lib/financial-types.ts](../frontend/src/lib/financial-types.ts)
- [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts)
- [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts)
- [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx)
- [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx)
- [frontend/src/index.css](../frontend/src/index.css)
- [frontend/eslint.config.js](../frontend/eslint.config.js)
- [frontend/tsconfig.app.json](../frontend/tsconfig.app.json)
- [frontend/tsconfig.node.json](../frontend/tsconfig.node.json)
- [frontend/Dockerfile](../frontend/Dockerfile)
- [backend/app/main.py](../backend/app/main.py)
- [backend/app/routes.py](../backend/app/routes.py)
- [backend/requirements.txt](../backend/requirements.txt)
- [backend/tests/test_routes.py](../backend/tests/test_routes.py)
- [backend/Dockerfile](../backend/Dockerfile)
