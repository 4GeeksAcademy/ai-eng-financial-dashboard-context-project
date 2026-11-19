# Regla: Backend API (FastAPI)

**Alcance:** `backend/app/**`, `backend/tests/**`.
**Origen:** R-1, R-2, R-11 · hallazgos H-1, H-2, H-3, H-13, H-17 (`practicas.md`).

## Por qué
Todo el backend vive en `backend/app/routes.py` con un patrón fijo (mock → filtro → función pura → modelo
Pydantic). Romper ese patrón o el mock rompe los 15 tests de `backend/tests/test_routes.py`, que asumen
`seed=42` y `len(movements) == 360`.

## Qué hacer
1. **Rutas nuevas** en `routes.py` con `@router.get("/api/metrics/<recurso>", response_model=...)`.
   Prefijo `/api` obligatorio: el proxy de Vite solo reenvía `/api` (`frontend/vite.config.ts`).
   Excepción existente: `/health`.
2. **Forma del handler** (copiar de `get_metrics_summary`):
   ```python
   movements = generate_mock_movements(seed=42)
   if business_type is not None:
       movements = [m for m in movements if m.business_type == business_type]
   filtered = filter_movements(movements, start_date, end_date, category, operation_type)
   return <funcion_pura>(filtered, ...)
   ```
   La agregación va en una función pura de módulo (sin `Query`, sin I/O), testeable directamente.
3. **Tipos**: parámetros acotados con los `Literal` existentes (`OperationType`, `Category`,
   `BusinessType`, `GroupBy`) y límites con `Query(ge=..., le=...)`. Nunca `str` libre para un enum.
4. **No tocar** `seed=42`, el bucle 12 × 30 de `generate_mock_movements` ni `_year_for_month` sin
   actualizar los tests afectados en el mismo commit.
5. **Tests**: cada ruta o función pura nueva añade al menos un test en `backend/tests/test_routes.py`
   usando el `client = TestClient(app)` del archivo.
6. **Seguridad**: no ampliar CORS (`main.py`), no publicar puertos nuevos en `docker-compose.yml`.
   Si la tarea es de despliegue, señalar que `allow_origins=["*"]` y el puerto `5678` (debugpy) deben cerrarse.

## Comprobar
```bash
docker compose exec backend python -m pytest -q
curl -s localhost:8000/openapi.json | python3 -c "import json,sys;print(list(json.load(sys.stdin)['paths']))"
```

## Ejemplos
- ✅ `GET /api/metrics/categories/top` con `limit: int = Query(default=5, ge=1, le=20)` y `build_top_categories` pura.
- ❌ `GET /top` que calcula dentro del handler con `random.seed()` propio y acepta `operation_type: str`.
