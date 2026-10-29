---
applyTo:
  - "backend/tests/**/*.py"
  - "frontend/src/**/*.test.ts"
  - "frontend/src/**/*.test.tsx"
  - "frontend/src/**/*.spec.ts"
  - "frontend/src/**/*.spec.tsx"
  - "backend/app/**/*.py"
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.tsx"
---

# Regla: pruebas enfocadas en contratos y casos límite

**Alcance:** Nuevas capacidades o cambios en endpoints backend, utilidades frontend y flujo de carga de la aplicación.

**Justificación basada en el repositorio:** `backend/tests/test_routes.py` usa `TestClient` y cubre respuestas de rutas, filtros, orden y varios agregados. `frontend/src/lib/financial-utils.test.ts` prueba cálculos y formato, pero no prueba `App.tsx`, el fetch ni los estados de error/carga.

**Guía específica del proyecto:**
- Para endpoints, comprueba status, forma de respuesta y filtros mediante `TestClient`, siguiendo `backend/tests/test_routes.py`.
- Para cálculos puros, añade casos a `financial-utils.test.ts` siguiendo el patrón Vitest existente; mantén los datos de prueba explícitos y deterministas.
- Cuando cambie la carga de `frontend/src/App.tsx`, cubre éxito, respuesta HTTP no exitosa y rechazo de red si la infraestructura de pruebas lo permite; no des por probado el comportamiento HTTP por tests de funciones utilitarias.
- Añade casos límite donde el código los hace relevantes: rango de fechas invertido, listas vacías en facets, neto previo cero en comparación y baseline cero en alertas.
- Si una prueba depende de la fecha actual, controla el reloj/fecha o evita afirmar un año fijo. `_year_for_month` depende de `date.today()`.
- Ejecuta la prueba específica del área afectada y usa los scripts ya declarados en `frontend/package.json` (`npm run test`, `npm run test:coverage`) o las pruebas backend del directorio `backend/tests/`.
