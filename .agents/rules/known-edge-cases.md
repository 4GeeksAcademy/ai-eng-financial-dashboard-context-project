---
name: known-edge-cases
scope: frontend/src/App.tsx, frontend/src/lib/financial-utils.ts, backend/app/routes.py
applies_when: touching dates, month bucketing, facets, or the header
related: [architecture-data-flow, testing-workflow]
---

# Known edge cases (each reproduced)

Fixing one: add the regression test and delete the entry here in the same commit.

### EDGE-1: Month bucketing shifts in negative-UTC timezones
- **When:** you touch `computeMonthlyData` or `toYearMonthKey` (`financial-utils.ts:8,42`).
- **Do:** build the month key from the date string, e.g. `m.create_date.slice(0, 7)`, instead of
  `new Date(m.create_date)` plus local `getMonth()` (proposed fix, not yet applied or tested).
  Don't use local-time `Date` getters on `create_date`.
- **Check:** a vitest case that sets `process.env.TZ = "America/Los_Angeles"` before any `Date` use, feeds
  `create_date: "2025-12-01"`, and expects "Dec 2025". Before the fix it gives "Nov 2025".
- **Why:** reproduced with the real function: LA time gave 13 months instead of 12 and 12 months differed
  from `/summary`; UTC and Asia/Tokyo were correct.

### EDGE-2: Header year is hardcoded
- **When:** you touch `frontend/src/App.tsx:49` or `DashboardHeader`.
- **Do:** derive the label from the data (first and last `create_date`) or from a prop; don't copy `"2024 - Full Year"`.
- **Check:** with the current mock data the header shows 2025-11..2026-10, not 2024.
- **Why:** mock data spans 2025-11-01..2026-10-28 because `routes.py:97` uses `date.today()`.

### EDGE-3: `build_metrics_facets` fails on empty input
- **When:** you call `build_metrics_facets` with filtered or real data (`routes.py:150-158`).
- **Do:** guard `ordered[0]` / `ordered[-1]`; choose the empty behavior (empty facets with null dates, or an
  HTTP 404) and state the choice in the PR.
- **Check:** a test calls `build_metrics_facets([])` and asserts that behavior (today: `IndexError`).
- **Why:** reproduced: `IndexError: list index out of range`.
