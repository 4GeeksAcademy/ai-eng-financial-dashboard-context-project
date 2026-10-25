# Verificación

## Mis dudas antes de mirar la API
- Funcionalidad 1:
    1. ¿Qué pasa si solo relleno la fecha de inicio?
    2. ¿Los dias seleccionados en inicio y fin son excluyentes o no?
    
- Funcionalidad 2:
    1. ¿Como va a introducir el usuario el input para el ratio?
    2. ¿Que pasa si el usuario mete un valor de ratio que sale de los margenes de 0.01 o 1.0 establecidos?

- Funcionalidad 3:
    1. Si una linea de negocio, dentro de sus categorias principales, una de ellas no tienen ingresos. ¿Se muestra como cero o no se muestra?
    2. El grafico comparativo. ¿Que tipo de grafico usamos?

## Afirmaciones verificadas
| Endpoint | Clase | Nombre | Tipo | Obligatorio | Valores válidos / observados | Fuente | Estado (✅ ❓) |
|---|---|---|---|---|---|---|---|
| `GET /api/metrics/facets` | Parámetros query | — | — | — | OpenAPI no declara parámetros | OpenAPI | ✅ |
| `GET /api/metrics/facets` | Respuesta | `operation_types` | array de string | Sí | `income`, `outcome` (enum OpenAPI y respuesta real) | OpenAPI `MetricsFacets`; `curl` HTTP 200 | ✅ |
| `GET /api/metrics/facets` | Respuesta | `business_types` | array de string | Sí | `B2B`, `B2C` (enum OpenAPI y respuesta real) | OpenAPI `MetricsFacets`; `curl` HTTP 200 | ✅ |
| `GET /api/metrics/facets` | Respuesta | `categories` | array de string | Sí | `suppliers`, `sales`, `operational`, `administrative`, `others` (enum OpenAPI y respuesta real) | OpenAPI `MetricsFacets`; `curl` HTTP 200 | ✅ |
| `GET /api/metrics/facets` | Respuesta | `min_date` | string, formato date | Sí | Fecha ISO `YYYY-MM-DD`; observada: `2025-10-02` | OpenAPI `MetricsFacets`; `curl` HTTP 200 | ✅ |
| `GET /api/metrics/facets` | Respuesta | `max_date` | string, formato date | Sí | Fecha ISO `YYYY-MM-DD`; observada: `2026-09-28` | OpenAPI `MetricsFacets`; `curl` HTTP 200 | ✅ |
| `GET /api/metrics/alerts` | Parámetro query | `threshold` | number | No (default `0.3`) | Mínimo `0`; sin máximo indicado en OpenAPI; solicitado `0.3` | OpenAPI; `curl` con `threshold=0.3` | ✅ |
| `GET /api/metrics/alerts` | Parámetro query | `group_by` | string | No (default `month`) | `day`, `week`, `month` | OpenAPI | ✅ |
| `GET /api/metrics/alerts` | Parámetro query | `start_date` | string date o null | No | Fecha ISO `YYYY-MM-DD` o null; sin rango adicional indicado | OpenAPI | ✅ |
| `GET /api/metrics/alerts` | Parámetro query | `end_date` | string date o null | No | Fecha ISO `YYYY-MM-DD` o null; sin rango adicional indicado | OpenAPI | ✅ |
| `GET /api/metrics/alerts` | Parámetro query | `business_type` | string o null | No | `B2B`, `B2C` o null | OpenAPI | ✅ |
| `GET /api/metrics/alerts` | Respuesta | `period` | string | Sí | Sin formato o enumeración indicada en OpenAPI; observados valores `YYYY-MM` | OpenAPI `MetricsAlert`; `curl` HTTP 200 | ✅ |
| `GET /api/metrics/alerts` | Respuesta | `outcome_total` | number | Sí | Sin límites indicados; respuesta real `103378.98` (también otros valores) | OpenAPI `MetricsAlert`; `curl` HTTP 200 | ✅ |
| `GET /api/metrics/alerts` | Respuesta | `baseline_average` | number | Sí | Sin límites indicados; respuesta real `51174.1` (también otros valores) | OpenAPI `MetricsAlert`; `curl` HTTP 200 | ✅ |
| `GET /api/metrics/alerts` | Respuesta | `increase_ratio` | number | Sí | Sin límites indicados; respuestas reales mayores o iguales a `0.3` en esta petición | OpenAPI `MetricsAlert`; `curl` HTTP 200 | ✅ |
| `GET /api/metrics/categories/top` | Parámetro query | `operation_type` | string | No (default `outcome`) | `income`, `outcome`; solicitado `income` | OpenAPI; `curl` con `operation_type=income` | ✅ |
| `GET /api/metrics/categories/top` | Parámetro query | `limit` | integer | No (default `5`) | Mínimo `1`, máximo `20`; solicitado `5` | OpenAPI; `curl` con `limit=5` | ✅ |
| `GET /api/metrics/categories/top` | Parámetro query | `start_date` | string date o null | No | Fecha ISO `YYYY-MM-DD` o null; sin rango adicional indicado | OpenAPI | ✅ |
| `GET /api/metrics/categories/top` | Parámetro query | `end_date` | string date o null | No | Fecha ISO `YYYY-MM-DD` o null; sin rango adicional indicado | OpenAPI | ✅ |
| `GET /api/metrics/categories/top` | Parámetro query | `business_type` | string o null | No | `B2B`, `B2C` o null | OpenAPI | ✅ |
| `GET /api/metrics/categories/top` | Respuesta | `category` | string | Sí | `suppliers`, `sales`, `operational`, `administrative`, `others`; observadas `sales`, `others` | OpenAPI `TopCategoryItem`; `curl` HTTP 200 | ✅ |
| `GET /api/metrics/categories/top` | Respuesta | `operation_type` | string | Sí | `income`, `outcome`; observado `income` | OpenAPI `TopCategoryItem`; `curl` HTTP 200 | ✅ |
| `GET /api/metrics/categories/top` | Respuesta | `total_amount` | number | Sí | Sin límites indicados; respuestas reales `1132097.38` y `126049.49` | OpenAPI `TopCategoryItem`; `curl` HTTP 200 | ✅ |

## Decisiones
| Duda | Decisión | Quién la confirma (yo / el PM) |
|---|---|---|
| 1. Rango de fechas para alertas | Reutilizar en `/api/metrics/alerts` las fechas seleccionadas en la Funcionalidad 1, mediante `start_date` y `end_date`. | yo |
| 2. Identificador de la línea de negocio | Distinguir B2B y B2C con `business_type`; enviar el valor correspondiente (`B2B` o `B2C`) al endpoint que admite ese filtro. | el PM |
| 3. Total de ingresos del grupo para calcular porcentajes | Opción A: obtener el total del grupo aparte mediante `/api/metrics/summary`, filtrando por `business_type` y fechas, y sumar sus ingresos. | yo |
| 4. Presentación del incremento de alerta | Mostrar `increase_ratio` como porcentaje (multiplicar el ratio por 100 y añadir `%`), según la columna de incremento porcentual solicitada. | el PM |
| 5. Threshold fuera del rango `0.01–1.0` | Opción A: rechazar valores fuera del rango mediante validación; el backend deberá aplicar mínimo `0.01` y máximo `1.0`. | yo |
| 6. Fechas para el endpoint de métricas existente | Enviar el rango al endpoint `GET /api/metrics` con los parámetros opcionales `start_date` y `end_date` en formato `YYYY-MM-DD`. | el PM |
| 7. Solo se rellena la fecha de inicio | Aplicar únicamente el límite inferior (`create_date >= start_date`); no exigir fecha de fin. | el PM |
| 8. Inclusión de las fechas de inicio y fin | Tratar ambos límites como inclusivos (`create_date >= start_date` y `create_date <= end_date`). | el PM |
| 9. Entrada del umbral de alerta | Permitir que el usuario introduzca el ratio mediante un input numérico, según el briefing. | el PM |
| 10. Categoría sin ingresos en el top por línea de negocio | Mostrar solo las categorías que devuelve la API; las categorías sin movimientos no se completan con filas de valor cero. | el PM |
| 11. Tipo del gráfico comparativo B2B vs B2C | Usar un gráfico de barras para comparar visualmente el total de ingresos de ambos grupos. | el PM |

## Validaciones Componentes-Types

Corrección de la verificación anterior: `BusinessType` no debe marcarse como tipo no localizado. Está definido como `'B2B' | 'B2C'` en `frontend/src/lib/financial-types.ts` y se importa y utiliza tanto en `api-types.ts` como en `param-types.ts`. Por tanto, está correctamente referenciado, aunque su definición canónica viva en el módulo de tipos financieros.

| Tipo usado en `components.md` | Estado | Verificación |
|---|---|---|
| `BusinessType` | ✅ | Importado por `api-types.ts` y `param-types.ts` desde `src/lib/financial-types.ts`; allí se define como `'B2B' \| 'B2C'`. |
| `FacetsResponse`, `AlertEntry`, `AlertsResponse`, `CategoryEntry`, `TopCategoriesResponse` | ✅ | Declarados en `api-types.ts`. |
| `DateRangeFilter`, `AlertsParams`, `TopCategoriesParams`, `MetricsParams` | ✅ | Declarados en `param-types.ts`. |
| `Pick<FacetsResponse, ...>` y `FacetsResponse['categories']` | ✅ | Tipos derivados de `FacetsResponse`, usando el utilitario `Pick` y acceso indexado de TypeScript. |
| `AlertsParams['threshold']` | ✅ | Tipo derivado de la propiedad `threshold` de `AlertsParams`; la propiedad es opcional. |
| `number`, `string` y firmas de callback como `(value: DateRangeFilter) => void` | ✅ | Primitivos y tipos estructurales válidos de TypeScript; las firmas de callback se escriben directamente en las props, no son interfaces exportadas por esos archivos. |
| Respuesta de `/api/metrics/comparison` y campos de total B2B/B2C | ❓ | Los tipos revisados no declaran un contrato de respuesta para ese endpoint. Que las props usen `number` es válido como tipo TypeScript, pero no verifica de qué respuesta provienen los totales ni confirma sus propiedades. |

### Resolución de dudas

| Nombre de la duda | duda a resolver | resolucion |
|---|---|---|
| Top-5 vacío | ¿Qué muestra cada panel si la lista top-5 de B2B o B2C está vacía? | El panel B2B muestra «No hay categorías de ingresos B2B para el rango seleccionado.» y el panel B2C muestra «No hay categorías de ingresos B2C para el rango seleccionado.» Cada panel presenta su estado de forma independiente. |
| Fechas vacías | ¿Qué datos se muestran si los campos de fecha de inicio y fin están vacíos? | Se omiten `start_date` y `end_date` en la petición y se muestran todos los datos disponibles. El rango disponible se presenta como referencia usando `min_date` y `max_date` de `FacetsResponse`. |
| Representación del gráfico | ¿Qué tipo de gráfico compara los ingresos B2B y B2C? | Un gráfico de barras con dos barras: una para el total de ingresos B2B y otra para el total de ingresos B2C, ambos para el mismo rango de fechas. |
| Origen de los valores del gráfico | ¿De dónde sale el valor de cada barra: lo devuelve la API o se calcula? | Según la decisión 3 de este documento, obtener los datos de `/api/metrics/summary`, filtrarlos por `business_type` y rango de fechas, y sumar los ingresos de cada grupo. Cada barra representa ese total del grupo; no se calcula sumando únicamente las categorías top-5. El contrato de respuesta de `/api/metrics/summary` aún debe verificarse antes de integrar el cálculo. |