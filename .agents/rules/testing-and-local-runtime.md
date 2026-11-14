# Pruebas y ejecución local

**Nombre:** Pruebas y ejecución local  
**Alcance:** Cambios de comportamiento en frontend/backend y cambios en el arranque con Docker Compose.

**Justificación:** Las pruebas están separadas por responsabilidad: `backend/tests/test_routes.py` cubre API, filtros y CORS; `frontend/src/lib/financial-utils.test.ts` cubre agregaciones y formatos. Compose ahora espera el healthcheck de `/health` antes de iniciar el frontend; `App.tsx` sigue sin reintentar si la API deja de responder después del arranque.

## Guía específica del proyecto

- Añade pruebas junto a la suite propietaria del comportamiento: rutas y filtros en `backend/tests/test_routes.py`; lógica financiera del cliente en `frontend/src/lib/financial-utils.test.ts`.
- Para cambios en fechas, prueba límites de mes y de año; para cambios en el contrato, prueba tanto la respuesta de FastAPI como la transformación usada por React.
- Conserva en `docker-compose.yml` el healthcheck de `backend` y la condición `service_healthy` del frontend. Esto cubre el arranque con Compose; si cambias la carga de datos en `App.tsx` o soportas reinicios posteriores de la API, define y prueba la recuperación del cliente.
- Comandos disponibles: desde `frontend/`, `npm test`, `npm run lint` y `npm run build`; desde `backend/`, `pytest`.

**Evidencia del repositorio:** `docker-compose.yml`, `frontend/src/App.tsx`, `frontend/package.json`, `frontend/src/lib/financial-utils.test.ts` y `backend/tests/test_routes.py`.

## Validación práctica

- Valida el YAML con `docker compose config --quiet`.
- Para comprobar el arranque, ejecuta `docker compose up --build -d`, confirma que `backend` queda `healthy` y que `GET /health` responde `200`; después detén el stack con `docker compose down`.
- Ejecuta `npm test`, `npm run lint` y `npm run build` en `frontend/`, y `pytest` en `backend/`.