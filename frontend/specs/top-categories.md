# Spec: Categorías principales

## Objetivo

Mostrar las categorías con mayor importe para que una persona usuaria pueda identificar los principales componentes de ingresos o gastos del periodo seleccionado.

## Lenguaje de producto y contrato

- En la interfaz, usar **“Principales gastos por categoría”** cuando `operation_type=outcome`, y **“Principales ingresos por categoría”** cuando `operation_type=income`.
- No llamar “gastos” a todas las respuestas: el endpoint también admite ingresos.
- `outcome` es el término contractual de la API para egresos/gastos; `income` corresponde a ingresos.
- La API no retorna una propiedad `total` ni `amount` para el agregado: el campo contractual es `total_amount`. La UI puede darle un formato/etiqueta legible, pero su origen es `total_amount`.

## Fuente y contrato API

`GET /api/metrics/categories/top`

Query params:

| Parámetro | Opcional | Default / valores | Uso en la spec |
|---|---:|---|---|
| `operation_type` | Sí | `outcome`; `income` o `outcome` | Selecciona gastos o ingresos. El modo de gastos usa `outcome`. |
| `limit` | Sí | `5`; entero de 1 a 20 | Máximo de categorías solicitadas. |
| `start_date` | Sí | Fecha ISO `YYYY-MM-DD` | Inicio inclusivo del rango. |
| `end_date` | Sí | Fecha ISO `YYYY-MM-DD` | Fin inclusivo del rango. |
| `business_type` | Sí | `B2B` o `B2C` | Filtro opcional de segmento. |

Respuesta: array ordenado de mayor a menor por `total_amount`; cada item contiene `category`, `operation_type` y `total_amount`. La respuesta puede tener menos items que `limit` si existen menos categorías con movimientos; un array vacío significa que no hay resultados para esos filtros.

## Reglas de presentación

- Mostrar el nombre/etiqueta de `category` y formatear `total_amount` como importe monetario.
- Mantener explícita la selección de tipo de operación en el título o contexto de la visualización.
- Las categorías y valores se presentan en el orden recibido; no invertir el orden.
- Mantener las fechas y el segmento aplicados coherentes con los demás filtros del dashboard.

## Criterios de aceptación

1. En modo de gastos, se solicita `operation_type=outcome` y se titula el resultado como gastos, no como ingresos.
2. En modo de ingresos, se solicita `operation_type=income` y el título cambia a ingresos.
3. Cada valor mostrado proviene de `total_amount`; cada etiqueta de categoría proviene de `category`.
4. El estado sin resultados se representa cuando el endpoint retorna `[]`, sin inventar valores ni categorías.
5. Los filtros de fecha y `business_type`, si están activos en la experiencia, se envían con los nombres y formatos de la API.

## Fuera de alcance

Cambiar el contrato del backend o renombrar campos; calcular agregados desde los movimientos en el cliente; presentar estas sumas como beneficio/neto.
