# Progress

## 2026-11-16: audit and proposed rule set
- Grouped the findings in `.agents/rules/*` into good and risky, by category (architecture, API, edge cases,
  security, testing, dev environment, style). The rules had no explicit audit; the grouping was derived from each rule's **Why**.
- Turned the risky findings into 16 proposed rules in `.agents/rules/proposed-rules.md` (commit `0025916`).
  Each cites at least one repo fact and names its source rule.

## Status
- Proposed only. Nothing is adopted, enforced or applied to code. The README index in `.agents/rules/` does not list the file.
- Facts were taken from the existing rule files, not re-run. Docker items (DEV-1, DEV-3, SEC-2) remain "not run".

## Next
- Decide which proposed rules to adopt; move each into its topic file with an ID and add it to the README index.
- Highest priority by risk: P-SEC-1 (CORS), P-API-1 (enum parity test), P-EDGE-1 (timezone month bucketing).
