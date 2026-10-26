# Documentation Evidence

## Purpose

Keep project documentation traceable to repository configuration and observed behavior.

## Scope

Apply this rule to `README.md`, `README.es.md`, `verification.md`, `memory-bank`, and documentation that describes setup, services, ports, APIs, or project status.

## Justification

The two README files document the Compose command, ports, and Vite proxy. `verification.md` distinguishes those configuration facts from the observed HTTP 502 returned by the proxy during phase 1.

## Required guidance

- Cite the owning file for claims about commands, ports, routes, dependencies, and behavior.
- Update both README languages when shared setup or runtime instructions change.
- Distinguish a host port published by `docker-compose.yml` from the backend container port used by `frontend/vite.config.ts`; update the Vite proxy only when its internal target changes.
- Distinguish configured behavior from behavior confirmed by an executed check.
- Mark uncertain statements as unverified and retain known limitations in `verification.md` or the current project-status memory.
- Never invent roadmap items, product users, external services, or runtime guarantees that are absent from the repository.

## Validation

- Compare setup claims with `docker-compose.yml`, both Dockerfiles, and package scripts.
- Compare API claims with `backend/app/main.py`, `backend/app/routes.py`, and route tests.
- For a port change, run `docker compose config`, start the affected service, and request its documented URL on the new port.
- Run documented commands when the environment supports them and record the result; otherwise mark the runtime claim as unverified.