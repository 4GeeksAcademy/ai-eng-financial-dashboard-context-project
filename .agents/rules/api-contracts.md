---
name: api-contracts
scope: backend/app/routes.py (models, Literals), frontend/src/lib/financial-types.ts, frontend/src/App.tsx
applies_when: changing a response field, enum value or field name
related: [architecture-data-flow, testing-workflow]
---

# API contract and naming rules

### API-1: Enum values change in both places, same commit
- **When:** you add, remove or rename a value of `Category`, `OperationType` or `BusinessType`.
- **Do:** edit `backend/app/routes.py:11-15` and `frontend/src/lib/financial-types.ts:1-3` together.
- **Check:** run `sed -n 11,15p backend/app/routes.py` (`Category` spans two lines) and
  `sed -n 1,3p frontend/src/lib/financial-types.ts` and compare the value lists by eye;
  no automated check exists.
- **Why:** adding `"tax"` to the backend only left pytest (15), `tsc -b` and `npm test` (5) all green.

### API-2: Field changes update the type, the cast site and the test data
- **When:** you add, remove or rename a field of `FinancialMovement` (`routes.py:22-27`).
- **Do:** update `frontend/src/lib/financial-types.ts`, every use in `frontend/src/lib/financial-utils.ts`,
  and the `FinancialMovement` literals in `frontend/src/lib/financial-utils.test.ts`.
- **Check:** `cd frontend && npx tsc -b && npm test` pass. Also load the dashboard once, because
  `App.tsx:15-21` returns `response.json()` unvalidated and a wrong field name will not fail the build.
- **Why:** the response is cast, not parsed.

### API-3: Keep `snake_case` on API types
- **When:** you add a field to an API type on the frontend.
- **Do:** use the backend's name exactly (`create_date`, `operation_type`, `business_type`); map to
  camelCase only in view-model types such as `MonthlyDataPoint`.
- **Check:** the field names in `frontend/src/lib/financial-types.ts` match `routes.py` character for character.
- **Why:** `financial-types.ts` mirrors those names today and `computeKPIs` reads `m.operation_type`.
