# Estado del proyecto

## Funciones verificadas

### Interfaz actual

- La pantalla solicita `GET /api/metrics` y muestra estados de carga y error para esa solicitud.
- Calcula y presenta ingresos totales, gastos totales, beneficio (ingresos menos gastos) y margen (beneficio dividido entre ingresos; devuelve `0` si no hay ingresos).
- Agrupa movimientos por año y mes y muestra gráficos mensuales de ingresos frente a gastos y de margen.
- Formatea importes en dólares estadounidenses y porcentajes con un decimal.

Referencias: [frontend/src/App.tsx](../frontend/src/App.tsx), [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts), [frontend/src/components/dashboard/kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx), [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx).

### Back-end

- El endpoint principal genera 360 movimientos de ejemplo con semilla `42` y 30 movimientos por mes; permite filtrar por fecha, categoría y tipo de operación.
- También hay endpoints para estado de salud, facetas, resúmenes por día/semana/mes, categorías principales, comparación de períodos, alertas y movimientos B2B/B2C.
- FastAPI valida los movimientos y respuestas mediante modelos y tipos definidos en las rutas.

Estas rutas existen en el backend, pero salvo `/api/metrics`, no son consultadas por la pantalla actual. Referencias: [backend/app/routes.py](../backend/app/routes.py), [frontend/src/App.tsx](../frontend/src/App.tsx).

## Limitaciones actuales

- Se ha documentado en [AGENTS.md](../AGENTS.md) la comprobación previa de `frontend/.env` y `VITE_API_BASE_URL` cuando se necesita un origen explícito del backend. El proxy de Compose sigue siendo el modo predeterminado sin esa variable. Esta actualización de instrucciones no verifica por sí misma la conectividad del entorno.
- Los datos son simulados en el backend y se generan en cada solicitud; no representan transacciones reales ni persistidas.
- El encabezado de la interfaz está fijado en `2024 - Full Year`, mientras que los años de los movimientos dependen de la fecha actual. El rótulo no garantiza que los datos sean de 2024 ni que correspondan a ese año completo.
- La interfaz no ofrece controles de filtro ni presenta las funciones de resumen, comparación, alertas, categorías principales o segmentación B2B/B2C que sí tienen endpoints en el backend.
- La agrupación mensual convierte `create_date` con `new Date()` y obtiene año y mes locales. Según la zona horaria, una fecha ISO de calendario puede desplazarse al día o mes anterior. Las pruebas existentes no comprueban este caso.
- Las pruebas front-end cubren utilidades financieras, no la integración de `App` con la API. En backend, la prueba llamada “full year” comprueba 360 elementos y orden cronológico, pero no un intervalo anual; la prueba de comparación comprueba campos de respuesta, no los valores calculados.
- La configuración CORS permite cualquier origen, método y cabecera, además de credenciales; es una configuración amplia que debe revisarse para el entorno de despliegue.

Referencias: [frontend/src/App.tsx](../frontend/src/App.tsx), [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts), [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts), [backend/app/routes.py](../backend/app/routes.py), [backend/tests/test_routes.py](../backend/tests/test_routes.py), [backend/app/main.py](../backend/app/main.py).

## Próximos pasos sugeridos

1. Calcular o solicitar el período mostrado para que el encabezado coincida con las fechas que devuelve el backend.
2. Agrupar las fechas de calendario sin depender de la zona horaria local y añadir una prueba para fechas al inicio de mes.
3. Añadir pruebas de integración que recorran la carga de `App` y el proxy hasta el backend, incluidos estados de error.
4. Reforzar las pruebas de backend para comprobar intervalos de fechas y resultados numéricos de comparación y alertas, no solo cantidad, orden o forma de la respuesta.
5. Si se decide exponer las capacidades adicionales del backend en la interfaz, añadir controles y conectarlos respetando los parámetros que acepta cada endpoint.
6. Restringir CORS a los orígenes requeridos antes de desplegar la API en un entorno expuesto.

Estos pasos son recomendaciones derivadas de las limitaciones descritas; no son funciones ya implementadas ni requisitos confirmados del producto.