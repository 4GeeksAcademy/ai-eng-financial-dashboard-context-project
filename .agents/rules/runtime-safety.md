# Runtime Safety

- Preserve the `/api` Vite proxy for local development unless the backend topology is intentionally changing.
- Do not widen CORS or enable permissive origins for production-facing changes; configure allowed origins for the deployment environment.
- Verify that referenced environment example files exist before documenting them or relying on them.

Repo anchors: `frontend/vite.config.ts` proxies `/api` to `backend:8000`; `backend/app/main.py` allows all CORS origins and credentials; `README.es.md` references the existing `frontend/.env.example` when describing `VITE_API_BASE_URL`.