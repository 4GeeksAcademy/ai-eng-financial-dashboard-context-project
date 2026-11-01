---
name: add-metrics-route
description: Use when adding a /api/metrics* endpoint to the backend.
---

1. Lee `.agents/rules/contratos-de-rutas-backend.md:4`, `.agents/rules/generacion-y-periodo-de-datos.md:4` y `.agents/rules/pruebas-junto-al-comportamiento.md:4`.
2. Abre `backend/app/routes.py` y `backend/tests/test_routes.py`. Usa como ejemplo `backend/app/routes.py:248` — `@router.get("/api/metrics", response_model=list[FinancialMovement])`.
3. Declara el schema Pydantic junto a los modelos de `backend/app/routes.py:22` — `class FinancialMovement(BaseModel):`; registra el endpoint en el router de `backend/app/routes.py`, no en `backend/app/main.py`.
4. Si el endpoint necesita movimientos, usa `backend/app/routes.py:255` — `movements = generate_mock_movements(seed=42)` y conserva el comportamiento de generación fijado por P4.
5. Añade un test `test_*` en `backend/tests/test_routes.py`, siguiendo `backend/tests/test_routes.py:29` — `def test_health_endpoint_returns_ok():` y el comportamiento del nuevo endpoint.
6. Comprueba P2: `grep -n "@router.get" backend/app/routes.py | grep -v "response_model"` (una sola coincidencia, /health; hoy en la línea 243); `grep -c "@router.get" backend/app/routes.py` (9 antes de añadir la ruta; +1 por cada ruta nueva); `grep -c "response_model=" backend/app/routes.py` (8 antes de añadir la ruta; +1 por cada ruta /api/metrics* nueva).
7. Comprueba P6: `grep -c "^def test_" backend/tests/test_routes.py` y `grep -c "\bit(" frontend/src/lib/financial-utils.test.ts` (líneas base 15 y 5; actualiza el test de backend correspondiente).
8. Ejecuta `docker compose exec -T backend python -m pytest -q` (si los servicios no están levantados, `docker compose up -d` antes). Dentro del contenedor, porque el Python del Codespace no tiene `fastapi` (fila 56 de `verification.md`). Medido en la Fase 3: 15 passed, 1 warning, exit=0.
