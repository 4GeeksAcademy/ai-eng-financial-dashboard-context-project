# Reglas de testing

## Nombre

Escribir pruebas deterministas que comprueben resultados financieros y contratos observables.

## Alcance

`frontend/src/**/*.test.ts`, `backend/tests/**` y cambios de lógica o rutas en `frontend/src/**` y `backend/app/**`.

## Justificación

El frontend usa Vitest: `financial-utils.test.ts` comprueba valores numéricos, formatos, meses cruzando años y el caso sin ingresos. El backend usa pytest y `TestClient` en `backend/tests/test_routes.py`. El generador calcula fechas respecto a `date.today()`, mientras una prueba de comparación usa marzo de 2025 y comprueba solo la forma de la respuesta. `generate_mock_movements` llama actualmente a `random.seed`, que cambia el estado aleatorio global. `build_metrics_facets` accede al primer y último elemento y no tiene una prueba para colecciones vacías.

## Instrucciones para agentes

- Para fórmulas o agregaciones frontend, añade o ajusta pruebas Vitest con entradas controladas y aserciones de resultados numéricos; incluye los límites relevantes del cambio.
- Para rutas backend, prueba el contrato y filtros con `TestClient`. Cuando la respuesta contenga cálculos, verifica valores además de claves y tipos.
- No bases pruebas de fechas en un año fijo si el código depende de `date.today()`. Usa datos/fechas controlados para probar cálculos y deriva las fechas válidas de la respuesta cuando se pruebe el generador actual.
- Si modificas el generador de movimientos, usa una instancia local `random.Random(seed)` en lugar de cambiar la semilla global y prueba tanto la repetibilidad como la ausencia de efectos sobre el generador aleatorio global.
- Antes de cambiar `build_metrics_facets`, define el resultado esperado para una entrada vacía y añade una prueba que fije ese comportamiento.

## Comprobación

Ejecuta `npm test` desde `frontend/` para Vitest y `pytest` desde `backend/` para pytest. Confirma que las nuevas pruebas fallan ante un resultado incorrecto pertinente y pasan con la implementación correcta; no sustituyas las aserciones de valores por comprobaciones solo de forma.