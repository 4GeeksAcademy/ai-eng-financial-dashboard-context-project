# Security rules

- `backend/app/main.py:9-10` sets `allow_origins=["*"]` with
  `allow_credentials=True`. Acceptable for local mock data only; restrict
  origins before any non-local deployment.
- `docker-compose.yml:20` publishes the debugpy port `"5678:5678"` to the host.
  Don't keep that for shared or deployed environments.
- `.gitignore` ignores `.env` and `.env.*` except `!.env.example`
  (`frontend/.env.example` is the tracked template). Never commit real values.
