# Verificación y pruebas

## Propósito
Evitar dar por válida una modificación por una prueba que solo cubre la forma de la respuesta o que no se ejecutó.

## Ámbito
Cambios en cálculos financieros, fechas, endpoints, filtros y carga de datos.

## Evidencia del repositorio
- `frontend/package.json` declara `test`, `lint` y `build`; las pruebas de cálculos están en `frontend/src/lib/financial-utils.test.ts`.
- `backend/tests/test_routes.py` cubre helpers y endpoints con FastAPI `TestClient`.
- `test_metrics_comparison_returns_delta_fields` usa fechas fijas y solo comprueba nombres de campos, mientras el generador usa el calendario actual.

## Instrucciones para el agente
- Elige la comprobación existente más cercana al comportamiento cambiado; no infieras que el cálculo es correcto solo porque el JSON tenga las claves esperadas.
- Para comparaciones de períodos, comprueba que las fechas de la consulta intersectan los datos generados y valida los importes, no solo el esquema.
- Separa validación de frontend y backend; informa qué comandos se ejecutaron y sus resultados. No declares una prueba superada si no se ejecutó.

## Comprobaciones antes de finalizar
- Frontend: desde `frontend/`, usa `npm test -- src/lib/financial-utils.test.ts` para cálculos, `npm run lint` para lint y `npm run build` para TypeScript/build, según el alcance.
- Backend: desde `backend/`, usa `pytest tests/test_routes.py` para rutas y lógica cubierta.
- Si el caso no está cubierto por una prueba existente, declara esa limitación; no atribuyas cobertura no observada.