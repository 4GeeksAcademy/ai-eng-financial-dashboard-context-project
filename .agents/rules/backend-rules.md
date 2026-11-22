# Backend Engineering Rules

**Last Updated:** 2026-11-16  
**Scope:** FastAPI/Python financial metrics backend (`backend/app/`, `backend/tests/`)  
**Purpose:** Establish conventions for contributors and AI agents

---

## Rule 1: Use Pydantic Models for All API Responses

**Scope:** 
- All files in `backend/app/routes.py`
- All response models in `backend/app/`

**Rationale:**
Every endpoint defines a `response_model` using Pydantic. This validates response data at runtime.

**Reference:**
- Models: `backend/app/routes.py:22-62` defines Pydantic models
- Usage: `backend/app/routes.py:245` uses `response_model=list[FinancialMovement]`

**Actionable Instructions:**
1. Define every response type as a Pydantic BaseModel: `class ResponseName(BaseModel): ...`
2. Add field type hints and optional docstrings
3. Every endpoint must include: `@router.get(..., response_model=ModelName)`
4. Use Pydantic field validators for domain logic (e.g., `field_validator("amount")`)

---

## Rule 2: Use String Literal Types for Domain Values

**Scope:** Type definitions in `backend/app/routes.py` (lines 11-16)

**Rationale:**
Domain types are defined as `Literal` unions, not Python enums. This keeps JSON serialization clean and aligns with API contracts.

**Reference:**
```python
OperationType = Literal["income", "outcome"]
Category = Literal["suppliers", "sales", "operational", "administrative", "others"]
BusinessType = Literal["B2B", "B2C"]
GroupBy = Literal["day", "week", "month"]
```
Defined at `backend/app/routes.py:11-16`

**Actionable Instructions:**
1. Define domain enums as `TypeName = Literal["value1", "value2", ...]`
2. Never use Python `Enum` for API types
3. Use these Literal types in Pydantic models and function signatures
4. Document allowed values in string literals

---

## Rule 3: Type-Hint All Functions

**Scope:** All functions in `backend/app/routes.py`

**Rationale:**
Every function has explicit parameter and return type hints. This enables IDE support and catches type mismatches.

**Reference:**
- Private helper: `backend/app/routes.py:65-69` has type hints on `_year_for_month(month: int, today: date) -> int`
- Public utility: `backend/app/routes.py:125-144` has type hints on `filter_movements(...) -> list[FinancialMovement]`
- Endpoint handler: `backend/app/routes.py:249-260` has type hints on `get_metrics(...) -> list[FinancialMovement]`

**Actionable Instructions:**
1. All function parameters must have type hints
2. All functions must have return type hints (never omit `->`)
3. Use modern syntax: `list[X]` not `List[X]`, `X | None` not `Optional[X]`
4. Import types at module top: `from typing import Literal`
5. Never use bare `...` or `Any` without documented justification

---

## Rule 4: Separate Private (Prefixed with `_`) from Public Helpers

**Scope:** All functions in `backend/app/routes.py`

**Rationale:**
Internal utilities are prefixed with `_` (private); public functions have no prefix. This clarifies API boundaries.

**Reference:**
- Private: `_year_for_month()` and `_build_movement()` in `backend/app/routes.py:65-100`
- Public: `filter_movements()` and `calculate_net_value()` in `backend/app/routes.py:125+`

**Actionable Instructions:**
1. Mark internal/helper functions with `_` prefix: `def _helper_name(...)`
2. Mark public, reusable functions without prefix: `def public_name(...)`
3. Document which functions are internal vs. public in module docstring
4. Never call internal functions from outside their module

---

## Rule 5: Use Pure Functions for Business Logic

**Scope:** All business logic functions in `backend/app/routes.py` (lines 107-242)

**Rationale:**
Business logic functions are pure (no side effects, deterministic output). This makes them testable and reusable.

**Reference:**
- `filter_movements()` in `backend/app/routes.py:125` — same input → same output
- `calculate_net_value()` in `backend/app/routes.py:211` — no DB access
- `summarize_movements()` in `backend/app/routes.py:161` — composable aggregation

**Actionable Instructions:**
1. Business functions must NOT:
   - Modify global state
   - Access databases or external APIs
   - Have side effects
2. Business functions MUST:
   - Accept data as parameters
   - Return computed results
   - Produce same output for same input (deterministic)
3. Keep HTTP/FastAPI logic separate: HTTP layer → calls business functions → returns result

---

## Rule 6: Validate Query Parameters with FastAPI Constraints

**Scope:** All endpoint handlers in `backend/app/routes.py`

**Rationale:**
Query parameters include validation constraints (e.g., `Query(ge=1, le=20)` for limits). This rejects invalid input at handler boundary.

**Reference:**
`backend/app/routes.py:308` shows validation with `limit: int = Query(default=5, ge=1, le=20)`

**Actionable Instructions:**
1. Integer bounds: `Query(ge=min, le=max)` (greater-equal, less-equal)
2. String enums: Use `Literal` type (automatically constrained)
3. Required params: `Query(...)` (ellipsis forces required)
4. Optional params: `Query(default=None)` or `Query(default=value)`
5. Add descriptions: `Query(default=5, ge=1, le=20, description="Results to return")`

---

## Rule 7: Validate Date Ranges at Handler Entry

**Scope:** Endpoints that accept `start_date` and `end_date` parameters

**Rationale:**
According to PHASE2-FINDINGS.md, `get_metrics_comparison()` doesn't validate that `start_date <= end_date`. Invalid ranges can produce unexpected results.

**Reference:** `backend/app/routes.py:306-327` — no date range validation present

**Actionable Instructions:**
1. At handler start, validate date relationships:
   ```python
   if start_date > end_date:
       raise HTTPException(status_code=400, detail="start_date must be <= end_date")
   ```
2. Use clear error messages (not generic 500 errors)
3. Validate at handler level, not in business functions
4. Test edge cases: dates equal, reversed, far apart

---

## Rule 8: Use TestClient for All Endpoint Tests

**Scope:** All test files in `backend/tests/test_routes.py`

**Rationale:**
Endpoints are tested using FastAPI's TestClient. This tests the real integration behavior without mocking.

**Reference:**
`backend/tests/test_routes.py:5-7` demonstrates the pattern:
```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
```

**Actionable Instructions:**
1. All endpoint tests use `TestClient(app)`
2. Import app from `app.main`: `from app.main import app`
3. Test structure:
   ```python
   def test_endpoint_name():
       response = client.get("/api/endpoint", params={...})
       assert response.status_code == 200
       payload = response.json()
       assert expected_condition(payload)
   ```
4. Test all parameter combinations and edge cases

---

## Rule 9: Include Unit Tests for Business Logic Functions

**Scope:** All utility functions in `backend/app/routes.py` (lines 107-242)

**Rationale:**
According to PHASE2-FINDINGS.md, only integration tests exist. Pure business functions should have unit tests to prevent silent bugs.

**Reference:** `backend/app/routes.py` — functions like `calculate_net_value()` need direct tests

**Actionable Instructions:**
1. Create tests for all public business functions
2. For each function, test:
   - Happy path (normal input → expected output)
   - At least one edge case (zero, boundary, empty collection)
   - Error case (invalid input)
3. Test structure:
   ```python
   def test_calculate_net_value_with_income_and_outcome():
       movements = [
           FinancialMovement(create_date=date.today(), amount=1000, operation_type="income", ...),
           FinancialMovement(create_date=date.today(), amount=250, operation_type="outcome", ...),
       ]
       result = calculate_net_value(movements)
       assert result == 750

   def test_calculate_net_value_with_empty_movements():
       assert calculate_net_value([]) == 0
   ```

---

## Rule 10: Include Docstrings on All Endpoints

**Scope:** All endpoint handlers (functions decorated with `@router.get(...)`)

**Rationale:**
No docstrings currently exist. Docstrings auto-populate OpenAPI documentation and help developers understand endpoint behavior.

**Reference:** `backend/app/routes.py:245-260` — no docstring exists

**Actionable Instructions:**
1. Every endpoint must have a docstring:
   ```python
   @router.get("/api/metrics", response_model=list[FinancialMovement])
   def get_metrics(...) -> list[FinancialMovement]:
       """
       Fetch financial movements with optional filters.
       
       Query Parameters:
       - start_date: Filter by minimum date (inclusive)
       - end_date: Filter by maximum date (inclusive)
       - category: Filter by expense category (sales, suppliers, etc.)
       - operation_type: Filter by income or outcome
       
       Returns:
       - List of FinancialMovement objects, sorted chronologically
       """
   ```
2. Describe what the endpoint does
3. Explain each query parameter
4. Describe return format

---

## Rule 11: Centralize Rounding for Monetary Values

**Scope:** All numeric calculations in `backend/app/routes.py`

**Rationale:**
Rounding is scattered across multiple functions (lines 90, 184, 217). Centralizing prevents precision errors.

**Reference:** 
- Line 90: `round(random.uniform(500, 9000), 2)`
- Line 184: `round(values["income"], 2)`
- Line 217: `round(income - outcome, 2)`

**Actionable Instructions:**
1. Create a utility function at module top:
   ```python
   CURRENCY_PRECISION = 2

   def round_money(value: float) -> float:
       """Round monetary value to currency precision."""
       return round(value, CURRENCY_PRECISION)
   ```
2. Use this function everywhere monetary calculations occur
3. If precision changes, only one place needs updating

---

## Rule 12: Never Hardcode Configuration

**Scope:** 
- Mock data seed parameters
- Probability ranges
- Algorithm thresholds
- Magic numbers

**Rationale:**
Configuration like `seed=42` and income probability ranges are hardcoded in function bodies. This makes testing inflexible.

**Reference:**
- `backend/app/routes.py:94-98` hardcodes seed
- `backend/app/routes.py:103-104` hardcodes income probability

**Actionable Instructions:**
1. Move constants to module top:
   ```python
   DEFAULT_SEED = 42
   INCOME_PROBABILITY_MIN = 0.45
   INCOME_PROBABILITY_MAX = 0.7
   MOVEMENTS_PER_MONTH = 30
   ```
2. Use constants in functions: `random.seed(DEFAULT_SEED)`
3. For environment-specific values, use environment variables:
   ```python
   import os
   API_DEBUG = os.getenv("API_DEBUG", "false").lower() == "true"
   ```
4. Never hardcode numbers inline; extract to named constants

---

## Rule 13: Use RESTful URL Patterns

**Scope:** All routes in `backend/app/routes.py`

**Rationale:**
Endpoints follow RESTful conventions: nouns for resources, hierarchical paths, query params for filters.

**Reference:**
```
/health                      — System status
/api/metrics                 — Base data
/api/metrics/facets          — Filter options
/api/metrics/summary         — Aggregated view
/api/metrics/categories/top  — Top N analysis
/api/metrics/comparison      — Period-over-period
/api/metrics/alerts          — Anomaly detection
/api/metrics/b2b             — Business type view
```

**Actionable Instructions:**
1. Use nouns, not verbs: `/api/metrics` not `/api/get-metrics`
2. Use hierarchical paths: `/api/<domain>/<resource>/<sub-resource>`
3. Use query parameters for filtering: `?category=sales&start_date=2025-01-01`
4. Use HTTP methods correctly: GET for reads, POST for creation
5. Keep URLs stable; version if changes required: `/api/v2/metrics`

---

## Rule 14: Add Logging at Critical Points

**Scope:** 
- Handler entry/exit
- Data processing milestones
- Anomalies and errors

**Rationale:**
According to PHASE2-FINDINGS.md, no logging exists. Logging is essential for understanding application behavior.

**Actionable Instructions:**
1. At handler entry:
   ```python
   import logging
   logger = logging.getLogger(__name__)

   @router.get("/api/metrics")
   def get_metrics(...):
       logger.info(f"Fetching metrics with filters: start_date={start_date}, category={category}")
       try:
           # Handler logic
           logger.info(f"Returning {len(result)} movements")
           return result
       except Exception as e:
           logger.error(f"Error fetching metrics: {e}", exc_info=True)
           raise
   ```
2. Log data processing milestones:
   ```python
   logger.debug(f"Filtered to {len(filtered)} movements")
   ```
3. Log anomalies (empty results, unexpected values):
   ```python
   if not results:
       logger.warning("No alerts detected; baseline may be insufficient")
   ```
4. Never log sensitive data (PII, tokens)

---

## Rule 15: Separate Models, Services, and Routes into Modules

**Scope:** Future refactoring of `backend/app/routes.py` (currently 391 lines)

**Rationale:**
When a single file grows beyond ~200 lines, consider splitting into separate modules for maintainability.

**Actionable Instructions:**
1. At scale, create:
   - `models.py` — All Pydantic models
   - `services.py` — All business logic functions
   - `routes.py` — Only endpoint handlers
2. Each module handles one concern
3. Routes import from models and services
4. Easy to test services independently

---

## Enforcement Checklist for Contributors

Before submitting backend code:

- [ ] All responses use Pydantic models (Rule 1)
- [ ] Domain types use `Literal` unions (Rule 2)
- [ ] All functions have type hints (Rule 3)
- [ ] Private functions prefixed with `_` (Rule 4)
- [ ] Business logic is pure (no side effects) (Rule 5)
- [ ] Query params include validation constraints (Rule 6)
- [ ] Date ranges validated at handler start (Rule 7)
- [ ] Endpoints tested with TestClient (Rule 8)
- [ ] Business functions have unit tests (Rule 9)
- [ ] All endpoints have docstrings (Rule 10)
- [ ] Monetary rounding uses centralized function (Rule 11)
- [ ] No hardcoded magic numbers (Rule 12)
- [ ] URLs follow RESTful pattern (Rule 13)
- [ ] Critical points have logging (Rule 14)
- [ ] Code is organized into logical modules (Rule 15)

## Testing Commands

```bash
# Run all tests
cd backend
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=app --cov-report=html

# Run specific test
python -m pytest tests/test_routes.py::test_health_endpoint_returns_ok -v

# Run with logging
python -m pytest tests/ -v --log-cli-level=DEBUG
```

