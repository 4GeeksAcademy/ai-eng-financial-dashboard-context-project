# Tests

Reglas derivadas de convenciones ya presentes en el repositorio. Cada una está respaldada por evidencia concreta, incluyendo ejecución real de las suites en esta sesión (`memory-bank/status.md`).

## Reglas

1. **Los tests del backend son de integración real contra `TestClient` (`app` completa). No mockees `generate_mock_movements` ni la capa HTTP en tests nuevos.**
   - Evidencia: `backend/tests/test_routes.py:9` (`client = TestClient(app)`) y sus 15 funciones `test_*`, verificadas con `pytest -q` → 15 passed en esta sesión.
   - Riesgo que evita: validado en esta sesión escribiendo un test temporal que mockeaba `app.routes.generate_mock_movements` con `unittest.mock.patch` — pytest lo aceptó y lo pasó sin ninguna queja (`1 passed`). Es decir: **nada impide técnicamente mockear** — es pura convención de estilo del archivo existente, no una regla forzada por pytest ni por ninguna configuración. Si mockeas, no rompes el build ni el CI (que no existe), pero rompes la consistencia del único patrón de test que sigue el archivo real.

2. **No modifiques ni elimines `backend/tests/conftest.py`. Los tests dependen de que inserte manualmente la raíz del proyecto en `sys.path` (no hay paquete instalado).**
   - Evidencia: `backend/tests/conftest.py:5-7`; ausencia de `pyproject.toml`/`pip install -e .`.
   - Riesgo que evita: validado en esta sesión comentando la inserción a `sys.path` y ejecutando los tests de dos formas. Con `python -m pytest -q` los 15 tests siguieron pasando (el flag `-m` ya añade el directorio actual a `sys.path` por su cuenta, haciendo el hack redundante en ese caso concreto). Pero con el binario `pytest -q` directo → `ModuleNotFoundError: No module named 'app'`, deteniendo la recolección de tests por completo. Conclusión real: el hack de `conftest.py` es imprescindible si algo invoca `pytest` sin el prefijo `python -m` (como suelen hacerlo herramientas de CI o extensiones de editor).

3. **Los tests de frontend van co-ubicados junto al código (`<archivo>.test.ts`), no en una carpeta `__tests__/`. Usa objetos de fixture inline, no librerías de generación de datos.**
   - Evidencia: `frontend/src/lib/financial-utils.test.ts` junto a `financial-utils.ts`; `sampleMovements` inline (`financial-utils.test.ts:11-33`); verificado con `vitest run` → 5 passed en esta sesión.
   - Riesgo que evita: romper el único patrón de test existente en frontend e introducir una dependencia nueva sin precedente.
