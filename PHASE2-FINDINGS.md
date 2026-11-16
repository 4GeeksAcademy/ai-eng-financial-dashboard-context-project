# Phase 2: Engineering Findings and Proposed Rules

## Purpose

This document records engineering conventions, potential risks, and proposed rules discovered during our Financial Dashboard investigation. Findings are supported by evidence from the project's code.

## Frontend Findings

### Architecture
- Finding: Dashboard components are stored in `frontend/src/components/dashboard/`, while general UI components are stored in `frontend/src/components/ui/`.
- Proposed rule: Keep dashboard-specific components separate from reusable UI components.

### Naming
- Finding: All seven files in `frontend/src/components/` use kebab-case naming.
- Proposed rule: Use kebab-case for new component filenames.

### Testing
- Finding: `frontend/src/lib/financial-utils.test.ts` contains five tests. No other files matching `*.test.*` were found under `frontend/src/`.
- Potential risk: Dashboard components may lack automated tests.
- Proposed rule: Add tests for important UI behavior and financial calculations.

### API Validation and Error Handling
- Finding: `frontend/src/App.tsx` checks the HTTP response status but does not explicitly validate the returned JSON structure. It also displays one generic error message.
- Potential risk: Invalid API data or different errors may not be handled clearly.
- Proposed rule: Validate API responses and handle meaningful error types.

### Styling
- Finding: `frontend/src/App.tsx` applies the `dark` class directly to the main element.
- Proposed rule: If theme switching is required, make theme selection configurable.

## Backend Findings

### Architecture
- Finding: `backend/app/main.py` contains the application setup, while `backend/app/routes.py` contains the API routes.
- Proposed rule: Keep application setup separate from API route definitions.

### Testing
- Finding: `backend/tests/test_routes.py` contains 15 test functions.
- Verification: Running `docker compose exec backend python -m pytest tests/ -q` returned 15 passed and 1 dependency deprecation warning in 0.45 seconds.
- Proposed rule: Maintain backend tests and add tests for important edge cases when introducing new functionality.

### Date Validation
- Finding: The inspected section of `backend/app/routes.py` (lines 306–327) accepts start and end dates without showing an explicit check of their order.
- Potential risk: A reversed date range may produce an unexpected comparison. This behavior has not been tested.
- Proposed rule: Validate that `start_date` is on or before `end_date` before calculating financial comparisons.

### Developer Experience
- Finding: Backend tests passed but produced a Starlette/httpx dependency deprecation warning.
- Potential risk: Future dependency changes may require updates.
- Proposed rule: Review dependency warnings during maintenance and test upgrades before adopting them.

## Verification and Limitations

We used GitHub Copilot to investigate the frontend and backend, then manually checked important findings against the repository.

Verification included:
- Using `ls` and `find` to inspect component folders, filenames, and test files.
- Using `cat`, `grep`, and `sed` to inspect source code and testing patterns.
- Running backend tests with Docker and pytest: 15 passed, 1 warning.

Not every Copilot suggestion was independently verified. Potential risks are documented as recommendations for further investigation, not confirmed production bugs.

No application code was changed during Phase 2. Agent rule files will be created and tested in Phase 3.