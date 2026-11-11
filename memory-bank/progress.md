# Progreso del proyecto

Registro append-only de trabajo por sesión. Conserva las entradas anteriores y añade una nueva al terminar cada sesión de trabajo. Resume los logs relevantes en vez de copiar salidas completas; no registres secretos, tokens ni credenciales.

## Estado actual

- **Actualizado:** 2026-11-06
- **Entorno:** Docker Compose con frontend Vite y backend FastAPI.
- **Estado:** el frontend sirve la UI en `http://localhost:5173`; `/api/metrics` a través del proxy responde HTTP 200.
- **Pendiente:** decidir si se elimina o silencia la advertencia no bloqueante de `debugpy` sobre módulos congelados.

## Esquema para la siguiente sesión

Duplica esta plantilla bajo `## Sesiones`:

```markdown
### YYYY-MM-DD — Resumen breve

- **Solicitud:** objetivo expresado por el usuario.
- **Inputs:** archivos/contexto inspeccionados; opciones, límites o datos de entrada relevantes (sin secretos).
- **Cambios:** rutas de archivos y resultado concreto.
- **Commits:** hash y mensaje, o `none` si no se creó commit.
- **Pruebas:** comando o comprobación | resultado | detalle breve.
- **Logs/avisos:** servicio y nivel | mensaje relevante | acción o estado.
- **Decisiones:** supuestos y alternativas descartadas, si afectan al trabajo futuro.
- **Siguiente paso:** acción pendiente o `none`.
```

Usa comandos reproducibles y distingue `passed`, `failed`, `blocked` y `not run`; no afirmes resultados que no se hayan observado. Para logs, registra origen, nivel, fragmento mínimo útil y si el problema sigue activo.

## Sesiones

### 2026-11-06 — Corregir el proxy API de Vite

- **Solicitud:** revisar el proxy tras HTTP 502 y mantener compatibilidad con Docker Compose y Vite ejecutado directamente en el host.
- **Inputs:** `frontend/vite.config.ts`, `docker-compose.yml`; destino inicial `http://backend:8000`; comprobación del endpoint desde host y contenedores.
- **Cambios:** el proxy usa `API_PROXY_TARGET`; fallback local `http://localhost:8000`. Compose establece `http://host.docker.internal:8000` y `host-gateway` para el frontend.
- **Commits:** `none`.
- **Pruebas:** `docker compose config --quiet` | passed; API directa vía host-gateway desde frontend | HTTP 200, 360 movimientos; `/api/metrics` vía Vite en Compose | HTTP 200; Vite local en 5174 sin override | HTTP 200; `npm run build` | passed, sin warnings; `npm test` | passed, 5 tests; `npm run lint` | passed, sin errores.
- **Logs/avisos:** Vite informó `ETIMEDOUT` hacia `backend:8000` antes del cambio; resuelto al usar host-gateway. Backend/debugpy sigue mostrando una advertencia no bloqueante sobre frozen modules.
- **Decisiones:** `secure: false` no aplica porque el proxy usa HTTP. Se mantuvo configurable el destino para soportar ambas modalidades.
- **Siguiente paso:** confirmar que futuras sesiones de desarrollo usen Compose o definan `API_PROXY_TARGET` según el entorno; revisar por separado la advertencia de debugpy si se solicita.

### 2026-11-11 — Limpiar rama y corregir ubicaciones de skills

- **Solicitud:** detectar incongruencias en los cambios de archivos, comprobar que las skills queden bajo `memory-bank` y retirar de la rama los cambios que no sean necesarios para las skills.
- **Inputs:** instrucciones de `AGENTS.md`, reglas y skills de `memory-bank/.agents/`, estado del árbol de trabajo e historial de `feature/agent-skills` frente a `origin/main`.
- **Cambios:** se reinició la punta local sobre `origin/main` con `git reset --hard origin/main` (sin actualizar el remoto) y se conservaron las cuatro skills con la estructura soportada `memory-bank/.agents/skills/<nombre>/SKILL.md`. Se mantuvieron `AGENTS.md`, las reglas citadas por la skill financiera y este registro. Las referencias a `frontend/specs/` ahora son condicionales porque esa carpeta no existe en `origin/main`; se retiraron del árbol los cambios previos de UI, Vite y especificaciones.
- **Commits:** `none`.
- **Pruebas:** `node -e 'const fs=require("fs"),p=require("path"),r="memory-bank/.agents/skills",d=fs.readdirSync(r).filter(x=>fs.statSync(p.join(r,x)).isDirectory());if(d.length!==4)process.exit(1);for(const x of d){const f=p.join(r,x,"SKILL.md"),s=fs.readFileSync(f,"utf8");if(s.match(/^name:\s*(.+)$/m)?.[1]?.trim()!==x)process.exit(1);for(const m of s.matchAll(/\[[^\]]+\]\((\.\/[^)]+)\)/g))if(!fs.existsSync(p.resolve(p.dirname(f),m[1])))process.exit(1)}console.log("4 skills: names and relative links OK")'` | passed; `find memory-bank/.agents/skills -mindepth 2 -maxdepth 2 -name SKILL.md -print | sort` | passed, 4 skills en ubicación directa; `git diff --check -- AGENTS.md memory-bank/.agents/rules/backend-api-contract.md memory-bank/.agents/rules/frontend-data-contract.md memory-bank/.agents/skills/verify-financial-dashboard-contract/SKILL.md` y su variante `--cached` | passed; `git diff --name-only origin/main | grep -Ev '^(AGENTS[.]md|memory-bank/)' && exit 1 || echo 'No app/spec/Vite changes remain'` | passed.
- **Logs/avisos:** `git diff --check` global | failed por espacios finales en materiales importados de Accessibility/Vercel (incluyen saltos Markdown intencionales); se conservaron para evitar reformatear material de referencia no relacionado con la corrección.
- **Decisiones:** no se modificó `origin/feature/agent-skills` ni se creó commit. Se conservaron `AGENTS.md`, las reglas financieras y `progress.md` porque son necesarios para descubrir/ejecutar la skill de verificación y cumplir el registro obligatorio del repositorio.
- **Siguiente paso:** revisar los cambios staged; publicar solo si se solicita explícitamente.

### 2026-11-11 — Restaurar la ubicación propia de la skill financiera

- **Solicitud:** regenerar `memory-bank/.skills/verify-financial-dashboard-contract/SKILL.md`, conservar `.skills/` y corregir las referencias que pudieran fallar desde frontend o backend.
- **Inputs:** `AGENTS.md`, reglas y cuatro skills actuales, entrada anterior de progreso y snapshot adjunto de la skill Vercel. El usuario confirmó que la skill financiera debe permanecer en `.skills/`.
- **Cambios:** se restauró la fuente única de la skill financiera en `memory-bank/.skills/verify-financial-dashboard-contract/SKILL.md`, retirando la copia de `.agents/skills/`. `AGENTS.md` carga explícitamente esa ruta y exige conservarla. La skill enlaza las dos reglas con rutas relativas a su archivo y aclara que las rutas de código y comandos se resuelven desde la raíz del repositorio, también al trabajar desde frontend/backend. Las otras tres skills no se movieron.
- **Commits:** `none`.
- **Pruebas:** comprobación Node inline de frontmatter, nombre/directorio, ausencia de copia financiera, enlace desde `AGENTS.md`, enlaces de reglas y resolución desde frontend/backend | passed; `git diff --check -- AGENTS.md memory-bank/.skills/verify-financial-dashboard-contract/SKILL.md` | passed; `git diff --exit-code HEAD -- frontend backend` | passed, sin cambios de aplicación; `rg -n 'verify-financial-dashboard-contract|\.skills/|\.agents/skills' AGENTS.md memory-bank frontend backend --glob '**/*.{md,json,yml,yaml}'` | passed, las referencias anteriores a la ubicación financiera solo permanecen como historial en este registro.
- **Logs/avisos:** validación inicial de todos los enlaces de skills | failed por referencias preexistentes de Accessibility/SEO a skills no instaladas (`web-quality-audit`, `core-web-vitals`), ajenas a esta restauración; la validación enfocada pasó. Diagnósticos del editor | blocked, herramienta no registrada. No se ejecutaron pruebas de aplicación al no haber cambios de código.
- **Decisiones:** esta entrada sustituye la decisión de ubicación financiera de la sesión anterior; se preserva el historial append-only. La ruta `.skills/` se carga explícitamente mediante `AGENTS.md`, sin prometer descubrimiento automático del editor ni añadir duplicados o enlaces simbólicos.
- **Siguiente paso:** `none` para la restauración solicitada; revisar por separado las referencias de skills importadas no instaladas si se solicita.

### 2026-11-11 — Evaluar la skill con una auditoría real

- **Solicitud:** comprobar objetivo, inputs, salida y criterios verificables de `verify-financial-dashboard-contract`, probarla en una tarea real y, si es útil, guardar texto actualizable por día junto a la skill.
- **Inputs:** skill y reglas locales, `AGENTS.md`, fuentes y tests de rutas backend, App/tipos/utilidades/tests frontend y `frontend/package.json`. HEAD `954f812d6fb0d95af6699b369ca6e88089ece90c`; `frontend/specs/` ausente. Modo auditar: integración `/api/metrics` y agrupación mensual con casos normal, vacío y primer día de mes.
- **Cambios:** `memory-bank/.skills/verify-financial-dashboard-contract/SKILL.md` define objetivo, inputs, salida y C1–C6; añade referencias a `calendar-contract-case.cjs` y `EVALUATION.md` en el mismo directorio. El repro ejecuta la utilidad real; el registro contiene inputs, esperados, observados, evidencias y veredicto de hoy. No se movió `.skills/` ni se modificó aplicación.
- **Commits:** `none`.
- **Pruebas:** `pytest backend/tests/test_routes.py -q` | passed, 15 tests y 1 warning; `cd frontend && npm test -- src/lib/financial-utils.test.ts` | passed, 5 tests; `TZ=UTC node memory-bank/.skills/verify-financial-dashboard-contract/calendar-contract-case.cjs` | passed, febrero 2024 y vacíos correctos; `TZ=America/Los_Angeles node memory-bank/.skills/verify-financial-dashboard-contract/calendar-contract-case.cjs` | failed, salida 1, febrero se agrupa como enero; `cd frontend && TZ=UTC node ../memory-bank/.skills/verify-financial-dashboard-contract/calendar-contract-case.cjs` y variante `cd backend` | passed; `node --check memory-bank/.skills/verify-financial-dashboard-contract/calendar-contract-case.cjs` | passed; comprobación Node de secciones C1–C6, frontmatter, enlaces y ubicación única | passed; `git diff --exit-code HEAD -- frontend backend` | passed.
- **Logs/avisos:** pytest | StarletteDeprecationWarning por `httpx` en TestClient, sin cambios de dependencias; Node | AssertionError de mes ISO en UTC negativa, fallo real documentado y no silenciado; herramientas Python del editor | no registradas; tests VS Code | sin controlador, se usó pytest. HTTP 422, fallo de red, respuesta HTTP vacía y renderizado no ejecutados.
- **Decisiones:** skill cumple C1–C6 en esta ejecución manual; producto presenta fallo runtime de calendario y cabecera fija incompatible por inspección estática. Suites verdes no cubren el repro. El registro se actualiza con evidencia fresca cada día de uso, no automáticamente en días sin ejecución; se preserva historial. No se corrigió aplicación para mantener el alcance de skills.
- **Siguiente paso:** si se solicita, corregir agrupación y cabecera en una tarea de aplicación separada y reejecutar los casos; próxima ejecución de la skill debe registrar evidencia nueva.

### 2026-11-11 — Corregir el destino de los comandos npm de las skills

- **Solicitud:** revisar errores de `npm run` y `npm test`, explicar por qué se busca `memory-bank/package.json` y corregir/conectar las instrucciones verificando su funcionamiento.
- **Inputs:** único manifiesto versionado `frontend/package.json`, scripts disponibles, `AGENTS.md`, regla frontend, skill financiera y evaluación adjunta; reproducción desde `memory-bank/`.
- **Cambios:** `AGENTS.md`, `memory-bank/.agents/rules/frontend-data-contract.md` y `memory-bank/.skills/verify-financial-dashboard-contract/SKILL.md` indican `npm --prefix "$(git rev-parse --show-toplevel)/frontend"`; se enlaza el manifiesto real y se distingue listar scripts de ejecutarlos. Los comandos backend/repro de la skill también seleccionan raíz explícita. Nueva entrada en `EVALUATION.md`. Sin crear `memory-bank/package.json`, duplicar dependencias, mover skills o modificar aplicación.
- **Commits:** `none`.
- **Pruebas:** `cd memory-bank && npm test` y `cd memory-bank && npm run build` | failed, salida 254, ENOENT reproducido; `npm --prefix "$(git rev-parse --show-toplevel)/frontend" run` | passed, scripts listados; `cd memory-bank && npm --prefix "$(git rev-parse --show-toplevel)/frontend" test -- src/lib/financial-utils.test.ts` | passed, 5 tests; `cd memory-bank/.skills/verify-financial-dashboard-contract && npm --prefix "$(git rev-parse --show-toplevel)/frontend" run build` | passed; `cd backend && npm --prefix "$(git rev-parse --show-toplevel)/frontend" run lint` | passed; `git diff --check -- AGENTS.md memory-bank/.agents/rules/frontend-data-contract.md memory-bank/.skills/verify-financial-dashboard-contract/SKILL.md` | passed.
- **Logs/avisos:** npm | ENOENT al buscar manifiesto en carpeta documental, corregido usando destino frontend; Vite | chunk JS 584.26 kB supera 500 kB, aviso no bloqueante preexistente de empaquetado, no alterado.
- **Decisiones:** no falta el ejecutable npm ni hay necesidad de paquete en memory-bank; corregir contexto de ejecución en vez de añadir un proxy npm. Sin `--prefix`, ejecutar desde frontend. Fuera de este repositorio Git, usar una ruta explícita al frontend. El fallo calendario previo sigue siendo independiente del error ENOENT.
- **Siguiente paso:** usar los comandos documentados; revisar por separado calendario/cabecera o empaquetado si se solicita.

### 2026-11-11 — Añadir manifiesto de delegación en memory-bank

- **Solicitud:** permitir que npm encuentre `memory-bank/package.json` para ejecutar directamente desde esa carpeta, como se hace desde frontend.
- **Inputs:** requisito aclarado tras ENOENT; manifiesto y scripts del frontend; instrucciones actuales de agentes, regla frontend y skill financiera.
- **Cambios:** nuevo `memory-bank/package.json` privado con scripts test/build/lint delegados a frontend, sin duplicar dependencias. Actualizados `AGENTS.md`, regla frontend, `SKILL.md` y registro `EVALUATION.md` para retirar instrucciones incompatibles con este manifiesto. No se movieron skills ni se cambió aplicación.
- **Commits:** `none`.
- **Pruebas:** `cd memory-bank && npm run` | passed, scripts listados; `cd memory-bank && npm test` | passed, 5 tests; `cd memory-bank && npm test -- src/lib/financial-utils.test.ts` | passed, filtro propagado; `cd memory-bank && npm run build` | passed; `cd memory-bank && npm run lint` | passed; `cd memory-bank && npm test -- __forwarding_failure_probe__.test.ts` | failed intencionalmente, salida 1 sin tests, propagación correcta; comprobación Node de manifiesto, scripts destino y enlaces | passed; `git diff --exit-code HEAD -- frontend backend` | passed.
- **Logs/avisos:** Vite | chunk JS 584.26 kB supera 500 kB, aviso no bloqueante conservado; diagnósticos editor | herramienta no registrada, validado JSON con Node. No se crearon archivos para la prueba negativa.
- **Decisiones:** sustituye la solución previa que solo corregía comandos: ahora existe un acceso npm directo desde memory-bank. Dependencias e instalación siguen perteneciendo al frontend; no crear otro árbol node_modules en memory-bank.
- **Siguiente paso:** `none` para los comandos solicitados.
