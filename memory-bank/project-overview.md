# Project Overview — Financial Metrics Dashboard

> Última actualización: 2026-09-29
> Repositorio: `4GeeksAcademy/ai-eng-financial-dashboard-context-project`

## Propósito y arquitectura

Dashboard full-stack para explorar métricas financieras simuladas.

| Componente | Stack | Puerto |
|---|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, Recharts | 5173 |
| Backend | Python 3.13, FastAPI, Uvicorn | 8000 |
| Contenedores | Docker Compose, servicios `frontend` y `backend` | — |

Desarrollo: `docker compose up --build`. Vite sirve el frontend y proxifica `/api` a `http://backend:8000`; desde el navegador se usa la URL del frontend, no el nombre DNS interno `backend`.

## Backend

Dependencias en `backend/requirements.txt`: FastAPI, Uvicorn, debugpy, pytest, pytest-cov e httpx.

### Endpoints

| Endpoint | Función |
|---|---|
| `GET /health` | Health check |
| `GET /api/metrics` | Movimientos, con filtros de fecha, categoría y operación |
| `GET /api/metrics/facets` | Opciones de filtros y rango de fechas |
| `GET /api/metrics/summary` | Agregados por día, semana o mes; acepta filtros y `business_type` |
| `GET /api/metrics/categories/top` | Categorías principales por operación |
| `GET /api/metrics/comparison` | Neto de dos períodos consecutivos |
| `GET /api/metrics/alerts` | Alertas por aumentos de gastos |
| `GET /api/metrics/b2b`, `GET /api/metrics/b2c` | Movimientos por tipo de negocio |

Los datos se generan en memoria: 360 movimientos por llamada, 30 por cada mes. `create_date` es una fecha ISO y el conjunto representa aproximadamente los últimos 12 meses; el rango comprobado el 2026-09-29 fue 2025-09-02 a 2026-08-28. Los modelos Pydantic validan las respuestas. No hay base de datos.

## Frontend y flujo de datos

El dashboard obtiene `GET /api/metrics/summary?group_by=month`, no descarga los movimientos individuales. Los tipos del contrato están en `src/lib/financial-types.ts`; `financial-utils.ts` transforma agregados en KPI y series. Las fechas ISO se agrupan por el prefijo `YYYY-MM` para evitar desplazamientos de mes por zona horaria.

`App.tsx` cancela la petición con `AbortController`, presenta errores HTTP/red y carga las gráficas mediante `React.lazy`/`Suspense`. Recharts queda en chunks diferidos; una build reciente redujo el chunk principal de 585.94 kB a 188.53 kB minificado (175.57 kB a 60.12 kB gzip). Los componentes incluyen skeletons, estado vacío y tablas accesibles para las gráficas.

`mock-data.ts` conserva datos de muestra estáticos, pero no es la fuente del dashboard conectado a la API.

## Tests y comandos

| Capa | Framework | Estado comprobado |
|---|---|---|
| Backend | pytest + FastAPI TestClient/httpx | 15 tests |
| Frontend | Vitest + React Testing Library + jsdom | 18 tests en 3 archivos |

Comandos desde `frontend/`: `npm test`, `npm run test:coverage`, `npm run lint`, `npm run build`.

Backend: `python -m pytest -q` requiere instalar `backend/requirements.txt`; alternativamente, con Docker: `docker compose run --rm backend python -m pytest -q`.

Los tests del frontend están junto al código (`*.test.ts`/`*.test.tsx`). Cubren transformaciones, zona horaria, estados de carga/error/cancelación de App y estados/semántica accesible de las gráficas. La guía de reglas del repo está en `.agents/rules/`; para nuevas funciones puras en `lib/`, añadir tests Vitest.

## Skills para el agente

Antes de una tarea del proyecto, revisar `AGENTS.md`, este memory-bank y las reglas aplicables de `.agents/rules/`.

| Skill | Cuándo usarla y adaptación del proyecto |
|---|---|
| `financial-dashboard-analysis` (`.agents/skills/financial-dashboard-analysis/SKILL.md`) | Skill local para análisis, mantenimiento, pruebas y extensión de API/UI; seguir las reglas del repo y mantener alineados los modelos Pydantic y TypeScript. |
| `financial-metrics-contracts` (`.agents/skills/financial-metrics-contracts/SKILL.md`) | Skill local para cambios en contratos, filtros, agregaciones, KPI, comparaciones, alertas y datos mock; preservar invariantes financieros y paridad API/UI. |
| `javascript-typescript-jest` (`.agents/skills/javascript-typescript-jest/SKILL.md`) | Usarla para diseñar tests JS/TS, mocks, casos async y tests de componentes. La skill menciona Jest, pero este proyecto usa Vitest: traducir `jest.*` a `vi.*`; no migrar el runner. Para React, usar Testing Library, consultas por roles/nombres accesibles y `jsdom`; usar `userEvent` cuando el flujo tenga interacción. |
| `vercel-react-best-practices` (`.agents/skills/vercel-react-best-practices/SKILL.md`) | Usarla al tocar componentes, fetching, renderizado o bundle. Adaptar ejemplos de Next.js al stack React/Vite (por ejemplo `React.lazy`, no `next/dynamic`) y evitar memoización sin evidencia de trabajo costoso. |
| `accessibility` (`.agents/skills/accessibility/SKILL.md`) | Usarla para auditorías o mejoras WCAG. Priorizar inspección de árbol accesible, teclado y evidencia del render; si no hay navegador/Lighthouse disponible, dejar indicada esa limitación y validar con tests/axe cuando proceda. |

Las tres skills comunitarias figuran en `skills-lock.json`; `financial-dashboard-analysis` y `financial-metrics-contracts` son skills locales específicas del proyecto.

## Riesgos y contexto conocido

- CORS permite todos los orígenes y credenciales en `backend/app/main.py`; restringirlo antes de despliegues con datos reales.
- `backend/Dockerfile` inicia debugpy en `0.0.0.0:5678` y `docker-compose.yml` publica ese puerto. La configuración actual es de desarrollo y no debe exponerse en producción.
- `generate_mock_movements(seed=42)` usa el generador aleatorio global. Una prueba concurrente observó 5 respuestas distintas entre 64 llamadas con la misma semilla. Usar una instancia local `random.Random(seed)` para aislar solicitudes.
- `App.tsx` fija el encabezado en 2024 aunque la API entrega un período móvil. El período visible debe derivarse de los datos.
- `ProfitPercentChart` interpreta que todos los márgenes iguales a 0 significan ausencia de datos; un mes con ingresos y gastos iguales debe distinguirse de un conjunto vacío.
- En una sesión de Codespaces se observó timeout de conexiones directas del contenedor frontend a `backend:8000`, aunque ambos estaban en la red Compose y la API respondía desde el host. No fue posible inspeccionar reglas del firewall por falta de permisos; el origen fuera del repositorio sigue sin confirmarse. Revalidar en el entorno donde ocurra.
- En la instalación actual, `npm audit` reportó 12 vulnerabilidades de dependencias de desarrollo (1 baja, 5 moderadas, 6 altas); `npm audit --omit=dev` reportó 0 vulnerabilidades de producción. Revisar y actualizar el toolchain de forma controlada.
- Los tests backend pasan en Docker, con una advertencia de deprecación de `starlette.testclient` respecto a HTTPX.
