# T2: Definir el resultado de agregaciones vacías

**Alcance:** Funciones de agregación que reciben listas, especialmente `build_metrics_facets` en `backend/app/routes.py`.

**Justificación:** `build_metrics_facets` ordena movimientos y accede a `ordered[0]` y `ordered[-1]`; una lista vacía produce `IndexError`.

**Guía accionable:**
- Antes de indexar una colección, define qué debe devolver la función si no hay elementos.
- Implementa ese contrato explícitamente (respuesta vacía, campos de fecha opcionales o error de dominio/HTTP, según el endpoint).
- Añade una prueba unitaria con lista vacía y una prueba de endpoint si esa entrada puede ocurrir por el contrato público.