# Service Validation

## Purpose

Match validation effort to the service and behavior changed.

## Scope

Apply this rule to backend, frontend, Docker Compose, proxy, and shared API changes.

## Justification

Backend behavior is covered by pytest in `backend/tests`; frontend calculations are covered by Vitest. `docker-compose.yml` starts both services, but it has no health check, and phase 1 verification found that container status alone did not prove the Vite proxy path worked.

## Required guidance

- Run `pytest -q` for backend logic or route changes.
- Run frontend tests, lint, and build for frontend changes.
- Run both service suites for API contract changes.
- For Compose, port, or proxy changes, verify the backend health endpoint, frontend root, and metrics endpoint through the frontend proxy.
- Do not describe the stack as healthy based only on `docker compose ps` or direct backend access.
- Record a failed or unavailable check instead of claiming it passed.

## Validation

```bash
curl --fail http://localhost:8000/health
curl --fail http://localhost:5173
curl --fail http://localhost:5173/api/metrics
```