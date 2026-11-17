---
name: change-validation
description: Validate software changes before approval by checking scope, applicable contracts, tests, risks, and evidence. Use when asked to verify a change, assess readiness, review test results, or recommend approval or corrections.
---

# Change Validation

Use this skill to assess whether a proposed software change is supported by sufficient evidence for approval. Validation is read-only: do not modify product files or claim that a check passed unless it was actually completed.

## When to Apply

Apply when the user asks to validate, verify, review readiness, or recommend approval of a software change. Do not use it as a substitute for a focused security review, accessibility audit, performance audit, or domain-specific review when one is requested; consult applicable specialist guidance as needed.

## Procedure

1. **Establish scope.** Identify the requested behavior, acceptance criteria, changed files, and relevant callers or dependent components. Inspect the current worktree and distinguish this change from pre-existing edits.
2. **Consult project context.** Read applicable `AGENTS.md`, rules, specifications, API contracts, relevant tests, and package or build manifests. Follow their instructions; do not assume conventions from another project.
3. **Review the change.** Compare changed code with the requested behavior and contracts. Check error and edge states, accessibility and security implications where relevant, and likely regressions in dependent flows. Keep unrelated pre-existing issues separate.
4. **Select focused checks.** Use the project's documented scripts and test tools for the changed behavior and affected layers (for example, unit tests, type checks, lint, build, or API tests). Prefer the smallest meaningful set; include broader checks only when scope or risk warrants them. Identify manual checks needed for behavior that automation cannot establish.
5. **Execute only authorized checks.** Run commands or tools only when the user has authorized them and the project environment supports them. Do not install dependencies, access external services, start or alter services, or change configuration without authorization. If a check is unavailable, unsafe, or not authorized, record it as not run and state why; do not substitute a guess.
6. **Assess evidence and risks.** Record the exact command or manual scenario, its scope, and observed result. Separate newly introduced defects from baseline failures. Note residual risks, untested paths, and evidence needed to resolve uncertainty.
7. **Recommend an outcome.** Recommend approval only when the change meets its stated criteria, relevant checks have passed, and no material unresolved issue remains. Otherwise request corrections or mark the result blocked by insufficient evidence. Validation does not authorize implementation, merge, or release.

## Evidence Status

Report checks using these meanings:

- **Passed:** the check was executed to completion and its result supports the stated criterion.
- **Failed:** the check was executed to completion and reported a failure; include relevant failure evidence.
- **Not run:** the check was not executed, could not run, or was not authorized; give the reason.
- **Pending:** required manual or environmental validation remains outstanding.

Do not treat a test's existence, a command's launch, a partial log, or source inspection as a passing runtime check. Distinguish code-based observations from executed results.

## Safety Boundaries

- Do not commit, push, merge, deploy, install packages, or perform destructive actions unless the user explicitly authorizes that specific action.
- Do not edit files as part of validation. If corrections are requested, handle them as a separate authorized implementation task.
- Preserve unrelated worktree changes. Never infer that a command is safe merely because it appears in project documentation.

## Report

Provide a concise, evidence-based report containing:

1. **Scope:** requested behavior and files inspected.
2. **Findings:** actionable issues with severity, affected file or behavior, and evidence.
3. **Checks:** passed, failed, and not-run checks, including exact commands or manual scenarios and reasons.
4. **Residual risk:** pending environment, integration, or manual validation.
5. **Recommendation:** approve, request corrections, or blocked/insufficient evidence, with a brief rationale.
