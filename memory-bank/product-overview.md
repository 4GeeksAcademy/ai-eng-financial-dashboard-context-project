# Descripción del producto

## Propósito

Dashboard de ejemplo para consultar métricas de movimientos financieros. El backend produce datos simulados; no se observó conexión con cuentas, bancos ni una fuente financiera externa. La descripción concuerda con [README.es.md](../README.es.md) y con el generador de movimientos en [backend/app/routes.py](../backend/app/routes.py).

## Qué presenta

El frontend solicita `/api/metrics` al cargar. A partir de la respuesta calcula ingreso total, egreso total, ganancia y porcentaje de ganancia; también agrupa movimientos por mes. La pantalla presenta esos KPI y dos gráficos: ingresos frente a egresos y porcentaje de ganancia. La implementación está en [frontend/src/App.tsx](../frontend/src/App.tsx), [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts) y los componentes de [frontend/src/components/dashboard](../frontend/src/components/dashboard).

El endpoint principal genera 360 movimientos sintéticos distribuidos entre los doce meses; el año asignado depende de `date.today()`. Usa la semilla `42` y acepta filtros de fecha, categoría y tipo de operación. Los modelos y rutas están en [backend/app/routes.py](../backend/app/routes.py).

## Flujo principal

`frontend/src/main.tsx` monta React y `App`. `App` obtiene el JSON de `/api/metrics`, calcula KPI, periodo y datos mensuales con las funciones de utilidad, y pasa los resultados a tarjetas y gráficos. Vite reenvía `/api` al backend según [frontend/vite.config.ts](../frontend/vite.config.ts) y [docker-compose.yml](../docker-compose.yml).