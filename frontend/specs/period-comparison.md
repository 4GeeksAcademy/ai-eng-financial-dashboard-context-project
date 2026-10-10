# Spec: Comparación de periodos

## Objetivo

Comparar el resultado neto de un rango de fechas con el resultado neto del rango inmediatamente anterior de igual duración.

## Lenguaje de producto y contrato

- La UI puede presentar `current_period` como **“Neto del periodo seleccionado”** y `previous_period` como **“Neto del periodo anterior”**.
- No etiquetar `current_period` como ingresos o ventas: la API calcula **neto** (ingresos menos gastos), redondeado a dos decimales.
- No presentar `delta_abs` como “variación porcentual”: es una diferencia absoluta en unidades monetarias.
- No confundir `delta_pct` con una razón decimal de UI: la API la retorna ya expresada en puntos porcentuales, por ejemplo `134.16` significa `134,16 %`.

## Fuente y contrato API

`GET /api/metrics/comparison`

Query params:

| Parámetro | Opcional | Default / valores | Uso en la spec |
|---|---:|---|---|
| `start_date` | **No** | Requerido, fecha ISO `YYYY-MM-DD` | Inicio inclusivo del periodo actual. |
| `end_date` | **No** | Requerido, fecha ISO `YYYY-MM-DD` | Fin inclusivo del periodo actual. |
| `business_type` | Sí | `B2B` o `B2C` | Compara solo el segmento seleccionado, si se proporciona. |

Respuesta: objeto con `current_period`, `previous_period`, `delta_abs` y `delta_pct`.

- `current_period`: neto del rango solicitado.
- `previous_period`: neto del rango de igual duración inmediatamente anterior; su último día es el día anterior a `start_date`.
- `delta_abs`: `current_period - previous_period`, importe monetario.
- `delta_pct`: variación porcentual calculada como `delta_abs / abs(previous_period) * 100`; es `null` si `previous_period` es cero.

## Reglas de presentación

- Ambos rangos y el segmento, cuando exista, deben identificarse claramente.
- Mostrar `delta_abs` con formato monetario y signo; mostrar `delta_pct` con `%` solo cuando no sea `null`.
- Cuando `delta_pct` sea `null`, indicar que no se puede calcular la variación porcentual por ausencia de base anterior igual a cero; no convertir `null` en `0 %`.
- Un neto puede ser negativo. No etiquetar un neto negativo como gasto total: conserva el concepto de resultado neto.

## Criterios de aceptación

1. La solicitud siempre incluye `start_date` y `end_date` válidos.
2. La visualización distingue neto actual, neto anterior, diferencia absoluta y variación porcentual.
3. La comparación de periodos no atribuye a la API una comparación de ingresos brutos o gastos brutos.
4. Si `delta_pct` es `null`, el cliente muestra un estado no disponible y no un porcentaje numérico.
5. Los valores se presentan tal como los campos significan, sin volver a calcular o cambiar el signo de las diferencias.

## Fuera de alcance

Cambiar la semántica del endpoint, definir reglas nuevas para rangos invertidos o fechas futuras, renombrar los campos de respuesta.
