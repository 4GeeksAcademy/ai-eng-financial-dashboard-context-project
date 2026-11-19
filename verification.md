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
