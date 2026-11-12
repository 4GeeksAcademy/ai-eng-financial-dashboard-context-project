# Developer-experience rules

- **Run with Docker:** `docker compose up --build` (README "How to run
  locally"). Ports from `docker-compose.yml`: frontend 5173, backend 8000,
  debugpy 5678; API docs at `/docs`.
- **Host-only frontend runs fail by default.** `frontend/vite.config.ts:11-13`
  proxies `/api` to `http://backend:8000`, which only resolves inside Compose.
  Outside Docker, set `VITE_API_BASE_URL` (`frontend/.env.example`) or edit the
  proxy target locally (don't commit that).
- **New npm dependency:** `docker-compose.yml:10` mounts `/app/node_modules` as
  an anonymous volume; rebuild with `docker compose up --build` (or `-V`) or the
  container keeps stale modules.
- **Fetch errors are swallowed.** `frontend/src/App.tsx:35` is
  `.catch(() => ...)`, which shows a generic Spanish message and drops the
  cause. Check the network tab or backend logs; don't assume the message means
  the backend is down.
