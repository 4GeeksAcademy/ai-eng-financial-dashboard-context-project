# Dashboard Quality Gate

Use this skill before merging changes that affect the financial dashboard, API specs, frontend components, accessibility, deployment configuration, or data contracts.

## When to use

- A PR changes `frontend/src`, `frontend/specs`, `docs/specs`, or dashboard API contracts.
- A PR adds or changes dashboard controls, charts, tables, empty states, or loading states.
- A PR changes Vite/Vercel build configuration, metadata, or environment variables.
- A PR changes ratio, currency, date-range, or B2B/B2C comparison semantics.

## Inputs to inspect

- `AGENTS.md` for current agent rules.
- `docs/specs/**/spec.md` for functional requirements.
- `frontend/specs/api-types.ts` and `frontend/specs/README.md` for API contract names and semantics.
- `frontend/src/App.tsx` and `frontend/src/components/dashboard/**` for UI behavior.
- `frontend/index.html`, `frontend/package.json`, and `frontend/vite.config.ts` for deployment readiness.

## Checklist

1. Confirm API contract alignment.
   - Query parameter names match backend names: `start_date`, `end_date`, `threshold`, `group_by`, `business_type`, `operation_type`, `limit`.
   - Alert ratios are treated as decimals: `0.3` means `30%`.
   - B2B/B2C category percentages are derived in the frontend, not expected from the API.

2. Check accessibility.
   - Interactive controls have visible or programmatic labels.
   - Keyboard focus is visible and controls are reachable in a logical order.
   - Dynamic errors use `role="alert"` or an equivalent announcement pattern.
   - Loading regions expose busy state where useful.
   - Decorative icons use `aria-hidden="true"`.
   - Tables use semantic table markup with headers.
   - Charts provide a screen-reader-accessible text summary or equivalent data.

3. Check deployment readiness.
   - `frontend/index.html` has a meaningful `title`, `description`, viewport, favicon, and correct `lang`.
   - Layout dimensions are stable across loading, empty, and loaded states.
   - `VITE_API_BASE_URL` behavior is documented for same-origin and external API deployments.
   - Vercel settings are compatible with Vite: install `npm ci`, build `npm run build`, output `dist`.

4. Run verification.
   - From `frontend/`, run `npm run lint`.
   - From `frontend/`, run `npm run test`.
   - From `frontend/`, run `npm run build`.
   - If possible, run `npm run preview` and inspect with keyboard navigation and Lighthouse.

## Output

Return a concise report with:

- Files inspected.
- Issues found, ordered by risk.
- Fixes applied or recommended.
- Verification commands and results.
- Any residual risks, especially manual accessibility or Lighthouse checks that were not run.