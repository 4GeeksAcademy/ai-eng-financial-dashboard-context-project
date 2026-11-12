---
name: security-local-vs-deployed
scope: backend/app/main.py, docker-compose.yml, .gitignore
applies_when: deploying, sharing the environment, or touching CORS, ports, env files
related: [dev-environment]
---

# Security rules

### SEC-1: Lock CORS before any non-local use
- **When:** the backend will be reachable by anyone but you.
- **Do:** in `backend/app/main.py:9-10` replace `allow_origins=["*"]` with an explicit list
  (for example `["http://localhost:5173"]`), and keep `allow_credentials=True` only if cookies are needed.
- **Check:** `curl -s -D- -H "Origin: http://evil.example" http://localhost:8000/health | grep -i access-control`
  prints no `access-control-allow-origin: http://evil.example`.
- **Why:** with the current config that request got the origin echoed back plus `allow-credentials: true`.

### SEC-2: Don't publish the debugger port when sharing
- **When:** you deploy or share the Compose file beyond your machine.
- **Do:** remove `"5678:5678"` (`docker-compose.yml:20`) and in `backend/Dockerfile` the `EXPOSE 8000 5678` port and the debugpy launch in `CMD` (line 10, 12).
- **Check:** `grep -n 5678 docker-compose.yml backend/Dockerfile` returns nothing.
- **Why:** the port is published to the host by default. Not exercised here (no Docker).

### SEC-3: Only `.env.example` may be tracked
- **When:** you add or edit env files.
- **Do:** put real values only in untracked `frontend/.env`; keep `frontend/.env.example` free of secrets.
- **Check:** `git check-ignore frontend/.env` exits 0, and `git ls-files | grep "\.env"` lists only
  `frontend/.env.example`.
- **Why:** `.gitignore:11` ignores `.env`; `.env.example` is not ignored.
