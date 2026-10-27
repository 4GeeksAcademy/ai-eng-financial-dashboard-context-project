# Runtime Behavior and Security

## Rule 9: Do not seed Python's global random generator

When writing or refactoring mock-data code, use an isolated generator (e.g., `random.Random(seed)`) instead of `random.seed(...)` when deterministic output is needed.

**Repo fact:** `generate_mock_movements()` in `backend/app/routes.py` calls `random.seed(seed)`, which mutates process-global random state.

## Rule 10: Replace wildcard CORS settings before deploying

Treat the current CORS configuration as development-only. Before any deployment, restrict `allow_origins`, `allow_methods`, and `allow_headers` to the intended values and reconsider `allow_credentials`.

**Repo fact:** `backend/app/main.py` configures `allow_origins=["*"]`, `allow_methods=["*"]`, and `allow_headers=["*"]` together with `allow_credentials=True`.

## Rule 19: Treat the debugpy listener as development-only

Do not expose the debug port in production deployments; remove the debugpy entrypoint or restrict the port.

**Repo fact:** `backend/Dockerfile` starts the app via `python -m debugpy --listen 0.0.0.0:5678`, and `docker-compose.yml` publishes port `5678`.

## Rule 20: Handle empty inputs explicitly in aggregation/facet helpers

If `build_metrics_facets()` or similar helpers may be reused with a source that can return no movements, guard empty lists before indexing.

**Repo fact:** `build_metrics_facets()` in `backend/app/routes.py` reads `ordered[0]` and `ordered[-1]`, which raise `IndexError` for an empty list; it is currently safe only because the seeded generator always returns 360 items.
