# Phase 2 — Engineering findings

Findings below describe the checked revision `954f812d6fb0d95af6699b369ca6e88089ece90c`. “Observed” means directly visible in the cited files; “risk” describes a possible consequence, not a confirmed incident.

## Existing conventions

| Area | Observed pattern | Evidence |
|---|---|---|
| Backend API | Pydantic response models, `Literal` query types, generation/helpers and handlers are in one route module. | `backend/app/routes.py` |
| Backend tests | Endpoint and helper tests use FastAPI `TestClient` and pytest. | `backend/tests/test_routes.py`, `backend/requirements.txt` |
| Frontend | Dashboard components are grouped by domain; financial types and pure calculation helpers are under `src/lib`. | `frontend/src/components/dashboard/`, `frontend/src/lib/` |
| Frontend tests | Utility behavior is tested with Vitest. | `frontend/src/lib/financial-utils.test.ts`, `frontend/package.json` |
| Frontend imports | The `@/` alias maps to `frontend/src`. | `frontend/vite.config.ts`, `frontend/tsconfig.app.json` |
| Agent instructions | Root `AGENTS.md` directs agents to read `.agents/rules/`, `.agents/skills/`, and `memory-bank/`. Those directories were absent at the checked revision. | `AGENTS.md`, repository tree |

## Evidence-backed risks

| Finding | Possible impact | Evidence |
|---|---|---|
| `routes.py` contains models, mock-data generation, calculations, and route handlers. | Changes can affect several API concerns in one file; tests should target the changed contract or calculation. | `backend/app/routes.py` |
| `App.tsx` combines fetch, loading/error state, calculations, and page composition. | Data-flow changes can affect UI behavior as well as the request. | `frontend/src/App.tsx` |
| The UI period is fixed to 2024 while backend dates are generated relative to the current date. | The period label may not describe the data displayed. | `frontend/src/App.tsx`, `backend/app/routes.py` |
| Backend requirements have no pinned versions. | Repeated installs may resolve different dependency versions. | `backend/requirements.txt` |
| Compose has no healthcheck; frontend only declares `depends_on: backend`. | Startup ordering does not itself verify API health. | `docker-compose.yml` |
| CORS allows wildcard origins together with credentials. | This needs review before using the configuration in a production deployment; production intent is not documented. | `backend/app/main.py` |
| The backend exposes more routes than the frontend `App.tsx` calls. | Future work should not assume every route is already integrated into the UI. | `backend/app/routes.py`, `frontend/src/App.tsx` |

## Proposed rule map

- `.agents/rules/backend-api.md`: API contracts and backend tests; grounded in `backend/app/routes.py` and `backend/tests/test_routes.py`.
- `.agents/rules/frontend-data-flow.md`: request URL, proxy, types, and loading/error state; grounded in `frontend/src/App.tsx`, `frontend/vite.config.ts`, and `frontend/src/lib/financial-types.ts`.
- `.agents/rules/frontend-calculations-tests.md`: calculation behavior and unit tests; grounded in `frontend/src/lib/financial-utils.ts` and its Vitest tests.
- `.agents/rules/technical-documentation.md`: evidence for setup claims and command results; grounded in the READMEs, Compose file, Dockerfiles, package scripts, and `.gitignore`.

## Copilot instruction compatibility

GitHub's current documentation for Copilot Chat in VS Code lists `AGENTS.md` as an agent-instruction format and documents repository-wide `.github/copilot-instructions.md` and path-specific `.github/instructions/*.instructions.md` formats:

- [Repository instructions for Copilot in the IDE](https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/customize-copilot/configure-custom-instructions/add-repository-instructions-in-your-ide)
- [Custom-instruction support matrix](https://docs.github.com/en/copilot/reference/custom-instructions-support)

The documentation does not establish `.agents/rules/` as an automatic discovery location. This repository's `AGENTS.md` explicitly instructs agents to read that directory, so the proposed rules preserve the repository's convention and are discoverable through its root agent instructions. The installed Copilot version and Codespaces settings were not inspected.

No functional changes were made as part of this analysis. These findings support project-specific rules; they are not a roadmap.
