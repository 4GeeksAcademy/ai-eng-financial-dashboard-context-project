# Skill: Run and Verify the Stack

## When to use

After changing backend or frontend code, before declaring work done, or when asked to "run the app". Verifies the full path from container build to the API call the UI actually makes.

## Prerequisites

- Docker + Docker Compose available (`docker compose version`)
- Ports 5173, 8000, 5678 free (or free the old stack first: `docker compose down`)

## Steps

1. **Start** from the repository root:
   ```bash
   docker compose up --build
   ```
   Wait for both: backend `Application startup complete.` and frontend `VITE v... ready`.

2. **Backend health:**
   ```bash
   curl http://localhost:8000/health        # expect {"status":"ok"}
   ```

3. **Frontend serves:**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/   # expect 200
   ```

4. **Proxy path (what the UI uses):**
   ```bash
   curl -s http://localhost:5173/api/metrics | python3 -c \
     "import json,sys; d=json.load(sys.stdin); print(len(d), 'movements')"
   # expect 360 movements
   ```
   If the JSON spans years (e.g. 2025-10 .. 2026-09 for an Oct-2026 run), the header badge should read `2025 - 2026` (derived by `computePeriodLabel`, never hard-coded).

5. **Teardown** when done:
   ```bash
   docker compose down
   ```

## Known pitfalls (observed 2026-10-09)

- **502 from `/api` on the Vite proxy** with backend healthy on `:8000` directly → stale backend container IP in the frontend proxy (`ETIMEDOUT <old-ip>:8000` in frontend logs). Fix: restart the frontend container (or the whole stack). Not an application bug.
- **`http://backend:8000` only resolves inside the compose network** — running `npm run dev` on the host requires `VITE_API_BASE_URL` or the proxy target change.
- **debugpy "frozen modules" warnings** in backend logs are benign (dev-only debugger noise).
- **`npm test` on the host needs `node_modules`**: run `npm install` first.
