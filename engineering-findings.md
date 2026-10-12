# Engineering findings and proposed rules

Static review only; runtime behavior and tests were not executed.

## Frontend

- **Finding: date-only values may shift across months by timezone.** `financial-utils.ts` parses API dates with `new Date(...)` and then reads local date fields. **Rule:** treat API `YYYY-MM-DD` values as calendar dates, and test month boundaries in relevant timezones. Evidence: [financial-utils.ts](frontend/src/lib/financial-utils.ts), [financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts).
- **Pattern: keep calculations separate from rendering.** `App.tsx` fetches and manages view state, `financial-utils.ts` computes metrics, and dashboard components render them. **Rule:** keep business calculations in utilities and add focused tests there before changing chart presentation. Evidence: [App.tsx](frontend/src/App.tsx), [financial-utils.ts](frontend/src/lib/financial-utils.ts), [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx).
- **Pattern: preserve loading, error, and empty states.** The app and charts render explicit feedback for these states. **Rule:** new data-driven views must handle all three. Evidence: [App.tsx](frontend/src/App.tsx), [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx).

## Backend

- **Finding: seeded output still depends on the current date.** `generate_mock_movements` seeds random values but assigns years from `date.today()`. **Rule:** if fixtures must remain identical across dates, inject or fix the reference date as well as the random seed. Evidence: [routes.py](backend/app/routes.py), [test_routes.py](backend/tests/test_routes.py).
- **Pattern: share filtering and aggregation helpers across routes.** Multiple endpoints call the common filtering, ordering, and summary functions. **Rule:** extend those helpers rather than duplicating endpoint-specific logic. Evidence: [routes.py](backend/app/routes.py).
- **Finding: comparison and alert tests mainly check response shape.** **Rule:** assert expected numeric results and boundary cases so calculation regressions are caught. Evidence: [test_routes.py](backend/tests/test_routes.py), [routes.py](backend/app/routes.py).

## Integracion

- **Finding: Vite uses a host bridge address, while Compose names the backend service `backend`.** The config comment says the target was changed because the previous address did not load. **Rule:** do not replace this target without testing requests from the frontend container in the intended environment; document why the chosen address works. Evidence: [vite.config.ts](frontend/vite.config.ts), [docker-compose.yml](docker-compose.yml).
- **Finding: startup order does not guarantee backend readiness.** Compose uses `depends_on`, but defines no health check. **Rule:** validate the first API request at startup and add an explicit readiness strategy if needed. Evidence: [docker-compose.yml](docker-compose.yml), [App.tsx](frontend/src/App.tsx).
- **Pattern: keep the API contract aligned across Python and TypeScript.** Field names and domain values are represented in both backend models and frontend types. **Rule:** update both sides and their tests together when changing fields or allowed values. Evidence: [routes.py](backend/app/routes.py), [financial-types.ts](frontend/src/lib/financial-types.ts), [test_routes.py](backend/tests/test_routes.py).
- **Finding: the main screen calls `/api/metrics`; additional backend analytics routes are not used by it.** **Rule:** confirm feature intent before wiring those routes into the UI or removing them. Evidence: [App.tsx](frontend/src/App.tsx), [routes.py](backend/app/routes.py).
- **Finding: the period label is fixed to 2024 while generated dates follow the current date.** **Rule:** derive the label from the displayed data or keep the data range fixed to match it. Evidence: [App.tsx](frontend/src/App.tsx), [routes.py](backend/app/routes.py).