# Stack tecnológico

> Únicamente tecnologías confirmadas por archivo (manifiestos de dependencias, Dockerfiles, configuración). Las versiones son las declaradas en el repositorio (rangos semver de `package.json`, o sin pin en `requirements.txt`), no versiones "instaladas" verificadas contra un entorno externo salvo donde se indique explícitamente.
> Complementa a [`project-summary.md`](./project-summary.md) (qué es y cómo se ejecuta) y [`conventions.md`](./conventions.md) (cómo está escrito).
> Fecha de generación: 2026-09-04.

---

## Lenguajes

| Lenguaje | Dónde | Evidencia |
|---|---|---|
| Python 3.13 | Backend | `backend/Dockerfile:1` (`FROM python:3.13-slim`) |
| TypeScript `~6.0.2` | Frontend (código de aplicación y tests) | `frontend/package.json:39`, `frontend/tsconfig.app.json`, `frontend/tsconfig.node.json` |
| JavaScript (config only, ESM) | `frontend/eslint.config.js`, `frontend/vite.config.ts` es TS pero se ejecuta como ESM vía Vite | `frontend/eslint.config.js`, `frontend/package.json:5` (`"type": "module"`) |
| HTML | `frontend/index.html` (punto de montaje de la SPA) | `frontend/index.html` |
| CSS (Tailwind, variables `oklch()`) | `frontend/src/index.css` | `frontend/src/index.css` |
| YAML | `docker-compose.yml` | `docker-compose.yml` |
| Dockerfile (sintaxis Docker) | `backend/Dockerfile`, `frontend/Dockerfile` | ambos archivos |

---

## Backend

### Runtime e imagen base
| Elemento | Valor | Evidencia |
|---|---|---|
| Runtime | Python 3.13 (imagen `slim`, basada en Debian) | `backend/Dockerfile:1` |
| Gestor de paquetes | `pip` (sin `poetry`/`pipenv`/`uv`; no hay `pyproject.toml` ni lockfile) | `backend/requirements.txt`, ausencia de `pyproject.toml`/`Pipfile`/`uv.lock` en el listado del repo |

### Framework y librerías (todas en `backend/requirements.txt`, sin versión fijada — ningún `==`)
| Paquete | Rol confirmado en el código | Evidencia de uso |
|---|---|---|
| `fastapi` | Framework web / definición de rutas y modelos | `backend/app/main.py:1` (`from fastapi import FastAPI`), `backend/app/routes.py:8` (`APIRouter`, `Query`) |
| `uvicorn[standard]` | Servidor ASGI que sirve la app | `backend/Dockerfile:12` (`-m uvicorn app.main:app ...`) |
| `debugpy` | Depurador remoto expuesto en el puerto 5678 | `backend/Dockerfile:12` (`-m debugpy --listen 0.0.0.0:5678 ...`) |
| `pytest` | Test runner | `backend/tests/test_routes.py` (15 funciones `test_*`; ejecución real: `15 passed` con `python -m pytest -q`) |
| `pytest-cov` | Cobertura de tests | declarado en `requirements.txt:5`; sin configuración de umbral encontrada (no hay `pyproject.toml`/`.coveragerc`) |
| `httpx` | Dependencia del `TestClient` de FastAPI (cliente HTTP síncrono/asíncrono usado internamente por Starlette/FastAPI para tests) | `backend/tests/test_routes.py:3` (`from fastapi.testclient import TestClient`) |

### Validación de datos
| Elemento | Evidencia |
|---|---|
| `pydantic` (`BaseModel`), instalado como dependencia transitiva de `fastapi` — no aparece como línea propia en `requirements.txt` | `backend/app/routes.py:9` (`from pydantic import BaseModel`), modelos `FinancialMovement`, `MetricsFacets`, `MetricsSummaryItem`, `TopCategoryItem`, `MetricsComparison`, `MetricsAlert` en `backend/app/routes.py:22-63` |

### Librería estándar de Python usada directamente
| Módulo | Uso |
|---|---|
| `random` | Generación de datos financieros simulados (`generate_mock_movements`) — `backend/app/routes.py:3,71-104` |
| `collections.defaultdict` | Agregación de totales por período/categoría — `backend/app/routes.py:4,165,195` |
| `datetime` (`date`, `timedelta`) | Fechas de movimientos, cálculo de rangos de comparación — `backend/app/routes.py:5,65-68,321-323` |
| `typing.Literal` | Enums ligeros (`OperationType`, `Category`, `BusinessType`, `GroupBy`) en vez de `enum.Enum` — `backend/app/routes.py:6,11-15` |
| `__future__.annotations` | Anotaciones de tipo diferidas | `backend/app/routes.py:1` |

### Middleware
| Elemento | Evidencia |
|---|---|
| `CORSMiddleware` de `fastapi.middleware.cors`, configurado con `allow_origins=["*"]` | `backend/app/main.py:2,7-13` |

---

## Frontend

### Runtime y gestor de paquetes
| Elemento | Valor | Evidencia |
|---|---|---|
| Runtime (contenedor) | Node 24 (imagen `alpine`) | `frontend/Dockerfile:1` |
| Gestor de paquetes | `npm` (hay `package-lock.json`; no hay `yarn.lock`/`pnpm-lock.yaml`) | `frontend/package-lock.json`, `frontend/Dockerfile:5-6` (`COPY package*.json ./` + `RUN npm install`) |
| Tipo de módulo | ESM (`"type": "module"`) | `frontend/package.json:5` |

### Framework y librerías de UI (`dependencies` en `frontend/package.json`)
| Paquete | Versión declarada | Rol confirmado en el código | Evidencia de uso |
|---|---|---|---|
| `react` | `^19.2.4` | Librería de UI | `frontend/src/main.tsx:2`, todos los componentes `.tsx` |
| `react-dom` | `^19.2.4` | Renderizado en el DOM | `frontend/src/main.tsx:2,6` (`createRoot`) |
| `recharts` | `^3.8.1` | Gráficas de líneas (income/outcome, profit %) | `frontend/src/components/dashboard/income-outcome-chart.tsx:5-14`, `profit-percent-chart.tsx:5-13` |
| `lucide-react` | `^1.8.0` | Iconos (`LayoutDashboard`, `TrendingUp`, `TrendingDown`, `DollarSign`, `BarChart2`) | `frontend/src/components/dashboard/dashboard-header.tsx:1`, `kpi-row.tsx:4` |
| `clsx` | `^2.1.1` | Composición condicional de clases CSS | `frontend/src/lib/utils.ts:1,5` |
| `tailwind-merge` | `^3.5.0` | Fusión de clases Tailwind sin conflictos | `frontend/src/lib/utils.ts:2,5` |
| `class-variance-authority` | `^0.7.1` | Dependencia del sistema de componentes shadcn/ui (variantes de estilo) | declarada en `frontend/package.json:16`; sin uso directo (`cva(...)`) detectado en los componentes actuales — ver nota en `conventions.md` sobre no asumir uso no evidenciado |

### Build, tipado y estilos (`devDependencies`)
| Paquete | Versión declarada | Rol | Evidencia |
|---|---|---|---|
| `vite` | `^8.0.4` | Bundler / servidor de desarrollo | `frontend/vite.config.ts`, `frontend/Dockerfile:12` |
| `@vitejs/plugin-react` | `^6.0.1` | Soporte de React (JSX, Fast Refresh) en Vite | `frontend/vite.config.ts:2,8` |
| `typescript` | `~6.0.2` | Tipado estático | `frontend/tsconfig*.json`, `npm run build` → `tsc -b` (`frontend/package.json:8`) |
| `typescript-eslint` | `^8.58.0` | Reglas de ESLint específicas de TS | `frontend/eslint.config.js:5,14` |
| `@types/node`, `@types/react`, `@types/react-dom` | `^24.12.2`, `^19.2.14`, `^19.2.3` | Tipos de terceros | `frontend/package.json:27-29` |
| `tailwindcss` | `^4.2.2` | Framework de utilidades CSS | `frontend/src/index.css:1` (`@import "tailwindcss"`) |
| `@tailwindcss/vite` | `^4.2.2` | Integración de Tailwind v4 como plugin de Vite (config CSS-first, sin `tailwind.config.js`) | `frontend/vite.config.ts:3,8` |
| `autoprefixer` | `^10.4.27` | Prefijos CSS automáticos | `frontend/package.json:32`; sin `postcss.config.js` explícito encontrado en el listado del repo — ❓ integración exacta con el pipeline de Tailwind v4 sin verificar |
| `postcss` | `^8.5.9` | Procesador CSS (dependencia de `autoprefixer`/Tailwind) | `frontend/package.json:37` |

### Testing y linting
| Paquete | Versión declarada | Rol | Evidencia |
|---|---|---|---|
| `vitest` | `^4.1.4` | Test runner | `frontend/package.json:11-13` (`test`, `test:watch`, `test:coverage`), `frontend/src/lib/financial-utils.test.ts:1` (`describe`, `expect`, `it`) |
| `@vitest/coverage-v8` | `^4.1.4` | Cobertura de tests (motor V8) | `frontend/package.json:31`, script `test:coverage` |
| `eslint` | `^9.39.4` | Linter | `frontend/eslint.config.js`, script `lint` |
| `@eslint/js` | `^9.39.4` | Reglas recomendadas base de ESLint | `frontend/eslint.config.js:1,13` |
| `eslint-plugin-react-hooks` | `^7.0.1` | Reglas de hooks de React | `frontend/eslint.config.js:3,15` |
| `eslint-plugin-react-refresh` | `^0.5.2` | Reglas de Fast Refresh (Vite) | `frontend/eslint.config.js:4,16` |
| `globals` | `^17.4.0` | Definición de globals de entorno (browser) para ESLint | `frontend/eslint.config.js:2,20` |

### Sistema de componentes
| Elemento | Evidencia |
|---|---|
| shadcn/ui, estilo `"new-york"`, `baseColor: "zinc"`, sin variables CSS de shadcn (`cssVariables: false` — el proyecto usa sus propias variables definidas manualmente en `index.css`, no las que shadcn generaría por defecto) | `frontend/components.json` |
| Componentes UI propios (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`, `Skeleton`) siguiendo el patrón `data-slot` de shadcn/ui | `frontend/src/components/ui/card.tsx`, `frontend/src/components/ui/skeleton.tsx` |

---

## Docker / Infraestructura local

| Elemento | Valor | Evidencia |
|---|---|---|
| Orquestación | Docker Compose (`services: frontend, backend`) | `docker-compose.yml` |
| Imagen backend | `python:3.13-slim` | `backend/Dockerfile:1` |
| Imagen frontend | `node:24-alpine` | `frontend/Dockerfile:1` |
| Versión de Docker usada en esta sesión para validar el stack | `29.7.2` (build `a7dcaa6`) | salida real de `docker --version` en esta sesión |
| Requisito de host confirmado | WSL2 (Windows) para que el daemon de Docker Desktop arranque | verificado en esta sesión: fallo con WSL no instalado, éxito tras instalarlo (`wsl --status`, `wsl -l -v`) |

---

## Tooling transversal / Git

| Elemento | Valor | Evidencia |
|---|---|---|
| Control de versiones | Git, repositorio con historial lineal + merges de PR | `git log --oneline` |
| Sin CI/CD configurado | Ausencia de `.github/workflows`, `.gitlab-ci.yml`, `.circleci/` | listado de archivos del repositorio |
| Sin formateador de código (Prettier) | Ausencia de `prettier` en `devDependencies` y de `.prettierrc` | `frontend/package.json` (devDependencies completas), listado del repo |
| Sin gestor de tareas transversal (`Makefile`, `Taskfile`) | Ausencia confirmada en el listado del repo | — |

---

## ❓ Sin verificar

- **Versiones exactas resueltas** (vs. rangos semver declarados) de los paquetes de `frontend/package-lock.json` no se listaron una por una en este documento — el archivo existe y fija versiones exactas, pero no se transcribió su contenido completo aquí.
- **Versión exacta instalada de `fastapi`, `uvicorn`, `pydantic`, `pytest`, etc.** en el contenedor backend: `requirements.txt` no fija versiones (sin `==`), por lo que la versión real instalada depende del momento del build (`pip install` toma siempre la última disponible en ese instante) y no se verificó con `pip freeze` dentro del contenedor en esta sesión.
- **Uso real de `class-variance-authority` y `autoprefixer`**: ambos están declarados como dependencia pero no se encontró una llamada directa a `cva(...)` en los componentes actuales, ni un `postcss.config.js` explícito — su integración exacta en el pipeline de build no se verificó en profundidad.
