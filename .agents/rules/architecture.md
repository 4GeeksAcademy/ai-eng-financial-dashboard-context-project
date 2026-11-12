# Arquitectura y flujo de datos

## Propósito
Evitar cambios basados en consumidores o responsabilidades supuestos.

## Ámbito
Cambios que conecten la pantalla, cálculos financieros y rutas del backend.

## Evidencia del repositorio
- `frontend/src/App.tsx` solicita `GET /api/metrics` y compone la pantalla.
- `frontend/src/lib/financial-utils.ts` calcula KPI y agregados mensuales.
- `backend/app/routes.py` implementa la generación de movimientos, transformaciones y endpoints.
- El backend también declara facetas, resúmenes, comparación, alertas y rutas B2B/B2C; la pantalla actual no las solicita.

## Instrucciones para el agente
- Antes de cambiar un endpoint o cálculo, identifica su consumidor y sigue la llamada desde `App.tsx` hasta `routes.py`.
- Mantén la composición visual en componentes, los cálculos compartidos en `financial-utils.ts` y las operaciones/endpoints backend en `routes.py`, salvo que el cambio requiera explícitamente otro diseño.
- No supongas que un endpoint implementado ya está conectado a la UI.

## Comprobaciones antes de finalizar
- Confirma en código qué pantalla o función consume la ruta modificada.
- Comprueba que la forma de respuesta y los cálculos que consume siguen siendo compatibles.
- Ejecuta la prueba específica del comportamiento afectado si existe e informa el resultado real.