# Verificacion y decisiones

## Hechos comprobados en la API

- `GET /api/metrics` devuelve movimientos ordenados por `create_date`; acepta `start_date`, `end_date`, `category` y `operation_type`.
- Los limites de fecha son inclusivos. Los filtros de categoria y tipo de operacion se combinan.
- `GET /api/metrics/b2b` y `/api/metrics/b2c` devuelven subconjuntos por tipo de negocio y aceptan los mismos filtros que `/api/metrics`.
- `GET /api/metrics/facets` devuelve los valores disponibles y las fechas minima y maxima del conjunto de datos.
- `GET /api/metrics/summary` agrupa por `day`, `week` o `month` (por defecto `month`), y devuelve ingresos, egresos y neto por periodo.
- `GET /api/metrics/categories/top` ordena las categorias por importe descendente; `limit` tiene valor por defecto 5 y rango de 1 a 20.
- `GET /api/metrics/comparison` requiere ambas fechas y compara el neto del periodo actual con un periodo anterior de igual duracion. `delta_pct` es `null` si el neto anterior es cero; en otro caso se expresa como porcentaje (por ejemplo, `12.5` significa 12.5%).
- `GET /api/metrics/alerts` detecta aumentos de egresos frente al promedio de periodos anteriores. `threshold` es una proporcion (por defecto `0.3`), y `increase_ratio` tambien es una proporcion.
- Las fechas son ISO `YYYY-MM-DD`. Los datos son simulados y se regeneran con la semilla 42.
- El endpoint `/health` devuelve `{ "status": "ok" }`.
- La pantalla actual solicita solo `/api/metrics`, calcula los KPI y los datos mensuales en el cliente, y muestra el periodo fijo `2024 - Full Year`.

## Decisiones para la interfaz

- Tratar los modelos y parametros de `api-types.ts` y `param-types.ts` como el contrato conocido del backend; no asumir que los endpoints adicionales ya estan integrados en la UI.
- Mantener fechas de calendario como strings ISO al cruzar la frontera HTTP. No convertirlas a instantes con zona horaria sin una necesidad funcional explicita.
- Representar `delta_pct` como `number | null` y los arrays sin resultados como `[]`.
- Mostrar una condicion de error diferenciada de un resultado exitoso sin datos. No convertir fallos de red en listas vacias.
- No inferir una moneda distinta de USD ni cambiar el periodo fijo de la cabecera sin una decision de producto.

## Pendientes de producto

- Confirmar si se esperan filtros interactivos, comparacion, alertas o categorias principales en el dashboard.
- Confirmar el periodo que debe mostrar la cabecera y si la moneda sera siempre USD.
- Definir comportamiento de reintento y formato/localizacion de mensajes de error.
