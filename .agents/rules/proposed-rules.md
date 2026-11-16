---
name: proposed-rules
status: proposed (not yet adopted; none of these are enforced today)
scope: whole repo
applies_when: deciding which risky findings to turn into enforced checks
related: [architecture-data-flow, api-contracts, known-edge-cases, security-local-vs-deployed, testing-workflow, dev-environment, code-style]
---

# Proposed rule set

Derived from the risky findings in the existing rule files. Same format as the other rules:
**When** -> **Do** -> **Check** -> **Why**. Every **Why** cites a repo fact taken from the
rule file named in brackets. Facts marked "not run" were never exercised on this machine.
Adopting a rule means moving it to its topic file and assigning it an ID there.

## Architecture

### P-ARCH-1: Single source for aggregation
- **When:** income, outcome, profit or profit % is computed.
- **Do:** compute it in the backend only. `App.tsx` fetches `/api/metrics/summary` and the client
  aggregation in `financial-utils.ts` is deleted.
- **Check:** `grep -n "computeKPIs\|computeMonthlyData" frontend/src` returns nothing outside tests being removed.
- **Why:** the same logic exists in `computeKPIs`/`computeMonthlyData` and in `summarize_movements`/`calculate_net_value`;
  `App.tsx` calls only `/api/metrics` and `/summary` has no consumer [architecture-data-flow ARCH-1].

### P-ARCH-2: Filters are declared once and applied to every endpoint
- **When:** an endpoint accepts `business_type`, `category` or `operation_type`.
- **Do:** route all filtering through `filter_movements` so no endpoint can skip it.
- **Check:** a parametrized test calls each endpoint with and without `business_type` and asserts the row counts differ.
- **Why:** `/api/metrics` returns 360 rows with or without `business_type`, while `/summary`, `/categories/top`,
  `/comparison` and `/alerts` honor it [architecture-data-flow ARCH-3].

### P-ARCH-3: Mock data window is injectable
- **When:** a test depends on the date range of generated movements.
- **Do:** let `generate_mock_movements` take a reference date (default `date.today()`) and pass a fixed one in tests.
- **Check:** the test suite passes with the system clock set to a different month.
- **Why:** `_year_for_month` (`routes.py:65-68`) follows `date.today()`; `/comparison` for 2025-03-01..2025-03-31
  returned all zeros [architecture-data-flow ARCH-4].

## API contracts

### P-API-1: Enum parity is checked by a test
- **When:** `Category`, `OperationType` or `BusinessType` changes.
- **Do:** add a test that compares the backend `Literal` values (`routes.py:11-15`) with the values in
  `frontend/src/lib/financial-types.ts:1-3`.
- **Check:** adding `"tax"` to the backend only makes that test fail.
- **Why:** that exact change left pytest (15), `tsc -b` and `npm test` (5) all green [api-contracts API-1].

### P-API-2: Validate the response at the boundary
- **When:** the frontend reads an API response.
- **Do:** parse `response.json()` in `App.tsx:15-21` with a schema (for example zod) instead of casting it.
- **Check:** a vitest case feeds a payload with a renamed field and expects an error state.
- **Why:** the response is cast, not parsed, so a wrong field name does not fail the build [api-contracts API-2].

## Edge cases

### P-EDGE-1: No local-time getters on date strings
- **When:** code derives a month or year from `create_date`.
- **Do:** use `create_date.slice(0, 7)` in `toYearMonthKey` and `computeMonthlyData` (`financial-utils.ts:8,42`).
- **Check:** a vitest case with `process.env.TZ = "America/Los_Angeles"` and `create_date: "2025-12-01"` expects "Dec 2025".
- **Why:** in Los Angeles time the real function gave 13 months instead of 12 and differed from `/summary`;
  UTC and Asia/Tokyo were correct [known-edge-cases EDGE-1].

### P-EDGE-2: Header text comes from data
- **When:** `App.tsx:49` or `DashboardHeader` renders a period label.
- **Do:** build the label from the first and last `create_date`.
- **Check:** with current mock data the header reads 2025-11..2026-10.
- **Why:** the label is hardcoded to "2024 - Full Year" while the data spans 2025-11-01..2026-10-28 [known-edge-cases EDGE-2].

### P-EDGE-3: Aggregation helpers accept empty input
- **When:** a helper in `routes.py` indexes into a list.
- **Do:** guard `ordered[0]`/`ordered[-1]` in `build_metrics_facets` (`routes.py:150-158`) and return empty facets with null dates.
- **Check:** `build_metrics_facets([])` returns a value instead of raising.
- **Why:** reproduced `IndexError: list index out of range` [known-edge-cases EDGE-3].

## Security

### P-SEC-1: CORS origins come from configuration
- **When:** the backend is reachable by anyone but you.
- **Do:** read allowed origins from an env var in `backend/app/main.py:9-10`, defaulting to `http://localhost:5173`; no `"*"`.
- **Check:** `curl -s -D- -H "Origin: http://evil.example" http://localhost:8000/health | grep -i access-control` prints nothing.
- **Why:** the current `allow_origins=["*"]` echoed an arbitrary origin back with `allow-credentials: true` [security-local-vs-deployed SEC-1].

### P-SEC-2: Debugger is opt-in
- **When:** the image or Compose file leaves your machine.
- **Do:** move port `5678:5678` (`docker-compose.yml:20`) and the debugpy launch (`backend/Dockerfile:10,12`) into a
  `docker-compose.override.yml` or a debug build target.
- **Check:** `grep -n 5678 docker-compose.yml backend/Dockerfile` returns nothing.
- **Why:** the port is published by default and `EXPOSE 8000 5678` is in the Dockerfile (not run: Docker is not installed)
  [security-local-vs-deployed SEC-2].

## Testing

### P-TEST-1: The build step is part of "done"
- **When:** you finish a change.
- **Do:** add `cd frontend && npm run build` as a fifth check in the done report.
- **Check:** the summary quotes its result or says "not run".
- **Why:** the vite bundle step was not run at baseline [testing-workflow TEST-1].

### P-TEST-2: Windows Python bootstrap is scripted
- **When:** setting up the backend on Windows.
- **Do:** add a documented `py -3 -m venv backend/.venv` setup to the README so `python` is never assumed.
- **Check:** from a clean clone, the documented commands end with `pytest -q` reporting 15 passed.
- **Why:** `python` resolved to the WindowsApps stub while `py` worked [testing-workflow TEST-5].

### P-TEST-3: Frontend coverage beyond one file
- **When:** you add a component or fetch logic.
- **Do:** add a colocated test (for example for the `App.tsx` error state).
- **Check:** `npm test` count rises above 5.
- **Why:** the only frontend test file is `financial-utils.test.ts` [testing-workflow TEST-4].

## Dev environment

### P-DEV-1: Vite proxy target is configurable
- **When:** running `npm run dev` on the host.
- **Do:** read the proxy target at `frontend/vite.config.ts:13` from an env var, defaulting to `http://backend:8000`.
- **Check:** `curl -i http://localhost:5173/api/metrics` returns 200 with the env var set to `http://localhost:8000`.
- **Why:** with the default target the proxy returned 502 and Vite logged `getaddrinfo ENOTFOUND backend` [dev-environment DEV-2].

### P-DEV-2: Errors are logged, not swallowed
- **When:** `App.tsx:35` handles a failed fetch.
- **Do:** replace `.catch(() => ...)` with a handler that calls `console.error(error)` and keeps the banner.
- **Check:** with the backend stopped, the browser console shows the error.
- **Why:** the current catch discards the cause [dev-environment DEV-4].

## Code style

### P-STYLE-1: Add a formatter and a backend linter
- **When:** repo tooling is set up or changed.
- **Do:** add Prettier for `frontend/` and Ruff for `backend/`, with one quote/semicolon style.
- **Check:** `npx prettier --check .` and `ruff check backend` exit 0.
- **Why:** there is no Prettier, Ruff, Black, EditorConfig or pyproject; `App.tsx` and `lib/*` use double quotes with
  semicolons while `main.tsx` and `components/dashboard/*` use single quotes without [code-style STYLE-1].
