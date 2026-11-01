# Stack técnico
**Última verificación:** 2026-10-31, sobre el commit 295fd8c.

## Tecnologías
- Frontend: React 19, TypeScript, Vite 8, Tailwind 4, Recharts; pruebas con Vitest.
- Backend: FastAPI, uvicorn, debugpy, pytest (Python 3.13 dentro del contenedor).
- Docker Compose con dos servicios: `backend` y `frontend`.

## Puertos publicados (`docker-compose.yml`)
- 5173 frontend, 8000 API del backend, 5678 debugpy.

## Comandos (siempre dentro del contenedor)
- `docker compose up -d` levanta los dos servicios. Si `docker compose ps` sale vacío, están parados.
- Backend: `docker compose exec -T backend python -m pytest -q` (15 passed, 1 warning).
- Frontend: `docker compose exec -T frontend npm run lint` (exit 0) y `docker compose exec -T frontend npm run test` (5 passed).
- El Python del Codespace no tiene `fastapi`: pytest fuera del contenedor falla.
- `./backend` y `./frontend` están montados en los contenedores (`docker-compose.yml`), así que los cambios se ven sin reconstruir.

## Reglas y convenciones
- Reglas del agente en `.agents/rules` (P1 a P10) y skill en `.agents/skills/add-metrics-route`. `AGENTS.md` manda leerlas antes de actuar.
- Instrucción global del curso (fuera del repo): «Do not write new tests unless explicitly requested». La regla P6 la contradice a propósito.

## Dependencias y calidad
- `backend/requirements.txt` lista 6 paquetes sin versión fijada. Regla P10: al añadir uno, fijarlo con `==`.
- No hay formatter, CI ni pre-commit versionados. El script `lint` está en `frontend/package.json:9`; la configuración de ESLint, en `frontend/eslint.config.js:12`.

## Dónde está el código
- `backend/app/main.py`: crea la app e incluye el router (`backend/app/main.py:14`).
- `backend/app/routes.py`: schemas (`backend/app/routes.py:22`), `generate_mock_movements` (`backend/app/routes.py:94`) y las 9 rutas GET, desde `/health` (`backend/app/routes.py:243`) hasta `/api/metrics/b2c`. `/api/metrics` está en `backend/app/routes.py:248`.
- `backend/tests/test_routes.py`: pruebas de las rutas y del generador (15 `test_`).
- `frontend/src/App.tsx`: estado de carga y error, el único `fetch` (`frontend/src/App.tsx:16`) y la composición de la pantalla.
- `frontend/src/components/dashboard/`: `kpi-row.tsx`, `dashboard-header.tsx`, `income-outcome-chart.tsx` y `profit-percent-chart.tsx`.
- `frontend/src/lib/financial-utils.ts`: totales, beneficio y agrupación mensual, con su test `frontend/src/lib/financial-utils.test.ts`. Nadie importa `frontend/src/lib/mock-data.ts`.

## Índice de reglas (`.agents/rules/<nombre>.md`)
- P1 `convenciones-de-codigo`: snake_case en Python; PascalCase en componentes con archivos kebab-case; `cn()` y tokens de `index.css` en vez de colores literales.
- P2 `contratos-de-rutas-backend`: rutas nuevas en el router de `backend/app/routes.py`, con `response_model` Pydantic en toda ruta `/api/metrics*` nueva; ninguna ruta en `main.py`. `/health` es la única excepción.
- P3 `fuente-de-datos-que-consume-la-ui`: seguir el fetch de `frontend/src/App.tsx` hasta el componente; no editar `mock-data.ts` esperando cambiar la UI mientras nadie lo importe.
- P4 `generacion-y-periodo-de-datos`: revisar todos los usos de `generate_mock_movements(seed=42)`; no llamar `random.seed` fuera del generador; si cambia el rango de fechas, actualizar el texto fijo «2024 - Full Year».
- P5 `estado-y-errores-de-carga`: mantener los estados `loading` y `error`; si se modifica el `.catch`, declarar si el error se muestra o se descarta.
- P6 `pruebas-junto-al-comportamiento`: al cambiar una ruta, añadir o actualizar un `test_*` en `backend/tests/test_routes.py` en el mismo cambio, aunque la tarea no mencione tests; al cambiar `frontend/src/lib/`, actualizar su `.test.ts`.
- P7 `cors-y-puertos-publicados`: no ampliar CORS ni publicar puertos nuevos sin que la tarea lo pida; informar de los puertos y de la política CORS.
- P8 `lectura-de-contexto-del-agente`: antes de editar, listar y leer `.agents/rules`, `.agents/skills` y `memory-bank`, e indicar qué se leyó.
- P9 `calidad-del-frontend`: antes de terminar un cambio en `frontend/src`, ejecutar lint y test; no reformatear archivos completos.
- P10 `dependencias-del-backend`: al añadir una dependencia, fijar su versión con `==` e indicar si es de ejecución, depuración o pruebas.
- Skill `.agents/skills/add-metrics-route/SKILL.md`: pasos para añadir un endpoint `/api/metrics*`.
- Cada regla trae alcance, justificación, verificación y línea base: léela entera antes de aplicarla.
