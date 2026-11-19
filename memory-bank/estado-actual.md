# Estado actual

> Última actualización: 2026-11-19. Actualizar en el mismo commit que cierre o abra un gap
> (`.agents/rules/verificacion-y-commits.md`).

## Qué funciona (comprobado en ejecución)
- `docker compose up --build` levanta ambos servicios; `/health` → `{"status":"ok"}`.
- Dashboard: 4 KPIs + 2 gráficas a partir de `GET /api/metrics` vía proxy de Vite.
- 9 rutas de API documentadas en `/docs`.
- Tests: backend 15/15 (pytest), frontend 10/10 (Vitest, también con `TZ=America/Bogota` y `Asia/Tokyo`).
- `npm run lint` y `npm run build` en verde.

## Cambios recientes
- Agrupado mensual independiente de la zona horaria (antes los movimientos del día 01 caían en el mes
  anterior en UTC−). `frontend/src/lib/financial-utils.ts`.
- Periodo de la cabecera derivado de los datos (antes "2024 - Full Year" fijo).
- Lint arreglado en `frontend/specs/api-types.ts`.

## Gaps conocidos (con evidencia)
| Gap | Evidencia |
|---|---|
| Datos 100% mock, sin persistencia | `generate_mock_movements` en cada handler de `routes.py` |
| `random.seed()` global en cada request (no thread-safe si se añade concurrencia) | `routes.py::generate_mock_movements` |
| 7 de 9 endpoints sin consumir en la UI | solo `/api/metrics` en `App.tsx` |
| 3 funcionalidades especificadas sin implementar (filtro de fechas, tabla de alertas, B2B vs. B2C) | `frontend/specs/funcionalidad-*.md` |
| Tipos duplicados a mano Python ↔ TS | `routes.py` vs. `financial-types.ts` vs. `specs/api-types.ts` |
| `delta_pct` es porcentaje y `increase_ratio` es ratio | modelos `MetricsComparison`, `MetricsAlert` |
| Sin tests de componentes React | solo existe `financial-utils.test.ts` |
| Sin CI y dependencias de backend sin versión fija | no hay `.github/workflows/`; `requirements.txt` |
| CORS `*` con credenciales, sin auth, debugpy publicado | `backend/app/main.py`, `docker-compose.yml` |
| `.env.example` con valor inválido (`VITE_API_BASE_URL=backend:`) | `frontend/.env.example` |
| Código muerto `frontend/src/lib/mock-data.ts` | no se importa |
| Skill duplicada en `.skills/` y `.agents/skills/` | `financial-dashboard-domain-rules/SKILL.md` |
| Warning de deprecación de `httpx` en `TestClient` | salida de pytest |

## Siguientes prioridades (derivadas de los gaps y specs existentes, no de un roadmap)
1. Implementar las specs de `frontend/specs/` en orden (1: filtro de fechas con `/api/metrics/facets`).
2. Corregir `frontend/.env.example` (comentar la variable o usar `http://localhost:8000`).
3. Eliminar duplicados de contexto (`.skills/`, `mock-data.ts`) tras confirmar que nadie los usa.
4. Fijar versiones en `requirements.txt` y añadir un workflow de CI con pytest, vitest, lint y build.
