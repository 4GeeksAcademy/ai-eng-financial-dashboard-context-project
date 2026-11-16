# Frontend financial calculations and tests

## Scope

Apply this rule when changing `frontend/src/lib/financial-utils.ts`, financial types used by those functions, or their unit tests.

## Instructions

- Keep financial calculations in the existing utility layer unless the task requires a different architecture.
- Preserve chronological month ordering and the current output shape unless requirements explicitly change them.
- Add or update a focused test in `frontend/src/lib/financial-utils.test.ts` for each changed calculation or formatter behavior.
- Use the project test script, `npm test`, when dependencies are installed; state clearly if it was not run.

## Repository evidence

- `frontend/src/lib/financial-utils.ts` contains KPI, monthly aggregation, currency, and percentage functions.
- `frontend/src/lib/financial-utils.test.ts` tests these functions with Vitest.
- `frontend/package.json` defines `npm test` as `vitest run`.
