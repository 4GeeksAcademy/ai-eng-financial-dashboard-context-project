---
name: financial-dashboard
description: Apply when exploring, specifying, implementing, or validating changes to this repository's React/TypeScript financial dashboard, its API integration, accessibility, or metadata.
---

# Financial dashboard engineering workflow

Use this skill for repository tasks that affect the financial dashboard or its frontend/API boundary. Follow the task's scope first: a specification-only task must not become an implementation task.

## 1. Establish repository context before proposing changes

1. Read `AGENTS.md`, then inspect applicable files under `.agents/rules/` and the relevant `memory-bank/` entries.
2. Check `git status --short --branch` before editing. Preserve existing user changes; do not reset, discard, or commit them unless specifically requested.
3. Trace the current UI through these entry points before deciding where work belongs:
   - `frontend/src/main.tsx` mounts `frontend/src/App.tsx`.
   - `frontend/src/App.tsx` fetches `/api/metrics`, computes dashboard values, and composes the dashboard components.
   - Presentation is under `frontend/src/components/dashboard/`; reusable financial domain types and calculations are under `frontend/src/lib/`.
   - Document metadata is in `frontend/index.html`; global styles are in `frontend/src/index.css`.
4. Inspect the actual file and callers before changing a shared UI component. Do not assume that a file name, old memory-bank statement, or previous task proves current behavior.

## 2. Respect the existing stack and boundaries

- Use the existing Vite + React + TypeScript stack and current component/style conventions. Check `frontend/package.json`, TypeScript/Vite configuration, and nearby components before introducing a dependency or pattern.
- Keep financial calculations in reusable `frontend/src/lib/` functions; keep dashboard components focused on presentation and composition.
- Keep frontend and backend responsibilities separate. Do not modify backend code for a frontend-only task.
- Match data fields and query parameters to verified contracts in `backend/app/routes.py`, its Pydantic response models, and the frontend types in `frontend/src/lib/financial-types.ts`. Do not infer API field names from chart labels or mock data. If the UI consumes a different endpoint, verify its response model before use.

## 3. Work from specifications when requested

For a specification-only task:

1. Convert the request into numbered requirements with explicit scope and acceptance criteria.
2. Link each requirement to current evidence (existing source, API model, README, or rule) and label unresolved assumptions as open questions.
3. Describe proposed files and behavior without editing runtime code.
4. Do not modify `frontend/src/**`, `backend/**`, `frontend/index.html`, package manifests/lockfiles, Docker files, or runtime configuration unless implementation is explicitly authorized. Documentation explicitly requested for the specification may be created/updated.
5. Validate that the specification is internally consistent and traceable; present it for approval before implementation if the request requires approval.

For implementation tasks, limit edits to authorized requirements and preserve unrelated working-tree changes.

## 4. Preserve accessible semantics and truthful metadata

- Keep the document language aligned with the rendered content; only change `lang` when page language actually changes.
- Derive title and description from verified product/UI content. Do not invent a product name, audience, locale, business claims, social-card URL, or framework-specific metadata that the app does not use.
- Use a logical heading hierarchy and native HTML semantics. Give controls accessible names and associate labels with fields; use ARIA only when native semantics do not express the state or role.
- Keep visible keyboard focus and keyboard access to interactive content. When using Recharts, inspect the installed API/version and preserve its accessibility layer rather than assuming defaults.
- Give informative images meaningful alt text and decorative images empty alt text; first verify how the image is used.
- Verify contrast numerically or with a suitable tool before claiming it passes. Do not claim screen-reader/manual accessibility verification unless it was actually performed.

## 5. Validate proportionally and report evidence

- Read the frontend scripts from `frontend/package.json`; use the repository's commands, normally `npm run build`, `npm run lint`, and `npm test` from `frontend/`.
- If dependencies are missing, install from the committed lockfile with `npm ci` when permitted. Report installation/audit notices separately; do not run automatic dependency upgrades unless requested.
- Run targeted tests for behavior changed, plus the available project checks. For code changes, apply applicable rules such as `.agents/rules/05-testing-casos-positivos-y-negativos.md`.
- Inspect `git diff --check`, the final diff, and `git status`. Confirm generated artifacts are ignored and no unintended files changed.
- Record in `memory-bank/` or the task's established evidence document: actual files changed, exact commands run, pass/fail/blocking result, warnings, and checks not performed. Never turn a planned command into a claimed result.

## 6. Record actual skill use

- Check `.agents/skills/` before work. A skill counts as used only if its instructions were consulted and applied during the task; merely creating, listing, or linking a skill is not use.
- Record name/path, purpose, task/phase, concrete guidance applied, artifacts affected, verification, and status in the evidence document.
- Distinguish skills actually used from those only consulted, created, unavailable, or pending. Do not claim that this newly created skill caused changes made before its creation.

## Completion checklist

- [ ] Current repository rules, state, and relevant code were inspected.
- [ ] API fields and parameters are supported by backend contracts and frontend types.
- [ ] Scope was respected; specification-only tasks changed no runtime files.
- [ ] Metadata, heading order, dynamic states, controls, images, and keyboard behavior were assessed as relevant.
- [ ] Available project validations were run and accurately classified.
- [ ] Final diff is scoped, evidence is linked, and no unrequested commit was created.
