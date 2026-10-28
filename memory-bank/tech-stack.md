# Stack tecnológico

Las versiones y rangos siguientes se transcriben de los manifiestos; su presencia no demuestra que una instalación o compilación se haya ejecutado.

## Frontend

- React y React DOM `^19.2.4`; TypeScript `~6.0.2` (`../frontend/package.json`).
- Vite `^8.0.4`, con plugins de React y Tailwind CSS (`../frontend/package.json`, `../frontend/vite.config.ts`).
- Recharts `^3.8.1` para los gráficos y Vitest `^4.1.4` para las pruebas frontend (`../frontend/package.json`).
- Tailwind CSS `^4.2.2`; también están declarados ESLint, `typescript-eslint` y utilidades como `clsx`, `tailwind-merge` y `class-variance-authority` (`../frontend/package.json`).
- Scripts declarados: `dev`, `build`, `lint`, `preview`, `test`, `test:watch` y `test:coverage` (`../frontend/package.json`).

## Backend

- FastAPI y `uvicorn[standard]` son dependencias declaradas en `../backend/requirements.txt`.
- El código usa modelos Pydantic y `CORSMiddleware` (`../backend/app/routes.py`, `../backend/app/main.py`). Pydantic no aparece como dependencia directa separada en `requirements.txt`.
- Pytest, `pytest-cov` y `httpx` están declarados para pruebas; `debugpy` también está en `requirements.txt` (`../backend/requirements.txt`). El backend usa `TestClient` en `../backend/tests/test_routes.py`.
- `requirements.txt` no fija versiones para estas dependencias (`../backend/requirements.txt`).

## Ejecución y conexión

- Docker Compose define servicios `frontend` y `backend`, publica los puertos `5173` y `8000`, y publica `5678` para el backend (`../docker-compose.yml`).
- Vite configura el proxy `/api` hacia `http://backend:8000` (`../frontend/vite.config.ts`). El README documenta `docker compose up --build` como comando de inicio (`../README.es.md`, `../README.md`).

Las configuraciones anteriores se inspeccionaron estáticamente; no se afirma que los servicios se hayan iniciado o que el proxy haya sido probado.