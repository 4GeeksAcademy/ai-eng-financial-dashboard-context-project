---
name: testing-workflow
scope: backend/tests/, frontend/src/lib/*.test.ts
applies_when: any code change; before claiming something works
related: [architecture-data-flow, dev-environment]
---

# Testing rules

### TEST-1: Run all four checks before saying "done"
- **When:** you finish a change.
- **Do:** run, and quote the result line for:
  1. `cd backend && pytest -q` (15 passed at baseline)
  2. `cd frontend && npm test` (5 passed)
  3. `cd frontend && npm run lint` (no output = clean)
  4. `cd frontend && npx tsc -b` (exit 0)
- **Check:** your summary lists each command with its result, or says "not run" for any you skipped.
  `npm run build` (the vite bundle step) was not run at baseline; say so if you didn't run it.
- **Why:** `memory-bank/verification.md` is the format for reporting verified vs. unverified.

### TEST-2: Backend tests, where and how
- **When:** you add backend tests.
- **Do:** put them in `backend/tests/test_routes.py` using the module-level `client = TestClient(app)`.
  Run from `backend/` or the repo root (`pytest -q backend`); both work.
- **Check:** the new test fails when you temporarily break the behavior it covers, then passes after revert.
- **Why:** `backend/tests/conftest.py` puts `backend/` on `sys.path`; both invocations gave 15 passed.

### TEST-3: Generator changes update the 360 assertion
- **When:** you change months, movements-per-month, or the loop in `generate_mock_movements`.
- **Do:** update `assert len(movements) == 360` in
  `test_generate_mock_movements_returns_full_year_sorted_data` (`test_routes.py:12-16`).
- **Check:** that test passes and no other test fails from the count.
- **Why:** changing 30 to 31 movements per month failed exactly that test (`372 == 360`).

### TEST-4: Frontend logic gets a colocated vitest file
- **When:** you add or change a function in `frontend/src/lib/`.
- **Do:** add cases to `frontend/src/lib/<name>.test.ts` (as `financial-utils.test.ts` does).
- **Check:** the `npm test` count goes up.
- **Why:** `"test": "vitest run"` in `package.json`; the only test file is `financial-utils.test.ts`.

### TEST-5: `python` missing on the Windows shell
- **When:** `python` prints the Microsoft Store message.
- **Do:** use the launcher: `py -3 -m venv <dir>`, then
  `<dir>/Scripts/python.exe -m pip install fastapi httpx pytest`; or use Docker.
  Put the venv in an ignored path (`backend/.venv/` is gitignored) or outside the repo.
- **Check:** `pytest -q` reports 15 passed; record the Python version you used.
- **Why:** `python` resolved to the WindowsApps stub while `py` worked (3.14 here; `backend/Dockerfile` uses 3.13).
