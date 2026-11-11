# Frontend Financial Logic

## Purpose

Keep financial calculations testable and separate from dashboard rendering.

## Scope

Apply this rule to changes under `frontend/src`, especially dashboard components, financial utilities, and financial types.

## Justification

`frontend/src/App.tsx` fetches movements and delegates KPI and monthly aggregation to `frontend/src/lib/financial-utils.ts`. Vitest coverage for those calculations lives in `frontend/src/lib/financial-utils.test.ts`.

## Required guidance

- Put reusable calculations and formatting in a focused module under `frontend/src/lib`, not inside React components.
- Add or update Vitest cases whenever calculation or formatting behavior changes.
- Keep components focused on loading, error, empty, and rendered states.
- Use the `@/` alias for imports that cross frontend directories.
- If the alias changes, update both `frontend/tsconfig.app.json` and `frontend/vite.config.ts`.
- Do not leave unused variables or parameters; the TypeScript configuration rejects them.

## Validation

```bash
docker compose exec -T frontend npm test
docker compose exec -T frontend npm run lint
docker compose exec -T frontend npm run build
```