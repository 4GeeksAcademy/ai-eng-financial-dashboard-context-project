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

Las filas de las Fases 2 a 4 se añaden en el commit de cada fase.
