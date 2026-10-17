# Implementación de reglas de ingeniería

Este documento resume las reglas de trabajo añadidas para orientar cambios en frontend y backend. Las reglas documentan prácticas y riesgos observados; no implican que los problemas descritos en el código ya estén corregidos.

## Regla de frontend

Archivo: [.agents/rules/frontend.md](.agents/rules/frontend.md)

**Objetivo:** mantener coherentes los datos financieros y su presentación, separar los cálculos de la UI y prevenir errores de agregación por zona horaria.

**Alcance:** `frontend/src/**`, con énfasis en `App.tsx`, tipos financieros, utilidades, pruebas y componentes del dashboard.

**Reglas principales:**

- Alinear los tipos TypeScript con las respuestas de la API al cambiar contratos.
- Mantener cálculos y formateadores financieros como funciones puras en `src/lib`, con pruebas.
- Tratar `create_date` como fecha de calendario y cubrir el primer día del mes y los límites de año.
- Mostrar un período consistente con los datos; representar estados de carga y error.
- No asumir que `src/lib/mock-data.ts` alimenta el dashboard, que actualmente consulta `/api/metrics`.

**Base verificada:** [frontend/src/App.tsx](frontend/src/App.tsx) realiza la consulta y mantiene estados de carga/error; [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts) agrupa fechas mediante `new Date(...)` y getters locales; [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts) cubre cálculos y agregaciones, pero no el límite del primer día del mes. La regla incluye ejemplos correctos e incorrectos basados en estos patrones.

## Regla de backend

Archivo: [.agents/rules/backend.md](.agents/rules/backend.md)

**Objetivo:** mantener contratos explícitos, filtros uniformes y generación reproducible sin modificar estado global.

**Alcance:** `backend/app/**` y `backend/tests/**`, especialmente `app/routes.py` y `tests/test_routes.py`.

**Reglas principales:**

- Mantener los modelos Pydantic, los `response_model` y los valores de dominio restringidos mediante `Literal`.
- Reutilizar los helpers de filtrado y ordenamiento al añadir o modificar endpoints.
- Usar un generador aleatorio local para producir datos deterministas; no reiniciar el RNG global.
- Mantener los valores de dominio y actualizar pruebas cuando cambien contratos, filtros o generación.

**Base verificada:** [backend/app/routes.py](backend/app/routes.py) declara modelos y tipos del dominio, reutiliza `filter_movements` y `ensure_chronological_order`, y actualmente llama a `random.seed(seed)` en `generate_mock_movements`. [backend/tests/test_routes.py](backend/tests/test_routes.py) comprueba generación, orden, filtros y respuestas. La regla presenta ejemplos correctos e incorrectos anclados a ese código.

## Actualización de AGENTS.md

[AGENTS.md](AGENTS.md) indica ahora que:

- Antes de analizar o modificar frontend, se debe leer `.agents/rules/frontend.md`.
- Antes de analizar o modificar backend, se debe leer `.agents/rules/backend.md`.
- Si un trabajo afecta ambas áreas, se deben leer las dos reglas antes de empezar.

También conserva la guía general del proyecto: revisar instrucciones, skills y memoria del repositorio si existen; mantener alineados los contratos frontend/backend; preservar las reglas de dominio; no asumir que los riesgos conocidos están corregidos; y ejecutar únicamente las verificaciones pertinentes, sin declarar como pasadas las que no se hayan ejecutado.