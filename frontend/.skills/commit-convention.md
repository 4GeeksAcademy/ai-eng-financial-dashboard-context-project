---
name: commit-convention
description: Project-specific commit guidelines for financial dashboard updates.
---

# Objective
Ensure clear, traceable git commits tied to agent skill modifications.

# Inputs
- Staged git changes (`git status`)
- Skill name applied during the turn

# Outputs
- Standardized git commit message following `feat(scope): message [skill-name]`

# Acceptance Criteria
- Commit message explicitly mentions the primary skill applied.
- All modified files are staged prior to committing.
