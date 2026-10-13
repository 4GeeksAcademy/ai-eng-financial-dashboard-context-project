# Plan técnico: alertas de anomalías

Este plan sigue los requisitos y criterios de [spec.md](spec.md).

## Cambios

- **Backend:** adaptar el cálculo de alertas para comparar cada período con la media de los tres períodos anteriores. Restringir `threshold` al intervalo `0.01–1.0` (predeterminado `0.3`). El endpoint ya acepta `start_date`/`end_date`, pero hoy filtra antes de calcular la media; deberá conservar contexto previo para calcular la referencia y limitar las alertas devueltas al rango seleccionado. La respuesta ya incluye período, gasto (`outcome_total`), media (`baseline_average`) e incremento como ratio (`increase_ratio`); no requiere cambiar su forma.
- **Frontend:** consultar `GET /api/metrics/alerts` con `threshold` y, cuando estén activos, `start_date` y `end_date`; presentar la tabla bajo los gráficos, convertir el ratio a porcentaje y mostrar estado vacío cuando la lista no contenga alertas. La pantalla todavía no consume este endpoint ni tiene un tipo o componente para esas filas.

## Archivos afectados

- `backend/app/routes.py`: cálculo de media móvil, límite del umbral y filtro por fechas.
- `backend/tests/test_routes.py`: pruebas del promedio de tres períodos, límites, rango de fechas y respuesta del endpoint.
- `frontend/src/App.tsx`: estado/consulta de alertas y fechas, ubicación debajo de los gráficos.
- `frontend/src/lib/financial-types.ts`: tipo de respuesta de alerta.
- Nuevo componente en `frontend/src/components/dashboard/` para la tabla y el estado vacío.

## Orden recomendado

1. Ajustar el contrato y cálculo del endpoint, manteniendo la forma actual de respuesta.
2. Añadir y verificar el tipo de alerta en el frontend.
3. Conectar umbral y fechas desde `App.tsx`; mostrar tabla y estado vacío bajo los gráficos.

## Verificación básica

- Ejecutar `pytest -q` y comprobar media de tres períodos, umbral predeterminado y límites `0.01` y `1.0`, así como el respeto del rango de fechas.
- Ejecutar `npm test` y `npm run build`; comprobar en la interfaz el umbral, las fechas activas, la presentación del porcentaje y el estado vacío.
