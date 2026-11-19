# verification.md — Rastro de verificación

Formato: **afirmación del agent (o de un artefacto previo) → realidad → cómo se comprobó**.

## Fase 1 — Comprensión del handover

Entorno: Codespace, `docker compose up --build` (2026-11-19).

| # | Afirmación incorrecta | Corrección | Cómo se comprobó |
|---|---|---|---|
| 1 | "Framework probable: FastAPI o Flask" (`context.md` v1) | Es FastAPI | `backend/app/main.py`, `backend/requirements.txt` |
| 2 | "No se detectan tests automatizados en el frontend" (`memory-bank/estado-actual.md` v1) | Hay Vitest con 5 tests | `frontend/src/lib/financial-utils.test.ts`; `npm test` → 5 passed |
| 3 | Endpoint de ejemplo `/movements/summary` (`.agents/rules/nombre-claro.md` v1) | No existe; es `/api/metrics/summary` | `curl localhost:8000/openapi.json` |
| 4 | Los datos son de "2024 - Full Year" (UI) | El mock cubre los 12 meses previos al mes actual | `routes.py::_year_for_month`; `/api/metrics/facets` → `2025-11-01`..`2026-10-28` |
| 5 | `pydantic` está en `requirements.txt` (`memory-bank/stack-tecnologico.md` v1) | Llega como dependencia transitiva de `fastapi`; el archivo lista `fastapi, uvicorn[standard], debugpy, pytest, pytest-cov, httpx` | `backend/requirements.txt` |
| 6 | Dependencias clave del frontend: `react, lucide-react, recharts, clsx` | Faltaban `tailwindcss` v4 (vía `@tailwindcss/vite`), `tailwind-merge`, `class-variance-authority` | `frontend/package.json` |
| 7 | `VITE_API_BASE_URL=backend:` es un valor de ejemplo válido | Produce `backend:/api/metrics` (URL inválida en navegador) | Lectura de `App.tsx` + `.env.example` |
| 8 | Solo hay puertos 5173 y 8000 | También 5678 (debugpy) | `docker-compose.yml`, `backend/Dockerfile` |
| 9 | Lint del frontend limpio (asumido) | 6 errores en `frontend/specs/api-types.ts` | `docker compose exec frontend npm run lint` |
| 10 | El agrupado mensual es correcto | Depende de la zona horaria del navegador | `TZ=America/Bogota node -e 'new Date("2026-01-01").getMonth()'` → 11 (diciembre) |

Verificado en ejecución: `/health` → `{"status":"ok"}`; `localhost:5173/api/metrics/facets` (proxy) → JSON;
pytest 15 passed; vitest 5 passed; `npm run build` OK.

## Fase 3 — Validación de reglas con tareas reales

Las 3 reglas previas (`alcance-claro.md`, `nombre-claro.md`, `razon-clara.md`) se retiraron: eran
genéricas y `nombre-claro.md` citaba un endpoint inexistente (`/movements/summary`). Su contenido útil
(naming, *porqué* en commits) quedó en `contratos-api-ui.md` y `verificacion-y-commits.md`.

### Tarea 1 — Bug de zona horaria (H-10) + periodo hardcodeado (H-11)
Regla bajo prueba: `.agents/rules/frontend-dashboard.md` (puntos 1–3) y `verificacion-y-commits.md`.

| Qué pidió la regla | Qué se hizo | Resultado |
|---|---|---|
| Test con día `01` antes del cambio | Test nuevo en `financial-utils.test.ts` | ❌ en `TZ=America/Bogota`: `expected 'Dec 2025' to equal 'Jan 2026'` (bug reproducido) |
| Fechas como string, no `new Date(iso)` | `toYearMonthKey` usa `isoDate.slice(0, 7)` | ✅ |
| Cálculo en `lib/`, no en componentes | `formatPeriodRange` en `financial-utils.ts` + 4 tests | ✅ |
| Nada hardcodeado | `App.tsx` pasa `period={formatPeriodRange(movements)}`; header sin default "2024" | ✅ |
| Ejecutar en contenedores | `npm test` con `TZ=America/Bogota`, `UTC`, `Asia/Tokyo` → 10/10; `npm run build` OK | ✅ |

**Iteración de la regla:** la primera versión del comando de verificación era
`TZ=... docker compose exec -e TZ=... frontend npm test`; el `TZ` del host no llega al contenedor, así que
se simplificó a `docker compose exec -e TZ=America/Bogota frontend npm test` y se marcó como obligatorio al tocar fechas.

### Tarea 2 — Lint roto (H-14)
Regla bajo prueba: `verificacion-y-commits.md` punto 1 (lint obligatorio en cambios `.ts`).
Al ejecutar `npm run lint` tras la Tarea 1, falló por 6 errores **previos** en `frontend/specs/api-types.ts`.
La regla obliga a reportarlo en vez de ignorarlo; se corrigió `interface X extends Array<T> {}` →
`type X = T[]` (mismo tipo, sin cambio de contrato). `npm run lint` ✅, `tsc --strict` sobre `specs/` ✅.

## Fase 4 — Memory bank

| Afirmación en `memory-bank/` v1 | Corrección | Cómo se comprobó |
|---|---|---|
| "Backend con endpoints para ... mock de movimientos" / "Lógica de negocio en `frontend/src/lib/`" | Se listan las 9 rutas reales y cuáles usa la UI (solo `/api/metrics`) | `openapi.json`, `App.tsx` |
| "No se detectan tests automatizados en el frontend" | Vitest con 10 tests | `npm test` |
| `pydantic` en requirements | Transitiva (pydantic 2.14.4 vía fastapi 0.165.0) | `python -c "import pydantic,fastapi"` en el contenedor |
| "Falta i18n", "añadir autenticación", "CI/CD", "base de datos" como prioridades | Retirado el roadmap genérico; las prioridades se derivan de gaps con evidencia y de `frontend/specs/` | — |
| Borrador v2: KPI "Profit Margin %" | La etiqueta es "Profit Margin" | `kpi-row.tsx:39` |
