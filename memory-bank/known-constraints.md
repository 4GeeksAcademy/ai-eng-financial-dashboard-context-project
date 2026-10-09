# Known Constraints

- **Last verified:** 2026-10-09
- **Evidence source:** [`../verifications.md`](../verifications.md), checked against the implementation paths linked below.

| Constraint | Current impact | Repository evidence |
|---|---|---|
| Synthetic, in-memory data | No real financial records, persistence, or data ingestion. | [`../backend/app/routes.py`](../backend/app/routes.py) generates seeded movements per request. |
| UI uses one endpoint | Dashboard requests `/api/metrics`; other backend routes are not consumed by the UI. | [`../frontend/src/App.tsx`](../frontend/src/App.tsx), [`../backend/app/routes.py`](../backend/app/routes.py). |
| No user filters or upload | Users cannot select a date range, filter dashboard data, upload files, edit movements, or export. | Current UI composition in [`../frontend/src/App.tsx`](../frontend/src/App.tsx). |
| Static dashboard period | Header says `2024 - Full Year`; generated dates depend on the backend runtime date. | [`../frontend/src/App.tsx`](../frontend/src/App.tsx), [`../backend/app/routes.py`](../backend/app/routes.py). |
| Development security settings | Wildcard CORS and debug/reload settings must not be assumed safe for production. | [`../backend/app/main.py`](../backend/app/main.py), [`../backend/Dockerfile`](../backend/Dockerfile). |

These are observed limitations, not a committed roadmap. Recheck the linked implementation before relying on them; update or remove entries when they change. Do not infer product commitments from this list.

