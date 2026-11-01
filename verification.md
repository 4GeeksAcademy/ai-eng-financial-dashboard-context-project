# Rastro de verificación

Repositorio: https://github.com/4GeeksAcademy/hnandrade_ai-eng-financial-dashboard-context-project
Agente: GitHub Copilot Chat (modo Agent). Verificación hecha por el usuario con comandos en la terminal del Codespace.
Fecha de la Fase 1: 2026-10-31
Criterio: ✅ verificada en código o en salida real · ❌ incorrecta · ❓ sin verificar

## Resumen de la Fase 1

- Entradas revisadas: 50
- Afirmaciones incorrectas del agent, corregidas: 31
- Afirmaciones sin verificar que se cerraron con evidencia del usuario: 10
- Afirmaciones confirmadas a la primera: 9
- Siguen sin confirmar (❓): quién ejecutó el build anterior, cómo se reiniciaron los servicios para las capturas, y el comportamiento de CORS y de la zona horaria en un navegador.

Cómo leer la tabla: "Estado" muestra la marca inicial y la final (❌ → ✅ significa que el agent afirmó algo incorrecto y quedó corregido). Las citas usan ruta completa desde la raíz y línea; las secciones de `docs/setup-evidence.md` y `docs/project-summary.md` se citan por nombre.

## Paso 0: ejecución del proyecto (docs/setup-evidence.md)

| # | Afirmación del agent | Estado | Evidencia | Corrección |
|---:|---|:---:|---|---|
| 1 | Evidencias sin carpeta (`Dockerfile:12`, `package.json:7`, `routes.py:243`) en el inventario 0.1 y en la ejecución 0.2, repetidas varias veces | ❌ → ✅ | `docs/setup-evidence.md`: comprobación con `grep` sin citas sin carpeta | Ruta completa desde la raíz y línea en toda evidencia |
| 2 | Marcas ✅ y ❓ mezcladas en una misma afirmación (`/docs`, carga del frontend) | ❌ → ✅ | Inventario 0.1, secciones de comprobación de salud | Separado lo verificado en archivo (✅) de lo que solo se sabe al ejecutar (❓) |
| 3 | Inventario sin los volúmenes de Compose ni `--reload` | ❌ → ✅ | `docker-compose.yml:9`, `docker-compose.yml:10`, `docker-compose.yml:22`, `backend/Dockerfile:12` | Añadidos al inventario |
| 4 | `frontend/.env.example` y `frontend/package-lock.json` "no legibles" | ❓ → ✅ | `frontend/.env.example:1` a `frontend/.env.example:4`; `git ls-files` los lista y `git check-ignore -v` no los marca | Contenido y estado verificados por el usuario |
| 5 | Si `debugpy` bloquea el arranque del backend | ❓ → ✅ | `backend/Dockerfile:12` | El comando no incluye `--wait-for-client`; no bloquea |
| 6 | `README.md:14` como descripción del stack | ❌ → ✅ | `README.md:14` es `<!-- endhide -->`; `README.md:18` | La línea correcta es `README.md:18` |
| 7 | `README.md:46` para "no hacen falta variables adicionales" | ❌ → ✅ | `README.md:45` | La línea correcta es `README.md:45` |
| 8 | "Ninguna afirmación proviene de memoria previa" marcada ✅ | ❌ → ❓ | Autoinforme del agent, sin archivo ni salida que lo pruebe | Se trata como ❓ |
| 9 | Tabla "Cambios respecto a tu versión anterior" con filas de afirmaciones que el agent no había hecho | ❌ → ✅ | Respuesta del inventario 0.1 corregido | Solo cuentan las correcciones reales |
| 10 | Compose arrancado por el agent pese a la instrucción de no arrancarlo | ❌ → ✅ | `docs/setup-evidence.md`, sección «Responsable y estado» | Se registra quién arrancó cada ejecución |
| 11 | Borrador: "la terminal continúa activa" | ❌ → ✅ | `docker inspect` del usuario: `frontend-1` exit 143, `backend-1` exit 0; fin a las 05:09:32 y 05:09:33 UTC | Reescrito en «Estado de los servicios al cerrar el Paso 0» |
| 12 | Borrador: detener con Ctrl+C en un identificador de terminal ajeno | ❌ → ✅ | `docs/setup-evidence.md`, sección «Detener los servicios» | Instrucción de limpieza: `docker compose down` |
| 13 | Salida de Docker alterada (comillas invertidas, puntos suspensivos, espacios colapsados en `Removed0.2s`) | ❌ → ✅ | `docs/setup-evidence.md`, secciones «Arranque (salida de docker compose up --build)» y «Detener los servicios» | Salida literal restaurada; espacios corregidos con `sed` |
| 14 | `docker images` partido en dos bloques y `docker history` resumido | ❌ → ✅ | `docs/setup-evidence.md`, sección «Build anterior» | Salida literal en un solo bloque |
| 15 | `CACHED` y `Recreated` afirmados sin sus líneas | ❌ → ✅ (Recreated ❓) | `docs/setup-evidence.md`, sección «Arranque (salida de docker compose up --build)»: seis líneas `CACHED` literales | Las líneas `Recreated` llegaron truncadas en la salida original; quedan ❓ |
| 16 | Verificación cruzada del proxy citaba un `GET /api/metrics` desde `172.18.0.3` ausente del documento | ❌ → ✅ | `docs/setup-evidence.md`, secciones «Logs de arranque» y «Logs del frontend» | Se incluyó la salida completa de `docker compose logs --tail 20 backend` |
| 17 | "No puedo determinar el estado previo de la caché y los contenedores" | ❓ → ✅ en parte | `docker history`: capas de dependencias unos 10 minutos anteriores a la imagen final (04:42:19 UTC) | Hubo un build anterior; quién lo ejecutó es declaración del usuario (❓) |
| 18 | "Este comando [docker compose down] no se ejecutó" | ❌ → ✅ | Terminal del usuario: tres líneas `Removed` y `docker compose ps -a` vacío | Se registra la ejecución del usuario |
| 19 | Diff con citas `docs/setup-evidence.md:NNN` a líneas inexistentes (referencia circular) | ❌ → ✅ | Respuesta de Copilot | Se cita el nombre de la sección |
| 20 | Diff sin la salida del `docker compose down` del usuario | ❌ → ✅ | `docs/setup-evidence.md`, sección «Detener los servicios» | Añadida la salida literal |
| 21 | `cat -n docs/setup-evidence.md` "excedió el límite" y solo mostró un enlace | ❌ → ✅ | `git status --short -uall`, `grep` y `sed` sobre el archivo | Verificado por el usuario sin depender del enlace |
| 22 | Erratas del parche: `debugpyescuchando`, `Recreated`;no, etiqueta `(a)` y `red;el` | ❌ → ✅ | `docs/setup-evidence.md` | Corregidas con `sed` y comprobadas con `grep` |
| 23 | Servicios arriba con los puertos 5173, 8000 y 5678 | ✅ | `docker compose ps` del usuario; `docker-compose.yml:7`, `docker-compose.yml:19`, `docker-compose.yml:20` | — |
| 24 | `/health`, `/docs`, frontend y proxy `/api/metrics` responden | ✅ | `curl` del usuario: `200` con `{"status":"ok"}`, `200 text/html`, `200 text/html` y JSON | — |
| 25 | "No cambié archivos del repo" | ❓ → ✅ | `git status --short` vacío; con `--ignored` solo aparecen `.vscode/` y `backend/app/__pycache__/` | Verificado por el usuario |
| 26 | Estado final: `frontend-1` exit 143 y `backend-1` exit 0 | ✅ | `docker inspect` del usuario | El motivo de la detención original sigue ❓ |

## Fase 1.1: mapa del repo

| # | Afirmación del agent | Estado | Evidencia | Corrección |
|---:|---|:---:|---|---|
| 27 | Citas sin carpeta en el mapa y lista de "10 rutas" sin carpeta ni línea (reincidencia) | ❌ → ✅ | `docs/project-summary.md`: 91 citas con carpeta y línea existentes | Ruta completa; comprobada con script |
| 28 | "Ocho rutas GET" | ❌ → ✅ | `backend/app/routes.py:243` a `backend/app/routes.py:378` | Son nueve: `/health` y ocho rutas de `/api/metrics` |
| 29 | Formatter y CI "no encontrados", citando `frontend/package.json:6` y `frontend/package.json:13` | ❓ → ✅ | `git ls-files` filtrado por prettier, biome, editorconfig, ruff, pre-commit y `.github`: sin salida | Evidencia sustituida; solo prueba esa búsqueda |
| 30 | Backend sin lectura de variables de entorno ("no detecté") | ❓ → ✅ | `grep` de `os.environ` y `getenv` en `backend` (archivos `.py`): sin salida | Verificado por el usuario |
| 31 | Sección A del mapa con siete filas sin columna Marca | ❌ → ✅ | `docs/project-summary.md`, sección «Tabla de afirmaciones» | Tabla con Marca en cada fila |
| 32 | `AGENTS.md:3`, `AGENTS.md:7` y `AGENTS.md:10` (inventario 0.1) frente a `AGENTS.md:6`, `AGENTS.md:9` y `AGENTS.md:12` (mapa 1.1) | ❌ → ✅ | `grep -n` sobre `AGENTS.md`: líneas 6, 9 y 12 | Las líneas correctas son 6, 9 y 12 |
| 33 | `frontend/public` "contiene" `favicon.svg` sin haberlo listado | ❓ → ✅ | `ls -la frontend/public`: solo `favicon.svg` | Verificado por el usuario |
| 34 | Las 10 rutas del mapa con sus líneas citadas | ✅ | Salida de `sed -n` línea por línea del usuario | — |
| 35 | Las fechas de los datos dependen de `date.today()` | ✅ | `backend/app/routes.py:65`, `backend/app/routes.py:75`, `backend/app/routes.py:97` | — |
| 36 | 15 funciones de test en el backend y 5 llamadas `it` en el frontend | ✅ | `backend/tests/test_routes.py:12`, `backend/tests/test_routes.py:173`, `frontend/src/lib/financial-utils.test.ts:36`, `frontend/src/lib/financial-utils.test.ts:111` | — |

## Fase 1.2 a 1.4: resumen (docs/project-summary.md)

| # | Afirmación del agent | Estado | Evidencia | Corrección |
|---:|---|:---:|---|---|
| 37 | Desajuste del encabezado `2024 - Full Year` marcado ❌ en el resumen | ❌ → ✅ | `frontend/src/App.tsx:49`, `frontend/src/components/dashboard/dashboard-header.tsx:7`, `backend/app/routes.py:65`, `backend/app/routes.py:75`; primer registro 2025-10-02 en ejecución | Es un hecho verificado, no una afirmación incorrecta |
| 38 | `frontend/src/components/dashboard/dashboard-header.tsx:11` como evidencia de "usuario objetivo" | ❌ → ✅ | La línea 11 es un `<span>` de estilos; el texto está en `frontend/src/components/dashboard/dashboard-header.tsx:16` | Cita corregida a la línea 16 |
| 39 | "No hay autenticación en el backend" | ❓ → ✅ | `grep -rniE` de auth, token, jwt, Depends, Security, api_key y password en `backend/app`: sin coincidencias | Verificado por el usuario |
| 40 | "Cuatro tarjetas KPI y dos gráficas de líneas" | ❓ → ✅ | `frontend/src/components/dashboard/kpi-row.tsx:14` a `frontend/src/components/dashboard/kpi-row.tsx:45`; `frontend/src/components/dashboard/income-outcome-chart.tsx:79`; `frontend/src/components/dashboard/profit-percent-chart.tsx:80` | Verificado por el usuario |
| 41 | Afirmaciones 2 y 17 duplicadas en la tabla del resumen | ❌ → ✅ | `docs/project-summary.md`, sección «Tabla de afirmaciones» | Fusionadas y renumeradas |
| 42 | Resumen reescrito con el desajuste del período en ❓ mientras la tabla lo marcaba ✅ | ❌ → ✅ | `docs/project-summary.md`, sección «Resumen» | Marcado ✅ en ambos sitios |
| 43 | "La tabla B de la 1.2 tenía 20 filas y la #17 era autenticación" | ❌ → ✅ | Tabla de la 1.2: 21 filas; la #17 era persistencia (duplicada con la #2) y la autenticación era la #18 | Historial corregido en la tabla final |
| 44 | Búsqueda de base de datos con aviso de exclusión de la herramienta, concluida como "sin coincidencias" | ❓ → ✅ | `grep` del usuario por sqlite, sqlalchemy, psycopg, pymongo, create_engine y DATABASE_URL en `backend` y `frontend/src`: sin salida | Verificado por el usuario |
| 45 | Zona horaria: el mes cambia con la zona horaria | ✅ | Node v24.22.2: `2025 10` en UTC y `2025 9` en America/New_York; `frontend/src/lib/financial-utils.ts:7` a `frontend/src/lib/financial-utils.ts:9` | Navegador, datos del día 1 y efecto real siguen ❓ |
| 46 | Citas a líneas en blanco `frontend/src/lib/financial-utils.ts:25` y `frontend/src/lib/financial-utils.ts:46` | ❌ → ✅ | `frontend/src/lib/financial-utils.ts:24` (`.reduce`) y `frontend/src/lib/financial-utils.ts:47` (`if (m.operation_type`) | Cambiadas a 24 y 47 |
| 47 | Fila duplicada del apéndice con CORS `[*]` junto a `["*"]` | ❌ → ✅ | `docs/project-summary.md`, apéndice «Verificaciones del usuario» | Fila con `[*]` eliminada |
| 48 | Referencias "apéndice, fila N" desalineadas por esa fila de más | ❌ → ✅ | `docs/project-summary.md` | Renumeradas y comprobadas con `grep` |
| 49 | Tabla con 26 filas numeradas frente a las 31 pedidas | ✅ | Las 5 afirmaciones restantes están en `docs/project-summary.md`, sección «Fechas y zona horaria» | Aceptado |
| 50 | Las 91 citas `ruta:línea` del resumen | ✅ | Script del usuario: todos los archivos existen y ninguna línea está fuera de rango ni en blanco; `frontend/src/lib/financial-utils.ts:42` contiene `toYearMonthKey(new Date(m.create_date))` | — |

Las filas de las Fases 3 y 4 se añaden en el commit de cada fase.

## Fase 2: hallazgos de ingeniería (docs/analysis/engineering-findings.md)

## Resumen de la Fase 2

- Entradas revisadas: 13
- Afirmaciones incorrectas corregidas: 9
- Afirmaciones sin verificar cerradas con evidencia: 2
- Datos rebajados por falta de evidencia guardada: 1 (fila 56)
- Afirmaciones confirmadas a la primera: 1 (fila 62)
- Siguen sin confirmar (❓): el primer registro 2025-10-02 (fila 56), R5 en un navegador, y la ejecución de `npm run lint`, `npm run test` y `pytest`.

`✅ → ❓` significa que un dato dado por bueno quedó rebajado por falta de evidencia guardada.


| # | Afirmación del agent | Estado | Evidencia | Corrección |
|---:|---|:---:|---|---|
| 51 | C1 citó backend/app/routes.py:248 como `def get_metrics(` | ❌ → ✅ | `sed -n '246,251p' backend/app/routes.py` (terminal del usuario): la línea 248 es el decorador `@router.get("/api/metrics", ...)` y la 249 es `def get_metrics(` | Cita corregida a `backend/app/routes.py:249` |
| 52 | C3 afirmó que "las rutas usan response_model" (alcance excesivo) | ❌ → ✅ | `grep -n "@router.get" backend/app/routes.py`: 9 decoradores (`backend/app/routes.py:243`, `backend/app/routes.py:248`, `backend/app/routes.py:262`, `backend/app/routes.py:268`, `backend/app/routes.py:287`, `backend/app/routes.py:305`, `backend/app/routes.py:342`, `backend/app/routes.py:362`, `backend/app/routes.py:378`); `grep -c "response_model" backend/app/routes.py`: 8 | Alcance acotado: las 8 rutas `/api/metrics*` lo declaran; `/health` (`backend/app/routes.py:243`) no |
| 53 | C10 usó el commit propio `docs(fase-1)` como evidencia del historial | ❌ → ✅ | `git --no-pager log --format='%h %s' 624e5d4~1` (terminal del usuario): 27 commits; 3 con prefijo en minúscula (eeece05, fb7dd96, 9c3e480), 1 con `Fix:` (e267908), 22 sin prefijo y 1 merge; Copilot repitió el recuento con `git --no-pager log --oneline 954f812` | Evidencia sin el commit propio y con recuento exacto |
| 54 | R2, R6 y R10 decían "reportada por el usuario" o "verificado por el usuario" sobre búsquedas hechas por Copilot | ❌ → ✅ | `grep -rn "mockMovements\|mock-data" frontend/src` (usuario): solo `frontend/src/lib/mock-data.ts:3`; `grep -rln "describe(\|\bit(" frontend/src` (usuario): solo `frontend/src/lib/financial-utils.test.ts`; la búsqueda de fetch/axios la hizo Copilot | Frases reescritas indicando quién hizo cada búsqueda |
| 55 | R4 citó docs/setup-evidence.md, sección «Comprobaciones», para "primer registro 2025-10-02" | ❌ → ✅ | `grep -rn "2025-10-02" docs verification.md` (usuario): solo aparece en `verification.md`, sección «Fase 1.2 a 1.4: resumen (docs/project-summary.md)» | Dato retirado de R4; R4 se apoya en el código: `frontend/src/App.tsx:49`, `backend/app/routes.py:65` y `backend/app/routes.py:75` |
| 56 | Fase 1, fila 37: "primer registro 2025-10-02 en ejecución" | ✅ → ❓ (solo ese dato) | No hay archivo con esa salida; la reproducción desde backend con `generate_mock_movements` falla con `ModuleNotFoundError: No module named 'fastapi'` (`backend/app/routes.py:8`, salida del usuario) | El dato queda ❓; el desajuste del encabezado sigue ✅ por el código (`backend/app/routes.py:65`, `backend/app/routes.py:75` y `frontend/src/App.tsx:49`) |
| 57 | R2 y R6 repetían el mismo hecho (el frontend solo consume `/api/metrics`) | ❌ → ✅ | Tabla de la 2.2 de Copilot (acción: fusionar) | Fusionados en R2 |
| 58 | 21 hallazgos, por encima del límite de 20 | ❌ → ✅ | Tabla de la 2.2: 12 se mantienen, 7 se ajustan y 2 se eliminan | C8 descartado, R6 fusionado y R12 añadido: 20 hallazgos |
| 59 | C9 solo cubría 3 de las 4 instrucciones de AGENTS.md | ❌ → ✅ | `cat -n AGENTS.md` (usuario): 15 líneas; instrucciones en `AGENTS.md:6`, `AGENTS.md:9`, `AGENTS.md:12` (condicional, `AGENTS.md:13`) y `AGENTS.md:15` | C9 incluye las cuatro; las tres rutas no existen (`ls -a` en la raíz) |
| 60 | R3 afirmó que "todos los endpoints" regeneran datos, sin recuento | ❓ → ✅ | `grep -n "generate_mock_movements(\|random.seed" backend/app/routes.py` (usuario): 8 llamadas con seed=42 (`backend/app/routes.py:255`, `backend/app/routes.py:264`, `backend/app/routes.py:277`, `backend/app/routes.py:295`, `backend/app/routes.py:311`, `backend/app/routes.py:350`, `backend/app/routes.py:370`, `backend/app/routes.py:386`) y un `random.seed(seed)` en `backend/app/routes.py:96` | Cuantificado: los 8 handlers de `/api/metrics*` |
| 61 | Citas añadidas por Copilot en la 2.2 sin comprobar: `frontend/src/App.tsx:58`, `backend/app/routes.py:74`, `backend/app/routes.py:80`, `backend/app/routes.py:83`, `backend/app/routes.py:100`, `frontend/eslint.config.js:12`, `frontend/eslint.config.js:15`, `backend/app/main.py:9`, `backend/app/main.py:10`, `backend/app/main.py:11`, `backend/app/main.py:12`, `docker-compose.yml:20`, `backend/tests/test_routes.py:29`, `frontend/src/lib/financial-utils.test.ts:36` y 7 archivos con `className=` | ❓ → ✅ | Salida de los 12 comandos sed/grep/git de la terminal del usuario | Todas coinciden con lo citado |
| 62 | R12: no hay formatter, CI ni pre-commit versionados | ✅ | `git ls-files | grep -iE "prettier\|biome\|editorconfig\|ruff\|pre-commit\|^\.github\|pyproject\|pytest\.ini\|tox\.ini"` (usuario): sin salida (grep exit=1) | Antes era C8 en ❓ (búsqueda de Copilot); solo prueba esos nombres de archivo |

## Fase 3

| # | Afirmación del agent | Estado | Evidencia | Corrección |
|---:|---|:---:|---|---|
| 64 | P9: Copilot (3.1) dejó la línea base «no ejecutada» por no poder usar git ls-files | ❓ → ✅ | git ls-files filtrado por prettier, biome, editorconfig, ruff, pre-commit, .github, pyproject, pytest.ini y tox.ini: sin salida, exit=1 (salida del usuario) | Línea base de P9 reescrita con el resultado medido |
| 65 | Las 10 reglas y la skill: citas de la Justificación sin comprobar contra el código | ❓ → ✅ | Script del usuario compara cada fragmento con su línea: OK=53, MAL=0; el rango `backend/requirements.txt:1-6` de P10 coincide con `cat -n` | Ninguna |
| 66 | Líneas base de P1 a P8 y P10 (Copilot dijo que coincidían) | ❓ → ✅ | Comandos de Verificación ejecutados por el usuario: P1 sin salida; P2 una línea sin response_model (243), 9 decoradores y 8 response_model=; P3 una referencia a mock-data y un fetch; P4 8 usos, random.seed en la 96 y 2 líneas Full Year; P5 líneas 26-27, 35-36 y 40-41; P6 15 y 5; P7 3 puertos y 4 líneas CORS; P10 6 entradas y 0 «==»; P8 exit=2 por memory-bank ausente | Ninguna |
| 67 | pytest, npm run lint y npm run test sin probar en el contenedor | ❓ → ✅ | docker compose ps vacío al principio (servicios parados); tras docker compose up -d: pytest 15 passed (1 warning, exit=0), lint exit=0, test 5 passed (exit=0) | P6, P9 y la skill pasan de «sin probar» a lo medido |
| 68 | Skill add-metrics-route, paso 8: «según el informe de Fase 2» | ❓ → ✅ | La fila 56 de verification.md contiene el ModuleNotFoundError de fastapi | Atribución cambiada a la fila 56 |
| 69 | Prueba de descubrimiento: Copilot describió un backend Express, Sequelize y JWT y dijo que .agents/skills no existía | ❌ → ✅ | ls -d backend/routes backend/models: no existen; .agents/skills existe; backend/requirements.txt lista fastapi | Resultado registrado en docs/rules-validation.md |
| 70 | Tarea 2, primer intento: «la tarea ya estaba completada en el chat anterior» | ❌ → ✅ | git diff --stat vacío y 0 coincidencias de metrics/count en backend/app/routes.py | Intento descartado |
| 71 | Tarea 3 (con regla): «verifico qué versión es estable» sin llamada de herramienta | ❌ → ✅ | pip install --dry-run python-dotenv==1.0.1 en el contenedor: «Would install» | La versión existe, pero no la comprobó él |
| 72 | Tarea 4: Copilot afirmó cumplir P6 | ❌ → ✅ | Diff sin cambios en backend/tests/test_routes.py; 15 test_; metrics/count sin coincidencias en el test (exit=1) | Resultado registrado como regla leída y no aplicada |
| 73 | Citas de línea de Copilot: tarea 2, modelo en 35 y ruta en 271-274; tarea 4, 66-67 y 398-400 | ❌ → ✅ | Cabeceras de los diffs: tarea 2, modelo en 38-39 y ruta en 272-275; tarea 4, 65-66 y 398-401 | Sus números de línea no se usan sin comprobarlos |
| 74 | P2 y P4: verificaciones con número de línea fijo (243, 96) y recuentos (9, 8) | ❌ → ✅ | Tras añadir una ruta, /health queda en la 247 y random.seed en la 100; hay 10 decoradores, 9 response_model= y 9 usos de generate_mock_movements(seed=42) | Reglas P2 y P4 y la skill reescritas con «una sola coincidencia» y «antes del cambio» |
| 75 | Tarea 5: Copilot afirmó cumplir P6 con la regla reescrita (v2) | ✅ | +10 en routes.py y +10 en test_routes.py; 16 test_; 16 passed; el test llama a la ruta en backend/tests/test_routes.py:193 | Ninguna; no se revisó el contenido de los assert (diff guardado vacío) |
| 76 | Tarea 6: Copilot afirmó cumplir P1, P3, P5 y P9 | ✅ | git status: solo App.tsx modificado y http-error-badge.tsx nuevo; find de nombres y grep de colores sin salida (exit=1); un solo fetch( en frontend/src/App.tsx:17; lint exit=0; test 5 passed; diff +9 y −1 | Ninguna |
| 77 | Tarea 6: «el dashboard muestra el código HTTP cuando hay un error de backend» | ❓ | Ninguna ejecución con un error HTTP: lint y los 5 tests no cubren App.tsx; el código extrae el número con /(\d{3})/ sobre el mensaje del throw de App.tsx:18 | Sin probar en un navegador |

## Resumen de la Fase 3

Contadores de la sección Fase 3 (calculados con grep, no a mano): 14 entradas; 6 incorrectas corregidas; 5 sin verificar cerradas con evidencia; 2 confirmadas a la primera; 1 sigue sin confirmar (fila 77).
Siguen sin confirmar (❓): el primer registro 2025-10-02, R5 y el aviso «Error 500» en un navegador, el efecto de CORS en navegador (P7), el contenido de los assert del test de la tarea 5 y que Copilot descubra .agents/rules por AGENTS.md sin que se lo pidan (n=1).


## Fase 4

| # | Afirmación del agent | Estado | Evidencia | Corrección |
|---|---|---|---|---|
| 78 | Las cifras y citas de memory-bank (9 rutas GET, 15 test_ y 5 it, 3 puertos, 360 movimientos, 6 dependencias, 10 reglas y las líneas citadas de App.tsx, main.py, package.json y test_routes.py) coinciden con el código | ✅ | Script del usuario al crear los archivos: cada línea citada contiene el fragmento esperado y los recuentos coinciden, sin ninguna línea FALLA | Ninguna |
| 79 | Prueba de arranque en frío: un agente nuevo se orienta solo con memory-bank | ❌ → ✅ | Un chat de Claude sin acceso al repo (según el prompt y sus respuestas) recibió solo los 4 archivos y 5 preguntas. Sus respuestas sobre cómo levantar y probar el proyecto, los dos riesgos de seguridad y lo no confirmado coinciden con lo escrito en memory-bank. Marcó dos huecos con sus palabras: no sabía en qué archivo está `generate_mock_movements` y solo conocía el contenido de 3 de las 10 reglas (P6, P7 y P10) | Se añadieron a `memory-bank/tech-stack.md` las secciones «Dónde está el código» e «Índice de reglas». No se repitió la prueba con el texto ampliado ❓; el chat no tenía acceso al repo, así que no probó que un agente de código llegue al memory-bank por `AGENTS.md` |

## Resumen de la Fase 4
Contadores de la sección Fase 4 (calculados con grep): 2 entradas; 1 incorrecta corregida (fila 79); 1 confirmada a la primera (fila 78).
Siguen sin confirmar (❓): que el memory-bank ampliado cierre los dos huecos de la prueba de arranque en frío (no se repitió), el primer registro 2025-10-02, R5 y el efecto de CORS en un navegador (P7), y que un agente descubra .agents/rules por AGENTS.md sin que se lo pidan (n=1).
