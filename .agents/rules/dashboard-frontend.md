# Dashboard Frontend Rules

- The frontend is a React + TypeScript single-page app built with Vite. Do not use Next.js APIs or assume Vercel is the deployment target.
- Keep API requests on `/api/metrics` to use the configured Vite proxy. `VITE_API_BASE_URL` is only for an alternate API origin. Verify the proxy route separately from direct API access; the shell returning 200 does not prove the dashboard data loaded.
- Reuse `MonthlyDataPoint`, `financial-types.ts`, and `financial-utils.ts` for chart data and financial formatting/calculation; do not duplicate business logic in components.
- Keep financial charts keyboard-accessible with Recharts `accessibilityLayer`, a descriptive name, and an equivalent screen-reader-readable data table.
- Preserve the 280px chart plot placeholder during loading so deferred chart code does not cause avoidable layout shifts.
- Set SPA title and description in `frontend/index.html`; retain the page's actual language in its `lang` attribute.
- Run `npm test`, `npm run lint`, and `npm run build` from `frontend/`. Use `docker compose up --build` at repository root, then verify both `http://localhost:5173/api/metrics` (Vite proxy) and `http://localhost:8000/api/metrics` (direct FastAPI) to confirm integrated data flow.