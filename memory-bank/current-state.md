# Current state

Last verified: 2026-11-05. Re-check before relying on this, because results
change. The evidence for each gap is in `docs/engineering-findings.md`.

## What works

All of these were run or observed on that date:

| Area | Result |
|---|---|
| Startup | Both services run with `docker compose up --build` |
| Backend tests | 25 passed, 100% coverage of `app/` |
| Frontend tests | 9 passed, also with `TZ=America/Santiago` |
| Lint | No errors |
| Build, including type check | Succeeds, with a warning about a 584 kB chunk |
| API | All 9 routes respond, and match `memory-bank/architecture.md` |
| Proxy | `/api` reaches the backend through port 5173 |
| Browser | Headless Chrome shows the KPIs, both charts, the period label and the loading state |

## Known gaps

None of these are fixed. Fix them only when asked.

**Reliability**

- **No CI:** nothing runs the checks automatically. There is no `.github/` folder.
- **Unpinned Python dependencies:** `backend/requirements.txt` has no versions, and
  a `starlette.testclient` deprecation warning about `httpx` already appears.
- **Inexact frontend installs:** `frontend/Dockerfile` runs `npm install` despite
  the tracked lockfile.
- **Untested UI states:** components have no tests, so the loading, empty and error
  states are not covered automatically.
- **Weak older tests:** several older backend tests still only check status codes
  and keys, and `test_metrics_alerts_returns_anomaly_candidates` only asserts inside
  `if payload:`.

**Design**

- **Calculations on both sides:** monthly totals exist in `computeMonthlyData` and
  in `summarize_movements`.
- **Hand-copied types:** `financial-types.ts` mirrors `routes.py`, and nothing
  checks that they match.
- **Repeated filter:** `business_type` is filtered inline in 4 handlers.
- **Global random state:** `generate_mock_movements` seeds Python's shared generator.
- **Permissive CORS:** `backend/app/main.py` combines `allow_origins=["*"]` with
  `allow_credentials=True`. This matters if the API is ever deployed.

**Small fixes**

- **Mixed UI language:** the error in `App.tsx` is in Spanish, and misspells
  "información". The rest of the UI is in English.
- **Lost error detail:** `App.tsx` discards the cause of a failed fetch.
- **Unused data:** nothing imports `frontend/src/lib/mock-data.ts`.
- **Bundle size:** the production chunk is 584 kB.

**Not wired up**

The UI does not use the `b2b`, `b2c`, `summary`, `categories/top`, `comparison` or
`alerts` endpoints, and has no filters or date selection.

## Not verified

- Attaching a debugger to port 5678 and stopping at a breakpoint.
- Pointing the frontend at another backend with `VITE_API_BASE_URL`.
- The empty and error states in a browser.

See `verification.md` and `docs/rule-validation.md` for details.

## Next priorities

This order is a technical suggestion based on the gaps above. It is not a product
roadmap, and the repo does not define one.

1. **Add CI** for the existing checks, because nothing else enforces them.
2. **Make builds reproducible** by pinning Python dependencies and using `npm ci`.
3. **Check the unverified items** above, so they can be documented as facts.
4. **Do the small fixes**, which are low risk and visible to users.
5. **Strengthen the older backend tests**, starting with the `if payload:` case.

Wiring up the remaining endpoints or adding filters is a product decision that
needs an owner, so it is not ranked here.
