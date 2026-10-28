# Reglas de arquitectura

## Nombre

Mantener explícitas las responsabilidades del dashboard y coherente el contrato entre frontend y backend.

## Alcance

`frontend/src/App.tsx`, `frontend/src/lib/**`, `frontend/src/components/**`, `frontend/vite.config.ts`, `backend/app/**` y sus pruebas relacionadas.

## Justificación

`App.tsx` consulta `/api/metrics` y gestiona los estados de carga y error. Los cálculos financieros están en `frontend/src/lib/financial-utils.ts`, separados de los componentes. El backend declara modelos Pydantic y valores `Literal` en `backend/app/routes.py`; las formas de movimientos también están tipadas en `frontend/src/lib/financial-types.ts`. Vite reenvía `/api` al servicio backend. Además, la etiqueta de período se fija actualmente en `2024 - Full Year`, aunque las fechas generadas por el backend dependen del año actual.

## Instrucciones para agentes

- Mantén las fórmulas y agregaciones financieras en `financial-utils.ts`; los componentes deben presentar los datos, no duplicar esos cálculos.
- Al modificar una petición en `App.tsx`, conserva y revisa los estados de carga y error.
- Si cambia una ruta, parámetro, valor permitido o campo de respuesta, actualiza en conjunto el modelo/contrato del backend, los tipos y consumidores del frontend y las pruebas afectadas.
- Si cambia el prefijo o destino de una ruta de API, coordina el cliente, `vite.config.ts` y la ruta FastAPI correspondiente.
- No muestres un período fijo que pueda contradecir las fechas recibidas; deriva la etiqueta del período de los datos disponibles.

## Comprobación

- Revisa que los cálculos sigan en `financial-utils.ts` y que la carga/error de la petición sigan representados en `App.tsx`.
- Para cambios de contrato, compara modelos y rutas en `backend/app/routes.py` con `frontend/src/lib/financial-types.ts`, el consumidor y sus pruebas; ejecuta las pruebas frontend y backend descritas en `testing.md`.
- Comprueba con fechas de respuesta que el período mostrado corresponde al conjunto de datos.