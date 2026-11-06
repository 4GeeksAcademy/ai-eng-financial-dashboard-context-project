# API contract

**Scope:** any change that crosses the frontend and backend boundary.

**Why:** types are copied by hand between `routes.py` and `financial-types.ts`,
and `response.json()` in `App.tsx` is not validated. A mismatch passes the build
and only shows up at runtime.

## Keep both sides in sync

Nothing generates the frontend types from the API, so a mismatch does not fail
at build time. Change these together, in the same piece of work:

| Backend (`backend/app/routes.py`) | Frontend (`frontend/src/lib/financial-types.ts`) |
|---|---|
| `OperationType`, `Category`, `BusinessType` | Types with the same names |
| `FinancialMovement` | `FinancialMovement` |
| `MetricsFacets` | `MetricsFacets` |

- API fields use `snake_case`, such as `create_date` and `operation_type`.
- Types derived in the frontend use `camelCase`, such as `totalIncome`.
- `create_date` is a plain `YYYY-MM-DD` string with no time or timezone. See the
  date rule in [frontend.md](frontend.md).

## Routing

- Put new API routes under `/api`. The Vite dev server only proxies `/api`.
- `/health` is deliberately outside `/api`, so request it on port 8000. On port
  5173 it returns the app's HTML with a 200, which looks like success.
- Frontend code builds URLs from `API_BASE_URL` (`VITE_API_BASE_URL`, which
  defaults to `""` and uses the proxy). Do not hardcode hosts or ports.
- Set `VITE_API_BASE_URL` in `frontend/.env`, not in a `.env` at the repo root.
  Vite only reads `.env` files from `frontend/`.

## Check the real API

The running API is the source of truth for the contract:

- Interactive docs: http://localhost:8000/docs
- Schema: http://localhost:8000/openapi.json
