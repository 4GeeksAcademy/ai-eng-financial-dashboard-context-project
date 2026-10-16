# Engineering Review

## Good practices (grouped by category)

### Architecture

1. Clear separation between frontend (`frontend/`) and backend (`backend/`).
2. Docker Compose orchestrates both services with a consistent local workflow.

### Type safety and contracts

3. Frontend uses TypeScript for domain and UI logic.
4. Backend uses Pydantic/FastAPI models to enforce API schemas.

### Frontend DX and maintainability

5. Reusable dashboard components are split into focused files.
6. Financial utility functions are extracted from UI components.

### Testing

7. Backend includes automated tests for API behavior.
8. Frontend includes automated tests for financial utility logic.

## Risks and improvement opportunities (grouped by category)

### Backend architecture

1. `backend/app/routes.py` concentrates multiple responsibilities and should be split by domain.
2. Business logic is mixed with route handlers instead of being centralized in services.

### Data layer

3. Metrics depend on generated mock data and there is no persistence layer.

### API/security

4. CORS is permissive for development and should be restricted by environment for production.

### Validation and error handling

5. Some endpoint validations and error responses can be standardized for better contract predictability.

### Scalability and maintainability

6. Large route files increase change risk and reduce long-term maintainability.
