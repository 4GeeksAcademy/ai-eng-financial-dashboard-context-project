# Regla: backend-api

**Alcance:** `backend/app/routes.py`, `backend/app/main.py`.
**Justificación:** F1, F2 y F8 de `docs/engineering-findings.md`. Todo el backend está en `routes.py`, con modelos pydantic y funciones puras. El filtro por `business_type` estaba copiado 4 veces más 2 variantes en `/b2b` y `/b2c`; la validación de la Fase 3 los unificó en `filter_by_business_type`.

## Qué hacer

- Añade los endpoints en `routes.py` sobre el `router` compartido (`@router.get(...)`). Todo endpoint lleva `response_model`; si devuelve una forma nueva, crea antes un modelo pydantic como `MetricsSummaryItem`.
- Los parámetros van con `Query(default=...)` y reutilizan los alias `OperationType`, `Category`, `BusinessType` y `GroupBy` (`routes.py:11-15`). No vuelvas a escribir las listas de valores.
- Claves JSON en `snake_case`; los importes son `float` redondeados con `round(valor, 2)`.
- Pon la lógica en una función pura (como `summarize_movements` o `detect_outcome_alerts`) y deja el cuerpo del endpoint en tres pasos: generar movimientos, filtrar, llamar a la función.
- Para filtrar usa `filter_movements` (fechas, categoría, tipo de operación) y `filter_by_business_type` (tipo de negocio; también lo usan `/b2b` y `/b2c`). Nunca pegues otra vez un bloque `if business_type is not None:` en un endpoint.
- Si necesitas un filtro nuevo, créalo como función pura junto a `filter_movements` y sigue el patrón de `filter_movements_by_date` y `filter_by_business_type`: si el filtro es `None`, devuelve la lista tal cual.
- Cada endpoint nuevo lleva su test en `backend/tests/test_routes.py` (ver `backend-tests.md`).

## Qué no hacer

- No crees un segundo módulo de rutas ni cambies las rutas existentes sin avisar: el frontend solo llama a `/api/metrics` (`frontend/src/App.tsx:16`).
- No cambies la forma de `FinancialMovement` (`routes.py:21-27`) sin actualizar `frontend/src/lib/financial-types.ts`.

## Cómo comprobarlo

`grep -c "if business_type is not None" backend/app/routes.py` debe dar `0`.
