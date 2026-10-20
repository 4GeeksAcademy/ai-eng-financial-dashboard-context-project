# A1: Sincronizar contratos de API

**Alcance:** Cambios en endpoints o modelos de `backend/app/routes.py` y en consumidores de `frontend/src/lib/financial-types.ts`.

**Justificación:** `FinancialMovement` está definido con campos `snake_case` en el backend y se replica en TypeScript; `backend/tests/test_routes.py` verifica formas de respuesta y filtros.

**Guía accionable:**
- Al cambiar un campo, tipo, valor permitido o parámetro, actualiza el modelo Pydantic, el tipo frontend y los tests afectados en el mismo cambio.
- Añade una prueba de contrato que compruebe el status y las claves relevantes de la respuesta.
- Conserva la forma JSON existente salvo que el cambio requiera explícitamente una migración coordinada.