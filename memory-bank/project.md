# Project Memory

## Product

Financial metrics dashboard with KPI cards for income, outcome, profit, and profit margin, plus monthly charts. It currently uses generated sample data, not a database or external financial source.

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Vitest.
- Backend: FastAPI, Pydantic, Uvicorn, pytest.
- Local orchestration: Docker Compose; frontend port 5173, backend port 8000.

## Current Status

- FastAPI generates 360 seeded movements. Values and categories are reproducible, but assigned years depend on the current date.
- The frontend consumes `GET /api/metrics` (with optional `start_date`/`end_date` from the home date range filter, Feature 1), `GET /api/metrics/facets`, and `GET /api/metrics/alerts` (anomaly table with debounced threshold input, Feature 2); API calls live in `frontend/src/lib/api.ts`. Other analysis endpoints are not wired yet.
- Specs for Features 1–3 live in `frontend/specs/` (`components.md`, `api-types.ts`, `param-types.ts`).
- `/api/metrics/alerts` uses a rolling baseline of the previous 3 periods and accepts `threshold` in [0.01, 1.0]; `/api/metrics/facets` exposes `categories_by_business_type[business_type][operation_type]`.
- The dashboard header now derives its displayed range from the first and last monthly data points; Vitest covers year-boundary and empty-data cases.
- The frontend now includes two reusable project skills under `frontend/.agents/skills/`: `accessibility` (WCAG 2.2 AA guidance) and `vercel-react-best-practices` (React performance and bundle optimization guidance). Their sources and hashes are recorded in `frontend/skills-lock.json` so the team can reproduce the installed skills.

## Recent Skills Updates

### Accessibility skill

The accessibility audit applied WCAG 2.2 AA improvements across the dashboard:

- Added semantic status and error announcements with `aria-busy`, `role="status"`, and `role="alert"`.
- Improved table semantics with captions and explicit row/column scopes.
- Added accessible names for Recharts visualizations and hid decorative icons from assistive technology.
- Added a visible, high-contrast `:focus-visible` indicator for keyboard users.
- Improved the document title to `Financial Overview Dashboard`.

These changes make the application easier to navigate with keyboards and screen readers, provide clearer feedback during loading and errors, and reduce ambiguity in tables and charts. They also support WCAG requirements for focus appearance, semantic structure, and non-text alternatives.

### Vercel React best practices skill

The React performance audit applied the following improvements:

- Lazy-loaded the Recharts-based dashboard charts and comparison page with dynamic imports and `Suspense`.
- Split heavy chart code into separate production chunks so the initial dashboard bundle is smaller and becomes interactive sooner.
- Narrowed `useEffect` dependencies to primitive date values to prevent unnecessary data fetches and reruns.
- Kept independent comparison requests parallel with `Promise.allSettled`.

These changes reduce initial JavaScript work and improve time-to-interactive while preserving independent loading and error handling for dashboard sections.

### TypeScript best practices skill

The TypeScript audit strengthened the API boundary and removed avoidable unsafe typing:

- API JSON is treated as `unknown` and validated before entering the typed domain model.
- Added runtime validation for movements, alerts, top categories, facets, ISO dates, and nested business/category data.
- Removed the unsafe `as FacetsResponse` conversion and constructed the validated response explicitly.
- Removed an unnecessary non-null assertion in the comparison page.

This prevents malformed backend responses from silently entering the UI, makes failures explicit at the network boundary, and lets the rest of the application rely on trusted domain types without repeated checks or unsafe casts.

All recent frontend changes were validated from `frontend/` with ESLint, Vitest, and the production TypeScript/Vite build: 44 tests pass and the build completes successfully.

## Useful Commands

- Start services: `docker compose up --build`.
- Frontend tests, lint, and build: run `npm test`, `npm run lint`, and `npm run build` from `frontend/`.
- Backend tests: run `pytest` from `backend/`.