# Development Rules

## Scope

Local runtime commands, service connectivity, and development URLs.

## Rationale

The repository provides a Compose-defined development environment. Following it preserves the frontend proxy and backend debugger configuration.

## Project-Specific Guidance

1. Use `docker compose up --build` as the default command to run the local application.
   - Repository fact: `README.md` documents this command, and `docker-compose.yml` defines the `frontend` and `backend` services.

2. Preserve the Compose service names and ports when changing local runtime configuration unless every dependent URL is updated together.
   - Repository fact: `docker-compose.yml` publishes frontend port `5173`, backend port `8000`, and debug port `5678`; `frontend/vite.config.ts` targets the `backend` service on port `8000`.

3. Before committing, run the narrow test command for changed behavior and `git diff --check`.
   - Repository fact: `frontend/package.json` provides the `test` script, `backend/requirements.txt` includes Pytest, and this repository uses Git for its source history.
