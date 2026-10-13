# Plan técnico: filtro por fechas

Este plan concreta los requisitos y criterios de aceptación de [spec.md](spec.md), sin ampliar su alcance.

## Cambios

- **Backend:** no requiere cambios para filtrar ni mostrar el rango global: `GET /api/metrics` ya acepta `start_date` y `end_date`, y `GET /api/metrics/facets` devuelve `min_date` y `max_date`. La API no valida rangos invertidos; la interfaz debe detectarlos antes de consultar.
- **Frontend:** añadir los campos de fecha en la parte superior y mostrar el rango disponible (`min_date`/`max_date`) consultando `/api/metrics/facets`. Enviar a `/api/metrics` los parámetros no vacíos `start_date` y `end_date` en formato `YYYY-MM-DD`; omitir ambos cuando estén vacíos para mostrar todos los datos. Reutilizar los movimientos recibidos para actualizar todos los KPI y gráficos con las utilidades actuales. Informar de rango invertido, período sin datos y error de API sin bloquear la interfaz; evitar que el período fijo del encabezado contradiga la selección.

## Archivos afectados

- `frontend/src/App.tsx`: estados, solicitudes, validación y presentación de estados.
- `frontend/src/components/dashboard/dashboard-header.tsx`: controles/rango visible y período mostrado.
- `frontend/src/lib/financial-types.ts`: tipo para la respuesta de facetas.
- `frontend/src/lib/financial-utils.test.ts`: solo si se modifican cálculos; no se prevé cambiar las fórmulas.
- `backend/app/routes.py` y `backend/tests/test_routes.py`: no se prevén cambios, salvo que se decida exigir también validación del rango desde la API.

## Orden recomendado

1. Añadir el estado del filtro y obtener las facetas.
2. Añadir los controles en la parte superior y mostrar el rango global.
3. Enviar fechas opcionales, validar el orden y actualizar los datos y estados del dashboard.

## Verificación básica

- Arrancar el proyecto y comprobar que `/api/metrics/facets` devuelve `min_date` y `max_date`, y que `/api/metrics` filtra con `start_date` y/o `end_date`.
- Probar en la interfaz ambas fechas, cada fecha por separado, campos vacíos, rango invertido, período sin resultados y error de API; confirmar que KPI y gráficos corresponden a los movimientos filtrados.
- Ejecutar las verificaciones existentes del frontend (`npm test` y `npm run build`) y del backend (`pytest -q`) si se modifica su contrato.
