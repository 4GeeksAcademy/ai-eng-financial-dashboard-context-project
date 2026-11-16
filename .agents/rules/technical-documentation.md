# Technical documentation changes

## Scope

Apply this rule when changing `README.md`, `README.es.md`, `AGENTS.md`, or project setup and verification documentation.

## Instructions

- Support setup commands and architecture claims with the current Dockerfiles, Compose file, package scripts, or application code.
- Separate documented commands from commands actually executed; report execution results only when observed.
- Mark inferred behavior and unresolved environment-specific details as such.
- Keep the English and Spanish READMEs aligned when changing shared setup instructions.
- Do not include secrets, credentials, or values copied from local environment files.

## Repository evidence

- `README.md` and `README.es.md` both document the Compose startup command and local service URLs.
- `docker-compose.yml`, `frontend/package.json`, and both Dockerfiles contain the related configuration.
- `.gitignore` excludes `.env` files while retaining `.env.example`.
