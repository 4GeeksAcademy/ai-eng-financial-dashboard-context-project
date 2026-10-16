# Project Architecture Rules

- Keep frontend and backend responsibilities separated.
- Place frontend code inside `frontend/`.
- Place backend code inside `backend/`.
- Do not add backend business logic directly inside React components.
- Do not add frontend presentation logic inside FastAPI route files.
- Preserve the current Docker Compose structure unless a change is strictly necessary.
- Reuse the existing project structure before creating new directories.
