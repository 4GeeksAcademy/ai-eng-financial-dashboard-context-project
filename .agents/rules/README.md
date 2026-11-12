# Agent rules index

Every rule has an ID, a trigger (**When**), an action (**Do**), a way to confirm it (**Check**)
and a repo fact (**Why**). If a rule has no runnable or observable check, or no repo fact,
don't add it. Each file's front-matter gives its `scope` and `related` files.

| Rule file | IDs | Read when |
|---|---|---|
| [architecture-data-flow](architecture-data-flow.md) | ARCH-1..6 | adding/changing endpoints, KPIs, charts, filters |
| [api-contracts](api-contracts.md) | API-1..3 | changing fields or enums |
| [testing-workflow](testing-workflow.md) | TEST-1..5 | any change; before saying "done" |
| [dev-environment](dev-environment.md) | DEV-1..4 | running, debugging, adding dependencies |
| [code-style](code-style.md) | STYLE-1..3 | editing frontend code |
| [known-edge-cases](known-edge-cases.md) | EDGE-1..3 | touching dates, header, facets |
| [security-local-vs-deployed](security-local-vs-deployed.md) | SEC-1..3 | deploying or sharing |

Reference rules by ID in commits and PR notes, for example "per TEST-1: pytest 15 passed".
