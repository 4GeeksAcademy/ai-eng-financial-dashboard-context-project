# Rule validation

Each rule in `.agents/rules/` was tried on a small real task in this repo. This
records what happened and what changed in the rule as a result.

| Rule | Task | Result | Change to the rule |
|---|---|---|---|
| `frontend.md` | Fix monthly totals behind UTC (`5bee479`) | The date rule and the test location applied. Running the suite with another `TZ` did not catch the bug, because no test used a date on the 1st | Tests for date logic now use a date on the 1st and set their own timezone with `vi.stubEnv` |
| `backend.md` | Add tests with calculated values (`22db46d`) | `routes.py` went from 97% to 100% coverage, and 25 tests pass. The rule did not say how to handle assumptions about rolling data, so the two data-dependent assertions were checked by hand for all 12 months | Added: work out expected values independently, derive dates from the data, and check data assumptions hold in every month |
| `api-contract.md` | Show the real period in the header using `/api/metrics/facets` (`840e6f2`) | The `/api` proxy and `API_BASE_URL` guidance worked. The sync table only listed the types in use at the time | Added `MetricsFacets` to the table |
| `frontend.md` | Same header task | The rule did not cover decorative data that fails to load | Added: decorative data must not block the page |
| `workflow.md` | Applied throughout these tasks | Verification, staying in scope and keeping the docs true all applied. Commit `2cd0e1e` had mixed concerns, which the rule did not prevent | Added one concern per commit, with type prefixes |

## Skills

| Skill | Task | Result | Change |
|---|---|---|---|
| `verify-changes` | Used for every task above | Commands work as written. A headless Chrome screenshot wrongly suggested that chart lines were missing | Added a warning about `--virtual-time-budget` and `--timeout` |
| `add-metrics-endpoint` | Only its frontend step, in the header task | Not fully tried, because no new endpoint was needed | None |

## Not validated

- `add-metrics-endpoint` has not been used to add a real endpoint.
- The rule to rebuild with `-V` after a frontend dependency change has not been
  run, because no dependency changed. Only the flag's existence was confirmed.
- No separate agent session has followed these rules from scratch.
