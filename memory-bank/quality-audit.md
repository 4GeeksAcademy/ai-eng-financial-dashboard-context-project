# Quality audit: accessibility and React/deployment practices

## Scope

Branch: `feature/agent-skills`.

This audit applies the repository rules in `.agents/rules/`, the installed `accessibility` skill from `addyosmani/web-quality-skills`, and the installed `vercel-react-best-practices` skill from `vercel-labs/agent-skills`.

## Skills ecosystem findings

- `vercel-react-best-practices` is listed at `https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices` and covers React/Next.js performance across 70 rules.
- `web-design-guidelines` is listed at `https://skills.sh/vercel-labs/agent-skills/web-design-guidelines` and covers design, accessibility, and UX review.
- The skills site documents installation through `npx skills add`; installation was not performed because the repository's local, versioned skill is the reusable artifact for this project.
- `deploy-to-vercel` is relevant only if a Vercel deployment becomes an actual project goal. No Vercel configuration or deployment evidence exists in this repository.
- `npx skills find accessibility`, `performance`, `seo`, and `forms` were executed. The most relevant additional candidates were `web-design-guidelines`, `web-quality-audit`, `performance`, `playwright-best-practices`, and `seo`; none was installed because the current scope is the requested accessibility and React review.
- Both requested skills were installed with `npx skills add ... --skill ... --copy`. The CLI reported safe/low-risk results and zero Socket alerts for both packages.
- The installer generated project skill metadata in `skills-lock.json` and agent-specific copies/symlinks under `.claude/` and `.agents/skills/`; these generated artifacts should be reviewed before committing.

## Applied changes

- Added `aria-hidden="true"` to decorative dashboard and KPI icons.
- Added a single screen-reader loading status and `role="alert"` for the network error.
- Made `CardTitle` render a configurable semantic heading (`h2` by default, with `h3`/`h4` available).
- Hid individual skeletons from assistive technology to avoid repetitive announcements.
- Added a global `prefers-reduced-motion` rule.
- Replaced the generic HTML title with `Financial Metrics Dashboard`.
- Added `AbortController` cancellation to the metrics request and ignored abort errors.
- Added a keyboard skip link and global `:focus-visible` styling.
- Added accessible chart names and expandable data tables for both Recharts visualizations.

## Validation

From `frontend/`:

- `npm run lint`: passed.
- `npm test`: passed, 5 tests.
- `npm run build`: passed. Vite reports the existing non-blocking large chunk warning.

## Remaining risks and unverified items

- The charts still need a complete non-visual data alternative (summary/table) and runtime axe/Lighthouse review.
- No JSX accessibility plugin or automated accessibility suite is currently configured; the installed skill requires a live Lighthouse/axe pass when those tools are available.
- `frontend/Dockerfile` and `backend/Dockerfile` remain development-oriented; production deployment is not verified.
- No Vercel configuration or CI/CD deployment exists in the repository.
- The HTML language remains `en` because the interface's primary language policy was not defined; one existing error message is Spanish and should be normalized in a separate copy/language decision.
