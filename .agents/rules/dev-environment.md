---
name: dev-environment
scope: docker-compose.yml, frontend/vite.config.ts, frontend/.env.example, frontend/src/App.tsx
applies_when: running, debugging, or adding dependencies
related: [testing-workflow, security-local-vs-deployed]
---

# Developer-experience rules

### DEV-1: Start the stack with Compose
- **When:** you need the app running.
- **Do:** `docker compose up --build` (not `docker-compose`).
- **Check:** `curl http://localhost:8000/health` returns `{"status":"ok"}`, http://localhost:5173 loads,
  and API docs open at http://localhost:8000/docs.
- **Why:** README "How to run locally"; ports come from `docker-compose.yml` (5173, 8000, 5678).
  Not run on this machine (Docker is not installed).

### DEV-2: Running the frontend without Docker needs a backend URL
- **When:** you run `npm run dev` on the host.
- **Do:** start the backend on 8000, then either set `VITE_API_BASE_URL=http://localhost:8000` in an
  untracked `frontend/.env`, or locally change the proxy target at `frontend/vite.config.ts:13`
  to `http://localhost:8000` and do not commit that change.
- **Check:** `curl -i http://localhost:5173/api/metrics` returns 200, not 502.
- **Why:** with the default target the proxy returned 502 and Vite logged `getaddrinfo ENOTFOUND backend`.
  With `VITE_API_BASE_URL` set, the browser calls that origin directly, so CORS applies.

### DEV-3: After adding an npm package, rebuild the image
- **When:** you change `frontend/package.json`.
- **Do:** `docker compose up --build -V` (renews the anonymous volumes).
- **Check:** `docker compose exec frontend ls node_modules/<package>` succeeds.
- **Why:** `docker-compose.yml:10` mounts `/app/node_modules` as an anonymous volume that survives restarts.
  Not run here.

### DEV-4: Error banner on the dashboard
- **When:** `App.tsx` shows "No se pudo cargar la informacion financiera".
- **Do:** run `curl -i http://localhost:5173/api/metrics`, then `curl http://localhost:8000/health`
  (or open the browser Network tab for `/api/metrics`).
- **Check:** you can name the HTTP status or error before you change any code.
- **Why:** `App.tsx:35` is `.catch(() => ...)`, which discards the cause. If you edit that catch,
  add `console.error(error)` so the cause is visible.
