# Evaluaciones de la skill financiera

Actualizar solo con ejecuciones reales, cada día de uso, conservando las entradas anteriores. Este registro no es un monitor diario automático. Una fecha nueva exige evidencia nueva; un fallo del contrato del producto no equivale a un fallo de la skill que lo detecta.

## 2026-11-11 — Auditoría real de integración y calendario

### Objetivo e inputs

- **Tarea:** comprobar qué contrato consume el dashboard y si la agrupación mensual conserva las fechas ISO en distintas zonas horarias.
- **Modo:** `auditar`; no modificar frontend/backend.
- **Revisión:** `954f812d6fb0d95af6699b369ca6e88089ece90c`; árbol de trabajo con cambios staged de skills/instrucciones de sesiones anteriores. El código de aplicación no tiene diferencias frente a HEAD.
- **Inputs:** `backend/app/routes.py`, `backend/tests/test_routes.py`, `backend/tests/conftest.py`, `frontend/src/App.tsx`, `frontend/src/lib/financial-types.ts`, `financial-utils.ts`, `financial-utils.test.ts` y `frontend/package.json`; reglas API/frontend y `AGENTS.md`.
- **Ausencias/límites:** `frontend/specs/` no existe. No hay tests descubiertos en VS Code ni herramientas de configuración Python registradas; se utilizó el runner `pytest` del repositorio. No se hizo navegación/renderizado ni prueba de HTTP 422, fallo de red o respuesta HTTP vacía.
- **Caso frontera:** movimiento `{create_date: "2024-02-01", amount: 500, operation_type: "income", category: "sales", business_type: "B2C"}`. Esperado en ambas zonas: `[{month: "Feb 2024", income: 500, outcome: 0, profitPercent: 100}]`.
- **Caso vacío:** `[]`. Esperado: KPI con cuatro valores cero y agrupación `[]`.

### Evidencia y salida

| ID | Afirmación/caso | Input | Esperado | Observado | Evidencia | Estado |
|---|---|---|---|---|---|---|
| E1 | Contrato de transporte | Modelo backend y tipo frontend | Campos/nombres y enums compatibles | Cinco campos coinciden; fecha `date` backend / string ISO frontend, amount float / number | Inspección estática: `backend/app/routes.py:22`, `frontend/src/lib/financial-types.ts:1` | passed |
| E2 | Integración real | Llamadas y cálculos de App | Identificar llamada y capa propietaria sin inferir integraciones | Solo fetch `/api/metrics`; KPI y meses se calculan en cliente | Inspección estática: `frontend/src/App.tsx:16`, `frontend/src/App.tsx:32`; firma API `backend/app/routes.py:249` | passed |
| E3 | Baseline API | Fixtures y peticiones de los tests existentes | 15 tests sin fallo | 15 passed; un warning | `pytest backend/tests/test_routes.py -q`, salida 0; incluye bordes inclusivos (`backend/tests/test_routes.py:19`) y filtros (`backend/tests/test_routes.py:36`) | passed |
| E4 | Cálculos normales | Fixtures existentes: ingresos 1500, egresos 250; meses entre años | KPI 1500/250/1250 y porcentaje 1250/1500*100; meses ordenados | 5 tests passed | `cd frontend && npm test -- src/lib/financial-utils.test.ts`, salida 0 | passed |
| E5 | Frontera en UTC | Movimiento del 1 de febrero | Mes Feb 2024, ingreso 500, egreso 0, margen 100 | Coincide exactamente | `TZ=UTC node memory-bank/.skills/verify-financial-dashboard-contract/calendar-contract-case.cjs`, salida 0 | passed |
| E6 | Frontera en zona UTC negativa | Mismo movimiento; America/Los_Angeles | Mismo mes y valores que E5 | Mes Jan 2024; demás valores iguales | `TZ=America/Los_Angeles node memory-bank/.skills/verify-financial-dashboard-contract/calendar-contract-case.cjs`, salida 1, AssertionError | failed |
| E7 | Input vacío de utilidades | `[]` | KPI cero y meses vacíos | Coincide en ambas ejecuciones antes de la aserción de calendario | Mismos comandos E5/E6; aserciones de vacío en `calendar-contract-case.cjs` | passed |
| E8 | Periodo mostrado | Cabecera y generador | Rango sustentado en datos, no año fijo asumido | App fija `2024 - Full Year`; generador usa fecha actual y año actual/anterior | Inspección estática: `frontend/src/App.tsx:49`, `backend/app/routes.py:65`, `backend/app/routes.py:97`; rango HTTP actual no medido | failed |
| E9 | Estados HTTP/red/visual | 422, error de red, éxito vacío, renderizado | Verificar estados diferenciados en ejecución | No ejecutados; código rechaza HTTP no OK y guarda error, sin prueba visual | Inspección estática: `frontend/src/App.tsx:17`, `frontend/src/App.tsx:35` | not run |
| E10 | Preservar alcance | Diff de aplicación | Sin modificaciones | Sin diferencias frente a HEAD | `git diff --exit-code HEAD -- frontend backend`, salida 0 | passed |

### Discrepancias y acción mínima

- **D1 — Agrupación mensual (runtime):** `frontend/src/lib/financial-utils.ts:42` convierte ISO date con `new Date`, y `:8` lee año/mes locales. En una zona UTC negativa, el primer día cae en el mes anterior. Impacto probado: 500 de ingreso del 1 de febrero aparece en enero. Recomendar derivar año/mes directamente de la fecha de calendario o usar lectura UTC coherente; añadir un test de primer día del mes y reejecutar E5/E6 antes de considerar una corrección verificada.
- **D2 — Cabecera (estático):** periodo fijo no derivado del generador. Recomendar derivar el rango de datos o definir una etiqueta de producto no engañosa. No se midió el rango de una respuesta HTTP ni se verificó visualmente la cabecera.
- **Cobertura pendiente:** una suite verde no cubre E6 ni demuestra los estados de E9. No se añadieron cambios de aplicación para ocultar los hallazgos.

### Criterios y veredicto

| Criterio | Resultado | Evidencia |
|---|---|---|
| C1 — Trazabilidad | passed | E1–E10 distinguen fuente, comando y evidencia estática/runtime |
| C2 — Inputs/salida | passed | Fixtures/repro, valores esperados/observados, comandos y ausencias declarados |
| C3 — Cobertura del alcance | passed | Normal E4, vacío E7, frontera E5/E6; el fallo de E6 permanece visible |
| C4 — Integración | passed | E2 identifica la única llamada y cálculos clientes |
| C5 — Honestidad | passed | E6 conserva salida 1, E9 queda not run; E8 no afirma un rango HTTP observado |
| C6 — Alcance | passed | E10; modo auditar sin cambios de aplicación |

**Skill:** cumple C1–C6 en esta ejecución manual; detecta un fallo que no detectan los tests existentes. No demuestra fiabilidad general ni auto-descubrimiento del editor.

**Producto:** contrato con discrepancias, no aprobado globalmente. D1 probado en ejecución; D2 identificado estáticamente; E9 pendiente.

### Cambios, logs y siguiente paso

- **Archivos:** `SKILL.md` ahora define objetivo, inputs, salida y criterios; `calendar-contract-case.cjs` conserva el repro contra la utilidad real; este registro conserva resultados. También se actualiza `memory-bank/progress.md`.
- **Validación del recurso:** `node --check memory-bank/.skills/verify-financial-dashboard-contract/calendar-contract-case.cjs` | passed.
- **Rutas desde subdirectorios:** `cd frontend && TZ=UTC node ../memory-bank/.skills/verify-financial-dashboard-contract/calendar-contract-case.cjs` y `cd backend && TZ=UTC node ../memory-bank/.skills/verify-financial-dashboard-contract/calendar-contract-case.cjs` | passed, mismo caso y salida UTC.
- **Aviso backend:** `StarletteDeprecationWarning: Using httpx with starlette.testclient is deprecated`; 15 tests passed. No se cambiaron dependencias por este aviso ajeno al alcance.
- **Límite del repro:** transpila la utilidad real con TypeScript instalado en frontend y la ejecuta en VM; no es build/type-check ni test de navegador. No oculta errores de dependencias.
- **Commits:** `none`.

## 2026-11-11 — Permitir npm directamente desde memory-bank

- **Objetivo:** permitir los comandos exactos `npm test` y `npm run build` desde `memory-bank/`, sin exigir cambiar de carpeta o escribir `--prefix`.
- **Inputs:** requisito aclarado por el usuario y scripts existentes de `frontend/package.json`.
- **Cambios:** `memory-bank/package.json` privado, sin dependencias, delega `test`, `build` y `lint` a `../frontend`. Argumentos y códigos de salida se propagan. `AGENTS.md`, regla frontend y `SKILL.md` documentan este acceso y conservan la alternativa con destino absoluto para otras carpetas.
- **Pruebas:** `cd memory-bank && npm run` | passed, lista scripts; `cd memory-bank && npm test` | passed, 5 tests; `cd memory-bank && npm test -- src/lib/financial-utils.test.ts` | passed, 5 tests y filtro propagado; `cd memory-bank && npm run build` | passed; `cd memory-bank && npm run lint` | passed; `cd memory-bank && npm test -- __forwarding_failure_probe__.test.ts` | failed intencionalmente, salida 1 por ausencia de tests, confirma que el wrapper no oculta errores.
- **Conexión:** comprobación Node de JSON privado, scripts destino existentes, ausencia de dependencias duplicadas y enlaces relativos | passed; `git diff --exit-code HEAD -- frontend backend` | passed.
- **Logs/avisos:** build conserva aviso no bloqueante por chunk JS de 584.26 kB; diagnósticos del editor no disponibles, validación JSON realizada con Node.
- **Decisión vigente:** esta solución sustituye la decisión anterior de no crear un manifiesto en memory-bank. El historial de ENOENT describe el estado previo y no el actual. No es una segunda aplicación ni requiere instalar dependencias en memory-bank.
- **Commits:** `none`.
- **Siguiente paso:** corregir D1/D2 en una tarea de aplicación separada si se solicita; repetir y añadir entrada con evidencia nueva el siguiente día de uso.

## 2026-11-11 — Diagnóstico de npm y comandos independientes del directorio

- **Objetivo:** reproducir el error `memory-bank/package.json` y verificar cómo ejecutar los scripts del frontend desde las carpetas de skills, memoria y backend.
- **Inputs:** `frontend/package.json`, `AGENTS.md`, regla frontend y procedimiento de esta skill. No se modifica el código de aplicación ni se crea un paquete en `memory-bank/`.
- **Causa:** `npm test` y `npm run build` sin destino desde `memory-bank/` buscan un manifiesto inexistente allí; ambos devuelven `ENOENT`, salida 254. El ejecutable npm sí funciona. `npm run` sin nombre solo enumera scripts, no inicia la aplicación.
- **Corrección:** las instrucciones seleccionan `frontend/package.json` mediante `npm --prefix "$(git rev-parse --show-toplevel)/frontend"`. Este destino funciona dentro de cualquier carpeta del repositorio Git, sin copiar manifiestos, añadir dependencias ni mover `.skills/`.

| Directorio de ejecución | Comando exacto | Resultado |
|---|---|---|
| Raíz | `cd memory-bank && npm test` | failed, salida 254, ENOENT para `memory-bank/package.json` |
| Raíz | `cd memory-bank && npm run build` | failed, salida 254, misma causa |
| Raíz | `npm --prefix "$(git rev-parse --show-toplevel)/frontend" run` | passed, salida 0, enumera scripts del frontend |
| Raíz | `cd memory-bank && npm --prefix "$(git rev-parse --show-toplevel)/frontend" test -- src/lib/financial-utils.test.ts` | passed, salida 0, 5 tests |
| Raíz | `cd memory-bank/.skills/verify-financial-dashboard-contract && npm --prefix "$(git rev-parse --show-toplevel)/frontend" run build` | passed, salida 0, TypeScript y Vite completados |
| Raíz | `cd backend && npm --prefix "$(git rev-parse --show-toplevel)/frontend" run lint` | passed, salida 0, sin errores |

- **Aviso build:** chunk JS de 584.26 kB supera 500 kB; aviso no bloqueante, no causado por el destino de npm. No se alteró el umbral ni el empaquetado para ocultarlo.
- **Veredicto:** problema de selección de paquete reproducido y comandos corregidos verificados; `npm test` sin `--prefix` sigue requiriendo ejecutar desde `frontend/`. Las pruebas verdes no invalidan D1/D2 de la auditoría anterior.
- **Archivos conectados:** `AGENTS.md`, `memory-bank/.agents/rules/frontend-data-contract.md` y `SKILL.md` comparten el destino explícito; `SKILL.md` enlaza el manifiesto real. Se conserva historial en este registro y en `memory-bank/progress.md`.
- **Comprobación adicional:** `cd memory-bank && TZ=UTC node "$(git rev-parse --show-toplevel)/memory-bank/.skills/verify-financial-dashboard-contract/calendar-contract-case.cjs"` | passed; `git diff --exit-code HEAD -- frontend backend` | passed. Verificación Node de prefijo compartido, enlaces relativos y ausencia de manifiesto/skill duplicados | passed.
- **Commits:** `none`.
