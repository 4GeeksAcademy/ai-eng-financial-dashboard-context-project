# Backend Development Rules

- Use FastAPI and Pydantic for API endpoints and response models.
- Keep route handlers focused on request validation and response construction.
- Move reusable business logic into independent functions or service modules.
- Avoid adding more unrelated responsibilities to `backend/app/routes.py`.
- Use explicit type annotations for function arguments and return values.
- Preserve deterministic mock data by using the existing fixed seed when required.
- Keep API results in chronological order when returning financial movements.
- Validate query parameters using FastAPI and Pydantic constraints.
- Add or update Pytest tests when changing backend calculations or filters.
