# context.md — Resumen verificado del proyecto

Resumen generado con el coding agent y contrastado contra el código y contra los servicios en ejecución
(`docker compose up --build`, 2026-11-19).
Leyenda: ✅ verificada en código/ejecución · ❌ incorrecta (se indica la corrección) · ❓ sin verificar.

## Qué hace

Dashboard de métricas financieras: el frontend pide movimientos financieros a la API, calcula KPIs y
series mensuales en el cliente y los pinta en tarjetas y gráficas.

| Afirmación | Estado | Evidencia |
|---|---|---|
| Muestra 4 KPIs: ingresos, egresos, utilidad y margen % | ✅ | `frontend/src/components/dashboard/kpi-row.tsx`, `computeKPIs` en `frontend/src/lib/financial-utils.ts` |
| Muestra gráfica mensual ingresos/egresos y gráfica de margen % | ✅ | `income-outcome-chart.tsx`, `profit-percent-chart.tsx` (cargadas con `lazy()` en `App.tsx`) |
| El frontend solo consume `GET /api/metrics` | ✅ | `fetchFinancialData` en `frontend/src/App.tsx` |
| Los KPIs se calculan en el frontend, no en el backend | ✅ | `computeKPIs` / `computeMonthlyData` en `App.tsx` |
| Los datos son reales / vienen de una base de datos | ❌ | No hay BD. Cada endpoint llama `generate_mock_movements(seed=42)` (`backend/app/routes.py`): 12 meses × 30 movimientos = 360 registros, regenerados en cada request |
| Los datos cubren el año 2024 | ❌ | El mock usa `date.today()`: cubre los 12 meses anteriores al mes actual (hoy `/api/metrics/facets` devuelve `2025-11-01`..`2026-10-28`). La etiqueta `"2024 - Full Year"` de `App.tsx` está *hardcodeada* y no coincide |
| `frontend/src/lib/mock-data.ts` alimenta el dashboard | ❌ | No se importa en ningún archivo de `src/` (código muerto) |

## Cómo se conecta

| Afirmación | Estado | Evidencia |
|---|---|---|
| Backend en FastAPI (antes: "FastAPI o Flask probable") | ❌→✅ | `backend/app/main.py`: `FastAPI(title="Financial Metrics API")`. No hay Flask en `requirements.txt` |
| Rutas definidas en un único `APIRouter` | ✅ | `backend/app/routes.py` (modelos Pydantic, lógica y rutas en el mismo archivo) |
| Endpoints: `/health`, `/api/metrics`, `/api/metrics/{facets,summary,categories/top,comparison,alerts,b2b,b2c}` | ✅ | `curl localhost:8000/openapi.json` devuelve exactamente esas 9 rutas |
| Existe un endpoint `/movements/summary` | ❌ | No existe (lo citaba `.agents/rules/nombre-claro.md`). El real es `/api/metrics/summary` |
| `/api/metrics/comparison` funciona sin parámetros | ❌ | `start_date` y `end_date` son obligatorios (`Query(...)`); sin ellos responde 422 |
| El frontend llega al backend por el proxy de Vite `/api` → `http://backend:8000` | ✅ | `frontend/vite.config.ts`; `curl localhost:5173/api/metrics/facets` responde JSON del backend |
| `VITE_API_BASE_URL` es opcional | ✅ | `App.tsx`: `import.meta.env.VITE_API_BASE_URL ?? ""` |
| El valor de ejemplo de `.env.example` funciona | ❌ | `VITE_API_BASE_URL=backend:` generaría la URL `backend:/api/metrics`, que el navegador no resuelve. Solo debe definirse con un origen completo |
| CORS abierto | ✅ | `main.py`: `allow_origins=["*"]` + `allow_credentials=True` |
| Hay autenticación | ❌ | No hay ninguna dependencia de seguridad en rutas ni middleware de auth |

## Cómo se ejecuta

| Afirmación | Estado | Evidencia |
|---|---|---|
| `docker compose up --build` levanta frontend y backend | ✅ | `docker-compose.yml`; ambos contenedores `Up` |
| Frontend en `:5173`, backend en `:8000`, docs en `:8000/docs` | ✅ | Puertos en `docker-compose.yml` y en el `CMD` de cada `Dockerfile`; `curl` 200 en `/` y `/health` |
| El backend expone además `:5678` | ✅ | Puerto de `debugpy` (`backend/Dockerfile` `CMD`); no estaba en el README |
| Backend con hot reload | ✅ | `uvicorn ... --reload` + volumen `./backend:/app` |
| Python 3.13 / Node 24 | ✅ | `FROM python:3.13-slim`, `FROM node:24-alpine` (el host del Codespace tiene Python 3.14, distinto) |
| Tests de backend con pytest | ✅ | `docker compose exec backend python -m pytest -q` → 15 passed |
| No hay tests de frontend | ❌ | Existe `frontend/src/lib/financial-utils.test.ts` (Vitest): `npm test` → 5 passed |
| `npm run lint` pasa | ❌ | 6 errores `no-empty-object-type` en `frontend/specs/api-types.ts` |
| `npm run build` pasa | ✅ | `tsc -b && vite build` termina OK |
| Hay CI | ✅ (no hay) | No existe `.github/workflows/` |
| El dashboard se ve igual en cualquier zona horaria | ❌ | `computeMonthlyData` hace `new Date("YYYY-MM-DD")` (UTC) y lee `getMonth()` (local): en UTC−5 los 16 movimientos con día `01` caen en el mes anterior |
| Las specs de `frontend/specs/` ya están implementadas | ❓→❌ | Son especificaciones de 3 funcionalidades futuras (filtro de fechas, alertas, B2B/B2C). Ningún archivo de `src/` las importa |

Detalle de cada corrección y cómo se verificó: [verification.md](./verification.md).
