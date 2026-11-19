# practicas.md — Hallazgos de ingeniería (con evidencia)

Solo se conservan hallazgos ligados a un archivo, carpeta o comportamiento comprobado.
Descartados de la versión anterior por vagos o no verificables: "uso consistente y descriptivo de nombres",
"manejo de errores con mensajes claros" (solo hay un mensaje genérico en `App.tsx`), "no se detectaron
comentarios" (sí hay JSDoc en `frontend/specs/api-types.ts`).

IDs `H-x` referenciados por [reglas.md](./reglas.md) y por `.agents/rules/`.

## Arquitectura

- **H-1 — Backend en un solo archivo.** Modelos Pydantic, generador mock, funciones puras de agregación y
  9 rutas viven en `backend/app/routes.py`; `main.py` solo crea la app, CORS e incluye el router.
- **H-2 — Patrón de ruta repetido.** Cada handler hace `generate_mock_movements(seed=42)` → filtro opcional
  por `business_type` → `filter_movements(...)` → función pura (`summarize_movements`,
  `build_top_categories`, `detect_outcome_alerts`...). La lógica está en funciones puras testeables.
- **H-3 — Datos 100% mock y relativos a hoy.** `generate_mock_movements` usa `date.today()` y
  `random.seed(seed)` (semilla **global** del módulo `random`). Rango actual: `2025-11-01`..`2026-10-28`.
- **H-4 — El frontend calcula los KPIs.** `App.tsx` solo consume `GET /api/metrics` y deriva todo con
  `computeKPIs` / `computeMonthlyData` (`frontend/src/lib/financial-utils.ts`). Los otros 7 endpoints no se usan aún.
- **H-5 — Specs de funcionalidades futuras.** `frontend/specs/` contiene 3 specs + tipos de contrato
  (`api-types.ts`, `param-types.ts`) verificados contra `/docs`, sin implementar.

## Contratos y naming

- **H-6 — snake_case en el cable, camelCase en la UI.** `FinancialMovement` usa `create_date`,
  `operation_type`, `business_type` igual en `routes.py` y `financial-types.ts`; los modelos de UI
  (`KPIMetrics`, `MonthlyDataPoint`) usan `totalIncome`, `profitPercent`.
- **H-7 — Literales duplicados entre capas.** `OperationType`, `Category`, `BusinessType` se definen en
  `routes.py` (`Literal[...]`) y en `financial-types.ts` (unión de strings). No hay generación de tipos.
- **H-8 — Ratio vs. porcentaje inconsistente.** `/api/metrics/comparison.delta_pct` ya viene ×100;
  `/api/metrics/alerts.increase_ratio` es ratio decimal. `formatPercent` espera porcentaje.
- **H-9 — Convención de archivos.** Componentes en kebab-case (`kpi-card.tsx`) exportando PascalCase
  (`KPICard`), alias `@/` → `src/` (`vite.config.ts`, `components.json` de shadcn).

## Corrección / bugs latentes

- **H-10 — Agrupado mensual dependiente de zona horaria.** `toYearMonthKey(new Date(m.create_date))`
  interpreta `"YYYY-MM-DD"` como UTC y lee `getMonth()` local. En UTC−5, los movimientos del día `01`
  (16 de 360 hoy) se suman al mes anterior.
- **H-11 — Periodo hardcodeado.** `App.tsx` pasa `period="2024 - Full Year"` y `DashboardHeader` tiene
  default `'2024 — Full Year'`, pero los datos son de los últimos 12 meses (H-3).
- **H-12 — Código muerto.** `frontend/src/lib/mock-data.ts` no se importa en ningún sitio.

## Testing y DX

- **H-13 — Tests existentes.** Backend: `backend/tests/test_routes.py` (15 tests, `TestClient`), `conftest.py`
  ajusta `sys.path`. Frontend: `financial-utils.test.ts` (5 tests Vitest) cubre solo `lib/`, no componentes.
- **H-14 — Lint roto.** `npm run lint` falla con 6 `no-empty-object-type` en `frontend/specs/api-types.ts`
  (`interface X extends Array<T> {}`).
- **H-15 — Sin CI ni versiones fijadas.** No hay `.github/workflows/`; `requirements.txt` no fija versiones;
  el host del Codespace tiene Python 3.14 y el contenedor 3.13 → ejecutar tests **dentro** del contenedor.
- **H-16 — `.env.example` engañoso.** `VITE_API_BASE_URL=backend:` rompe el fetch si se copia tal cual;
  el proxy de Vite (`/api` → `http://backend:8000`) hace innecesaria la variable en local.

## Seguridad

- **H-17 — Superficie abierta.** `allow_origins=["*"]` con `allow_credentials=True` (`main.py`), sin auth,
  y puerto `5678` de debugpy publicado en `docker-compose.yml`. Aceptable en local, no en despliegue.

## Documentación y contexto para agentes

- **H-18 — Skills duplicadas.** `financial-dashboard-domain-rules/SKILL.md` existe idéntico en `.skills/` y
  `.agents/skills/`; además hay `frontend/.agents/skills/performance` y dos `skills-lock.json`
  (raíz y `frontend/`). `AGENTS.md` solo apunta a `.agents/`.
