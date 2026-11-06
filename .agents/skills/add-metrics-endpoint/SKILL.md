---
name: add-metrics-endpoint
description: Add or change a read-only metrics endpoint in the FastAPI backend, with its tests and optional frontend wiring. Use when asked for a new metric, aggregation, filter or API route.
---

# Add a metrics endpoint

Read [backend.md](../../rules/backend.md) and
[api-contract.md](../../rules/api-contract.md) first.

Before adding anything, check whether an existing endpoint already covers the
need, possibly with a new filter. The list is in
[architecture.md](../../../memory-bank/architecture.md).

## 1. Backend: `backend/app/routes.py`

1. Add a Pydantic model for the response if no existing one fits.
2. Add a pure helper for the calculation, rounding money with `round(value, 2)`.
3. Add a thin handler under `/api/metrics/...`, following this shape:

```python
@router.get("/api/metrics/example", response_model=list[ExampleItem])
def get_example(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    business_type: BusinessType | None = Query(default=None),
) -> list[ExampleItem]:
    movements = generate_mock_movements(seed=42)
    if business_type is not None:
        movements = [
            item for item in movements if item.business_type == business_type]
    filtered = filter_movements(
        movements, start_date, end_date, category=None, operation_type=None
    )
    return build_example(filtered)
```

## 2. Tests: `backend/tests/test_routes.py`

Cover:

- A calculated value, compared with a result you work out independently from
  `generate_mock_movements(seed=42)` or from a small handmade list.
- Each filter the route accepts.
- Invalid input returning 422, if the route has bounds or `Literal` parameters.

Do not hardcode dates that assume a specific year, because the data rolls with
today's date.

## 3. Frontend: only if the UI should use the endpoint

1. Add the response type to `frontend/src/lib/financial-types.ts`.
2. Fetch it using `API_BASE_URL`, following `fetchFinancialData` in `App.tsx`.
3. Render the loading, empty and data states described in
   [frontend.md](../../rules/frontend.md).

## 4. Finish

1. Add the route to the table in `memory-bank/architecture.md`.
2. If the UI now uses it, update `memory-bank/current-state.md`.
3. Run the [verify-changes](../verify-changes/SKILL.md) skill.
