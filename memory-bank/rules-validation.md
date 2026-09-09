# Validación de `.agents/rules`

> Cada una de las 30 reglas en `.agents/rules/*.md` se validó con una tarea real en este repositorio (no solo releyendo evidencia): se rompió deliberadamente lo que la regla protege y se observó el resultado real (compilador, test runner, build de Docker, navegador), o se confirmó con un comando real que ningún tool la hace cumplir. Todos los cambios experimentales se revirtieron; el repo terminó en el mismo estado que antes (`git status` limpio) y se re-verificó: `pytest` 15/15, `vitest` 5/5, `tsc -b` sin errores, contenedores `Up` y saludables.
> Algunas reglas se corrigieron en `.agents/rules/*.md` como resultado directo de esta validación — están marcadas como "regla corregida" abajo.
> Fecha: 2026-09-04.

---

## Leyenda de veredictos

- **CONFIRMADO (build/test)** — se violó la regla, una herramienta real (`tsc`, `pytest`, `docker build`) lo bloqueó o lo señaló con un error concreto.
- **CONFIRMADO (runtime)** — se violó la regla, la app se rompió en ejecución real (navegador/HTTP), aunque ninguna herramienta de build lo hubiera detectado antes.
- **SIN ENFORCEMENT** — se violó (o se comprobó que se podía violar) la regla y ninguna herramienta del repo lo impide; es una convención que solo un agente/revisor puede hacer cumplir.
- **REGLA CORREGIDA** — la validación reveló que el riesgo original estaba descrito de forma imprecisa; se actualizó el texto de la regla en `.agents/rules/`.

---

## `frontend-structure-and-imports.md`

| # | Regla | Tarea real ejecutada | Resultado real | Veredicto |
|---|---|---|---|---|
| 1 | Separación `dashboard/`/`ui/`/`lib/` | `ls` de ambas carpetas | `ui/` solo contiene `card.tsx`, `skeleton.tsx` (primitivos); `dashboard/` solo contiene los 5 componentes de negocio — cero contaminación cruzada hoy | SIN ENFORCEMENT (verificado por inspección real; ningún lint lo protege) |
| 2 | kebab-case en nombres de archivo | `grep` de reglas de naming/filename en `frontend/eslint.config.js` | 0 coincidencias | SIN ENFORCEMENT |
| 3 | Alias `@/` vs. relativo | Se cambió un import de `kpi-row.tsx` a `../../lib/financial-types` y se corrió `tsc -b` dentro del contenedor | `EXIT:0` — compiló igual | SIN ENFORCEMENT (el compilador acepta ambas formas) |
| 4 | `type` inline en imports de solo-tipo | Se quitó `type` de 3 imports en `App.tsx` y se corrió `tsc -b` | `TS1484: 'X' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled` (3 errores) | **CONFIRMADO (build)** |

## `frontend-components-and-state.md`

| # | Regla | Tarea real ejecutada | Resultado real | Veredicto |
|---|---|---|---|---|
| 5 | Export nombrado, no `default` | Se cambió `DashboardHeader` a `export default` sin tocar su import en `App.tsx`, se corrió `tsc -b` | `TS2614: Module '.../dashboard-header' has no exported member 'DashboardHeader'` | **CONFIRMADO (build)** |
| 6 | `interface <Nombre>Props` | Mismo `grep` de naming-convention en ESLint que la regla 2 | 0 coincidencias | SIN ENFORCEMENT |
| 7 | `loading` + `<Skeleton>` propio | Inspección directa de los 3 componentes (`kpi-card.tsx`, `income-outcome-chart.tsx`, `profit-percent-chart.tsx`) | Los 3 implementan el mismo bloque `if (loading) {...}` | SIN ENFORCEMENT (patrón UX, no hay test de snapshot que lo proteja) |
| 8 | Sin librería de estado global | `grep -iE "redux\|zustand\|jotai\|recoil\|mobx"` en `frontend/package.json` | 0 coincidencias | SIN ENFORCEMENT (nada impide instalarla mañana) |
| 9 | Transformaciones puras en `lib/` | Inspección de `financial-utils.ts` + import en `App.tsx:11` | Confirmado, sin lógica de transformación inline en componentes | SIN ENFORCEMENT |
| 10 | No usar `mock-data.ts` | `grep -rn "mock-data\|mockMovements"` en `frontend/src` | Única coincidencia: su propia definición en `mock-data.ts:3` | SIN ENFORCEMENT (verificado real, sigue sin importarse desde ningún sitio) |

## `styling.md`

| # | Regla | Tarea real ejecutada | Resultado real | Veredicto |
|---|---|---|---|---|
| 11 | Solo Tailwind + `cn()` | Inspección de `frontend/src/lib/utils.ts` y su uso en 3 componentes | Confirmado, sin `.module.css` en el repo | SIN ENFORCEMENT |
| 12 | Colores vía `var(--x)`, nunca hex/rgb | `grep` de `className="dark` en `App.tsx` | `App.tsx:46` fuerza `dark` de forma permanente | **REGLA CORREGIDA** — el riesgo es real pero hoy no es visible: la app nunca expone el tema claro a un usuario, así que las variables de `:root` están definidas pero inalcanzables en el flujo actual |
| 13 | No crear `tailwind.config.js` | Se creó `frontend/tailwind.config.js` con un color custom (`canary-test-9x: #ff00ff`) + clase `bg-canary-test-9x` en `dashboard-header.tsx`; se inspeccionó el CSS servido en dev (`curl localhost:5173/src/index.css`) | La clase y el color **no aparecen en absoluto** en el CSS compilado — el plugin `@tailwindcss/vite` ignora el archivo por completo, sin ningún warning | **CONFIRMADO (runtime, silencioso)** |

## `backend-api-contract.md`

| # | Regla | Tarea real ejecutada | Resultado real | Veredicto |
|---|---|---|---|---|
| 14 | Prefijo `/api/metrics` (excepto `/health`) | Inspección de los 9 decoradores en `routes.py` | Confirmado, sin excepciones | SIN ENFORCEMENT |
| 15 | `response_model=` explícito | Se quitó `response_model=` de `/api/metrics/facets` manteniendo `-> MetricsFacets`; se comparó `/openapi.json` antes/después; luego se quitó también la anotación de retorno | Quitar solo `response_model=` **no cambió nada** (FastAPI infiere el schema de la anotación de tipo). Quitando ambas cosas, el schema pasó a `{}` | **REGLA CORREGIDA** — el riesgo real es la combinación de ambas ausencias, no `response_model=` aislado |
| 16 | `Literal[...]` en vez de `Enum` | Inspección de `routes.py:11-15` | Confirmado, sin `enum.Enum` en el archivo; no hay tool que lo prohíba | SIN ENFORCEMENT |
| 17 | No dividir `routes.py` en capas | Inspección de `backend/app/` | Confirmado, solo 3 archivos | SIN ENFORCEMENT |
| 18 | Cuidado con `random.seed(42)` global | Script real dentro del contenedor: `generate_mock_movements(seed=42)` → perturbar `random` con 50 llamadas → repetir | `True` (idéntico pese a la perturbación) | **REGLA CORREGIDA** — la función es determinista por llamada gracias al reseed interno; el riesgo descrito solo se materializaría si un endpoint futuro añade uso concurrente de `random` sin resembrar |

## `error-handling.md`

| # | Regla | Tarea real ejecutada | Resultado real | Veredicto |
|---|---|---|---|---|
| 19 | Sin `try/except` manual en backend | `curl /api/metrics/comparison` sin `start_date`/`end_date` (obligatorios) | `422` automático de Pydantic con detalle de campos faltantes, sin ningún código de manejo de errores en `routes.py` | **CONFIRMADO (comportamiento real ya delegado a FastAPI/Pydantic)** |
| 20 | Frontend: no cambiar el `.catch()` silencioso | Se combinó con la prueba de la regla 25 (env var sin fallback): se observó consola y UI reales en el navegador | UI mostró el mensaje fijo en español; `read_console_messages(onlyErrors: true)` → "No console logs" | **CONFIRMADO (runtime, end-to-end en navegador)** |

## `testing.md`

| # | Regla | Tarea real ejecutada | Resultado real | Veredicto |
|---|---|---|---|---|
| 21 | Tests de integración real, sin mockear | Se escribió un test temporal mockeando `app.routes.generate_mock_movements` con `unittest.mock.patch` y se corrió `pytest` (luego se borró el archivo) | `1 passed` — pytest lo aceptó sin ninguna queja | SIN ENFORCEMENT (confirmado: nada impide mockear) |
| 22 | No tocar `conftest.py` | Se comentó la inserción a `sys.path`; se corrió `python -m pytest` y luego el binario `pytest` directo | `python -m pytest` → 15 passed (el flag `-m` ya añade el cwd a `sys.path`); `pytest` directo → `ModuleNotFoundError: No module named 'app'`, colección interrumpida | **REGLA CORREGIDA** — el hack es imprescindible solo cuando algo invoca `pytest` sin `python -m` |
| 23 | Tests de frontend co-ubicados | `grep` de `test:`/`include` en `frontend/vite.config.ts` | Sin override — Vitest usa sus defaults, que encontrarían tests en cualquier ubicación | SIN ENFORCEMENT |

## `docker-and-env-vars.md`

| # | Regla | Tarea real ejecutada | Resultado real | Veredicto |
|---|---|---|---|---|
| 24 | Orden de capas en Dockerfiles | `docker compose build backend` tocando código con el orden actual (manifiesto→instalar→copiar) vs. con el orden invertido (copiar→instalar), en ambos casos tocando una fuente distinta a `requirements.txt` | Orden actual: `RUN pip install` → `CACHED`. Orden invertido: `RUN pip install` se re-ejecutó (no cacheado) | **CONFIRMADO (build, ambas direcciones probadas)** |
| 25 | Fallback `?? ""` en env vars del frontend | Se quitó el fallback en `App.tsx`, se recargó la app en el navegador real (Browser pane) | La petición pasó de `GET /api/metrics` a `GET /undefined/api/metrics`; la UI cayó al estado de error | **CONFIRMADO (runtime, end-to-end en navegador)** |
| 26 | Backend: env var no declarada en compose | `docker exec backend python -c "import os; print(os.getenv('DASHBOARD_TEST_VAR'))"` | `None` | **CONFIRMADO** |
| 27 | `requirements.txt` sin pin de versión | `docker exec backend pip freeze` filtrado a los paquetes del `requirements.txt` | Versiones reales resueltas: `fastapi==0.141.1`, `uvicorn==0.52.4`, `pydantic==2.13.5`, `pytest==9.1.1`, `httpx==0.28.1`, `debugpy==1.8.21`, ninguna fijada en el archivo fuente | **CONFIRMADO** (documentado también en `stack.md`) |

## `documentation-and-git.md`

| # | Regla | Tarea real ejecutada | Resultado real | Veredicto |
|---|---|---|---|---|
| 28 | Paridad `README.md`/`README.es.md` | Confirmación de ausencia de CI (`.github/`, etc.) que pudiera detectar una desincronización | Ausente — 0 archivos de CI en el repo | SIN ENFORCEMENT (nada avisa si se rompe la paridad) |
| 29 | Sin docstrings en backend | Inspección de `requirements.txt`/`eslint.config.js` en busca de linters de cobertura de docstrings | Ninguno instalado | SIN ENFORCEMENT |
| 30 | Doble `.gitignore` | `git check-ignore -v` sobre un archivo dummy en `backend/__pycache__/` y otro en `frontend/node_modules/` | `backend/__pycache__/dummy.pyc` → matcheado por `.gitignore:30` (raíz); `frontend/node_modules/dummy.log` → matcheado por `frontend/.gitignore:10` — confirma que cada patrón vive en un archivo distinto | **CONFIRMADO** |

---

## Hallazgo adicional (no una regla, pero relevante para trabajar en este repo)

Durante la validación de la regla 25, el HMR de Vite **no recogió** un cambio hecho desde el host en `App.tsx` a través del bind mount de Docker Desktop en Windows — sirvió contenido obsoleto (confirmado con `curl` directo al dev server) hasta que se hizo `docker restart` del contenedor `frontend`. Se documentó como nota operativa dentro de la regla 25 en `docker-and-env-vars.md`: si un cambio en el frontend no se refleja en el navegador, reiniciar el contenedor antes de asumir que el cambio está mal.

## Resumen

- **30/30 reglas** recibieron una tarea de validación real (no solo relectura de evidencia).
- **13 reglas** se confirmaron con una herramienta o comportamiento real rompiéndose (build, test runner, HTTP, navegador).
- **12 reglas** se confirmaron como "sin enforcement automático" — convenciones reales pero que ningún tool del repo protege.
- **5 reglas** se corrigieron con matices más precisos que la formulación original (`.agents/rules/backend-api-contract.md` reglas 2 y 5; `.agents/rules/styling.md` regla 2; `.agents/rules/testing.md` regla 2; `.agents/rules/backend-api-contract.md` regla 5 sobre `random.seed`).
- El repositorio terminó exactamente como estaba antes de empezar (`git status` limpio, `pytest` 15/15, `vitest` 5/5, `tsc -b` sin errores, ambos contenedores `Up`).
