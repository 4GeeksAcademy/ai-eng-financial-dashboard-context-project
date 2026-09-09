# Resumen del proyecto — Financial Metrics Dashboard

> Generado por inspección directa del repositorio y por ejecución real de `docker compose up --build`.
> Cada afirmación indica el archivo (y, cuando aplica, la línea) que la respalda. No contiene conocimiento genérico sobre React, Node, Docker o FastAPI que no esté confirmado en este repositorio.
> Fecha de generación: 2026-09-04.
> Para convenciones de código, nombres, imports, estilos, tests, Docker y manejo de errores, ver [`conventions.md`](./conventions.md) en esta misma carpeta.

---

## ✅ Verificado

### Cómo se ejecuta

- El proyecto se levanta con `docker compose up --build` desde la raíz del repositorio.
  Evidencia: `docker-compose.yml`, `README.md:41-43`, `README.es.md:41-43`.
- Comando ejecutado y confirmado en este entorno; ambos contenedores construyeron y arrancaron sin intervención manual sobre el código o la configuración.
  Evidencia: log de ejecución real — `Container ...-backend-1 Started`, `Container ...-frontend-1 Started`.

### Servicios

- Existen exactamente dos servicios definidos: `frontend` y `backend`.
  Evidencia: `docker-compose.yml:2` y `docker-compose.yml:14`.
- `frontend` depende de `backend` en el orden de arranque de Compose (`depends_on`).
  Evidencia: `docker-compose.yml:11-12`.
- No hay base de datos, cache ni proxy inverso como servicios de Compose.
  Evidencia: `docker-compose.yml` (archivo completo, 23 líneas, solo 2 servicios).

### Puertos y contenedores (confirmados en ejecución real, no solo en configuración)

| Servicio | Puertos declarados en compose | Puertos reales al ejecutar (`docker ps`) |
|---|---|---|
| `backend` | `8000:8000`, `5678:5678` | `0.0.0.0:8000->8000/tcp`, `0.0.0.0:5678->5678/tcp` |
| `frontend` | `5173:5173` | `0.0.0.0:5173->5173/tcp` |

Evidencia: `docker-compose.yml:6-7,18-20`; salida real de `docker ps`.

- El puerto `5678` del backend es para depuración remota con `debugpy`, no para tráfico de la API.
  Evidencia: `backend/Dockerfile:10-12` (`CMD [... "debugpy", "--listen", "0.0.0.0:5678", ...]`).

### Endpoints verificados por petición HTTP real (no solo por lectura de código)

| Petición | Resultado real | Archivo/línea que lo define |
|---|---|---|
| `GET http://localhost:8000/health` | `200` — `{"status":"ok"}` | `backend/app/routes.py:243-245` |
| `GET http://localhost:8000/api/metrics` | `200` — JSON de movimientos financieros | `backend/app/routes.py:248-259` |
| `GET http://localhost:8000/docs` | `200` (Swagger UI) | Comportamiento por defecto de `FastAPI()` en `backend/app/main.py:6`; mencionado en `README.md:50` |
| `GET http://localhost:5173/` | `200` (SPA servida) | `frontend/index.html`, `frontend/src/main.tsx` |
| `GET http://localhost:5173/api/metrics` | `200` (proxeado al backend) | `frontend/vite.config.ts:11-15` (proxy `/api` → `http://backend:8000`) |

Otros endpoints existen en el código pero **no se probaron con petición HTTP real** en esta sesión (solo por lectura de código, ver sección ❓): `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b`, `/api/metrics/b2c` — todos en `backend/app/routes.py`.

### Frontend

- SPA en React 19 + TypeScript, empaquetada con Vite. Punto de entrada `frontend/src/main.tsx` → `frontend/src/App.tsx`, montado en `#root` de `frontend/index.html`.
  Evidencia: `frontend/src/main.tsx`, `frontend/index.html:10-11`, `frontend/package.json:19-20` (`react: ^19.2.4`).
- El frontend obtiene datos exclusivamente vía `fetch` a `/api/metrics`; no usa datos locales en runtime.
  Evidencia: `frontend/src/App.tsx:15-21`.
- `frontend/src/lib/mock-data.ts` (`mockMovements`) existe pero no se importa en ningún otro archivo — código muerto.
  Evidencia: única coincidencia de `mock-data`/`mockMovements` en todo el repo es su propia definición en `frontend/src/lib/mock-data.ts:3`.
- El frontend fuerza tema oscuro (`className="dark ..."`) y no tiene enrutador (una sola vista).
  Evidencia: `frontend/src/App.tsx:46`; sin dependencia `react-router` en `frontend/package.json`.
- Usa componentes de estilo shadcn/ui (`style: "new-york"`, `baseColor: "zinc"`).
  Evidencia: `frontend/components.json`, `frontend/src/components/ui/card.tsx`, `frontend/src/components/ui/skeleton.tsx`.
- Gráficas construidas con Recharts (`LineChart`).
  Evidencia: `frontend/src/components/dashboard/income-outcome-chart.tsx:5-14`, `frontend/src/components/dashboard/profit-percent-chart.tsx:5-13`.

### Backend

- API FastAPI servida por uvicorn, sin base de datos: los datos se generan en memoria con `random` y semilla fija `seed=42` en cada endpoint.
  Evidencia: `backend/app/routes.py:94-104` (`generate_mock_movements`), uso de `seed=42` p. ej. en `backend/app/routes.py:255`.
- CORS configurado con `allow_origins=["*"]`.
  Evidencia: `backend/app/main.py:7-13`.
- Confirmado en ejecución real: `generate_mock_movements` produce fechas relativas a la fecha actual del sistema (no fijas a 2024). En esta ejecución (2026-09-04) los `create_date` devueltos por `/api/metrics` comenzaron en `2025-09-02` / `2025-09-04`.
  Evidencia: salida real de `curl http://localhost:8000/api/metrics`; lógica en `backend/app/routes.py:65-68` (`_year_for_month`) y `backend/app/routes.py:97`.
- Modelos de datos Pydantic: `FinancialMovement`, `MetricsFacets`, `MetricsSummaryItem`, `TopCategoryItem`, `MetricsComparison`, `MetricsAlert`.
  Evidencia: `backend/app/routes.py:22-63`.

### Inconsistencia verificada en el propio repositorio (no es un error mío, es un hallazgo)

- El header del dashboard muestra el texto fijo `"2024 - Full Year"`, pero los datos reales que devuelve el backend en ejecución están fechados en 2025/2026 (relativos a `date.today()`), no en 2024.
  Evidencia: `frontend/src/App.tsx:49` (prop `period` hardcodeada) vs. salida real de `/api/metrics` y `backend/app/routes.py:65-68,97`.

### Variables de entorno

- `VITE_API_BASE_URL` (frontend, opcional): si no se define, vale `""` y las llamadas van a rutas relativas que resuelve el proxy de Vite.
  Evidencia: `frontend/src/App.tsx:13`, `frontend/.env.example:1-4`, `README.md:45-46`.
- El backend no lee ninguna variable de entorno (sin `os.environ` / `os.getenv` en el código).
  Evidencia: ausencia confirmada por búsqueda en todo el repo; `backend/app/main.py` y `backend/app/routes.py` no importan `os`.
- `docker-compose.yml` no define la clave `environment` para ningún servicio.
  Evidencia: `docker-compose.yml` (archivo completo).
- Confirmado en ejecución real: el proyecto arrancó y sirvió tráfico correctamente **sin definir ninguna variable de entorno**, tal como indica el README.
  Evidencia: ejecución real de `docker compose up --build` sin archivo `.env` presente.

### Scripts npm

- Único `package.json` del repo está en `frontend/`. Scripts: `dev`, `build`, `lint`, `preview`, `test`, `test:watch`, `test:coverage`.
  Evidencia: `frontend/package.json:6-14`.
- El contenedor de `frontend` solo ejecuta `dev` (vía `npm run dev -- --host 0.0.0.0 --port 5173`).
  Evidencia: `frontend/Dockerfile:12`.

### Docker / Compose

- Dos Dockerfiles (`backend/Dockerfile`, `frontend/Dockerfile`) y un único `docker-compose.yml` en la raíz.
  Evidencia: listado de archivos del repositorio (`git ls-files`).
- Ambas imágenes construyen sin errores y sin caché corrupta en esta sesión (`Built` para `backend` y `frontend`).
  Evidencia: log real de `docker compose up --build`.
- Bind mounts para hot-reload: `./frontend:/app` + volumen anónimo `/app/node_modules`; `./backend:/app`.
  Evidencia: `docker-compose.yml:8-10,21-22`.

### Documentación existente

- `README.md` (inglés) y `README.es.md` (español): descripción del proyecto, pasos recomendados, estructura esperada `./.agents`, cómo ejecutar, URLs.
- `AGENTS.md`: indica a los agentes leer `./.agents/rules`, `./.agents/skills` y `./memory-bank` (si existe) antes de actuar.
  Evidencia: `AGENTS.md:5-13`.
- No existe configuración de CI/CD (`.github/`, `.gitlab-ci.yml`, `.circleci/` ausentes) ni `Makefile`, `pyproject.toml` o `pytest.ini` en el backend.
  Evidencia: listado de archivos del repositorio.

---

## ❌ Incorrecto

No se ha identificado ninguna afirmación previa (propia o de la documentación del repositorio) que resultara contradicha por el código o por la ejecución real. Todo lo declarado en `README.md`, `README.es.md` y `docker-compose.yml` respecto a cómo levantar el proyecto se confirmó tal cual al ejecutarlo.

Si en el futuro se detecta una afirmación falsa, debe documentarse aquí con: la afirmación original, el archivo que la contradice, y la evidencia concreta.

---

## ❓ Sin verificar

- **Endpoints no probados con petición HTTP real** (solo confirmados por lectura de código en `backend/app/routes.py`): `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b`, `/api/metrics/b2c`.
- **Suite de tests**: no se ejecutó `pytest` (backend, `backend/tests/`) ni `npm run test` / `vitest` (frontend, `frontend/src/lib/financial-utils.test.ts`) en esta sesión. Su existencia está verificada por archivo, pero no su resultado real (pass/fail) dentro del contenedor.
- **Comando exacto para correr los tests dentro de Docker**: no está documentado en ningún archivo del repositorio (ni `README.md`, ni Dockerfiles, ni `docker-compose.yml`).
- **Comportamiento de `docker compose down` / reinicio limpio / persistencia entre reinicios**: no se probó en esta sesión (los datos son generados en memoria con seed fija, por lo que en teoría son deterministas, pero esto no se verificó reiniciando el contenedor backend).
- **Comportamiento fuera de Compose** (ej. `npm run dev` o `uvicorn` ejecutados manualmente sin Docker): no se probó; el `target` del proxy de Vite (`http://backend:8000`, `frontend/vite.config.ts:14`) depende del DNS interno de Compose y no se verificó su comportamiento fuera de esa red.
- **Uso real de `VITE_API_BASE_URL` con un valor distinto de vacío**: no se probó apuntando a un backend en otro origen.
- **Estructura `.agents/rules` y `.agents/skills`**: `AGENTS.md` y los README las describen como esperadas, pero no existen en el repositorio en el momento de este análisis. No hay evidencia de qué reglas o skills concretas se espera que contengan.
