# Tech stack

**Estado verificado:** 2026-11-12. Las versiones JavaScript son los rangos declarados en `package.json`, no una afirmación sobre las versiones instaladas en ejecución.

## Lenguajes

- **Python 3.13** como imagen base del backend: [backend/Dockerfile](../backend/Dockerfile).
- **TypeScript** para la aplicación frontend; `typescript` declara `~6.0.2` en [frontend/package.json](../frontend/package.json).
- **JavaScript** para configuración ESM de herramientas, por ejemplo [frontend/vite.config.ts](../frontend/vite.config.ts) y [frontend/eslint.config.js](../frontend/eslint.config.js).
- **CSS** con directivas de Tailwind en [frontend/src/index.css](../frontend/src/index.css).

## Frameworks y librerías principales

| Área | Tecnología | Evidencia |
|---|---|---|
| Frontend | React `^19.2.4`, React DOM `^19.2.4` | [frontend/package.json](../frontend/package.json) |
| UI y desarrollo | Vite `^8.0.4`, plugin React `^6.0.1` | [frontend/package.json](../frontend/package.json), [frontend/vite.config.ts](../frontend/vite.config.ts) |
| Estilos | Tailwind CSS y plugin Vite `^4.2.2` | [frontend/package.json](../frontend/package.json), [frontend/src/index.css](../frontend/src/index.css) |
| Gráficos | Recharts `^3.8.1` | [frontend/package.json](../frontend/package.json), componentes de [frontend/src/components/dashboard/](../frontend/src/components/dashboard/) |
| Iconos y clases | `lucide-react` `^1.8.0`, `clsx` `^2.1.1`, `tailwind-merge` `^3.5.0` | [frontend/package.json](../frontend/package.json), [frontend/src/lib/utils.ts](../frontend/src/lib/utils.ts) |
| Backend HTTP | FastAPI, Pydantic y Uvicorn | [backend/requirements.txt](../backend/requirements.txt), [backend/app/main.py](../backend/app/main.py), [backend/app/routes.py](../backend/app/routes.py) |

`class-variance-authority` (`^0.7.1`) figura en las dependencias, pero [Verification.md](../Verification.md) informa que no encontró usos en `frontend/src/`. No se considera una dependencia de uso confirmado.

## Infraestructura

- Docker Compose construye y ejecuta los servicios frontend y backend: [docker-compose.yml](../docker-compose.yml).
- Frontend: imagen `node:24-alpine`, servidor Vite en el puerto `5173`: [frontend/Dockerfile](../frontend/Dockerfile).
- Backend: imagen `python:3.13-slim`, Uvicorn en `8000` y depurador `debugpy` en `5678`: [backend/Dockerfile](../backend/Dockerfile).
- Proxy de desarrollo Vite: `/api` hacia `http://backend:8000`: [frontend/vite.config.ts](../frontend/vite.config.ts).
- No se declara una base de datos en Compose ni en las dependencias Python revisadas.

## Herramientas y validación disponibles

- Frontend: `npm run dev`, `npm run build`, `npm run lint`, `npm test` (Vitest), según scripts de [frontend/package.json](../frontend/package.json).
- Backend: pytest, `TestClient` de FastAPI y httpx; dependencias declaradas en [backend/requirements.txt](../backend/requirements.txt), pruebas en [backend/tests/test_routes.py](../backend/tests/test_routes.py).
- Documentación interactiva de FastAPI disponible por convención en `/docs`; la aplicación se instancia en [backend/app/main.py](../backend/app/main.py).
- Inicio conjunto documentado: `docker compose up --build`, en [README.md](../README.md).

Las dependencias Python están listadas sin versiones fijadas en `backend/requirements.txt`. No se verificó qué versiones exactas están instaladas en el entorno.
