# Funcionalidad 3 - Vista comparativa B2B vs B2C

Crear una nueva página en el dashboard para comparar el rendimiento de ingresos entre las dos líneas de negocio: B2B y B2C.

## Requisitos de producto

- Mostrar dos secciones en paralelo:
  - B2B.
  - B2C.
- Mostrar en cada sección una tabla con las cinco categorías de ingreso principales de esa línea de negocio.
- Incluir en cada tabla:
  - Nombre de la categoría.
  - Total de ingresos.
  - Porcentaje sobre el total del grupo.
- Añadir bajo ambas secciones un único gráfico que compare visualmente el total de ingresos de B2B frente a B2C.
- Permitir filtrar la comparativa por un rango de fechas en formato `YYYY-MM-DD`.
- Obtener las categorías disponibles para cada grupo desde el endpoint de facetas.

## Contrato verificado en `/docs`

### `GET /api/metrics/categories/top`

Parámetros query:

| Parámetro | Tipo OpenAPI | Obligatorio | Predeterminado | Restricciones documentadas |
|---|---|---|---|---|
| `operation_type` | `string` | No | `outcome` | `income`, `outcome` |
| `limit` | `integer` | No | `5` | Mínimo `1`, máximo `20` |
| `start_date` | `string`, formato `date`, o `null` | No | — | — |
| `end_date` | `string`, formato `date`, o `null` | No | — | — |
| `business_type` | `string` o `null` | No | — | `B2B`, `B2C` |

La vista necesita dos peticiones diferenciadas:

```text
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C
```

Cuando exista un rango activo, ambas peticiones deben añadir `start_date` y `end_date`.

Respuesta `200`: array de `TopCategoryItem`.

Campos obligatorios de cada elemento:

| Campo | Tipo OpenAPI | Valores documentados |
|---|---|---|
| `category` | `string` | `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `operation_type` | `string` | `income`, `outcome` |
| `total_amount` | `number` | — |

Correspondencia de columnas con el contrato:

| Wording del PM | Campo real | Resolución en la spec |
|---|---|---|
| Línea de negocio B2B/B2C | Query `business_type` | Pedir `top` por separado con `business_type=B2B` y `business_type=B2C`. |
| Categoría de ingreso | `category` | Enviar `operation_type=income` (el valor por defecto es `outcome`); mostrar el nombre de `category` para cada resultado. |
| Total de ingresos de la categoría | `total_amount` | Mostrar el importe de cada categoría devuelta. |
| Cinco categorías principales | Query `limit=5` | Mostrar hasta cinco categorías con datos; `limit` no garantiza cinco filas. |
| Porcentaje sobre el total del grupo | No existe en `TopCategoryItem` | Dividir `total_amount` entre el **total de ingresos del segmento en el mismo rango** obtenido de `/api/metrics/summary`; si el total es cero, no calcular porcentaje y mostrar un estado sin datos. |
| Un gráfico de ingresos B2B frente a B2C | No existe en `TopCategoryItem` | Usar los dos totales completos obtenidos del resumen, no la suma truncada del top. |

Respuesta `422`: `HTTPValidationError` cuando un parámetro no cumple el contrato, como `limit=0`, `limit=21` o un valor no admitido.

### `GET /api/metrics/summary` para los totales de cada grupo

Parámetros query publicados:

| Parámetro | Tipo OpenAPI | Obligatorio | Predeterminado | Valores documentados |
|---|---|---|---|---|
| `group_by` | `string` | No | `month` | `day`, `week`, `month` |
| `start_date` | `string`, formato `date`, o `null` | No | — | — |
| `end_date` | `string`, formato `date`, o `null` | No | — | — |
| `category` | `string` o `null` | No | — | `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `operation_type` | `string` o `null` | No | — | `income`, `outcome` |
| `business_type` | `string` o `null` | No | — | `B2B`, `B2C` |

Solicitar el resumen por separado para `business_type=B2B` y `business_type=B2C`, con el mismo `start_date` y `end_date` que las peticiones `top`. No aplicar un filtro `category`: el denominador debe abarcar **todas** las categorías de ingreso del grupo.

Respuesta `200`: array de `MetricsSummaryItem`, con `period` (`string`), `income`, `outcome` y `net` (`number`) obligatorios. Sumar `income` de todos los períodos devueltos para obtener el total de ingresos completo de cada segmento. El mismo total sirve de denominador para la tabla y de valor para el gráfico. Una respuesta vacía da un total de ingresos de cero; no dividir por cero.

Respuesta `422`: `HTTPValidationError` si un parámetro no cumple el contrato.

### `GET /api/metrics/facets`

No documenta parámetros query, por lo que no permite solicitar facetas distintas para B2B y B2C.

Respuesta `200`: objeto `MetricsFacets` con todos estos campos obligatorios:

| Campo | Tipo OpenAPI | Valores documentados |
|---|---|---|
| `operation_types` | array de `string` | `income`, `outcome` |
| `business_types` | array de `string` | `B2B`, `B2C` |
| `categories` | array de `string` | `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `min_date` | `string`, formato `date` | — |
| `max_date` | `string`, formato `date` | — |

## Desajuste sobre categorías disponibles por grupo

El PM pide obtener **las categorías disponibles para cada grupo** desde facetas, pero `/api/metrics/facets` solo publica una lista global `categories` y no admite `business_type`. Esa lista sirve como catálogo global, **no** demuestra qué categorías de ingresos están disponibles en B2B o B2C.

Para cumplir literalmente el requisito, el contrato de facetas debe permitir consultar cada segmento (por ejemplo, mediante `business_type=B2B` y `business_type=B2C`) y devolver las categorías disponibles en ese grupo. La API actual no lo garantiza y esta spec no sustituye silenciosamente las facetas por los resultados `top`; esa dependencia queda pendiente antes de dar la funcionalidad por terminada.

## Casos límite confirmados o no documentados

- Confirmado: debe enviarse `operation_type=income`; si se omite, el valor predeterminado es `outcome`.
- Confirmado: `limit=5` es válido, pero la respuesta es un array y `/docs` no garantiza que contenga exactamente cinco elementos.
- Confirmado: `business_type` admite únicamente `B2B` y `B2C`.
- Confirmado: `start_date` y `end_date` son opcionales y usan el formato OpenAPI `date`.
- No documentado: `/docs` no exige que `start_date` sea menor o igual que `end_date`.
- No disponible en `TopCategoryItem`: el porcentaje se deriva de `total_amount` y del total completo `income` de `/api/metrics/summary` para el mismo segmento y rango.
- No garantizado: `/api/metrics/facets` devuelve categorías globales, no categorías disponibles por segmento; esto requiere ampliar el contrato si se mantiene el requisito del PM.

## Contraste con el frontend existente

- `App.tsx` es actualmente la única pantalla y no existe configuración de rutas, componentes `Route` ni uso de una librería de navegación. Crear una “nueva página” no puede apoyarse en un patrón de routing existente.
- La única función de acceso a datos usa `API_BASE_URL`, comprueba `response.ok` y devuelve JSON tipado. Esa función es local a `App.tsx` y no está exportada como cliente compartido.
- No existe un patrón previo para coordinar dos peticiones paralelas B2B/B2C ni para representar éxito parcial si una responde y la otra falla.
- `financial-types.ts` no define todavía `TopCategoryItem` ni un modelo de vista para la comparativa.
- `formatCurrency(number)` puede reutilizarse para `total_amount`.
- `formatPercent(number)` espera un porcentaje ya calculado. El endpoint `top` no lo devuelve; antes de formatear hay que calcularlo usando el total de ingresos obtenido del resumen del segmento.
- `computeKPIs` calcula ingresos totales desde arrays de `FinancialMovement`, pero `/api/metrics/categories/top` devuelve `TopCategoryItem[]`. No se puede reutilizar esa función directamente con la respuesta de categorías.
- Los gráficos existentes reciben datos ya transformados y una prop `loading`; no hay un componente actual que compare un único total B2B con B2C.
- El error actual es global para la pantalla. La spec no presupone si las dos secciones compartirán error y carga o tendrán estados independientes.
