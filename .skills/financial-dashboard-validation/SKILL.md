---
name: financial-dashboard-validation
description: Validate changes to this React, TypeScript, and Vite financial dashboard while preserving financial behavior and accessibility.
---

# Financial Dashboard Change Validation

## Objective

Provide a repeatable, evidence-based validation workflow for changes to the Financial Dashboard frontend. Confirm tests and production compilation, review the patch for whitespace problems, and explicitly consider financial-data behavior and accessibility without claiming checks that were not run.

## Required inputs

- The changed files or a concise description of the proposed dashboard change.
- The repository root and a usable Node.js/npm environment.
- Access to `frontend/package.json` scripts and the repository Git diff.
- For any browser/manual review: a running frontend, any required backend/API service, and a browser automation tool if available.

## Step-by-step workflow

1. Read `AGENTS.md`, relevant `.agents/rules/`, and applicable memory-bank context before editing or validating.
2. Inspect the changed code and its surrounding tests. Identify affected financial calculations, request/error/loading states, and UI semantics.
3. Add or update focused tests for behavior changed; check both success and relevant edge/error states. Keep tests consistent with the existing Vitest patterns.
4. From `frontend/`, run `npm test -- --run` (or the equivalent package test script) and record the exact result.
5. From `frontend/`, run `npm run build` and record the exact result, including TypeScript/Vite failures if any.
6. From the repository root, run `git diff --check` and inspect `git status --short` plus `git diff` to confirm scope, whitespace, and that no unrelated user changes were overwritten.
7. If browser tooling/services are available and the change warrants live interaction, follow the community webapp-testing skill: check helper usage first, wait for the app to settle before inspecting rendered content, exercise the relevant flow, and record observations. If unavailable, state that browser verification was not performed and why.
8. Compare evidence to the acceptance criteria; report passed, failed, or not-run for every check. Do not infer runtime or accessibility conformance from a successful build or unit tests.

## Outputs

Provide a concise validation record containing:

- Change summary and relevant changed file paths.
- Exact commands executed and pass/fail results (include test counts where available).
- Browser/manual checks performed or a clear limitation explaining why not.
- Any failures, warnings, or validation gaps.
- A final acceptance decision based only on collected evidence.

## Acceptance criteria

- Relevant frontend tests pass, including regression tests for changed behavior.
- The production TypeScript/Vite build succeeds.
- `git diff --check` succeeds, and the reviewed diff contains only intended changes.
- Existing financial behavior and accessible semantics are preserved; changed user-facing states have suitable regression coverage where feasible.
- Browser-based behavior is verified when the required server/browser tooling is available; otherwise the limitation is explicitly recorded without implying it passed.
- The validation record accurately distinguishes automated checks, manual checks, warnings, and checks not run.
