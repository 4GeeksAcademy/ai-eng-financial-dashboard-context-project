# Servicios, conexión y datos mock

## Reglas

- Usa `docker-compose.yml` como referencia para los servicios `frontend` y `backend`, sus builds, volúmenes, dependencia y puertos.
- No cambies el nombre del servicio `backend` sin revisar simultáneamente el destino del proxy en `frontend/vite.config.ts`.
- No cambies de forma aislada los puertos, hosts o comandos definidos en Compose y los Dockerfiles. Mantén coordinados `docker-compose.yml`, `frontend/Dockerfile`, `backend/Dockerfile` y `frontend/vite.config.ts`.
- Conserva el proxy de Vite para `/api`, o documenta y actualiza explícitamente toda la estrategia de conexión si la arquitectura cambia.
- No asumas que todos los endpoints del backend son consumidos por el dashboard. La aplicación actual de `frontend/src/App.tsx` solicita únicamente `/api/metrics`.
- Antes de modificar `generate_mock_movements`, revisa sus consumidores y los tests. Los endpoints actuales lo invocan con `seed=42` y los tests esperan 360 movimientos ordenados.
- No confundas `frontend/src/lib/mock-data.ts` con la fuente actual del dashboard: `App.tsx` obtiene los movimientos mediante `fetch` desde `/api/metrics`.
- No trates el texto `2024 - Full Year` de la interfaz como prueba del periodo real de la API. Las fechas generadas por el backend dependen de `date.today()` y `_year_for_month()`.
- Respeta los scripts existentes de `frontend/package.json` (`dev`, `build`, `lint`, `preview`, `test`, `test:watch` y `test:coverage`) al cambiar el flujo de desarrollo.
- No añadas servicios o dependencias por defecto: el repositorio declara actualmente dos servicios y no muestra una base de datos configurada.

## Evidencia y riesgo

- Los servicios, nombres, volúmenes, puertos y `depends_on` están en `docker-compose.yml`.
- El frontend arranca Vite en `0.0.0.0:5173` desde `frontend/Dockerfile`; el backend arranca debugpy en `5678` y Uvicorn en `0.0.0.0:8000` desde `backend/Dockerfile`.
- El proxy `/api` hacia `http://backend:8000` está en `frontend/vite.config.ts`.
- `App.tsx` hace `fetch` de `/api/metrics`; las demás rutas se definen en `backend/app/routes.py`, pero no son llamadas por la aplicación actual.
- `generate_mock_movements(seed=42)` y la generación de 360 movimientos están en `backend/app/routes.py` y `backend/tests/test_routes.py`.
- El dataset alternativo está en `frontend/src/lib/mock-data.ts`; el consumo actual de la API está en `frontend/src/App.tsx`.
- Los scripts están en `frontend/package.json`; la ausencia de un servicio de base de datos en Compose está en `docker-compose.yml`.

Ignorar estas reglas puede dejar contenedores incomunicados, romper peticiones `/api`, desalinear puertos publicados y procesos internos, alterar resultados financieros o dar una falsa sensación de cobertura al modificar un dataset que la UI no usa.
