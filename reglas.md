# reglas.md — Reglas propuestas (trazadas a hallazgos)

Cada regla cita al menos un hallazgo de [practicas.md](./practicas.md). Las reglas aceptadas se
implementan en `.agents/rules/` (columna "Archivo").

Reglas de la versión anterior descartadas: "no usar mocks en producción", "implementar JWT/OAuth2",
"middleware centralizado de errores", "documentar todo con docstrings". Son buenas prácticas genéricas o
roadmap, no restricciones que un agente pueda cumplir en una tarea pequeña de este repo sin rediseñarlo.

| ID | Regla propuesta | Hallazgos | Archivo |
|---|---|---|---|
| R-1 | Nuevos endpoints van en `backend/app/routes.py` bajo `/api/metrics...`, con `response_model` Pydantic, lógica en función pura y filtros reutilizando `filter_movements` | H-1, H-2 | `backend-api.md` |
| R-2 | No cambiar `seed=42`, el número de movimientos ni la lógica de fechas del mock sin actualizar los tests que dependen de él | H-3, H-13 | `backend-api.md` |
| R-3 | Un campo/enum nuevo o renombrado se cambia a la vez en `routes.py`, `financial-types.ts` y `frontend/specs/api-types.ts` | H-6, H-7 | `contratos-api-ui.md` |
| R-4 | Wire en snake_case, modelo de UI en camelCase; documentar si un valor es ratio o porcentaje antes de pasarlo a `formatPercent` | H-6, H-8 | `contratos-api-ui.md` |
| R-5 | Cálculos y formateo en `frontend/src/lib/financial-utils.ts` (funciones puras + test); los componentes solo presentan | H-4, H-13 | `frontend-dashboard.md` |
| R-6 | Fechas `YYYY-MM-DD` de la API se tratan como strings de calendario: nunca `new Date(isoDate)` + getters locales | H-10 | `frontend-dashboard.md` |
| R-7 | Ningún texto de UI fija periodos/años: se derivan de los datos | H-3, H-11 | `frontend-dashboard.md` |
| R-8 | Antes de dar una tarea por terminada, ejecutar pytest/vitest/lint/build **dentro de los contenedores** y reportar el resultado real | H-13, H-14, H-15 | `verificacion-y-commits.md` |
| R-9 | Commits: un objetivo por commit, mensaje con el *porqué*; registrar afirmaciones corregidas en `verification.md` | H-15 (sin CI, la revisión es manual) | `verificacion-y-commits.md` |
| R-10 | No usar `VITE_API_BASE_URL` en local; si se define, debe ser un origen completo (`http://host:puerto`) | H-16 | `frontend-dashboard.md` |
| R-11 | No ampliar CORS, debug ni exponer puertos nuevos; señalar H-17 en cualquier tarea de despliegue | H-17 | `backend-api.md` |
| R-12 | Contexto de agentes solo en `.agents/` y `memory-bank/`; actualizar `memory-bank/estado-actual.md` al cerrar una tarea que cambie gaps | H-18 | `verificacion-y-commits.md` |
