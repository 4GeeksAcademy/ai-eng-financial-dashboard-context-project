# Funcionalidad 2 - Tabla de alertas de anomalías en el dashboard principal

Bajo los gráficos existentes, añadir una tabla que destaque los períodos en los que el gasto subió de forma inesperada.

## Requisitos de producto

- Mostrar una tabla con cuatro columnas:
  - Período.
  - Gasto registrado.
  - Media móvil de los tres períodos anteriores.
  - Incremento porcentual.
- Permitir que el usuario configure el umbral de alerta mediante un input numérico.
- Aceptar un ratio entre `0.01` y `1.0`.
- Usar `0.3` como valor predeterminado.
- Mostrar un mensaje explícito de estado vacío, no ocultar la tabla, cuando no se detecten anomalías para el umbral actual.
- Respetar el rango de fechas activo establecido en la Funcionalidad 1.

## Contrato verificado en `/docs`

### `GET /api/metrics/alerts`

Parámetros query:

| Parámetro | Tipo OpenAPI | Obligatorio | Predeterminado | Restricciones documentadas |
|---|---|---|---|---|
| `threshold` | `number` | No | `0.3` | Mínimo `0`; no se documenta máximo |
| `group_by` | `string` | No | `month` | `day`, `week`, `month` |
| `start_date` | `string`, formato `date`, o `null` | No | — | — |
| `end_date` | `string`, formato `date`, o `null` | No | — | — |
| `business_type` | `string` o `null` | No | — | `B2B`, `B2C` |

Ejemplo de ruta:

```text
GET /api/metrics/alerts?threshold=0.3&group_by=month
```

Respuesta `200`: array de `MetricsAlert`.

Campos obligatorios de cada elemento:

| Campo | Tipo OpenAPI |
|---|---|
| `period` | `string` |
| `outcome_total` | `number` |
| `baseline_average` | `number` |
| `increase_ratio` | `number` |

Correspondencia de columnas con el contrato:

| Wording del PM | Campo real | Resolución en la spec |
|---|---|---|
| Período | `period` | Mostrar como etiqueta del período agrupado; `/docs` solo garantiza `string`. |
| `outcome` registrado | `outcome_total` | Mostrar el gasto total del período; no existe un campo `outcome` en `MetricsAlert`. |
| Media móvil de los tres períodos anteriores | `baseline_average` | **No son equivalentes todavía**: el campo solo nombra una media de referencia. La definición de tres períodos debe cumplirse antes de presentar esta columna como tal. |
| Incremento porcentual | `increase_ratio` | El campo es un ratio; presentar el incremento en porcentaje (`ratio * 100`) sin cambiar el valor recibido. |
| Umbral configurable entre `0.01` y `1.0` | Query `threshold`, mínimo API `0`, predeterminado `0.3` | Restringir el input de producto a `0.01`–`1.0`; enviar el ratio directamente, sin multiplicarlo por `100`. |

Respuesta `422`: `HTTPValidationError` cuando un parámetro no cumple el contrato.

## Desajuste que requiere ajustar el contrato antes de cumplir el requisito

El requisito del PM es una **media móvil de los tres períodos anteriores**, mientras que la implementación actual de `/api/metrics/alerts` usa el promedio de **todos** los períodos anteriores disponibles y compara el gasto actual con esa referencia. Por tanto, ni renombrar `baseline_average` en la tabla ni formatearlo de otro modo satisface el requisito.

La especificación exige que el cálculo de las alertas y `baseline_average` utilicen los tres períodos anteriores de la agrupación seleccionada; un período sin tres anteriores no reúne la referencia solicitada y no debe mostrarse como anomalía calculada con tres. La API actual necesita adaptar ese cálculo antes de considerar terminada esta funcionalidad. No se modifica la implementación aquí.

## Casos límite confirmados o no documentados

- Confirmado: `threshold=0` es válido según el mínimo de `/docs`.
- Confirmado: `/docs` no define un máximo para `threshold`.
- Requisito de UI, no restricción del endpoint: limitar el input al intervalo `0.01`–`1.0`.
- Confirmado por la forma de respuesta: el endpoint devuelve un array, que puede representarse como estado vacío cuando no contiene elementos.
- Confirmado: `start_date` y `end_date` permiten aplicar el rango activo.
- No documentado: `/docs` no define el formato interno de `period`; depende de `group_by`.
- No documentado en `/docs`: el cálculo de `baseline_average` y `increase_ratio`; la implementación actual promedia todos los períodos anteriores, no solo tres.

## Contraste con el frontend existente

- La única función de acceso a datos es `fetchFinancialData` en `App.tsx`. Usa `API_BASE_URL`, comprueba `response.ok`, incluye el estado HTTP en el error y tipa el resultado como una promesa. La futura carga de alertas debe conservar esas garantías.
- `financial-types.ts` no define todavía `MetricsAlert`; solo contiene los tipos de movimientos, KPI y series mensuales. La forma documentada por `/docs` necesita un tipo frontend nuevo con `period`, `outcome_total`, `baseline_average` e `increase_ratio`.
- La carga actual ocurre una vez al montar `App`. Actualizar alertas al cambiar `threshold`, `start_date`, `end_date` o `business_type` requiere un ciclo reactivo nuevo; no hay un patrón de debounce o cancelación en el repositorio.
- El frontend dispone de `formatCurrency(number)`, que puede presentar `outcome_total` y `baseline_average` con el formato monetario actual.
- `formatPercent(number)` espera un porcentaje, mientras que la implementación de la API calcula `increase_ratio` como ratio. Para presentarlo como porcentaje debe multiplicarse por `100` antes de formatear; `/docs` por sí solo no describe esta fórmula.
- El estado vacío solicitado es distinto del error global actual. Una respuesta `200` con un array vacío no debe tratarse como fallo de red.
- Los componentes actuales muestran esqueletos mediante una prop `loading`, pero no existe todavía un patrón de tabla cargando, vacía o con error.
- No existen reintentos ni recuperación automática después de un fallo de la API.
