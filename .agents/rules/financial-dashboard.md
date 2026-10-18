# Financial Dashboard Project Rules

## Scope

Apply these rules to changes and documentation across `frontend/`, `backend/`, and the repository root.

## Evidence and Product Claims

- Inspect the implementation and its nearby tests before describing behavior. Cite repository-relative paths for important findings.
- Distinguish backend API capability from frontend behavior. The UI currently requests `/api/metrics` in `frontend/src/App.tsx`; additional routes in `backend/app/routes.py` are not automatically available in the UI.
- Do not claim database persistence, product features, or roadmap plans unless checked-in code or project documentation supports the claim. The inspected application paths currently use seeded mock data.
- Treat the static `2024 - Full Year` label in `frontend/src/App.tsx` as a known mismatch: backend movement dates are generated relative to `date.today()` in `backend/app/routes.py`.

## API and Financial Logic

- When changing a backend response or query contract, check `backend/app/routes.py`, the corresponding route tests in `backend/tests/test_routes.py`, frontend types in `frontend/src/lib/financial-types.ts`, and frontend consumers as applicable.
- Keep KPI and monthly aggregation logic in `frontend/src/lib/financial-utils.ts`; add or update focused cases in `frontend/src/lib/financial-utils.test.ts` when changing calculations.
- Preserve the existing API types and naming conventions unless the requested behavior requires a contract change.

## Validation and Workflow

- Use the repository's declared frontend checks from `frontend/`: `npm test`, `npm run lint`, and `npm run build`.
- Run backend tests with the project's container runtime from the repository root when the selected local Python environment is not aligned with `backend/Dockerfile`: `docker compose run --build --rm backend python -m pytest -q`.
- Validate service wiring with `docker compose config --quiet`; the documented local startup is `docker compose up --build`, and `frontend/vite.config.ts` proxies `/api` to `backend:8000`.
- Before staging or committing, inspect `git status` and keep commits scoped to the requested phase or task. Do not publish commits or push unless the user asks.

## Documentation

- Keep project summaries and memory tied to checked-in evidence. Record corrections and unresolved mismatches in `verification.md` rather than presenting assumptions as facts.
- Follow `README.md` for documented service URLs and setup; use `frontend/.env.example` for the optional `VITE_API_BASE_URL` override.