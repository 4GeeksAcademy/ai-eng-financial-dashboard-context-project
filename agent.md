# Guía del agente

## Proyecto
Dashboard financiero con frontend React y API FastAPI. El backend genera movimientos de ejemplo; el frontend calcula y presenta KPI y gráficos.

## Stack y estructura
- **Frontend:** React, TypeScript, Vite, Vitest y Recharts. Código en `frontend/src`; componentes en `components/dashboard`; tipos y cálculos en `lib`.
- **Backend:** FastAPI y pytest. Aplicación en `backend/app`; pruebas en `backend/tests`.
- **Integración:** Docker Compose coordina ambos servicios.

## Comandos a seguir
- Iniciar: `docker compose up --build`.
- Backend: `docker compose exec backend pytest`.
- Frontend: `docker compose exec frontend npm test`.
- Validar frontend: `docker compose exec frontend npm run build` y `docker compose exec frontend npm run lint`.

El README documenta el inicio; los scripts frontend están en `frontend/package.json` y pytest en `backend/requirements.txt`.

## Convenciones
- Mantener sincronizados los modelos de respuesta del backend y los tipos TypeScript.
- Mantener cálculos en `frontend/src/lib/financial-utils.ts`; los componentes reciben datos y los presentan.
- Reutilizar los helpers de filtrado y orden de `backend/app/routes.py`.
- Actualizar pruebas de rutas o cálculos junto con cambios de comportamiento.

## Reglas de dominio
- El backend genera 360 movimientos de ejemplo: 30 por mes durante 12 meses, con semilla `42` y fechas relativas a la fecha actual.
- El frontend calcula beneficio como ingresos menos egresos y margen como beneficio dividido por ingresos; con ingresos cero, el margen es cero.
- El título actual fija `2024 - Full Year`; no asumir que coincide con las fechas generadas.

## Formas de trabajar
- Antes de cambiar una ruta, revisar su modelo de respuesta, filtros y pruebas.
- Antes de cambiar cálculos, revisar las pruebas existentes y verificar las reglas de negocio disponibles.
- Si un cambio afecta ambas capas, actualizar frontend y backend en el mismo cambio.

## Límites
- No describir los movimientos generados como datos persistidos.
- No afirmar que las fórmulas son requisitos de negocio sin una especificación que lo confirme.
- El proxy `backend:8000` corresponde a la configuración de Compose; fuera de Compose no se garantiza que el nombre resuelva.

## Verificaciones
- API: consultar `/health` y `/api/metrics`; `/docs` ofrece la documentación interactiva.
- Ejecutar pruebas backend con `pytest` y frontend con `npm test`.
- Comprobar build y lint del frontend con `npm run build` y `npm run lint`.
- No declarar una verificación como exitosa sin ejecutar el comando correspondiente.

Referencias: `README.es.md`, `docker-compose.yml`, `frontend/package.json`, `frontend/vite.config.ts`, `frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-types.ts`, `backend/app/routes.py`, `backend/tests/test_routes.py`.
