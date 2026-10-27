# Testing

## Rule 7: Add or update backend endpoint/helper tests when changing backend behavior

Add tests for new or changed routes and helpers in `backend/tests/test_routes.py`.

**Repo fact:** `backend/tests/test_routes.py` tests route responses, filters, and mock generation for the handlers in `backend/app/routes.py`.

## Rule 8: Add or update frontend calculation tests alongside the utility implementation

When changing functions in `frontend/src/lib/financial-utils.ts`, update `frontend/src/lib/financial-utils.test.ts`. Run `npm test`, `npm run lint`, and `npm run build` in `frontend/` before considering the change done.

**Repo fact:** `frontend/src/lib/financial-utils.test.ts` sits next to the implementation it tests, and `frontend/package.json` declares `test`, `lint`, and `build` scripts.
