# Stack tecnológico

Verificado contra el commit `c06ab07`. Las versiones son las declaradas en los archivos de dependencias, no las instaladas (no se pudieron instalar).

## Backend (`backend/`)

- ✅ Python 3.13 (`backend/Dockerfile`, imagen `python:3.13-slim`).
- ✅ Dependencias, sin versión fija (`backend/requirements.txt`): `fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov`, `httpx`.
- ✅ Estructura: `app/main.py` (aplicación y CORS), `app/routes.py` (modelos, lógica y rutas), `tests/test_routes.py` y `tests/conftest.py`.
- ✅ Arranca con `python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`.

## Frontend (`frontend/`)

- ✅ Node 24 (`frontend/Dockerfile`, `node:24-alpine`), módulos ES.
- ✅ React `^19.2.4`, TypeScript `~6.0.2`, Vite `^8.0.4` con `@vitejs/plugin-react`.
- ✅ Estilos: Tailwind `^4.2.2` con `@tailwindcss/vite`; variables CSS en `src/index.css`; shadcn estilo `new-york` y base `zinc` (`components.json`); `class-variance-authority`, `clsx` y `tailwind-merge`.
- ✅ Gráficas: Recharts `^3.8.1`; iconos: `lucide-react`.
- ✅ Pruebas: Vitest `^4.1.4` con `@vitest/coverage-v8`. Calidad: ESLint 9 con `typescript-eslint`, `react-hooks` y `react-refresh`.
- ✅ Configuración de TypeScript: `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`; alias `@/` → `src`.

## Infraestructura

- ✅ Docker Compose con 2 servicios: `frontend` (5173) y `backend` (8000 y 5678 de depuración). El código se monta como volumen; el frontend reserva `/app/node_modules` (`docker-compose.yml`).
- ✅ Vite reenvía `/api` a `http://backend:8000` (`frontend/vite.config.ts:13`). La variable `VITE_API_BASE_URL` es opcional (`frontend/.env.example`).
- ✅ No hay base de datos, integración continua (`.github/` no existe) ni variables de entorno obligatorias.
- ✅ CORS abierto a cualquier origen con credenciales (`backend/app/main.py`).

## Comandos

| Comando | Estado |
|---|---|
| `docker compose up --build` (arranque) | ❓ no ejecutado: sin Docker ni red en el entorno de verificación |
| `cd backend && pytest` (15 tests) | ❓ no ejecutado; la lógica de los tests se comprobó con las funciones reales |
| `cd frontend && npm test` (6 tests) y `TZ=America/New_York npm test` | ❓ `vitest` no se pudo instalar; los 6 tests se ejecutaron con un sustituto mínimo y pasan en 4 zonas horarias |
| `cd frontend && npm run lint` / `npm run build` (`tsc -b && vite build`) | ❓ no ejecutados |
