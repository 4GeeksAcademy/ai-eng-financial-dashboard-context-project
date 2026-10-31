# Resumen del proyecto

Última verificación: 2026-10-31

## Resumen

✅ El repo contiene un frontend React/Vite y un backend FastAPI conectados por Compose y por el proxy `/api` de Vite (`docker-compose.yml:2`, `docker-compose.yml:14`, `frontend/vite.config.ts:11`, `frontend/vite.config.ts:13`).

✅ El backend genera movimientos financieros simulados en memoria, fija la semilla a 42 en las rutas y calcula el año de los movimientos según `date.today()` (`backend/app/routes.py:94`, `backend/app/routes.py:97`, `backend/app/routes.py:255`).

✅ El frontend consume `GET /api/metrics`, calcula las tarjetas y series mensuales y presenta cuatro KPIs y dos gráficas de líneas (`frontend/src/App.tsx:16`, `frontend/src/App.tsx:32`, `frontend/src/components/dashboard/kpi-row.tsx:14`, `frontend/src/components/dashboard/income-outcome-chart.tsx:79`, `frontend/src/components/dashboard/profit-percent-chart.tsx:80`).

✅ El README documenta `docker compose up --build`; el usuario verificó `/health`, `/docs` y la API a través del proxy (`README.md:42`, `docs/setup-evidence.md`, secciones «Comprobaciones» y «Verificación del usuario»).

✅ El periodo visible indica 2024, mientras la regla del backend y el primer registro observado corresponden a un periodo que comienza en 2025 (`frontend/src/App.tsx:49`, `frontend/src/components/dashboard/dashboard-header.tsx:7`, `backend/app/routes.py:65`, `backend/app/routes.py:75`, verificado por el usuario: apéndice «Verificaciones del usuario»).

❓ El código consultado no determina el público objetivo del producto (`frontend/src/components/dashboard/dashboard-header.tsx:16`).

## Tabla de afirmaciones

| # | Afirmación | Marca | Evidencia |
|---:|---|:---:|---|
| 1 | Compose declara los servicios frontend y backend. | ✅ | `docker-compose.yml:2`, `docker-compose.yml:14` |
| 2 | El endpoint de métricas genera movimientos en memoria; no consulta una base de datos en ese flujo. | ✅ | `backend/app/routes.py:94`, `backend/app/routes.py:255` |
| 3 | El generador recibe semilla 42 en la ruta de métricas y fija el generador aleatorio. | ✅ | `backend/app/routes.py:95`, `backend/app/routes.py:96`, `backend/app/routes.py:255` |
| 4 | El año asignado depende de la fecha actual del servidor y el día generado está entre 1 y 28. | ✅ | `backend/app/routes.py:65`, `backend/app/routes.py:66`, `backend/app/routes.py:67`, `backend/app/routes.py:68`, `backend/app/routes.py:74`, `backend/app/routes.py:75`, `backend/app/routes.py:97` |
| 5 | Hay nueve rutas declaradas y todas usan GET. | ✅ | `backend/app/routes.py:243`, `backend/app/routes.py:248`, `backend/app/routes.py:262`, `backend/app/routes.py:268`, `backend/app/routes.py:287`, `backend/app/routes.py:305`, `backend/app/routes.py:342`, `backend/app/routes.py:362`, `backend/app/routes.py:378`; verificado por el usuario: apéndice, fila 2 |
| 6 | Las rutas son `/health`, `/api/metrics`, `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b` y `/api/metrics/b2c`. | ✅ | `backend/app/routes.py:243`, `backend/app/routes.py:248`, `backend/app/routes.py:262`, `backend/app/routes.py:268`, `backend/app/routes.py:287`, `backend/app/routes.py:305`, `backend/app/routes.py:342`, `backend/app/routes.py:362`, `backend/app/routes.py:378` |
| 7 | El frontend solicita `/api/metrics`; no consume las otras rutas de backend ni aplica filtros, facets, summary o alerts a esa solicitud. | ✅ | `frontend/src/App.tsx:16`; verificado por el usuario: apéndice, fila 6 |
| 8 | `computeKPIs` suma ingresos y gastos de todos los movimientos recibidos, calcula profit y porcentaje. | ✅ | `frontend/src/App.tsx:32`, `frontend/src/lib/financial-utils.ts:21`, `frontend/src/lib/financial-utils.ts:24`, `frontend/src/lib/financial-utils.ts:30`, `frontend/src/lib/financial-utils.ts:31` |
| 9 | `computeMonthlyData` agrupa los movimientos por clave año-mes y calcula totales y margen mensual. | ✅ | `frontend/src/lib/financial-utils.ts:36`, `frontend/src/lib/financial-utils.ts:42`, `frontend/src/lib/financial-utils.ts:47`, `frontend/src/lib/financial-utils.ts:59`, `frontend/src/lib/financial-utils.ts:60` |
| 10 | La UI presenta cuatro tarjetas KPI y dos gráficas de líneas. | ✅ | `frontend/src/components/dashboard/kpi-row.tsx:14`, `frontend/src/components/dashboard/kpi-row.tsx:45`, `frontend/src/components/dashboard/income-outcome-chart.tsx:79`, `frontend/src/components/dashboard/profit-percent-chart.tsx:80` |
| 11 | Si falla el fetch, se lanza un error con status HTTP, pero el `catch` no recibe ese objeto y muestra un mensaje genérico en español. | ✅ | `frontend/src/App.tsx:17`, `frontend/src/App.tsx:18`, `frontend/src/App.tsx:35`, `frontend/src/App.tsx:37`, `frontend/src/App.tsx:39` |
| 12 | Las etiquetas KPI están en inglés y el mensaje de error está en español. | ✅ | `frontend/src/components/dashboard/kpi-row.tsx:15`, `frontend/src/components/dashboard/kpi-row.tsx:23`, `frontend/src/components/dashboard/kpi-row.tsx:31`, `frontend/src/components/dashboard/kpi-row.tsx:39`, `frontend/src/App.tsx:37` |
| 13 | La clase `dark` está aplicada directamente al elemento `<main>` de App. | ✅ | `frontend/src/App.tsx:46` |
| 14 | El formato monetario usa `en-US`, USD y cero decimales. | ✅ | `frontend/src/lib/financial-utils.ts:69`, `frontend/src/lib/financial-utils.ts:70`, `frontend/src/lib/financial-utils.ts:71`, `frontend/src/lib/financial-utils.ts:72`, `frontend/src/lib/financial-utils.ts:73` |
| 15 | El arranque documentado es `docker compose up --build`; los puertos configurados son frontend 5173, backend 8000 y debugpy 5678. | ✅ | `README.md:42`, `docker-compose.yml:7`, `docker-compose.yml:19`, `docker-compose.yml:20`, `frontend/Dockerfile:12`, `backend/Dockerfile:12` |
| 16 | El backend define `/health` y hay un test que comprueba su respuesta JSON. | ✅ | `backend/app/routes.py:243`, `backend/app/routes.py:245`, `backend/tests/test_routes.py:29`, `backend/tests/test_routes.py:33` |
| 17 | El usuario registró respuestas exitosas de `/health`, `/docs`, frontend y proxy de métricas. | ✅ | `docs/setup-evidence.md`, secciones «Comprobaciones» y «Verificación del usuario» |
| 18 | Hay 15 funciones de test backend y cinco llamadas `it` en el test frontend. | ✅ | `backend/tests/test_routes.py:12`, `backend/tests/test_routes.py:173`, `frontend/src/lib/financial-utils.test.ts:36`, `frontend/src/lib/financial-utils.test.ts:111`; verificado por el usuario: apéndice, fila 7 |
| 19 | El inventario del usuario incluye un test frontend de utilidades y ningún test de componentes. | ✅ | Verificado por el usuario: apéndice, filas 1 y 7 |
| 20 | CORS se configura con origins, métodos y headers `*`, y `allow_credentials=True`. | ✅ | `backend/app/main.py:7`, `backend/app/main.py:9`, `backend/app/main.py:10`, `backend/app/main.py:11`, `backend/app/main.py:12` |
| 21 | El header observado `Vary: Origin` no prueba por sí solo el comportamiento de CORS en navegador. | ❓ | `backend/app/main.py:7`, `backend/app/main.py:12`; `docs/setup-evidence.md`, sección «Cabeceras y cuerpo completos de /health, agente» |
| 22 | La búsqueda de patrones de autenticación en `backend/app` no encontró coincidencias. | ✅ | Verificado por el usuario: apéndice, fila 14 |
| 23 | La búsqueda de archivos versionados para los patrones de CI y formatter indicados no encontró coincidencias. | ✅ | Verificado por el usuario: apéndice, fila 8 |
| 24 | Las rutas de reglas, skills y memory-bank indicadas por AGENTS no estaban disponibles al consultarlas. | ✅ | `AGENTS.md:6`, `AGENTS.md:9`, `AGENTS.md:12`; lectura local de las tres rutas devolvió ENOENT |
| 25 | `mockMovements` está declarado pero no importado; `hero` no tiene referencias en el alcance buscado. | ✅ | `frontend/src/lib/mock-data.ts:3`; verificado por el usuario: apéndice, fila 5 |
| 26 | El periodo del encabezado no coincide con el generado/observado; la UI dice 2024 y el primer registro observado comienza en 2025. | ✅ | `frontend/src/App.tsx:49`, `frontend/src/components/dashboard/dashboard-header.tsx:7`, `backend/app/routes.py:65`, `backend/app/routes.py:75`, `backend/app/routes.py:97`; `docs/setup-evidence.md`, sección «Comprobaciones»; verificado por el usuario: apéndice, fila 16 |

## Fechas y zona horaria

✅ Con un texto de solo fecha, el mes que devuelve `getMonth()` cambia según la zona horaria: octubre en UTC y septiembre en `America/New_York` (verificado por el usuario: apéndice, fila 15).

✅ `toYearMonthKey` usa `getFullYear()` y `getMonth()`; `computeMonthlyData` aplica esa clave a `new Date(m.create_date)` en la línea exacta `frontend/src/lib/financial-utils.ts:42`.

✅ `formatMonthYearLabel` separa año y mes, construye un `Date` local y lo presenta con locale `en-US`, mes abreviado y año (`frontend/src/lib/financial-utils.ts:11`, `frontend/src/lib/financial-utils.ts:12`, `frontend/src/lib/financial-utils.ts:13`, `frontend/src/lib/financial-utils.ts:14`, `frontend/src/lib/financial-utils.ts:15`, `frontend/src/lib/financial-utils.ts:16`, `frontend/src/lib/financial-utils.ts:17`, `frontend/src/lib/financial-utils.ts:18`).

❓ Que un navegador se comporte igual que Node no se probó.

❓ Que los datos servidos contengan movimientos del día 1 no se comprobó; el backend puede generarlos (`backend/app/routes.py:74`).

❓ Cuánto cambiaría una gráfica real no se midió.

✅ Las tarjetas KPI no dependen de la agrupación mensual: suman los movimientos sin agrupar por mes (`frontend/src/lib/financial-utils.ts:21`, `frontend/src/lib/financial-utils.ts:22`, `frontend/src/lib/financial-utils.ts:24`, `frontend/src/lib/financial-utils.ts:26`, `frontend/src/lib/financial-utils.ts:30`, `frontend/src/lib/financial-utils.ts:31`).

## Lo que no existe en el repo

✅ No se encontró autenticación mediante los patrones consultados en `backend/app` (verificado por el usuario: apéndice, fila 14).

✅ El endpoint de métricas genera sus datos en memoria; el flujo citado no consulta persistencia (`backend/app/routes.py:94`, `backend/app/routes.py:255`).

✅ La búsqueda de archivos versionados para CI/formatter indicada por el usuario no produjo resultados (verificado por el usuario: apéndice, fila 8).

✅ Las rutas `.agents/rules`, `.agents/skills` y `memory-bank` indicadas por AGENTS devolvieron ENOENT al consultarlas (`AGENTS.md:6`, `AGENTS.md:9`, `AGENTS.md:12`).

✅ El inventario de archivos frontend del usuario contiene `frontend/src/lib/financial-utils.test.ts` y no tests de componentes (verificado por el usuario: apéndice, filas 1 y 7).

✅ El backend genera movimientos simulados con `_build_movement` y `generate_mock_movements` (`backend/app/routes.py:71`, `backend/app/routes.py:94`).

✅ `frontend/src/lib/mock-data.ts` contiene un array `mockMovements`, pero no se importa; el archivo `frontend/src/assets/hero.png` no tiene referencias en la búsqueda indicada (verificado por el usuario: apéndice, fila 5).

## Sin confirmar

❓ No se probó el comportamiento CORS desde un navegador o con preflight.

❓ No se probó el cambio de mes en un navegador; la demostración aportada es de Node.

❓ No se contó si los movimientos servidos incluyen días 1 ni el impacto de una conversión de mes en una gráfica.

❓ Las búsquedas de base de datos, autenticación, CI y formatter solo prueban los patrones y archivos que se consultaron; no prueban mecanismos externos al repo o fuera de ese alcance.

❓ El usuario objetivo no está definido por las etiquetas visibles consultadas (`frontend/src/components/dashboard/dashboard-header.tsx:15`, `frontend/src/components/dashboard/dashboard-header.tsx:16`).

## Verificaciones del usuario

| Comando | Resultado resumido |
|---|---|
| `find backend frontend/src -type f -not -path '*/__pycache__/*' \| sort` | 23 archivos: 7 en backend y 16 en frontend/src; no hay tests de componentes. |
| `grep -n "@router\.\(get\|post\|put\|delete\)" backend/app/routes.py` | 9 rutas, todas GET: líneas 243, 248, 262, 268, 287, 305, 342, 362 y 378. |
| `sed -n '62,80p;90,102p;253,260p' backend/app/routes.py` | `_year_for_month` 65-68, `_build_movement` 71, `generate_mock_movements` 94-102, seed 95-96, `date.today()` 97, `seed=42` 255. |
| `sed -n '1,16p' backend/app/main.py` | CORS `allow_origins=["*"]`, `allow_credentials=True`, métodos y headers `["*"]` en 9-12; `include_router` en 14; sin manejadores de excepciones; el archivo termina en línea 14. |
| `grep -rn "mock-data\|mockMovements\|hero" frontend/src frontend/index.html` | Única coincidencia `frontend/src/lib/mock-data.ts:3`; sin importaciones de mock-data y sin referencias a hero. |
| `grep -rn "fetch(\|/api/" frontend/src` | Única coincidencia `frontend/src/App.tsx:16`. |
| `grep -c "^def test_" backend/tests/test_routes.py` y `grep -cE "^\s*it\(" frontend/src/lib/financial-utils.test.ts` | 15 funciones backend y 5 llamadas `it` frontend. |
| `git ls-files \| grep -iE "prettier\|biome\|editorconfig\|ruff\|pre-commit\|\.github"` | Sin salida. |
| `grep -rn "os.environ\|getenv" backend --include='*.py'` | Sin salida. |
| `cat -n frontend/.env.example` | 4 líneas: tres comentarios y `VITE_API_BASE_URL=` vacío. |
| `ls -la frontend/public` | Solo `favicon.svg`. |
| `grep -n "agents\|memory" AGENTS.md` | Referencias en las líneas 6, 9 y 12 a `./.agents/rules`, `./.agents/skills` y `./memory-bank`. |
| Lecturas de `frontend/src/App.tsx`, `frontend/src/components/dashboard/kpi-row.tsx`, `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx`, `frontend/src/components/dashboard/dashboard-header.tsx` y `frontend/src/lib/financial-utils.ts` | Líneas y contenido citados en la tabla de afirmaciones y en «Fechas y zona horaria». |
| `grep -rniE "auth\|token\|jwt\|Depends\|Security\|api_key\|password" backend/app` | Sin coincidencias. |
| `TZ=UTC node -e 'const d=new Date("2025-10-01"); console.log(d.getFullYear(), d.getMonth()+1)'` y `TZ=America/New_York node -e 'const d=new Date("2025-10-01"); console.log(d.getFullYear(), d.getMonth()+1)'` (Node v24.22.2) | UTC: `2025 10`; `America/New_York`: `2025 9`. |
| `docker compose up`, `docker compose ps` y `curl` | Resultados de arranque y HTTP registrados en `docs/setup-evidence.md`, secciones «Arranque (salida de docker compose up --build)», «Comprobaciones» y «Verificación del usuario». |
