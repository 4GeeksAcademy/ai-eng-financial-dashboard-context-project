# Current state

Last verified: 2026-11-05. Re-check before relying on this, because line numbers
and results change.

## Baseline

All of these were run inside the containers:

| Check | Result |
|---|---|
| Backend tests | 15 passed, 97% coverage of `app/` |
| Frontend tests | 5 passed |
| Lint | No errors |
| Build, including type check | Succeeds, with a warning about a 584 kB chunk |

## Known issues

None of these are fixed yet. Fix them only when asked.

### Monthly totals are wrong in timezones behind UTC

`computeMonthlyData` in `frontend/src/lib/financial-utils.ts` uses
`new Date(m.create_date)` with local getters, so a date on the 1st of a month
counts toward the previous month.

With `TZ=America/Santiago` the current data produces 13 points instead of 12,
including an extra `Oct 2025` point with $5,466 of income and a 100% margin. All
16 movements dated on the 1st are affected. UTC and `Europe/Madrid` are correct.

The tests miss it because containers run in UTC and no test covers a date on the
1st through `computeMonthlyData`.

Likely fix: take the key from the string with `m.create_date.slice(0, 7)`, and
add a test with a date on the 1st.

### The period label is wrong

`App.tsx` passes `period="2024 - Full Year"` to `DashboardHeader`, but the data
covers the last 12 full months (`2025-11-01` to `2026-10-28` when verified). The
component also has its own hardcoded default.

### Smaller issues

- **Unused data:** nothing imports `frontend/src/lib/mock-data.ts`.
- **Mixed UI language:** the UI is in English except the error message in
  `App.tsx`, which is in Spanish and also misspells "información".
- **Permissive CORS:** `backend/app/main.py` combines `allow_origins=["*"]` with
  `allow_credentials=True`. This matters if the API is ever deployed.
- **Unpinned Python dependencies:** `backend/requirements.txt` has no versions,
  so rebuilds can change them. The `starlette.testclient` deprecation warning
  about `httpx` comes from a current release.
- **Weak test assertions:** several backend tests only check status codes and
  keys. Lines 170, 297, 313, 332 and 352 of `routes.py` are not covered: the
  `day` grouping and the `business_type` filter on three routes, plus the
  `delta_pct` calculation.

## Not wired up yet

The backend has endpoints the UI does not use: `b2b`, `b2c`, `facets`, `summary`,
`categories/top`, `comparison` and `alerts`. The UI has no filters or date
selection, and it calculates its monthly data in the browser even though
`/api/metrics/summary` exists.
