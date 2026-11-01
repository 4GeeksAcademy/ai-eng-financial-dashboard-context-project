# contratos-de-rutas-backend (P2)
**Prioridad:** alta
**Alcance:** `backend/app/main.py`; `backend/app/routes.py`
**Regla:** DEBES registrar toda ruta nueva en el router de `backend/app/routes.py` y declarar `response_model` Pydantic para toda ruta `/api/metrics*` nueva; NO DEBES crear rutas en `main.py`. `/health` es la única excepción actual.
**Justificación:** C2, C3, R1; `backend/app/main.py:14` — `app.include_router(router)`; `backend/app/routes.py:22` — `class FinancialMovement(BaseModel):`; `backend/app/routes.py:94` — `def generate_mock_movements(seed: int | None = None) -> list[FinancialMovement]:`; `backend/app/routes.py:243` — `@router.get("/health")`; `backend/app/routes.py:248` — `@router.get("/api/metrics", response_model=list[FinancialMovement])`.
**Verificación:** `grep -n "@router.get" backend/app/routes.py | grep -v "response_model"` (esperado: una sola coincidencia, la ruta /health; hoy en la línea 243); `grep -c "@router.get" backend/app/routes.py` (esperado: 9 antes del cambio; +1 por cada ruta nueva); `grep -c "response_model=" backend/app/routes.py` (esperado: 8 antes del cambio; +1 por cada ruta /api/metrics* nueva).
**Línea base:** línea 243; 9 decoradores; 8 modelos de respuesta.
