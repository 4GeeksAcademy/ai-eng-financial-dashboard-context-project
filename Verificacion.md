# Verificación

## Datos y período

- La API genera 30 movimientos por mes para los 12 meses completos anteriores al mes actual. La semilla fija (`42`) hace reproducibles los movimientos para una misma fecha de ejecución; no fija el período entre fechas distintas.
- El dashboard calcula el período visible a partir de las fechas mínima y máxima de los movimientos que recibe. Una respuesta vacía muestra `No data`; si falla la petición, muestra `Unavailable`.
- El dashboard consume `GET /api/metrics`. También están disponibles `GET /api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b` y `/api/metrics/b2c`; no están conectadas al frontend actual.

## Ejecución

- Docker Compose: `docker compose up --build`. Vite reenvía `/api` a `http://backend:8000`, el nombre del servicio backend en Compose.
- Ejecución directa en el host: desde `backend/`, iniciar `python -m uvicorn app.main:app --reload --host 0.0.0.0`; desde `frontend/`, iniciar `VITE_API_PROXY_TARGET=http://localhost:8000 npm run dev`. El destino predeterminado del proxy sigue siendo `http://backend:8000` para Compose.

## Validaciones ejecutadas

- `cd frontend && npm test`: 7 pruebas pasaron.
- `cd frontend && npm run build`: compilación y comprobación de TypeScript completadas. Vite mostró advertencias sobre `__dirname` en la configuración y el tamaño de un chunk.
- `cd backend && pytest tests/test_routes.py`: 15 pruebas pasaron; se mostró una advertencia de deprecación de Starlette/httpx. Pytest se ejecutó en un entorno virtual temporal instalado desde `backend/requirements.txt`.
- Smoke test en host: con backend en `localhost:8000` y Vite configurado con `VITE_API_PROXY_TARGET=http://127.0.0.1:8000`, `GET http://localhost:5173/api/metrics` devolvió 360 movimientos, desde `2025-11-01` hasta `2026-10-28`.
- Las comprobaciones de período cubren rango de fechas y lista vacía. No se ejecutó una prueba de Docker Compose.
