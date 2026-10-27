# API Input Validation and Numerical Precision

## Rule 16: Keep API input validation explicit; test invalid and boundary values

Use `Literal` types for enum-like query filters and `Query(ge=..., le=...)` bounds for numeric parameters. When changing query parameters, add tests for invalid values and boundary values.

**Repo fact:** `backend/app/routes.py` uses `Literal` types (`OperationType`, `Category`, `BusinessType`, `GroupBy`) and bounds the top-categories `limit` with `Query(default=5, ge=1, le=20)` and the alert `threshold` with `Query(default=0.3, ge=0)`.

## Rule 17: Keep date-range endpoint semantics consistent and test the inclusive edges

Date-range filters are inclusive on both edges (`>= start_date`, `<= end_date`); preserve this and cover the edges in tests when changing range logic.

**Repo fact:** `filter_movements_by_date()` in `backend/app/routes.py` uses `>= start_date` and `<= end_date`, and `backend/tests/test_routes.py` checks the equal start/end-date case.

## Rule 18: Define and test a monetary precision/rounding policy before using these calculations with real financial data

Current amounts are floats with floating-point sums and ad-hoc `round(..., 2)`. If real financial data is introduced, decide the precision policy (e.g., `Decimal`, integer cents) deliberately and test it.

**Repo fact:** `FinancialMovement.amount` is a `float` in `backend/app/routes.py`, totals use floating-point addition, and several backend outputs are rounded to two decimal places at the response boundary.
