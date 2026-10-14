# Skills usage evidence

## Purpose
Registro de skills que influyeron efectivamente en el trabajo de este repositorio. Una skill creada o disponible no se considera automáticamente usada. Se conservan separadas la consulta, la aplicación y el resultado.

## Evidence records

### Current exercise — compliance audit against specification-driven dashboard brief

- **Skill:** `financial-dashboard` — [`.agents/skills/financial-dashboard/SKILL.md`](../.agents/skills/financial-dashboard/SKILL.md)
- **Guidance applied:** Reviewed repository rules/memory, preserved existing user changes, traced API fields to backend handlers, kept scope in `frontend/specs/`, and validated types without changing runtime or backend.
- **Task/phase:** Audit and correction of the three-functionality specification exercise, 2026-10-09.
- **Files affected:** `frontend/specs/api-types.ts`, new `frontend/specs/param-types.ts`, `frontend/specs/components.md`, `frontend/specs/README.md`, and this evidence record. No React/runtime, backend, dependency, configuration, or commit changes.
- **Evidence:** Existing `/api/metrics` accepts optional date bounds and feeds the current dashboard; `/api/metrics/summary` provides grouped `income`/`outcome`; `/api/metrics/alerts` uses an accumulated baseline rather than the PM's three-period moving average; `/api/metrics/facets` returns global categories, not categories filtered by group. These were verified against `backend/app/routes.py`. The server at `localhost:8000` was stopped during this turn; an attempted live OpenAPI request failed, and importing FastAPI locally failed because the dependency is not installed. The earlier exercise had a successful live OpenAPI inspection on the same date.
- **Corrections:** Added exact response aliases (`FacetsResponse`, `AlertEntry`, `AlertsResponse`, `CategoryEntry`, `TopCategoriesResponse`) and query interfaces (`DateRangeFilter`, `AlertsParams`, `TopCategoriesParams`) with JSDoc for every property. Specified the existing-dashboard date filter, a summary-based three-calendar-month alert derivation, a new `/comparison` page, group-income percentages, and a two-total B2B/B2C chart. Documented that facets cannot return per-group category lists.
- **Verification:** `npx --no-install tsc --noEmit` passed (exit 0); strict targeted TypeScript compile of `specs/api-types.ts` and `specs/param-types.ts` passed (exit 0); `git diff --check` passed; editor diagnostics reported no errors; static checks passed for required names, no `any`/`object`, 12 README sections, edge cases and relative links. Build/lint/tests were not run because this task only changed specification/type files. No commit was created.
- **Result:** Deliverables match the requested documentation scope, with the two API mismatches called out and implementation-ready resolutions documented. Live `/docs` could not be rechecked in this turn.

### Current exercise — tech-lead audit of dashboard specifications

- **Skill:** `financial-dashboard` — [`.agents/skills/financial-dashboard/SKILL.md`](../.agents/skills/financial-dashboard/SKILL.md)
- **Purpose / guidance applied:** Se aplicó trazabilidad de requisitos al OpenAPI/backend, separación entre contrato wire y propuestas UI, preservar alcance documental, distinguir errores de arrays vacíos y validar antes de aprobar.
- **Task/phase:** Auditoría de aprobación previa a implementación, 2026-10-09.
- **Files affected:** `frontend/specs/api-types.ts`, `frontend/specs/components.md`, `frontend/specs/README.md`, y este registro. No se modificaron runtime, backend, configuración ni se creó commit; se preservaron cambios preexistentes.
- **Evidence:** OpenAPI vivo `http://localhost:8000/openapi.json` inspeccionado para rutas, parámetros, nulabilidad, required, defaults y response models. Se verificó sum(summary income) frente a Top income en mock vivo: B2B 615540.72/615540.72 y B2C 642606.15/642606.15; esto sustenta factibilidad de una derivación, no aprobación PM ni garantía de datos futuros.
- **Verification:** `cd frontend && npx --no-install tsc --noEmit` terminó con código 0. El `tsconfig.app.json` solo incluye `src`, por eso se ejecutó también `npx --no-install tsc --ignoreConfig --noEmit --strict --skipLibCheck --target ES2023 --module ESNext --moduleResolution bundler specs/api-types.ts` (código 0). `git diff --check` pasó. Se verificaron 12 secciones numeradas, 5/7/4 casos de borde en fechas/alertas/B2B-B2C y 16 enlaces relativos presentes. No se ejecutaron build/lint/tests porque solo se tocaron especificaciones/tipos declarativos.
- **Result:** Tipos wire centralizados en `api-types.ts`; README/components usan los aliases compartidos y se aclaró required/nullability de comparison, rango invertido, baseline alerta, cardinalidad del Top, y propuesta de derivar porcentajes/gráfico desde summary. Pendientes PM: política de fechas, baseline móvil vs acumulado, umbral, denominador/redondeo/cero/divisa y métrica/ejes del gráfico. Sin commit.

### Current exercise — data contract specification

- **Skill:** `financial-dashboard` — [`.agents/skills/financial-dashboard/SKILL.md`](../.agents/skills/financial-dashboard/SKILL.md)
- **Purpose / guidance applied:** Se consultó y aplicó el flujo de trabajo de especificación: mantener el alcance documental, trazar requisitos a OpenAPI/backend/frontend, etiquetar discrepancias como pendientes, no tocar runtime y validar enlaces/consistencia antes de implementar.
- **Task/phase:** Contrato de datos para filtro de fechas, alertas y comparación B2B/B2C, 2026-10-09.
- **Files affected by this exercise:** [`frontend/specs/README.md`](../frontend/specs/README.md) y este registro. No se modificaron componentes runtime ni backend. Se preservaron cambios preexistentes de la rama.
- **Verification evidence:** `git diff --check` pasó. Se verificaron 12 secciones numeradas, casos límite de las tres funcionalidades y enlaces relativos existentes; no se ejecutaron build, lint ni tests porque solo se documentó el contrato. OpenAPI vivo consultado; `frontend/specs/api-types.ts` y la matriz aprobada referida por PM no estaban presentes.
- **Result:** Especificación creada, con tipos de query y respuesta documentales trazados al contrato observado, límites/defaults y decisiones pendientes (baseline tres periodos, denominador porcentual, divisa y política de fechas). No se creó `api-types.ts` ni se hizo commit.

### Current exercise — dashboard component specification

- **Skill:** `financial-dashboard` — [`.agents/skills/financial-dashboard/SKILL.md`](../.agents/skills/financial-dashboard/SKILL.md)
- **Purpose:** Guiar la especificación de funcionalidades del dashboard financiero usando evidencia del contrato real y separando datos confirmados de decisiones pendientes.
- **Why applied:** La tarea requiere especificar componentes financieros y contrastar requisitos con el estado del frontend y la API.
- **Task/phase:** Documento agnóstico de componentes para filtros de fechas, alertas de egresos y comparativa B2B/B2C, 2026-10-09.
- **Concrete guidance applied:** Se revisaron fuentes existentes y contratos reales; se mantuvieron cálculos/reglas financieras fuera de una propuesta de implementación de UI; se señalaron explícitamente discrepancias y datos no presentes en el API en vez de inventar contratos.
- **Files affected by this exercise:** [`frontend/specs/components.md`](../frontend/specs/components.md) y este registro de evidencia. No se modificaron frontend runtime ni backend en esta tarea.
- **Verification evidence:** `git diff --check` pasó; siete enlaces relativos del documento apuntan a rutas existentes; se verificó presencia de las secciones A/B/C, fechas de un solo extremo y estados vacíos de alertas y de ambos grupos. No se ejecutaron build, lint ni tests porque el cambio de esta tarea es documentación.
- **Result:** Documento creado y validado estructuralmente. `frontend/specs/api-types.ts` no existe en el workspace, por lo que el documento distingue tipos derivados del OpenAPI vivo de tipos TypeScript importables y deja esa fuente como pendiente.

### Current exercise — create and document a project skill

- **Skill:** `financial-dashboard` — [`.agents/skills/financial-dashboard/SKILL.md`](../.agents/skills/financial-dashboard/SKILL.md)
- **Purpose:** Guiar la exploración, especificación, implementación y validación del dashboard financiero de este repositorio.
- **Why applied:** Este ejercicio pide crear una skill específica del dashboard y comprobar su formato, rutas y consistencia con las reglas locales.
- **Task/phase:** Ejercicio de reutilización de conocimiento, objetivos A–C, 2026-10-09.
- **Concrete guidance applied:** Tras crear la skill, consulté sus pasos de exploración y de distinción de uso real, verifiqué fuentes/rutas ya revisadas y separé su uso actual de los cambios que la precedieron. La skill no se atribuye cambios previos a su creación.
- **Files affected by this exercise:** [`.agents/skills/financial-dashboard/SKILL.md`](../.agents/skills/financial-dashboard/SKILL.md) y este documento. La creación y verificación se ejecutan con esta tarea; no se alteraron componentes del dashboard en este ejercicio.
- **Verification evidence:** La skill existe bajo la estructura documentada por `README.md` y `README.es.md` como `.agents/skills/<nombre>/SKILL.md`; frontmatter YAML con `name` y `description`; los enlaces/rutas a archivos descritos se verifican en la validación final de esta tarea. La skill fue leída después de su creación y sus instrucciones de comprobación documental se aplicaron al crear este registro.
- **Result:** Parcial. Creada y aplicada a esta tarea, con rutas y formato verificados. No se ejecutó una implementación funcional del dashboard ni una segunda validación completa de build/lint/tests en este ejercicio; esos resultados pertenecen a la iteración previa, no a la skill recién creada.

### Previous exercise — metadata, accessibility, and build corrections

- **Skills actually used:** Ninguna identificable.
- **Purpose / reason:** El registro disponible muestra que se inspeccionaron las reglas `.agents/rules/` y el estado del repositorio, pero no existía ninguna skill bajo `.agents/skills/` al iniciar ese ejercicio.
- **Task/phase:** Corrección de metadatos, accesibilidad y validación del frontend, anterior a este ejercicio.
- **Concrete changes documented elsewhere:** título/descripción en `frontend/index.html`; semántica de encabezados en `frontend/src/components/ui/card.tsx`; estado de carga y alertas en `frontend/src/App.tsx`; estados vacíos y capa accesible en los dos gráficos; actualización de `memory-bank/current-state.md`; creación de `.agents/rules/11-evidencia-de-skills.md`.
- **Files affected:** Los archivos anteriores constan en el `git status`/resumen de la iteración previa. No se atribuyen a `financial-dashboard`, que todavía no existía.
- **Verification evidence recorded at that time:** `npm ci`, `npm run build`, `npm run lint`, `npm test` (5 pruebas) y `git diff --check` se reportaron ejecutados. La memoria también registra advertencias de chunk >500 kB, 13 vulnerabilidades de npm y que no hubo prueba manual de contraste/lector de pantalla.
- **Result:** Completado para esas correcciones, según el informe anterior. No fueron cambios producidos por una skill.

## Classification

- **Applied in current exercises:** `financial-dashboard` — aplicada en la creación/documentación de la skill y en la especificación de componentes.
- **Created but not retroactively applied:** `financial-dashboard` no produjo cambios del ejercicio anterior.
- **Consulted/applied rules (not skills):** archivos de `.agents/rules/` y `AGENTS.md`. Son reglas/instrucciones del repositorio, no skills.
- **Unavailable:** Ninguna skill estaba disponible en `.agents/skills/` al comenzar el ejercicio de correcciones anterior.
