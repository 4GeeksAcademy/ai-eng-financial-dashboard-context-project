# Naming and contract rules

- `Category`, `OperationType`, `BusinessType` are `Literal` types in
  `backend/app/routes.py:11-15` and are mirrored by hand in
  `frontend/src/lib/financial-types.ts:1-3`. Changing a value in one requires
  the same change in the other, in the same commit.
- `/api/metrics` is cast, not validated, in `frontend/src/App.tsx:15-21`
  (`return response.json()` typed as `FinancialMovement[]`). If you change a
  `FinancialMovement` field, update `financial-types.ts` and its uses together.
- Backend fields are `snake_case` (`create_date`, `operation_type`,
  `business_type` in `routes.py:22-27`) and `financial-types.ts` keeps those
  names on API types. Don't rename on the client.
