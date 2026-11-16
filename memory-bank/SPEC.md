# SPEC: Financial Metrics Dashboard

Statements below cite a source in the repo (file, line or config key) or say how they were observed.
Inferences are labeled "Inference". Anything not backed by evidence is listed under [Not established](#not-established).

## 1. Product overview

### What it is
A financial metrics dashboard: a React + TypeScript frontend and a FastAPI backend
(`README.md`: "Financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend").
The README says it is built by students in 4Geeks Academy's Career Programs, and its "Recommended steps" tell the reader to
fork it, run an AI agent over both halves, and "Document the proposed rules and memory bank".
Inference: the project exists as an exercise for that workflow; the repo does not state a product purpose beyond the sentence above.

### What a user sees today
One page, dark theme (`<main className="dark ...">`, `frontend/src/App.tsx:46`), with:

| Element | What it shows | Source |
|---|---|---|
| Header | Title and a period label, currently the hardcoded string `"2024 - Full Year"` | `App.tsx:49`, `dashboard-header.tsx` |
| KPI row, 4 cards | Total Income, Total Outcome, Profit, Profit Margin (profit as a % of total income) | `kpi-row.tsx:14-42` |
| Chart: "Income vs. Outcome" | Monthly revenue and expenditure, two lines | `income-outcome-chart.tsx:69-70,100-109` |
| Chart: "Profit Margin %" | Monthly profit as a % of income, line with a zero reference line | `profit-percent-chart.tsx:70-71,96-98` |
| Loading / error states | Skeletons while loading; an error banner (Spanish text) if the fetch fails | `App.tsx:26-27,35-39,51-55` |

### Data
- The data is generated, not real: 12 months x 30 movements = 360 per request, seeded with `seed=42`
  (`backend/app/routes.py:94-104,255`; asserted by `test_generate_mock_movements_returns_full_year_sorted_data`).
- A movement is `{create_date, amount, operation_type: income|outcome, category, business_type: B2B|B2C}`
  (`routes.py:22-27`, mirrored in `frontend/src/lib/financial-types.ts`).
- Dates follow `date.today()` (`routes.py:65-68,97`). Observed in November 2026: 2025-11-01 to 2026-10-28.
- There is no database, auth, or persistence (no DB dependency in `requirements.txt`, no models beyond Pydantic).

### Backend capabilities (API)
All routes are in `backend/app/routes.py`. The frontend uses only the first data route.

| Route | Purpose |
|---|---|
| `GET /health` | Liveness (`{"status": "ok"}`) |
| `GET /api/metrics` | Movements, filter by date range, `category`, `operation_type`. **Used by the frontend** (`App.tsx:16`) |
| `GET /api/metrics/facets` | Filter values and min/max date |
| `GET /api/metrics/summary` | Income/outcome/net by `day`, `week` or `month` |
| `GET /api/metrics/categories/top` | Top-N categories by amount (limit 1-20) |
| `GET /api/metrics/comparison` | Net for a period vs. the previous equal-length period, with delta and % |
| `GET /api/metrics/alerts` | Periods whose outcome exceeds the running average by more than `threshold` (default 0.3) |
| `GET /api/metrics/b2b`, `/api/metrics/b2c` | Movements for one business type |

### Current state and known gaps
- Seven of the eight data routes have no frontend consumer (single `fetch` in `App.tsx:16`).
- The frontend aggregates KPIs and monthly series itself (`frontend/src/lib/financial-utils.ts`).
- Reproduced issues are documented with checks in `.agents/rules/known-edge-cases.md`
  (timezone month-shift, stale "2024" header, `build_metrics_facets([])` raising `IndexError`).
- No CI configuration is tracked (`git ls-files` has no `.github/` or pipeline files).

### Verified baseline (2026-11-12, local run)
`pytest` 15 passed (Python 3.14 venv, not the project's 3.13), `npm test` 5 passed, `npm run lint` clean,
`tsc -b` exit 0. The Vite bundle (`npm run build`) and the Docker Compose path were not run
(Docker is not installed on that machine). Details: `memory-bank/verification.md`, `.agents/rules/testing-workflow.md`.

## 2. Tech stack

### Languages
| Language | Where | Evidence |
|---|---|---|
| Python 3.13 | backend runtime | `backend/Dockerfile`: `FROM python:3.13-slim` |
| TypeScript ~6.0.2 (target ES2023, `jsx: react-jsx`) | frontend | `frontend/package.json`, `tsconfig.app.json:4,19` |
| JavaScript (Node 24 runtime for tooling) | frontend dev server, config | `frontend/Dockerfile`: `FROM node:24-alpine`; `vite.config.ts`, `eslint.config.js` |
| CSS (Tailwind utility classes) | styling | `frontend/src/index.css`, `@tailwindcss/vite` plugin |

### Frameworks and runtimes
| Layer | Technology | Evidence |
|---|---|---|
| Backend web framework | FastAPI, with Pydantic models; served by Uvicorn (`--reload`) | `requirements.txt`; `routes.py:8-9`; `backend/Dockerfile` CMD |
| Frontend UI | React 19 (declared `^19.2.4`, installed 19.2.5), `createRoot` + `StrictMode` | `package.json`; `src/main.tsx` |
| Build / dev server | Vite 8 (declared `^8.0.4`, installed 8.0.8) with `@vitejs/plugin-react` | `package.json`; `vite.config.ts` |
| Styling | Tailwind CSS 4 (declared `^4.2.2`, installed 4.2.2) via `@tailwindcss/vite`; shadcn-style components (`style: new-york`, base color zinc) | `package.json`; `vite.config.ts:8`; `components.json` |
| Charts | Recharts 3 (declared `^3.8.1`, installed 3.8.1): `LineChart`, `Line`, `ReferenceLine`, `ResponsiveContainer` | `income-outcome-chart.tsx:5-14`; `profit-percent-chart.tsx` |

### Infrastructure and runtime
| Item | Detail | Evidence |
|---|---|---|
| Orchestration | Docker Compose, two services: `frontend` (5173), `backend` (8000, plus 5678 for debugpy) | `docker-compose.yml` |
| Dev workflow | Source folders bind-mounted; `uvicorn --reload` and Vite dev server; `/app/node_modules` anonymous volume | `docker-compose.yml:8-10,21-22`; Dockerfiles |
| Service wiring | Vite proxies `/api` to `http://backend:8000`; optional `VITE_API_BASE_URL` override | `vite.config.ts:11-15`; `frontend/.env.example`; `App.tsx:13` |
| CORS | `allow_origins=["*"]`, `allow_credentials=True` | `backend/app/main.py:9-10` |
| Debugging | `debugpy` listening on `0.0.0.0:5678` inside the backend container | `backend/Dockerfile` CMD |
| Hosting / CI / CD | Not present in the repo. README mentions GitHub Codespaces as an option | `README.md`; no `.github/` tracked |

### Tooling
| Purpose | Tool | Evidence |
|---|---|---|
| Frontend tests | Vitest 4 (`vitest run`), coverage via `@vitest/coverage-v8` | `package.json` scripts and devDependencies |
| Backend tests | pytest, pytest-cov, httpx (FastAPI `TestClient`) | `requirements.txt`; `backend/tests/` |
| Lint | ESLint 9 with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` | `eslint.config.js`; `package.json` |
| Type checking | `tsc -b`; sets `noUnusedLocals` and `noUnusedParameters`; no `strict` option is set in `tsconfig.app.json` | `package.json` `build`; `tsconfig.app.json:22-23` |
| Python formatting/lint | None configured | no Ruff/Black/pyproject found |
| JS formatting | None configured (no Prettier) | no config files found |
| Package managers | npm (`package-lock.json`), pip (`requirements.txt`, versions unpinned) | repo files |
| Agent workflow | `AGENTS.md` -> `.agents/rules/`, `memory-bank/` | `AGENTS.md` |

### Key dependencies
**Frontend runtime** (`frontend/package.json`):
`react ^19.2.4`, `react-dom ^19.2.4`, `recharts ^3.8.1`, `lucide-react ^1.8.0` (icons),
`class-variance-authority ^0.7.1`, `clsx ^2.1.1`, `tailwind-merge ^3.5.0` (class utilities used by `cn()` in `src/lib/utils.ts`).

**Frontend dev**: `vite ^8.0.4`, `@vitejs/plugin-react ^6.0.1`, `tailwindcss ^4.2.2`, `@tailwindcss/vite ^4.2.2`,
`typescript ~6.0.2`, `vitest ^4.1.4`, `eslint ^9.39.4`, `typescript-eslint ^8.58.0`, `autoprefixer`, `postcss`.

**Backend** (`backend/requirements.txt`, no version pins):
`fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov`, `httpx`. `pydantic` arrives through FastAPI
and is imported directly (`routes.py:9`) without being listed.

## Not established
- Production deployment target, hosting, and any CI/CD: nothing in the repo defines them.
- Backend dependency versions: unpinned, so the exact versions a fresh install gets can change. The local test run used
  FastAPI 0.162.5, which is not a project pin.
- Docker Compose behavior, HMR inside the container, and the `npm run build` bundle: not run.
- Intended users, product goals, or a roadmap: the repo states none beyond the README sentence above.
  This document does not propose any.

Next steps for the gaps and "Not established" items above: see `memory-bank/progress.md` ("Next priorities").
