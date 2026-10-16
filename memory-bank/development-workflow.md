# Development Workflow

## Before making changes

1. Review `AGENTS.md`.
2. Review all files in `.agents/rules`.
3. Review the latest files in `memory-bank`.
4. Inspect the existing implementation before creating new files or structures.

## Running the project

```bash
docker compose up --build
```

## Frontend commands

Run from `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:coverage
```

## Backend testing

Run from `backend/`:

```bash
pytest
pytest --cov
```

## Change guidelines

- Make small and focused changes.
- Preserve frontend and backend separation.
- Reuse existing components and utilities.
- Add or update tests when changing calculations, filters, or reusable logic.
- Do not add new features or redesign the application unless explicitly requested.
- Verify Docker Compose after structural changes.

## Git workflow

Use one focused commit for each completed phase or meaningful unit of work.

Commit messages should clearly describe the completed change.
