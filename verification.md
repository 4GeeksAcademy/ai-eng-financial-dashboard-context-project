# Verificación del proyecto

## Mapeo del proyecto

| Análisis | Elemento 1 | Elemento 2 |
| --- | --- | --- |
| Estructura | `frontend/src/components/dashboard/` muestra el panel y sus gráficos. | `backend/app/routes.py` define la API y sus datos de ejemplo. |
| Servicios | Frontend Vite: `5173`. | Backend FastAPI: `8000`. |
| Puntos de entrada | `frontend/index.html` carga `src/main.tsx`, que muestra `src/App.tsx`. | `backend/Dockerfile` inicia `app.main:app`; `backend/app/main.py` registra las rutas. |
| Comunicación | `frontend/src/App.tsx` solicita `/api/metrics`. | `frontend/vite.config.ts` reenvía `/api` a `backend:8000`. |


