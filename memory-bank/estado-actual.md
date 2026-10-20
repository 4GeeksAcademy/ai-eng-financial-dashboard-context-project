# Estado actual

- El HEAD observado es `6292fbd5e50c8cda5c3f53021e8b40f4bb63c4c4`, con asunto `docs: hallazgos de ingeniería y reglas propuestas`; el historial reciente también incluye `0d12e92` y `954f812`. Fuente: salida de `git log -5 --oneline` y `git log -1 --format=%H%n%s`.
- Antes de crear este banco de memoria, `git status --short` no imprimió cambios. Fuente: salida vacía de `git status --short`.
- La suite backend no pudo recolectarse: `pytest -q backend/tests/test_routes.py` terminó con `ModuleNotFoundError: No module named 'fastapi'`. Esto no confirma un fallo funcional de los tests. Fuente: salida del comando `pytest -q backend/tests/test_routes.py`.
- La suite frontend no se ejecutó: `npm --prefix frontend test` terminó con `sh: 1: vitest: not found`. Fuente: salida del comando `npm --prefix frontend test`.
- El encabezado del dashboard fija `2024 - Full Year`, mientras el generador de movimientos calcula años en función de `date.today()`. Fuente: `frontend/src/App.tsx`, `backend/app/routes.py`.
- El generador determinista llama a `random.seed(seed)`, que cambia el estado aleatorio global del proceso. Fuente: `backend/app/routes.py`.
- CORS está configurado con `allow_origins=["*"]` y `allow_credentials=True`. Fuente: `backend/app/main.py`.
- `build_metrics_facets` indexa el primer y último elemento de la lista ordenada sin un caso vacío explícito. Fuente: `backend/app/routes.py`.
- El frontend solicita `/api/metrics`; no se observan solicitudes a las otras rutas analíticas en el flujo de `App`. Fuente: `frontend/src/App.tsx`, `backend/app/routes.py`.