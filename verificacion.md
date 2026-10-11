# Verificacion de afirmaciones

| Afirmacion original | Archivos revisados | Resultado | Correccion si necesaria |
|---|---|---|---|
| El frontend solicita `/api/metrics` y Vite redirige esa ruta al backend. | `frontend/src/App.tsx`, `frontend/vite.config.ts`, `docker-compose.yml` | Confirmado | — |
| La estructura y los valores de los movimientos coinciden entre API y frontend. | `backend/app/routes.py`, `frontend/src/lib/financial-types.ts` | Confirmado | — |
| Los calculos de KPIs y agregados mensuales estan cubiertos, incluidos casos limite. | `frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts` | Parcial | Las pruebas cubren sumas basicas, margen sin ingresos y agregacion entre anos, no todos los casos limite. |
| La etiqueta fija “2024 - Full Year” no corresponde al periodo que genera el backend, que depende de la fecha actual. | `frontend/src/components/dashboard/dashboard-header.tsx`, `frontend/src/App.tsx`, `backend/app/routes.py` | Confirmado | La etiqueta es fija; las fechas del backend se generan a partir de `date.today()`. |
| En el frontend inspeccionado, la app solo solicita `/api/metrics`; el backend tambien define endpoints de resumen, filtros, comparacion y alertas. | `frontend/src/App.tsx`, `backend/app/routes.py` | Confirmado | — |