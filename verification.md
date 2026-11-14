# Verificación del proyecto

- **Confirmado por inspección estática:** React/Vite sirve el dashboard en `5173`; `App.tsx` solicita `GET /api/metrics` y calcula KPI/agregados mensuales en el frontend.
- **Confirmado por inspección estática:** FastAPI se expone en `8000`; Vite reenvía `/api` a `backend:8000`; Compose también publica `debugpy` en `5678`.
- **Confirmado por inspección estática:** el README documenta `docker compose up --build`; el backend genera datos simulados en memoria, sin persistencia configurada.
- **Límite de verificación:** no se ejecutaron los tests ni `docker compose up`; el funcionamiento en runtime queda sin verificar.

## Specs del frontend (2026-11-14)

- Se contrastaron las tres specs de [frontend/specs/](frontend/specs/) con el OpenAPI servido por `GET /openapi.json` (el contrato de `/docs`): rutas, parámetros query, valores permitidos y campos de respuesta. También se revisó el patrón de carga de `frontend/src/App.tsx`.
- Se probaron respuestas reales de `/api/metrics/summary`, `/api/metrics/categories/top` y `/api/metrics/alerts`: el resumen aporta el total de ingresos por segmento y `increase_ratio` representa una proporción. En el rango probado, `limit=5` devolvió dos categorías de ingresos por segmento.
- Los desajustes de nombres y el cálculo de porcentajes quedaron especificados, **no implementados**. Siguen pendientes la media móvil de exactamente tres períodos para alertas (el backend actual promedia todos los anteriores) y las facetas por segmento (el endpoint actual solo ofrece categorías globales).
- Solo se editaron specs/documentación; no se ejecutaron pruebas de aplicación. `git diff --check -- frontend/specs` pasó.
