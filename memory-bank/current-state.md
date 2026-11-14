# Estado actual

## Estado verificado

- El proyecto contiene un frontend React/Vite y un backend FastAPI orquestados por Compose; fuentes principales y comandos se resumen en [`tech-stack.md`](./tech-stack.md).
- El backend produce datos financieros simulados y dispone de endpoints generales y segmentados B2B/B2C. El dashboard mostrado consume `/api/metrics`. Fuentes: [`backend/app/routes.py`](../backend/app/routes.py), [`frontend/src/App.tsx`](../frontend/src/App.tsx).
- La memoria no tiene una estructura obligatoria definida por [`AGENTS.md`](../AGENTS.md); este proyecto indica consultar `memory-bank` si existe. No se encontraron archivos en `.agents/skills/` al crear estos documentos.

## Trabajo de las fases anteriores

- **Fase 1:** creado el handover con arquitectura, fuentes, comandos y la discrepancia del periodo. Ver [`docs/phase1-handover.md`](../docs/phase1-handover.md).
- **Fase 2:** documentadas convenciones, riesgos priorizados y propuestas en [`docs/phase2-engineering-findings.md`](../docs/phase2-engineering-findings.md).
- **Fase 3:** existen reglas de frontend, backend y proyecto en [`.agents/rules/`](../.agents/rules/); [`AGENTS.md`](../AGENTS.md) instruye revisarlas. `verification.md` registra los resultados reportados por el operador y las limitaciones de descubrimiento.
- **Prueba B2C:** [`backend/tests/test_routes.py`](../backend/tests/test_routes.py) contiene una prueba de filtros combinados para el endpoint B2C, además de la cobertura previa.

## Pruebas recientes

Ejecutadas durante esta revisión en los servicios Docker que ya estaban activos:

- `docker compose exec -T backend pytest`: **16 aprobadas**, una `StarletteDeprecationWarning` sobre el uso de `httpx` con `starlette.testclient`.
- `docker compose exec -T frontend npm test`: **5 aprobadas**.

No se ejecutaron build, lint ni comprobaciones de endpoints en esta revisión. Las comprobaciones previas del operador, incluidos Compose, dashboard y respuestas HTTP, se registran separadamente en [`verification.md`](../verification.md); no se atribuyen aquí al agente.

## Git y servicios al iniciar esta actualización

- Antes de crear estos documentos, `git status --short --branch` mostró `main...origin/main [ahead 3]` sin cambios de worktree.
- En ese momento `docker compose ps` mostró los servicios `frontend` y `backend` activos. Esto es una observación puntual, no garantía de su estado posterior.
- Los tres documentos de memoria son cambios de esta actualización; no se hizo commit.

## Problemas conocidos, riesgos y decisiones pendientes

- **Hallazgo técnico verificado:** el encabezado de [`frontend/src/App.tsx`](../frontend/src/App.tsx) fija `2024 - Full Year`. El generador de [`backend/app/routes.py`](../backend/app/routes.py) asigna cada mes a un año mediante `date.today()` y recorre los doce meses. La etiqueta no representa ese intervalo móvil. No está decidido cuál es el periodo de negocio correcto. Más contexto: [`docs/phase1-handover.md`](../docs/phase1-handover.md) y [`docs/phase2-engineering-findings.md`](../docs/phase2-engineering-findings.md).
- **Riesgo documentado:** el contrato de datos está definido por separado en TypeScript y Pydantic; la respuesta se parsea como JSON sin validación runtime en el frontend. Ver `.agents/rules/frontend.md` y `docs/phase2-engineering-findings.md`.
- **Riesgo documentado:** el generador usa `random.seed`, que afecta el estado aleatorio global. No se midió impacto de concurrencia; no se requiere refactor si la tarea no toca generación. Ver `.agents/rules/backend.md`.
- **Riesgo documentado:** filtros B2B/B2C se implementan en rutas separadas; mantener pruebas para ambos al cambiar filtros. Ver [`backend/app/routes.py`](../backend/app/routes.py), [`backend/tests/test_routes.py`](../backend/tests/test_routes.py).
- **Pendiente de verificación:** no se ha demostrado la carga automática de `.agents/rules/*.md` por Copilot sin la instrucción explícita de `AGENTS.md`; `verification.md` explica la limitación.
- **Advertencia:** la prueba backend sigue mostrando deprecación de Starlette; no se cambió ninguna dependencia.

## Próximas tareas recomendadas

1. Confirmar con producto el periodo financiero esperado antes de cambiar fechas o etiqueta.
2. Para cambios del contrato API, actualizar y probar conjuntamente ambos modelos.
3. Al tocar filtros, comprobar paridad de cobertura B2B/B2C.
4. Evaluar la advertencia de Starlette dentro de una tarea de dependencias, no como parte de cambios no relacionados.
5. Si se necesita afirmar descubrimiento automático de reglas, realizar y conservar una prueba reproducible en un chat nuevo de Copilot.

Estas tareas son recomendaciones, no requisitos de implementación ya aprobados.

## Mantenimiento de la memoria

Actualiza los documentos afectados después de cambios relevantes de producto, arquitectura, reglas o estado. Verifica rutas y resultados contra el repositorio y ejecuciones reales; marca claramente hechos, inferencias y decisiones pendientes. Evita copiar aquí el detalle que ya mantienen los documentos de Fase 1 y 2: enlázalos y conserva en `current-state.md` solo el estado vigente.
