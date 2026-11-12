# Producto

## Dashboard actual

El proyecto es un dashboard de métricas financieras con datos simulados. La pantalla muestra el intervalo entre la fecha mínima y la máxima recibidas, ingresos, gastos, beneficio y margen, además de gráficos mensuales de ingresos frente a gastos y porcentaje de beneficio. Véanse [`App.tsx`](../frontend/src/App.tsx), [`kpi-row.tsx`](../frontend/src/components/dashboard/kpi-row.tsx) y [`financial-utils.ts`](../frontend/src/lib/financial-utils.ts).

El frontend solicita `GET /api/metrics`, guarda los movimientos y calcula los indicadores y agregados en el navegador. El backend genera movimientos simulados por petición, con fechas dependientes del calendario actual; no se observó persistencia en este flujo. Las rutas y modelos están en [`routes.py`](../backend/app/routes.py).

## Capacidades y límites

- La API implementa filtros para movimientos y rutas de facetas, resúmenes, categorías principales, comparación de períodos, alertas y movimientos B2B/B2C. La pantalla actual no consume estas rutas adicionales ni ofrece esos filtros; implementación no implica validación en ejecución.
- La pantalla muestra carga y un error genérico; con el backend detenido se observó el error y `Period unavailable`. El caso de respuesta vacía no se comprobó visualmente.
- Los datos son simulados, no movimientos financieros reales de una fuente externa. El intervalo observado en una ejecución no es un rango fijo del producto.

Las comprobaciones y sus límites están en [`verification.md`](../verification.md).