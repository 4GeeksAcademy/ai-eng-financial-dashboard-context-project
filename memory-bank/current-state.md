# Current state

Last verified: 2026-11-05. Re-check before relying on this, because line numbers
and results change.

## Baseline

All of these were run inside the containers:

| Check | Result |
|---|---|
| Backend tests | 15 passed, 97% coverage of `app/` |
| Frontend tests | 6 passed |
| Lint | No errors |
| Build, including type check | Succeeds, with a warning about a 584 kB chunk |

## Known issues

None of these are fixed yet. Fix them only when asked.

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

The backend has endpoints the UI does not use: `b2b`, `b2c`, `summary`,
`categories/top`, `comparison` and `alerts`. The UI has no filters or date
selection, and it calculates its monthly data in the browser even though
`/api/metrics/summary` exists.
