# Spec: Alertas de gastos

## Objetivo

Señalar los periodos donde los gastos agregados superan en más del umbral elegido el promedio de gastos de los periodos previos incluidos en el resumen.

## Lenguaje de producto y contrato

- En la UI, nombrar esta función **“Alertas de gastos”** o **“Aumentos de gastos”**. La API llama `outcome` a los gastos; no confundir el nombre contractual con un resultado/neto.
- Los campos `outcome_total` y `baseline_average` son importes agregados de egresos/gastos, no ingresos ni beneficio.
- `increase_ratio` es una **razón proporcional**, no un porcentaje ya multiplicado por 100: `0.5` equivale a `50 %`, y `1.0201` equivale aproximadamente a `102,01 %`.
- `threshold` también se pasa como razón proporcional: el default `0.3` representa un límite del 30 %. La API solo incluye aumentos estrictamente mayores al umbral (no iguales).
- `period` no siempre representa un mes: su formato depende de `group_by` (`YYYY-MM-DD` para día, `YYYY-Www` para semana ISO, `YYYY-MM` para mes).

## Fuente y contrato API

`GET /api/metrics/alerts`

Query params:

| Parámetro | Opcional | Default / valores | Uso en la spec |
|---|---:|---|---|
| `threshold` | Sí | `0.3`; número >= 0 | Umbral proporcional de incremento de gastos. |
| `group_by` | Sí | `month`; `day`, `week` o `month` | Agrupación temporal que define cada periodo y comparación. |
| `start_date` | Sí | Fecha ISO `YYYY-MM-DD` | Inicio inclusivo de los movimientos considerados. |
| `end_date` | Sí | Fecha ISO `YYYY-MM-DD` | Fin inclusivo de los movimientos considerados. |
| `business_type` | Sí | `B2B` o `B2C` | Filtro opcional de segmento. |

Respuesta: array de objetos con `period`, `outcome_total`, `baseline_average` e `increase_ratio`.

El baseline se obtiene del promedio acumulado de los gastos en los periodos anteriores del resumen filtrado. El primer periodo no puede generar alerta al no tener periodos previos; se omite la alerta si el baseline no es positivo. Los periodos se procesan en orden cronológico.

## Reglas de presentación

- Rotular claramente el periodo usando la agrupación elegida; no añadir nombres de mes a periodos semanales/diarios.
- Formatear `outcome_total` y `baseline_average` como importes monetarios.
- Convertir `increase_ratio` a porcentaje de presentación multiplicando por 100 una sola vez; por ejemplo `0.3864` se muestra como aproximadamente `38,64 %`.
- Informar el umbral seleccionado con la misma convención de porcentaje, si se muestra.
- Un array vacío significa que ningún periodo del rango cumple los criterios para una alerta; no equivale a error.

## Criterios de aceptación

1. El consumo respeta los defaults y dominios: `threshold >= 0`, agrupación `day|week|month`, y segmento `B2B|B2C`.
2. Los importes de gasto mostrados se obtienen de `outcome_total` y `baseline_average`.
3. `increase_ratio` y `threshold` se interpretan como proporciones; la conversión a porcentaje visual ocurre una sola vez.
4. La UI soporta periodos diarios, semanales y mensuales sin asumir que `period` siempre es un mes.
5. El estado vacío explica que no hay alertas para los filtros actuales, sin fabricar una alerta ni convertirlo en error de red.

## Fuera de alcance

Modificar el algoritmo de baseline, la condición estricta de umbral, el modelo de respuesta o la implementación del backend.
