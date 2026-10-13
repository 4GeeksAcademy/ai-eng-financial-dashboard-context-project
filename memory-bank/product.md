# Resumen del producto

## Descripción

Dashboard financiero que calcula y presenta ingresos, gastos, beneficio y margen de beneficio, además de gráficos mensuales de ingresos frente a gastos y de margen. En la implementación actual, la interfaz obtiene movimientos de una API y calcula los indicadores en el front-end.

**Los datos que entrega actualmente el backend son de ejemplo, generados en cada solicitud; no son registros financieros reales ni persistidos.**

## Hechos comprobables

- La pantalla muestra cuatro KPI: ingresos totales, gastos totales, beneficio (ingresos menos gastos) y margen (beneficio dividido entre ingresos).
- Los gráficos muestran la evolución mensual de ingresos y gastos, y el margen de beneficio mensual. Los importes se presentan en dólares estadounidenses.
- Cada movimiento tiene fecha, importe, tipo de operación (`income`/`outcome`), categoría y tipo de negocio (`B2B`/`B2C`).
- El endpoint principal genera 360 movimientos de ejemplo con semilla `42`, 30 por mes. Los años se determinan a partir de la fecha actual, por lo que no se debe asumir que los datos correspondan a un año natural concreto.
- El backend también define endpoints para facetas, resúmenes por período, principales categorías, comparaciones, alertas y movimientos B2B/B2C. La pantalla actual no consulta ni presenta esas capacidades.
- Las pruebas existentes cubren cálculos financieros en el front-end y comportamientos de las rutas del backend. No hay pruebas front-end del flujo de integración de la pantalla con la API.

## Límites de lo que puede afirmarse

- No afirmar que el producto recibe, guarda o analiza transacciones financieras reales; el código revisado solo demuestra generación de datos simulados.
- No presentar filtros, comparaciones, alertas o desgloses B2B/B2C como funciones disponibles en la interfaz actual; existen endpoints relacionados en el backend, pero la pantalla no los usa.
- El encabezado muestra `2024 - Full Year`, pero ese rótulo fijo no demuestra que el conjunto de datos pertenezca a 2024 ni cubra un año completo.
- La interfaz incluye el texto `Executive metrics dashboard`, pero el código no permite confirmar que el producto esté destinado exclusivamente a ejecutivos ni identificar otros usuarios objetivo.