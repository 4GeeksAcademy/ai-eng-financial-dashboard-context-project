# Current Status

## Implemented and verified

### Phase 1–2 (Financial Dashboard + Telemetry)
- Docker Compose can build and start the frontend and backend containers.
- The frontend root, backend API documentation, and backend health endpoint returned HTTP 200 on their published ports during phase 1 verification.
- `GET /health` returns `{"status":"ok"}`.
- The backend exposes deterministic mock financial data and filtering, facets, summaries, top categories, period comparison, expense alerts, and B2B/B2C routes.
- The frontend displays four KPI cards and two monthly charts from `GET /api/metrics`.
- Phase 1 validation passed 15 backend tests and 5 frontend tests.
- Repository-specific agent rules exist under `.agents/rules` and were rehearsed against four concrete maintenance tasks.
- The Vite proxy reaches the backend through `host.docker.internal`; the full Compose path returned HTTP 200 during phase 4 verification.

Evidence: `verification.md`, `backend/app/routes.py`, `backend/tests/test_routes.py`, `frontend/src/App.tsx`, dashboard components, and `.agents/rules`.

### Phase 2 — Business Performance Pipeline (Data Pipelines Milestone)
- Pipeline `business_performance_etl_flow` reads from `telemetry_events`, transforms into clinic-month KPIs, and upserts into `reporting.monthly_clinic_supply_performance`.
- Prefect 3 with subflows: `resolve_run_window_flow`, `emit_optional_artifacts_flow`, `extract_telemetry_subflow`, `transform_business_kpis_subflow`, `load_monthly_clinic_supply_subflow`.
- Tolerance to partial failures: optional steps (webhook, CSV) fail gracefully without aborting the pipeline.
- Retries: 3 for DB tasks, 2 for notification/write tasks.
- 1h transform cache keyed by month range (`kpi-transform:YYYY-MM[+YYYY-MM]`).
- Idempotent load via upsert on `(clinic_id, month_start)`.
- CLI: `python data/pipelines/pipeline.py [--month YYYY-MM|YYYY-MM-DD] [--dry-run]`.
- Reporting service: 3 endpoints (`/reporting/pipeline-runs/latest`, `/reporting/pipeline-runs` POST, `/reporting/monthly-clinic-supply-performance`).
- Migration `002_create_reporting_schema.sql` (schema `reporting`).
- 39 backend tests in `backend/tests/` + 10 pipeline tests in `tests/pipelines/test_pipeline.py`.

### Phase 3 — Subflows, Tests & Dashboard (This PR)
- Pipeline refactored into 3 ETL subflows (`extract-telemetry-subflow`, `transform-business-kpis-subflow`, `load-monthly-clinic-supply-subflow`) plus 2 existing subflows.
- 10 unit tests for pure transform functions in `tests/pipelines/test_pipeline.py` (in-memory, no DB).
- New business dashboard in frontend (`Reporting` tab) consuming `GET /reporting/monthly-clinic-supply-performance`.
- All four BRIEFING KPIs displayed with stakeholder-friendly labels.
- Dashboard header updated with third tab (`dashboard` / `telemetry` / `reporting`).
- Vite proxy routes `/reporting` to backend.

Evidence: `data/pipelines/pipeline.py`, `tests/pipelines/test_pipeline.py`, `frontend/src/components/reporting/reporting-dashboard.tsx`, `frontend/src/App.tsx`, `frontend/src/components/dashboard/dashboard-header.tsx`.

## Known limitations and unverified behavior

- The data is generated in memory with a fixed seed; there is no persistence or external financial data integration.
- The current frontend consumes only the general movements endpoint even though the backend exposes additional analytical endpoints.
- Compose declares `depends_on` but no service health checks.
- Pipeline tests only cover the pure transform layer (`data/process/kpi_aggregation.py`); no integration tests against a live database yet.

Evidence: `backend/app/routes.py`, `frontend/src/App.tsx`, `docker-compose.yml`, and `verification.md`.

## Evidence-based maintenance priorities

These are repository maintenance needs derived from verified limitations, not a product roadmap:

1. Consider adding Compose health checks so startup ordering is observable rather than relying only on `depends_on`.
2. Preserve synchronization between backend Pydantic/literal contracts and `frontend/src/lib/financial-types.ts` when the API changes.
3. Keep financial calculations in tested frontend utility modules and retain deterministic backend test data.
4. Keep this status file and `verification.md` current when a limitation is confirmed, resolved, or replaced by new evidence.
5. Add integration tests for the pipeline that exercise extract → transform → load against a test database.
6. Extend pipeline tests to cover the subflow orchestration layer (not just pure transforms).

Guidance: `.agents/rules/api-contract-changes.md`, `frontend-financial-logic.md`, `service-validation.md`, and `documentation-evidence.md`.