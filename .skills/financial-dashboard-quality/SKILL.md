---
name: financial-dashboard-quality
description: Review and improve this React/Vite financial dashboard using repository evidence, accessibility checks, React performance guidance, and the documented Docker Compose workflow.
---

# Financial Dashboard Quality

## Objective

Provide a focused pre-merge review for this inherited financial dashboard. Keep changes evidence-based, preserve the verified API/Compose contract, and identify risks without claiming unsupported deployment or framework behavior.

## Inputs

- Changed frontend files or an explicit review scope.
- `AGENTS.md`, `.agents/rules/`, and `memory-bank/`.
- `frontend/package.json` scripts and the relevant API/configuration files.
- Any deployment, testing, accessibility, or performance claim to verify.

## Procedure

1. Read the repository guidance, relevant rules, memory-bank notes, and the changed files.
2. Trace every proposed change to source evidence or to an applicable accessibility/React guideline.
3. Check React effects for cancellation, stale updates, unnecessary state, avoidable rerenders, and bundle regressions.
4. Check headings, accessible names, live regions, keyboard access, focus visibility, reduced motion, contrast, color-independent feedback, and chart alternatives.
5. Preserve the `/api` proxy and Compose services. Do not invent endpoints, hosting, or production behavior.
6. From `frontend/`, run `npm run lint`, `npm test`, and `npm run build`. If runtime behavior matters, validate with the documented `docker compose up --build` flow and record the URL/context.
7. Separate applied changes, deferred recommendations, and unknowns. Use a focused commit for each implementation phase.

## Outputs

- Findings with priority and exact file paths.
- Applied changes linked to evidence or skill rules.
- Deferred risks and explicit unknowns.
- Validation commands, working directories, execution context, and results.
- Suggested focused commit message when changes were made.

## Acceptance criteria

- No unsupported API, hosting, or framework assumptions.
- Loading and error states have appropriate accessible semantics.
- Decorative icons are hidden from assistive technology and interactive controls have names.
- Network effects cancel safely and do not update state after abort.
- The documented lint, test, and build commands pass.
- Accessibility and performance claims distinguish static review from live Lighthouse/axe or browser verification.
- Documentation and commits accurately describe the work performed.
