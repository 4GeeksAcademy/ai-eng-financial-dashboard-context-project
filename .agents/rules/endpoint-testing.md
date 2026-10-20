# T1: Probar contratos y filtros de endpoints

**Alcance:** Cualquier alta o cambio de ruta en `backend/app/routes.py`; pruebas en `backend/tests/test_routes.py`.

**Justificación:** La suite existente comprueba status, respuestas y filtros de `/health`, `/api/metrics` y rutas analíticas.

**Guía accionable:**
- Para cada ruta, prueba status y forma de respuesta; para parámetros, comprueba que el resultado respeta el filtro.
- Añade casos límite relevantes, como límites de fechas inclusivos, parámetros inválidos y colecciones vacías.
- Ejecuta `pytest` desde `backend/` con las dependencias de `backend/requirements.txt` instaladas y registra si la suite no pudo ejecutarse; no informes tests como aprobados si no se ejecutaron.