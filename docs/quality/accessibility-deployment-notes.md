# Accessibility and Deployment Notes

## Context

The tech lead requested two quality tracks before merging future dashboard changes:

- Accessibility for people using screen readers, keyboard navigation, and high-contrast modes.
- Vercel + React deployment practices focused on stable layout, metadata, and Lighthouse readiness.

This repository currently uses Vite + React, not Next.js. Next-specific practices such as `next/image`, `next/font`, and the Next metadata API do not apply directly. Equivalent checks for this repo are documented below.

## Accessibility baseline

- Decorative dashboard icons should be hidden from assistive technologies with `aria-hidden="true"`.
- Dynamic error messages should use an announcing role such as `role="alert"`.
- Loading regions should expose busy state with `aria-busy` when data is being fetched.
- Chart components should not rely on SVG-only information. Provide an accessible text summary or equivalent tabular data for screen readers.
- Empty states should be explicit and announced as status content when they replace a chart or table.
- New controls for date ranges, thresholds, view switching, and tables must have labels, visible focus states, and keyboard access.

## Vercel + Vite deployment baseline

- Framework preset: Vite.
- Install command: `npm ci`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Required environment variable when the backend is not served from the same origin: `VITE_API_BASE_URL`.
- If `VITE_API_BASE_URL` is empty, frontend requests are relative to the deployed origin.

## Lighthouse readiness checklist

- `frontend/index.html` must have a product-specific `<title>` and `<meta name="description">`.
- The root HTML `lang` must match the product language.
- Skeleton dimensions should match final content dimensions to avoid layout shift.
- Charts should keep stable dimensions across loading, empty, and loaded states.
- Build output must be generated with `npm run build` before deployment.

## Learned constraints

- The dashboard API uses decimal ratios for alert thresholds and increases: `0.3` means `30%`.
- Top-category percentages in the B2B/B2C comparison are derived in the frontend; the API does not return them.
- The local skill ecosystem referenced by `AGENTS.md` did not exist yet, so reusable agent guidance should be captured under `.agents/skills`.