# Regla: Testing y validación

## Alcance

Aplica a cambios funcionales de backend, frontend e integración entre ambas capas.

## Justificación basada en el repositorio

- `backend/tests/test_routes.py` usa FastAPI `TestClient` y cubre health check, filtros, orden y respuestas de endpoints.
- `frontend/src/lib/financial-utils.test.ts` prueba KPI, agrupación mensual y formateo.
- `backend/requirements.txt` incluye `pytest`; `frontend/package.json` define `npm test` (`vitest run`), `npm run build` y `npm run lint`.

## Guía específica del proyecto

1. Añade o actualiza una prueba cuando modifiques un comportamiento existente o agregues uno nuevo.
2. Desde la raíz del repo, ejecuta backend con `(cd backend && pytest)`.
3. Desde la raíz del repo, ejecuta frontend con `(cd frontend && npm test)`; ejecuta también `(cd frontend && npm run build)` para validar TypeScript y el bundle, y `(cd frontend && npm run lint)` si el cambio toca código fuente. Los subshells evitan que un `cd` deje la terminal en otra carpeta.
4. Para cambios que atraviesan contrato API y UI, valida ambas suites y el build del frontend.
5. En la entrega, indica qué comandos ejecutaste y si alguno falló o no se pudo ejecutar; no declares validaciones que no se hayan realizado.
