---
name: financial-dashboard-quality
description: Review and improve this React/Vite financial dashboard using repository evidence, accessibility checks, React performance guidance, and the documented Docker Compose workflow.
---

# Financial Dashboard Quality

## Purpose

Use this skill before merging frontend changes. It combines the repository's evidence-first rules with the applicable parts of the external `vercel-react-best-practices` and `web-design-guidelines` skills.

## Inputs

- Changed frontend files or a review scope.
- The current repository rules in `.agents/rules/`.
- The frontend scripts in `frontend/package.json`.
- The API and deployment claims that need verification.

## Procedure

1. Read `AGENTS.md`, all relevant `.agents/rules/` files, and `memory-bank/`.
2. Confirm each claim against source files, configuration, tests, or a running service. Mark unverified deployment assumptions explicitly.
3. Review React code for request cancellation, stale responses, unnecessary state, avoidable rerenders, bundle-size regressions, and dependency correctness.
4. Review accessibility for semantic headings, accessible names, live regions, loading/error states, keyboard access, reduced motion, contrast, color-independent communication, and chart alternatives.
5. Preserve the documented Compose contract. Do not replace the `/api` proxy or invent services/endpoints without evidence.
6. Run affected validation from `frontend/`: `npm run lint`, `npm test`, and `npm run build`.
7. If runtime behavior matters, run `docker compose up --build` and record the URL, context, and result. Do not claim Vercel deployment is verified unless repository configuration or a real deployment proves it.
8. Report findings with file paths, evidence, priority, applied changes, remaining risks, and validation results.

## Outputs

- A concise findings list with file references.
- A list of applied changes separated from deferred recommendations.
- Validation commands and results.
- Explicit unknowns for unavailable skills, deployment providers, or runtime checks.

## Acceptance criteria

- No unsupported API, hosting, or framework assumptions.
- Loading and error states have appropriate accessible semantics.
- Decorative icons are hidden from assistive technology.
- Network effects handle cancellation and do not update state after abort.
- Existing lint, test, and build commands pass.
- Changes are split into focused commits according to `.agents/rules/05-validation-and-commits.md`.
