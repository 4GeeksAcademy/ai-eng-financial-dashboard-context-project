# Frontend Development Rules

- Use React with TypeScript.
- Keep components small and focused on one responsibility.
- Reuse components from `frontend/src/components` before creating duplicates.
- Keep shared financial types in `frontend/src/lib/financial-types.ts`.
- Keep reusable financial calculations outside React components.
- Handle loading, success, empty, and error states when fetching data.
- Use the existing Tailwind CSS conventions.
- Use Recharts for financial visualizations unless the requirement explicitly changes.
- Add or update Vitest tests when changing reusable calculation logic.
