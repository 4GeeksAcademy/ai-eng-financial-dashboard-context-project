---
description: Testing rules — how to write and run tests for both backend and frontend
applyTo:
  - "backend/tests/**"
  - "frontend/src/**/*.test.*"
  - "frontend/src/**/*.spec.*"
---

# Testing Rules

## Backend (pytest)

### Test location
- All tests in `backend/tests/`
- Test file naming: `test_<module>.py` → `test_routes.py`
- Shared fixtures in `conftest.py`

### Running tests
```bash
cd backend
pytest                    # Run all tests
pytest -v                 # Verbose output
pytest --cov=app          # With coverage
pytest test_routes.py     # Single file
```

### Test patterns
- Function naming: `test_<what_is_being_tested>()`
- Use `TestClient` from FastAPI for endpoint tests
- Use `seed=42` for deterministic mock data:
  ```python
  from app.routes import generate_mock_movements
  movements = generate_mock_movements(seed=42)
  assert len(movements) == 360
  ```
- Test both happy path and edge cases
- Test filters, sorting, and data shapes

### Critical assertions
- Mock data count: `assert len(movements) == 360` (12 months × 30)
- Date ordering: `assert movements == sorted(movements, key=lambda item: item.create_date)`
- Business type filter: `assert all(item["business_type"] == "B2B" for item in payload)`

---

## Frontend (Vitest)

### Test location
- Co-located with source: `financial-utils.test.ts` next to `financial-utils.ts`
- Test file naming: `<module>.test.ts`

### Running tests
```bash
cd frontend
npm run test              # Single run
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
```

### Test patterns
- Use `describe` / `it` blocks
- Import with `type` keyword for types:
  ```ts
  import type { FinancialMovement } from "./financial-types";
  ```
- Test pure functions only (no React component tests yet)
- Verify computed outputs match expected values

### What to test
- `computeKPIs()` — totals, profit calculation
- `computeMonthlyData()` — monthly aggregation, sorting
- `formatCurrency()` — USD formatting
- `formatPercent()` — percentage formatting

---

## After any code change

1. Run backend tests: `cd backend && pytest`
2. Run frontend tests: `cd frontend && npm run test`
3. Verify no TypeScript errors: `cd frontend && npx tsc --noEmit`
4. Check for lint issues: `cd frontend && npm run lint`

---

## Adding new tests

### Backend
- Add to `test_routes.py` for endpoint tests
- Follow existing pattern: `test_<action>_<condition>()`
- Use `client = TestClient(app)` for HTTP tests

### Frontend
- Create `<module>.test.ts` next to the module
- Import functions directly from the module
- Use `expect()` assertions with Vitest matchers
