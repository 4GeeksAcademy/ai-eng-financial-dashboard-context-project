# API y determinismo del backend

**Nombre:** API y determinismo del backend  
**Alcance:** Cambios en `backend/app/` que afecten rutas, validación, CORS o generación de datos.

**Justificación:** `routes.py` define los modelos de respuesta, endpoints y generador simulado en el mismo módulo. La generación aislada con `random.Random(seed)` evita compartir estado entre llamadas. `main.py` obtiene una allowlist CORS del entorno; el valor local predeterminado es `http://localhost:5173`.

## Guía específica del proyecto

- Mantén los parámetros y respuestas de cada endpoint tipados y validados con los modelos Pydantic de `backend/app/routes.py`; al cambiar el contrato, actualiza `frontend/src/lib/financial-types.ts` y las pruebas de rutas.
- Configura `CORS_ALLOWED_ORIGINS` como lista separada por comas para permitir solo los orígenes requeridos. Compose usa por defecto `http://localhost:5173`; no sustituyas la allowlist por `allow_origins=["*"]` con credenciales habilitadas.
- Para reproducir los movimientos de una solicitud, usa una instancia local de `random.Random(seed)` en vez de cambiar el estado aleatorio global con `random.seed(seed)`.
- Si cambias la generación o el calendario de los datos, conserva una semántica explícita para las fechas: actualmente `generate_mock_movements` deriva los años de `date.today()`.

**Evidencia del repositorio:** `backend/app/main.py`, `backend/app/routes.py`, `backend/tests/test_routes.py` y `frontend/src/lib/financial-types.ts`.

## Validación práctica

- `test_generate_mock_movements_is_reproducible_without_mutating_global_random` comprueba repetibilidad y aislamiento del RNG global.
- Las pruebas `test_cors_preflight_allows_configured_frontend_origin` y `test_cors_preflight_rejects_unconfigured_origin` verifican la allowlist.
- Ejecuta `pytest -q backend/tests` desde la raíz para validar rutas y contratos.