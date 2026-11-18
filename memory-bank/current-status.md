# Current status

## What works

Verified only in `verification.md`:

- The app runs. `docker compose up --build` started both services (`verification.md`, claim 10).
- The dashboard loads at http://localhost:5173, including the header, four KPI cards, and two charts (`verification.md`, claims 2, 3, 4, and 11).
- API docs load at http://localhost:8000/docs (`verification.md`, claims 12 and 13).
- The backend test for the new count route passed in Docker: 1 passed (`verification.md`, Phase 3).
- `GET /api/metrics/count` was added, with a backend test, and that task followed `backend-api.md` rules 1, 2, and 3 and `testing.md` rules 1 and 2 (`verification.md`, Phase 3).

## Known gaps

Taken from the risky patterns in `proposed-rules.md`, plus the missing login noted in `verification.md`:

- The badge is the hardcoded string "2024 - Full Year", while movement dates come from `date.today()`. The badge does not describe the charts (`proposed-rules.md`, F18; `verification.md`, Findings).
- `frontend/src/lib/mock-data.ts` is an unused 2024 movement list. The page reads the API instead (`proposed-rules.md`, F19).
- The UI never calls these eight endpoints: `/api/metrics/facets`, `/summary`, `/categories/top`, `/comparison`, `/alerts`, `/b2b`, `/b2c`, and `/api/metrics/count`. `GET /api/metrics/count` was added in Phase 3 (`verification.md`, Phase 3). The browser only calls `GET /api/metrics` (`proposed-rules.md`, F20).
- `test_metrics_comparison_returns_delta_fields` uses the fixed range 2025-03-01 through 2025-03-31 and only checks JSON keys. That window can contain no rows while the test still passes, because generated dates move with `date.today()` (`proposed-rules.md`, F25).
- The backend always starts debugpy on `0.0.0.0:5678`, and Compose publishes `5678:5678`. The README does not mention 5678 (`proposed-rules.md`, F28).
- `backend/requirements.txt` has no version pins (`proposed-rules.md`, F29).
- There is no login. The code has no named user or role (`verification.md`, claim 5).

## Next priorities

Fixes for the gaps above. No new features.

- Make the period badge describe the rolling dates built from `date.today()`, instead of the fixed "2024 - Full Year" string (`proposed-rules.md`, F18).
- Decide with the team whether the 8 unused endpoints and frontend/src/lib/mock-data.ts should be connected to the UI, documented, or removed (F19, F20). Do not change them until decided.
- Change `test_metrics_comparison_returns_delta_fields` so a fixed 2025-03-01 through 2025-03-31 range is not treated as proof that the range contains rows (`proposed-rules.md`, F25; `.agents/rules/testing.md`, rule 4).
- Stop starting debugpy on every backend launch, and stop publishing 5678 unless a debugger is in use (`proposed-rules.md`, F28). `.agents/rules/dev-environment.md` rule 5 still says to keep that listener and the published port.
- Pin the backend dependency versions in `backend/requirements.txt` (`proposed-rules.md`, F29). `.agents/rules/dev-environment.md` rule 6 still says to add Python dependencies with no version pin.
- Login: the code has no login (`verification.md` claim 5). Whether one is needed is an open question, not a decision.
