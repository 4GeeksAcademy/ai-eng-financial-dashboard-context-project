# Verificación del proyecto

- **Confirmado por inspección estática:** React/Vite sirve el dashboard en `5173`; `App.tsx` solicita `GET /api/metrics` y calcula KPI/agregados mensuales en el frontend.
- **Confirmado por inspección estática:** FastAPI se expone en `8000`; Vite reenvía `/api` a `backend:8000`; Compose también publica `debugpy` en `5678`.
- **Confirmado por inspección estática:** el README documenta `docker compose up --build`; el backend genera datos simulados en memoria, sin persistencia configurada.
- **Límite de verificación:** no se ejecutaron los tests ni `docker compose up`; el funcionamiento en runtime queda sin verificar.
