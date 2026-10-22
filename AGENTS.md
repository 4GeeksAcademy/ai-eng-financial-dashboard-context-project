# Agent Guidance

Agents working on this project **must**:

- Look for **work instructions and rules** in the directory:  
  `./.agents/rules`

- Look for available **agent skills** in the directory:  
  `./.agents/skills`

- Look for the **project memory bank** in:  
  `./memory-bank`  
  _(if the directory exists)_
- Before working, read the relevant memory-bank documents. Use `product.md` for product behavior and `techContext.md` for stack, architecture, and integration context.

- Before working on the frontend, read `./.agents/rules/frontend.md`.
- Before working on the backend, read `./.agents/rules/backend.md`.
- For changes that affect both frontend and backend, read both rule files.

Before taking action (analyzing code, modifying files, or generating outputs), always review the latest files in these locations to ensure compliance with project conventions, context, and operational constraints.

After every new implementation, update the relevant document in `./memory-bank` to reflect the implemented behavior or technical context. If no existing document fits, add an appropriate memory-bank document. Record only facts supported by the code and report verification as successful only when it was actually run.

## Project and stack

- Financial dashboard with a React, TypeScript, and Vite frontend and a FastAPI backend.
- Frontend code is in `frontend/src`; dashboard components are in `components/dashboard`, and shared types and calculations are in `lib`.
- Backend routes and models are in `backend/app/routes.py`; route tests are in `backend/tests`.
- Docker Compose runs the `frontend` and `backend` services.

## Commands and checks

- Start the project with `docker compose up --build`.
- Run backend tests with `docker compose exec backend pytest`.
- Run frontend tests with `docker compose exec frontend npm test`.
- Check frontend build and lint with `docker compose exec frontend npm run build` and `docker compose exec frontend npm run lint`.
- Check API responses at `/health` and `/api/metrics`; interactive API docs are at `/docs`.
- Do not report a check as passing unless it was run.

## Conventions

- Keep API response models in sync with the corresponding TypeScript types.
- Keep KPI and monthly calculations in `frontend/src/lib/financial-utils.ts`; avoid duplicating them in visual components.
- Reuse backend movement-filtering and chronological-order helpers where applicable.
- Update relevant frontend or backend tests when changing calculation or route behavior.

## Domain rules

- Backend routes generate 360 example movements: 30 per month across 12 months, using seed `42` and dates relative to the current date.
- Frontend profit is income minus outcome; profit percentage is profit divided by income, or zero when income is zero.
- The dashboard title is currently fixed to `2024 - Full Year`; do not assume it matches the generated date range.
- Do not describe generated movements as persisted data or the calculations as approved business requirements without a specification.

## Integration limits

- Vite proxies `/api` to `http://backend:8000`, matching the Compose service. The hostname is not guaranteed to resolve outside the Compose network.
- When changing API fields or allowed values, update both backend models and frontend types in the same change.
- When changing generated dates, review the dashboard's displayed period as well.
