# Stack tecnológico

> Fuente: `frontend/package.json`, `backend/requirements.txt`, Dockerfiles y `docker-compose.yml`
> (2026-11-19). Versiones de `package.json` son rangos `^`; `requirements.txt` **no fija versiones**.

## Frontend (`frontend/`)
| Pieza | Detalle | Evidencia |
|---|---|---|
| Runtime | Node 24 (`node:24-alpine`) | `frontend/Dockerfile` |
| Lenguaje | TypeScript ~6.0 | `package.json` |
| UI | React 19.2 + react-dom, `StrictMode` | `package.json`, `src/main.tsx` |
| Build/dev | Vite 8 + `@vitejs/plugin-react`; proxy `/api` → `http://backend:8000`; alias `@/` → `src/` | `vite.config.ts` |
| Estilos | Tailwind CSS 4 vía `@tailwindcss/vite`; `tailwind-merge`, `clsx`, `class-variance-authority`; tokens en `src/index.css` | `package.json`, `src/lib/utils.ts` |
| Componentes base | estilo shadcn/ui (`components.json`): `src/components/ui/card.tsx`, `skeleton.tsx` | `components.json` |
| Gráficas | Recharts 3 | `income-outcome-chart.tsx`, `profit-percent-chart.tsx` |
| Iconos | lucide-react | `kpi-row.tsx`, `dashboard-header.tsx` |
| Tests | Vitest 4 (+ `@vitest/coverage-v8`); solo `src/lib/financial-utils.test.ts` | `npm test` |
| Lint | ESLint 9 flat config + typescript-eslint, react-hooks, react-refresh | `eslint.config.js` |

Scripts: `dev`, `build` (`tsc -b && vite build`), `lint`, `test`, `test:watch`, `test:coverage`, `preview`.

## Backend (`backend/`)
| Pieza | Detalle | Evidencia |
|---|---|---|
| Runtime | Python 3.13 (`python:3.13-slim`) | `backend/Dockerfile` |
| Framework | FastAPI (`APIRouter` en `app/routes.py`) | `app/main.py` |
| Validación | Pydantic (transitiva de FastAPI, no listada) | modelos en `routes.py` |
| Servidor | uvicorn `--reload` lanzado bajo `debugpy` (`:5678`) | `Dockerfile` `CMD` |
| Tests | pytest + `fastapi.testclient` (httpx), `pytest-cov` instalado | `requirements.txt`, `tests/` |

## Infra y tooling
- Docker Compose: servicios `frontend` (5173) y `backend` (8000, 5678) con bind mounts para hot reload;
  `frontend` depende de `backend`. Sin healthchecks ni base de datos.
- Sin CI (`.github/workflows/` no existe).
- Contexto para agentes: `AGENTS.md`, `.agents/rules/`, `.agents/skills/` (accessibility,
  react-best-practices, financial-dashboard-domain-rules), `memory-bank/`.

## Comandos verificados
```bash
docker compose up --build -d
docker compose exec backend python -m pytest -q      # 15 passed
docker compose exec frontend npm test                # 10 passed
docker compose exec frontend npm run lint            # OK
docker compose exec frontend npm run build           # OK
```
Ejecutar dentro de los contenedores: el host del Codespace tiene Python 3.14, distinto al de la imagen.
