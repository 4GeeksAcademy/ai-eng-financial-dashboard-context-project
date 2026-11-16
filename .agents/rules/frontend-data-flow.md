# Frontend data flow changes

## Scope

Apply this rule when changing frontend API calls, data types, loading or error states, or the Vite server configuration.

## Instructions

- Trace the request from `frontend/src/App.tsx` through the API URL configuration before changing the request path.
- Preserve the default `/api` request path and verify it against the proxy in `frontend/vite.config.ts`.
- Check `frontend/.env.example` before changing `VITE_API_BASE_URL`; it is an optional override for a different backend origin.
- Check `frontend/src/lib/financial-types.ts` against the backend response model when changing financial movement fields.
- Do not assume that frontend screens use every endpoint implemented by the backend; identify actual callers first.
- Keep loading and error behavior accounted for when changing data fetching.

## Repository evidence

- `frontend/src/App.tsx` requests `/api/metrics` and handles loading and error state.
- `frontend/vite.config.ts` proxies `/api` to `http://backend:8000`.
- `frontend/.env.example` documents `VITE_API_BASE_URL` as an optional override.
- `backend/app/routes.py` defines the API models and routes.
