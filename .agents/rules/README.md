# Project Rules (Draft)

Status: **DRAFT** — inferred from current repository behavior during the review recorded in `verification.md`. These are proposed conventions, not yet ratified policies.

Per `AGENTS.md`, agents must read these rules before analyzing or modifying files in this repository.

## Index

| File | Rules | Topic |
|---|---|---|
| `architecture-and-data-flow.md` | 1–4 | Payload alignment, API proxy, data-source clarity, mock-data cost |
| `naming-and-organization.md` | 5–6 | Component naming/location, `@/` import alias |
| `testing.md` | 7–8 | Backend endpoint tests, frontend calculation tests |
| `runtime-behavior-and-security.md` | 9–10, 19–20 | Random seeding, CORS, debugpy, empty inputs |
| `dates-and-time-zones.md` | 11–12 | Period labels, date-only string handling |
| `api-validation-and-precision.md` | 16–18 | Query validation, date-range edges, monetary precision |
| `documentation-and-developer-experience.md` | 13–14 | README accuracy, fetch-error handling |
| `agent-workflow.md` | 15 | Instruction directories |

Rule numbers match the "Proposed contributor rules" list in `verification.md`.
