# Current Status

## Implemented and verified

- Docker Compose can build and start the frontend and backend containers.
- The frontend root, backend API documentation, and backend health endpoint returned HTTP 200 on their published ports during phase 1 verification.
- `GET /health` returns `{"status":"ok"}`.
- The backend exposes deterministic mock financial data and filtering, facets, summaries, top categories, period comparison, expense alerts, and B2B/B2C routes.
- The frontend displays four KPI cards and two monthly charts from `GET /api/metrics`.
- Phase 1 validation passed 15 backend tests and 5 frontend tests.
- Repository-specific agent rules exist under `.agents/rules` and were rehearsed against four concrete maintenance tasks.
- The Vite proxy reaches the backend through `host.docker.internal`; the full Compose path returned HTTP 200 during phase 4 verification.

Evidence: `verification.md`, `backend/app/routes.py`, `backend/tests/test_routes.py`, `frontend/src/App.tsx`, dashboard components, and `.agents/rules`.

## Known limitations and unverified behavior

- The data is generated in memory with a fixed seed; there is no persistence or external financial data integration.
- The current frontend consumes only the general movements endpoint even though the backend exposes additional analytical endpoints.
- Compose declares `depends_on` but no service health checks.

Evidence: `backend/app/routes.py`, `frontend/src/App.tsx`, `docker-compose.yml`, and `verification.md`.

## Evidence-based maintenance priorities

These are repository maintenance needs derived from verified limitations, not a product roadmap:

1. Consider adding Compose health checks so startup ordering is observable rather than relying only on `depends_on`.
2. Preserve synchronization between backend Pydantic/literal contracts and `frontend/src/lib/financial-types.ts` when the API changes.
3. Keep financial calculations in tested frontend utility modules and retain deterministic backend test data.
4. Keep this status file and `verification.md` current when a limitation is confirmed, resolved, or replaced by new evidence.

Guidance: `.agents/rules/api-contract-changes.md`, `frontend-financial-logic.md`, `service-validation.md`, and `documentation-evidence.md`.