# Estado del proyecto

Estado basado en la revision estatica del codigo. No se ejecutaron pruebas
funcionales en esa revision. "Funciona" indica implementacion presente y
revisada, no funcionamiento integral comprobado en ejecucion.

## Funciona
- El dashboard consulta `/api/metrics`, calcula cuatro KPIs y presenta dos graficos mensuales, con estados de carga y error. Fuente: [App.tsx](../frontend/src/App.tsx).
- Las utilidades calculan ingresos, gastos, beneficio y margen; sin ingresos, el margen es cero. Fuente: [financial-utils.ts](../frontend/src/lib/financial-utils.ts).
- La API genera 360 movimientos mock durante los doce meses completos anteriores al mes actual. Ofrece filtros, endpoints B2B/B2C, facetas, resumenes, categorias principales, comparaciones y alertas. Fuente: [routes.py](../backend/app/routes.py).
- Existen pruebas de calculos basicos, margen sin ingresos, agrupacion entre anos y endpoints. Su existencia no acredita que hayan pasado. Fuentes: [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts), [test_routes.py](../backend/tests/test_routes.py).

## Limitaciones actuales
- El encabezado fija `2024 - Full Year`, aunque el periodo generado depende de la fecha actual. Fuente: [App.tsx](../frontend/src/App.tsx).
- La agrupacion mensual usa getters locales sobre fechas ISO y puede desplazar el primer dia al mes anterior segun la zona horaria. Fuente: [financial-utils.ts](../frontend/src/lib/financial-utils.ts).
- El grafico de margen muestra ausencia de datos cuando todos los margenes son cero, aunque existan registros. Fuente: [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx).
- El frontend no valida la estructura del JSON recibido y el backend no rechaza rangos de fechas invertidos. Fuentes: [App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py).
- Cada generacion de mocks reinicializa el generador aleatorio global; existe riesgo de interferencia entre peticiones concurrentes. Fuente: [routes.py](../backend/app/routes.py).
- Algunas pruebas verifican solo estructuras o respuestas no vacias: no demuestran resultados numericos de comparacion ni deteccion de alertas. Fuente: [test_routes.py](../backend/tests/test_routes.py).
- La configuracion Docker usa depurador y recarga, y CORS permite todos los origenes con credenciales habilitadas. No se ha acreditado preparacion para produccion. Fuentes: [Dockerfile](../backend/Dockerfile), [docker-compose.yml](../docker-compose.yml), [main.py](../backend/app/main.py).
- Los datos son simulados. La interfaz solo consume movimientos; las capacidades adicionales de la API no son controles disponibles en pantalla. Fuentes: [routes.py](../backend/app/routes.py), [App.tsx](../frontend/src/App.tsx).

## Proximos pasos sugeridos
Son propuestas pendientes, no correcciones implementadas ni funcionalidades comprometidas.

1. Corregir la etiqueta del periodo, la agrupacion de fechas y la visualizacion del margen cero; comprobar sus casos limite. Fuentes: [App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx).
2. Validar el JSON y rechazar fechas invertidas, con pruebas de entradas invalidas. Fuentes: [App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py).
3. Ampliar pruebas con datos controlados y resultados numericos exactos; controlar fecha y aleatoriedad. Fuentes: [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts), [test_routes.py](../backend/tests/test_routes.py).
4. Aislar el generador aleatorio y separar configuraciones de desarrollo y produccion. Fuentes: [routes.py](../backend/app/routes.py), [Dockerfile](../backend/Dockerfile), [main.py](../backend/app/main.py).
5. Como evolucion opcional, incorporar filtros existentes de la API a la interfaz. Fuentes: [routes.py](../backend/app/routes.py), [App.tsx](../frontend/src/App.tsx).
6. Ejecutar las pruebas pertinentes y, para cambios de frontend, lint y build; registrar resultados y pendientes en [verificacion.md](../verificacion.md). Comandos documentados en [AGENTS.md](../AGENTS.md).