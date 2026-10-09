# Regla: backend-tests

**Alcance:** `backend/tests/`.
**Justificación:** F16 y F17. `test_metrics_comparison_returns_delta_fields` usa fechas fijas (2025-03) y solo mira claves, así que hoy pasa sin probar nada.

## Qué hacer

- Ejecuta los tests desde `backend/`: `cd backend && pytest`. `conftest.py:5-7` añade esa carpeta al `sys.path`. Con Docker: `docker compose exec backend pytest` (`pytest`, `pytest-cov` y `httpx` están en `requirements.txt`).
- Usa el `client = TestClient(app)` compartido (`test_routes.py:9`).
- Obtén las fechas de los datos, no las escribas: el patrón correcto es el de `test_routes.py:39` (`first_date` de la primera respuesta de `/api/metrics`). Para un rango, usa elementos de esa misma lista.
- Cada test debe poder fallar: si el endpoint calcula algo, comprueba valores o relaciones entre valores, no solo los nombres de las claves. Para confirmarlo, rompe la lógica a propósito (por ejemplo, suma en vez de restar en `calculate_net_value`) y comprueba que el test falla; luego deshaz el cambio.
- Para `/api/metrics/comparison` hace falta un periodo anterior con datos. El periodo anterior dura lo mismo y termina el día antes de `start_date` (`previous_end` y `previous_start` en `get_metrics_comparison`). Con `start_date` en la mitad de la lista de `/api/metrics` y `end_date` en el último elemento, ambos periodos tienen datos.
- Para validar el valor de un endpoint, vuelve a calcularlo desde otra respuesta (por ejemplo, el neto de `/api/metrics` con los mismos filtros) en lugar de copiar un número.
- Si el test necesita datos, comprueba primero `assert payload`, como hacen los tests existentes.
- Nombre del test: `test_<endpoint>_<comportamiento>`.

## Qué no hacer

- No uses años, meses ni días concretos en parámetros ni en `assert`.
- No dependas del orden de ejecución ni de datos de otro test.
