# Correctness rules (known edge cases, read from code, not reproduced)

- **Header year:** `frontend/src/App.tsx:49` passes `"2024 - Full Year"` to
  `DashboardHeader`, while the backend builds dates from `date.today()`
  (`routes.py:97`). Don't copy the hardcoded label; derive it from the data.
- **Timezone:** `computeMonthlyData` does `new Date(m.create_date)`
  (`financial-utils.ts:42`; an ISO date parses as UTC) then buckets with local
  `getMonth()` (`financial-utils.ts:8`). In negative-UTC-offset timezones, a
  movement on the 1st can land in the previous month.
- **Empty input:** `build_metrics_facets` indexes `ordered[0]`
  (`routes.py:156`) and raises `IndexError` on an empty list. Guard before
  using it on filtered or real data.
