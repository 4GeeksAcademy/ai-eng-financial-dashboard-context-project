# Skill: Add a Backend API Endpoint

## When to use

Adding or extending a route in the FastAPI backend (`backend/app/routes.py`).

## Steps

1. **Model the response** with a Pydantic `BaseModel` next to the existing ones (`FinancialMovement`, `MetricsSummaryItem`, ...). Reuse `Literal` aliases (`OperationType`, `Category`, `BusinessType`, `GroupBy`) for enum-like fields; add new ones at the top of the file.

2. **Write the handler** on the existing `router`:
   - Source data: `generate_mock_movements(seed=42)` (never a different seed — tests in both stacks depend on it).
   - Filter with the existing helpers (`filter_movements`, `filter_movements_by_date`) rather than reimplementing date/category logic.
   - Keep date-range semantics **inclusive on both edges** (`>= start_date`, `<= end_date`).
   - Sort with `ensure_chronological_order` when the response is a movement list.

3. **Validate inputs explicitly** (rule 16): numeric query params get bounds, e.g. `limit: int = Query(default=5, ge=1, le=20)`; enums via `Literal` give 422 automatically.

4. **Add tests** in `backend/tests/test_routes.py`, mirroring existing style (module-level `client = TestClient(app)`, plain asserts):
   - happy path → 200 + payload shape/content assertions,
   - **boundary values that should succeed** (e.g. `limit=1`, `limit=20`),
   - **invalid values that should 422** (out-of-range, unknown enum),
   - filter combinations actually narrow the payload.

5. **Run:**
   ```bash
   cd backend && python -m pytest tests/ -q    # expect all green
   ```

6. **If the frontend will consume it** (rule 1): add the matching TS type to `frontend/src/lib/financial-types.ts` in the same change.

## Pitfalls

- Do not call `random.seed()` yourself (rule 9) — go through `generate_mock_movements`.
- Beware `build_metrics_facets()`: it indexes `ordered[0]`/`ordered[-1]` and breaks on empty lists (rule 20) — guard if your filter can return nothing.
- Keep money as-is (`float` + 2-decimal rounding) unless a precision policy is agreed (rule 18).
