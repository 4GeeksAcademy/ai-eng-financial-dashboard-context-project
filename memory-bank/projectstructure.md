# Project Structure — Financial Metrics Dashboard

_Last verified: 2026-10-09._

```
.
├─ AGENTS.md                  # Agent entry point: read .agents/rules, .agents/skills, memory-bank
├─ README.md / README.es.md   # Run docs (docker compose up --build); bilingual
├─ verification.md            # Audit trail: checklist + 20 proposed rules + Phase 3 implementation
├─ docker-compose.yml         # frontend (:5173) + backend (:8000, :5678 debugpy)
├─ .agents/rules/             # 20 DRAFT contributor rules (8 category files + README index)
├─ memory-bank/               # This folder — persistent project knowledge for agents
│
├─ backend/
│  ├─ Dockerfile              # python:3.13-slim; uvicorn under debugpy (dev-only)
│  ├─ requirements.txt        # fastapi, uvicorn, debugpy, pytest, pytest-cov, httpx
│  ├─ app/
│  │  ├─ main.py              # FastAPI app + CORS middleware (wildcard — dev-only)
│  │  └─ routes.py            # ALL backend logic: models, mock generator, helpers, routes
│  └─ tests/
│     ├─ conftest.py          # sys.path bootstrap only
│     └─ test_routes.py       # 19 tests: routes, filters, mock gen, validation bounds
│
└─ frontend/
   ├─ Dockerfile              # node:24-alpine; npm run dev on :5173
   ├─ vite.config.ts          # /api proxy → backend:8000; @/ alias
   ├─ components.json         # shadcn-style component config
   ├─ package.json            # scripts: dev, build, lint, test, test:watch, test:coverage
   └─ src/
      ├─ main.tsx             # React entry, mounts App
      ├─ App.tsx              # Fetches /api/metrics; derives KPIs, monthly data, period label
      ├─ index.css            # Tailwind + theme tokens
      ├─ components/
      │  ├─ dashboard/        # dashboard-header, kpi-card, kpi-row, income-outcome-chart, profit-percent-chart
      │  └─ ui/               # shadcn-style primitives: card, skeleton
      └─ lib/
         ├─ financial-types.ts       # TS mirror of backend Pydantic models
         ├─ financial-utils.ts       # PURE calculations (+ period label); colocated tests
         ├─ financial-utils.test.ts  # 10 vitest cases
         ├─ mock-data.ts             # frontend-side mock fixtures (dev/testing)
         └─ utils.ts                 # cn() class-merge helper
```

## Conventions encoded in this structure

- Backend is a **single-module monolith by design** (`routes.py`) — fine at current scale; split only when it hurts (rule 4).
- Frontend separates **pure logic** (`lib/`), **composed views** (`components/dashboard/`), and **primitives** (`components/ui/`).
- Tests live **next to what they test** on the frontend and in a **central test module** on the backend.
