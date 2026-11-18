# Frontend structure

## Scope

Applies to `frontend/src/`, including `frontend/src/App.tsx`, `frontend/src/components/dashboard/`, `frontend/src/components/ui/`, `frontend/src/lib/`, `frontend/src/lib/financial-types.ts`, `frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts`, and `frontend/src/lib/mock-data.ts`. The period badge also depends on dates built in `backend/app/routes.py`.

## Rules

1. Do put screen components in `frontend/src/components/dashboard/`, shared primitives in `frontend/src/components/ui/`, and domain types and calculations in `frontend/src/lib/`.
2. Do import modules under `frontend/src` through the `@/` alias.
3. Do keep the dashboard’s data load as `GET /api/metrics`, then `computeKPIs` and `computeMonthlyData` in the browser.
4. Never wire the page to `frontend/src/lib/mock-data.ts`. Do read `/api/metrics` for the screen.
5. Do treat the `"2024 - Full Year"` badge and the backend dates as separate. The badge is fixed in `App.tsx`. Movement dates come from `date.today()` in `routes.py`.
6. Do name a dashboard component file in kebab-case and export a PascalCase function. Do leave `App` as the default export.
7. Do use snake_case for fields that match the API, and camelCase for values computed in the browser.
8. Do match the file you edit. Dashboard and UI files use single quotes and no semicolons. `App.tsx`, `financial-utils.ts`, and the Vitest file use double quotes and semicolons.
9. All user-facing text, including error messages, must be in English. The load-error message in frontend/src/App.tsx is currently Spanish; translating it to English is allowed and expected.
10. Do give a dashboard component a `loading` prop and render `Skeleton` while it is set.
11. Do remove unused locals and unused parameters in frontend TypeScript.

## Rationale

- Rule 1 — F2: The page already imports dashboard components, UI primitives, and lib calculations from those three folders.
- Rule 2 — F3: `tsconfig`, Vite, and `components.json` map `@/` to `frontend/src/*`.
- Rule 3 — F7, F20: `App.tsx` calls only `GET /api/metrics` and computes KPIs in the browser. The other metrics routes are unused by the UI.
- Rule 4 — F19: `mock-data.ts` is a 2024 list that nothing imports. The page reads the API.
- Rule 5 — F18: The badge is the hardcoded string `"2024 - Full Year"`, while `routes.py` builds a rolling window from `date.today()`.
- Rule 6 — F8: Dashboard files are kebab-case named exports. `App` is the default export.
- Rule 7 — F9: Wire types in `financial-types.ts` are snake_case. Computed KPI fields are camelCase.
- Rule 8 — F23: Dashboard and UI files use single quotes without semicolons. `App.tsx`, `financial-utils.ts`, and the Vitest file use double quotes with semicolons.
- Rule 9 — F24: All user-facing text, including error messages, must be in English. The load-error message in `frontend/src/App.tsx` is currently Spanish; translating it to English is allowed and expected.
- Rule 10 — F16: Dashboard components already take `loading` and render `Skeleton`.
- Rule 11 — F17: `frontend/tsconfig.app.json` fails the build on unused locals and unused parameters.
