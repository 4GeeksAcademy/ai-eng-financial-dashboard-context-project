# API Contracts

- Treat backend response models as the source of truth for API payloads. Keep TypeScript API types aligned with their field names and allowed values.
- When changing a route, query parameter, or response shape, update its API tests and affected frontend consumers in the same change.
- Keep request validation explicit with typed parameters, constrained values, and response models.

Repo anchors: `backend/app/routes.py` defines Pydantic models, `Literal` values, `Query` constraints, and `response_model`; `frontend/src/lib/financial-types.ts` mirrors movement fields and unions.