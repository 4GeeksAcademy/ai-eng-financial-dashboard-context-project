# Estado actual del proyecto

> Snapshot verificado en esta sesión, no un informe periódico automatizado. Las secciones "Qué funciona" y "Gaps conocidos" están respaldadas por archivo o por ejecución real (`docker compose up --build`, `pytest`, `vitest`, peticiones HTTP reales). La sección "Siguientes prioridades" es una recomendación razonada a partir de esos gaps, no un hecho verificable — se marca explícitamente como tal.
> Complementa a [`project-summary.md`](./project-summary.md), [`conventions.md`](./conventions.md) y [`stack.md`](./stack.md).
> Fecha de generación: 2026-09-04. Este archivo puede quedar desactualizado; antes de confiar en él, re-verificar contra el código y, si es posible, contra una ejecución real.

---

## ✅ Qué funciona (verificado con ejecución real en esta sesión)

| Área | Verificado | Evidencia |
|---|---|---|
| Arranque completo | `docker compose up --build` construye ambas imágenes y levanta ambos contenedores sin errores | log real de build/arranque; `docker ps` muestra `...-backend-1` y `...-frontend-1` con estado `Up` |
| Backend HTTP | `GET /health` → `200 {"status":"ok"}`; `GET /api/metrics` → `200` con JSON válido; `GET /docs` → `200` (Swagger UI) | peticiones `curl` reales contra `http://localhost:8000` en esta sesión |
| Frontend HTTP | `GET /` → `200` (SPA servida); `GET /api/metrics` vía proxy de Vite → `200` | peticiones `curl` reales contra `http://localhost:5173`; proxy definido en `frontend/vite.config.ts:11-15` |
| **Suite de tests backend** | `python -m pytest -q` dentro del contenedor → **15 passed**, 0 fallos | ejecución real en esta sesión (`docker exec ...-backend-1 python -m pytest -q`) |
| **Suite de tests frontend** | `npm run test` (Vitest) dentro del contenedor → **1 test file, 5 tests, todos passed** | ejecución real en esta sesión (`docker exec ...-frontend-1 npm run test`) |
| Cobertura funcional real de las 9 rutas | Los 15 tests de `backend/tests/test_routes.py` ejercitan las 9 rutas existentes (`/health`, `/api/metrics`, `/api/metrics/facets`, `/summary`, `/categories/top`, `/comparison`, `/alerts`, `/b2b`, `/b2c`) contra la app real vía `TestClient`, no solo la lectura de código | `backend/tests/test_routes.py` (funciones `test_*`), confirmado por la ejecución real de pytest arriba |
| Documentación del proyecto | `memory-bank/project-summary.md`, `conventions.md` y `stack.md` existen y están mergeados en `main` | PR #1 mergeado (`d91ac41`), `git log --oneline origin/main` |

**Corrección respecto a una afirmación previa de esta misma sesión**: en `conventions.md` y `stack.md` se había escrito "18 tests" en el backend por conteo manual erróneo. La ejecución real de pytest confirma **15 tests**, y ya se corrigió en ambos archivos.

---

## ✅ Skill interna del proyecto — `metrics-api-contract` (creada y validada, 2026-09-09)

- **Ubicación:** `.skills/metrics-api-contract/SKILL.md`.
- **Problema que la motivó:** el contrato real de la API de métricas (9 endpoints `GET`, `backend/app/routes.py`) y sus reglas de frontera con el frontend estaban repartidos entre `backend/app/routes.py`, `backend/tests/test_routes.py` y los 6 archivos de `frontend/specs/`. Un agente que implemente el consumo de datos tenía que re-derivarlo cada vez, con riesgo de errores silenciosos en un dashboard financiero. Las 3 skills externas ya aplicadas (`accessibility`, `vercel-react-best-practices`, `deployment-pipeline-design`) no cubren contrato de dominio.
- **Qué captura:** digest operativo de los 9 endpoints (método/ruta, params obligatorios/opcionales, defaults, restricciones, forma de respuesta, gotchas), reglas de fechas dinámicas, reconciliación de tipos `frontend/specs/` ↔ `frontend/src/lib/financial-types.ts` ↔ backend, y las restricciones "no tocar backend / no tocar ni importar `frontend/specs/`". Fuente de verdad del comportamiento: `backend/app/routes.py`; ante discrepancia doc-vs-código, gana el código.
- **Carga y validación:** cargada con `npx skills use "./.skills/metrics-api-contract"` (no instalada de forma permanente; `.skills/` no lo escanea `npx skills list`). Validada sobre una tarea real: planificación e implementación base del consumo frontend de `GET /api/metrics/categories/top` (soporte de `operation_type=outcome` e `income`; conversión de la respuesta a `CategoryShare[]`).
- **Archivos de la implementación base guiada por la skill** (frontend; backend y `frontend/specs/` sin tocar): `frontend/src/lib/financial-types.ts` (+ `TopCategoryItem`, `TopCategoriesQuery`, `CategoryShare`), `frontend/src/lib/category-share.ts` (`computeCategoryShares`), `frontend/src/lib/category-share.test.ts` (4 tests: normal, vacío, una categoría, total 0), `frontend/src/lib/metrics-api.ts` (`fetchTopCategories`). Checks `npm run lint` / `npm run build` / `npm run test` (9/9) verdes; `curl` real contra el backend confirmó el contrato.

### Aprendizaje concreto confirmado (`backend/app/routes.py` como fuente de verdad)

- `GET /api/metrics/categories/top` tiene `operation_type` con **default `"outcome"`** (`backend/app/routes.py:289`) → una vista de **ingresos** debe enviar `operation_type=income` **explícito**; omitirlo devuelve el ranking de gasto (verificado en vivo: `?limit=20` sin `operation_type` → items `"outcome"`).
- `limit` tiene rango **API `1..20`**, default `5` (`backend/app/routes.py:290`, `Query(default=5, ge=1, le=20)`). Fuera de rango → **`422 HTTPValidationError`** (verificado en vivo: `limit=21` → `422`).
- **El frontend NO debe ocultar errores de validación del backend con clamping.** Decisión de esta fase: se eliminó un `clampLimit` de cliente; `fetchTopCategories` envía `limit` explícito tal cual y deja que FastAPI devuelva `422` (coherente con `.agents/rules/error-handling.md` R1 y `conventions.md` conv. 31). Solo se conserva un default de `20` cuando `limit` es `undefined`.
- **`limit=20` devuelve todas las categorías** (hay ≤4 por `operation_type`; income = `sales` + `others`, `backend/app/routes.py:79`) → se usa como denominador real para calcular el porcentaje de cada categoría en el cliente (la respuesta no trae `percent` ni `business_type`, `backend/app/routes.py:200-208`).
- Los **tipos de implementación viven en `frontend/src/lib/financial-types.ts`** (extendido), **no en `frontend/specs/`**: `frontend/specs/` es spec-only, no está en `frontend/tsconfig.app.json` (`"include": ["src"]`) y no debe importarse desde `frontend/src/` (`frontend/specs/README.md:41-48`).
- Los **parámetros opcionales se omiten** cuando no están definidos — nunca se envía `null` literal ni la cadena `"null"`: `fetchTopCategories` añade `start_date` / `end_date` / `business_type` solo con `!== undefined` (`frontend/specs/param-types.ts:9-13`).
- Las **fechas del dataset son dinámicas**: `generate_mock_movements(seed=42)` con `today = date.today()` y `_year_for_month` (`backend/app/routes.py:65-68,97`); `facets.min_date` / `max_date` cambian a diario → **nunca hard-codear años/fechas**; los límites del filtro se leen de `GET /api/metrics/facets`. (Relacionado con el gap "Inconsistencia de fecha en el dashboard" de este mismo archivo.)

---

## ✅ Fase agent-skills — resumen consolidado (2026-09-10)

Ejercicio de mejora del codebase mediante *agent skills*. Rama `feature/agent-skills`; PRs #5–#8 (#5, #6 y #7 mergeados a `main`; #8 abierto).

### Skills aplicadas (4)

| Skill | Origen | Uso en el repo | Entregable |
|---|---|---|---|
| `accessibility` | `addyosmani/web-quality-skills` (ecosistema / comunidad) | auditoría + **5 correcciones**, verificadas en runtime (árbol de accesibilidad + contraste medido; sin axe/Lighthouse en el entorno) | commit `197f722` · PR #5 (merged) |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` (ecosistema / comunidad) | auditoría de rendimiento; **1 corrección** aplicada (regla `js-cache-function-results`); resto auditado y descartado por stack (Vite SPA, sin SSR/RSC) | commit `22d6260` · PR #5 (merged) |
| `deployment-pipeline-design` | `wshobson/agents` (ecosistema / comunidad) | auditoría CI/CD → **P1/P2/P3** aplicados | commit `e736bfe` · PR #6 (merged) |
| `metrics-api-contract` | **interna del proyecto** — `.skills/metrics-api-contract/SKILL.md` | creada desde el contrato real de `backend/app/routes.py`; validada sobre `/api/metrics/categories/top` | commit `c2aebbe` · PR #8 (abierto) — detalle en la sección anterior |

Las 3 externas se cargaron con `npx skills use <owner/repo@skill>` (efímero) y luego se **instalaron a nivel de proyecto** en `.agents/skills/<name>/` con `npx skills add … --copy` + `skills-lock.json` (commit `7a36ad4` · PR #7 merged). La interna se carga con `npx skills use "./.skills/metrics-api-contract"` (no la lista `npx skills list`).

### Cambios verificados

- **Accesibilidad** (`197f722`): ticks de eje `var(--muted-foreground)` / `var(--border)` → contraste 3.14:1 → **5.17:1** (WCAG 1.4.3); cada gráfico envuelto en `<figure>` con `aria-labelledby` a un `<h2>` real + tabla `sr-only` equivalente (1.1.1 / 1.3.1); `role="alert"` en el banner de error de `App.tsx` (4.1.3); `<title>` descriptivo en `index.html` (2.4.2). Navegación por teclado de Recharts v3 intacta. Sin tocar `components/ui/card.tsx` ni el backend.
- **Rendimiento** (`22d6260`): `Intl.NumberFormat` de `formatCurrency` izado a constante de módulo en `frontend/src/lib/financial-utils.ts` — misma salida (verificada por el test existente `formatCurrency(1234.56) === "$1,235"`).
- **CI/CD base** (`e736bfe`): `.github/workflows/ci.yml` (jobs frontend Node 24 y backend Python 3.13, en paralelo, con caché de npm/pip); `backend/requirements.txt` con versiones **fijadas** a las resueltas (`fastapi==0.141.1`, …); `.dockerignore` en `frontend/` y `backend/`. Sin comprometer proveedor de despliegue.
- **Base de `/api/metrics/categories/top`** (`c2aebbe`): tipos `TopCategoryItem` / `TopCategoriesQuery` / `CategoryShare` en `frontend/src/lib/financial-types.ts`; `fetchTopCategories` en `frontend/src/lib/metrics-api.ts` (contrato respetado, `operation_type` explícito, `limit` **sin clamping** — el backend valida `1..20` → `422`; `undefined` → `20`); `computeCategoryShares` + 4 tests co-ubicados. **Sin integrar en `App.tsx`** (Feature 3 fuera de alcance). Sin imports desde `frontend/specs/`.
- **Verificación transversal**: en cada fase, `npm run lint` / `npm run build` (`tsc -b`) / `npm run test` verdes en contenedor (tests frontend: 5 → **9**); `python -m pytest -q` **15/15** sin regresión; `docker compose build` OK; peticiones `curl` reales contra el backend.

### Gaps de este `status.md` cerrados por esta fase

- **"Sin CI/CD"** → RESUELTO: `.github/workflows/ci.yml` corre lint + `tsc -b` + `vitest` + `pytest` en `push`/`pull_request` (PR #6). Pendiente: marcar los checks como *required* en `main` (Branch Protection en GitHub Settings, no en código).
- **"Dependencias del backend sin versión fijada"** → RESUELTO: `backend/requirements.txt` con `==` (PR #6).
- **"Estructura de agentes incompleta"** (`.agents/skills` vacía) → RESUELTO: 3 skills externas instaladas en `.agents/skills/` + `skills-lock.json` (PR #7) y skill interna en `.skills/metrics-api-contract/` (PR #8). Cubre las prioridades #1 y #2 de "Siguientes prioridades".

Siguen abiertos: header `"2024 - Full Year"` vs fechas dinámicas; `frontend/src/lib/mock-data.ts` código muerto; cobertura de tests no medida; sin tests de componente React; CORS `["*"]`; Dockerfiles sin `HEALTHCHECK` ni `USER` no-root; `App.tsx` sigue sin loguear el error real de red/API (aunque ya lo **anuncia** con `role="alert"`).

### Skill del ecosistema elegida (y por qué)

`wshobson/agents@deployment-pipeline-design`, seleccionada tras `npx skills find deployment` (20 candidatas revisadas). Motivos:

- **Comunitaria y agnóstica de proveedor**: solo GitHub Actions, sin comprometer AWS / Vercel / Railway / Kubernetes — el proyecto **no tiene destino de despliegue elegido**.
- **Ataca un gap ya documentado en este archivo**: "Sin CI/CD" y "Siguientes prioridades" #7 ("Añadir un pipeline de CI que corra `pytest` y `vitest run` en cada PR").
- **Adopción alta** (~12,3K instalaciones), la mayor entre las candidatas aplicables a este stack.
- **Descartadas**: Expo/React Native, Azure/AWS/Vercel/Railway específicas, Next.js, Kubernetes, Salesforce, HuggingFace/SageMaker, etc. — o no aplican al stack (Vite SPA + FastAPI) o comprometen una plataforma concreta.

### Skill interna creada

`.skills/metrics-api-contract/SKILL.md` (167 líneas) — digest verificado del contrato de la API de métricas de **este** repo: los 9 endpoints `GET` con params/defaults/gotchas, reglas de fechas dinámicas, y la frontera de tipos `frontend/specs/` ↔ `frontend/src/lib/financial-types.ts` ↔ backend, con `backend/app/routes.py` como fuente de verdad. Complementa a las 3 externas (que cubren genéricos de framework/proceso, no contrato de dominio). Detalle, evidencia `archivo:línea` y aprendizajes en la sección **"Skill interna del proyecto — `metrics-api-contract`"** de arriba.

---

## ⚠️ Gaps conocidos (evidenciados por archivo)

| Gap | Evidencia | Impacto |
|---|---|---|
| Estructura de agentes incompleta | `AGENTS.md:5-9` y `README.md` describen `./.agents/rules` y `./.agents/skills` como ubicaciones esperadas, pero ninguna de las dos existe en el repo (`test -d .agents` → MISSING) | Cualquier agente que siga `AGENTS.md` al pie de la letra no encontrará reglas ni skills — es una instrucción sin contenido todavía |
| Inconsistencia de fecha en el dashboard | El header muestra el texto fijo `"2024 - Full Year"` (`frontend/src/App.tsx:49`), pero el backend genera fechas relativas a `date.today()` (`backend/app/routes.py:65-68,97`). En esta sesión, con fecha real 2026-09-04, `/api/metrics` devolvió movimientos fechados en 2025/2026, no en 2024 | El label del dashboard no refleja el rango real de los datos que muestra |
| Código muerto en frontend | `frontend/src/lib/mock-data.ts` (`mockMovements`) no se importa desde ningún otro archivo del repo (confirmado por búsqueda de `mock-data`/`mockMovements`) | Mantenimiento innecesario; puede confundir a un agente que busque "de dónde salen los datos" y encuentre dos fuentes |
| Dependencias del backend sin versión fijada | `backend/requirements.txt` no tiene ningún `==` (sin pin de versión) para `fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov`, `httpx` | Dos builds en momentos distintos pueden instalar versiones diferentes de las mismas dependencias — no hay reproducibilidad garantizada |
| Cobertura de tests no medida | `pytest-cov` (backend) y `@vitest/coverage-v8` (frontend) están instalados y hay scripts (`test:coverage` en `frontend/package.json:13`) pero no se generó ni revisó ningún reporte de cobertura en esta sesión | Se desconoce qué porcentaje real del código está cubierto por tests |
| Tests de frontend limitados a funciones puras | El único archivo de test del frontend (`financial-utils.test.ts`, 5 tests) cubre `lib/financial-utils.ts`; ningún componente React (`KPICard`, `IncomeOutcomeChart`, `ProfitPercentChart`, `DashboardHeader`, `KPIRow`) tiene test | Cambios en la lógica de renderizado o en props no están protegidos por ningún test automático |
| CORS totalmente abierto | `allow_origins=["*"]` en `backend/app/main.py:9` | Aceptable para desarrollo local/mock, pero es una configuración permisiva que un agente no debería replicar sin más contexto si el proyecto avanza hacia otro entorno |
| Backend sin manejo de errores explícito | Confirmado por búsqueda (`try/except/raise/HTTPException` → 0 resultados en `backend/`) — ver `conventions.md`, convención 31 | Cualquier excepción no anticipada por FastAPI/Pydantic se propagaría como error 500 genérico sin contexto adicional |
| Frontend descarta el error real | `frontend/src/App.tsx:35-39` — el único `.catch()` de la app no captura el error real ni lo loguea a consola | Depurar un fallo real de red/API en el navegador no muestra ninguna pista más allá del mensaje fijo en español |
| Sin CI/CD | Ausencia de `.github/workflows`, `.gitlab-ci.yml`, `.circleci/` en el repo | Los tests (15+5, ambos verificados ahora manualmente) no se ejecutan automáticamente en cada push/PR — el propio PR #1 se mergeó sin ningún check automático |
| Sin healthcheck ni usuario no-root en Docker | Ninguno de los dos Dockerfiles define `HEALTHCHECK` ni `USER` (`conventions.md`, convención 21) | No hay señal automática de "contenedor listo" para orquestación; los procesos corren como root dentro del contenedor |

---

## ❓ Sin verificar

- Comportamiento de la app bajo carga o con un volumen de datos mayor a 360 movimientos/año (el dataset es fijo por diseño — `seed=42` — y no se probó con otros valores).
- Persistencia/consistencia de resultados tras reiniciar el contenedor backend varias veces seguidas (la semilla es fija, pero no se verificó explícitamente el reinicio repetido en esta sesión).
- Reporte de cobertura real (`pytest-cov`, `@vitest/coverage-v8`) — instalado pero no ejecutado.
- Comportamiento fuera de Docker Compose (ejecución manual de `uvicorn`/`npm run dev` sin contenedores).
- Contenido esperado de `.agents/rules` y `.agents/skills` — se sabe que la estructura se espera, pero no qué reglas o skills concretas debería contener.

---

## Siguientes prioridades

> Esta sección es una recomendación basada en los gaps documentados arriba, no un hecho verificable del repositorio — inclúyela como punto de partida para discutir con el equipo, no como una decisión ya tomada.

1. **Completar `.agents/rules` y `.agents/skills`** — es el hueco más directo respecto a lo que `AGENTS.md` y el README ya prometen, y es literalmente el objetivo declarado de este ejercicio de construcción de contexto.
2. **Fijar versiones en `backend/requirements.txt`** (`fastapi==...`, etc.) para que los builds sean reproducibles — hoy dos `docker compose up --build` en fechas distintas pueden instalar versiones distintas sin que nada lo señale.
3. **Medir y publicar cobertura de tests** (`pytest --cov`, `vitest run --coverage`) ya que las herramientas ya están instaladas pero no se usan — coste bajo, valor alto para saber qué tan protegido está el código.
4. **Resolver la inconsistencia del header "2024 - Full Year"** frente a los datos dinámicos, o documentar explícitamente que es un placeholder intencional.
5. **Eliminar `mock-data.ts`** si de verdad no tiene uso previsto, o documentar por qué se mantiene.
6. **Añadir tests de componentes React** (al menos de los que tienen lógica condicional, como `loading`/`hasData` en las gráficas), ya que hoy el 100% del testing de frontend es sobre funciones puras.
7. **Añadir un pipeline de CI** que corra `pytest` y `vitest run` en cada PR — ahora mismo el único "check" fue manual, en esta sesión, ejecutado a mano contra los contenedores.
