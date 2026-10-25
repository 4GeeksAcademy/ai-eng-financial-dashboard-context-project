# Patrones del sistema

## Estructura

El frontend arranca en `frontend/index.html` y `frontend/src/main.tsx`, que monta `App` (`frontend/src/App.tsx`). `App` coordina la carga de datos y el estado de la pantalla; utilidades de cálculo están en `frontend/src/lib/financial-utils.ts` y componentes visuales reutilizables del dashboard en `frontend/src/components/dashboard/`.

El backend crea la aplicación FastAPI e incluye el router (`backend/app/main.py`). Las rutas, modelos de respuesta, generación de datos y lógica de filtros/métricas están definidos en `backend/app/routes.py`.

## Flujo principal de datos

1. `App.tsx` solicita `${VITE_API_BASE_URL}/api/metrics`; si la variable está vacía, la ruta queda relativa (`frontend/src/App.tsx`; valor de ejemplo en `frontend/.env.example`).
2. En la configuración Vite, las solicitudes `/api` se proxifican a `http://backend:8000` (`frontend/vite.config.ts`). `backend` coincide con el nombre del servicio definido en Compose (`docker-compose.yml`); este destino corresponde a la red de servicios, no necesariamente a una ejecución local de Vite fuera de Compose.
3. FastAPI sirve el router de `backend/app/routes.py`. `/api/metrics` devuelve movimientos generados por el backend, según el endpoint y el generador allí definidos.
4. El cliente utiliza los movimientos para calcular KPI y datos mensuales (`frontend/src/lib/financial-utils.ts`) y los pasa a los componentes de presentación (`frontend/src/components/dashboard/`).

## Contrato y pruebas existentes

Los campos y literales de los movimientos están representados en `backend/app/routes.py` y `frontend/src/lib/financial-types.ts`. Las pruebas de rutas están en `backend/tests/test_routes.py`; las pruebas de cálculos y formato del cliente en `frontend/src/lib/financial-utils.test.ts`.

`frontend/src/lib/mock-data.ts` contiene datos de muestra, pero no aparece importado por el componente principal `frontend/src/App.tsx`; no es la fuente usada por el flujo de carga observado.