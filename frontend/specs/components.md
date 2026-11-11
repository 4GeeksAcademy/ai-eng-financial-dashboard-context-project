# Especificacion de componentes y contrato de UI

## Alcance y estado de implementacion

La UI implementada consulta `GET /api/metrics` desde `App.tsx`, calcula KPI y series mensuales en el cliente y renderiza el dashboard existente. Las demas rutas de `/docs` se documentan aqui como contrato para su integracion; no se afirma que ya tengan componentes conectados.

Todas las rutas son `GET`, no envian body y usan los tipos indicados en `api-types.ts` y `param-types.ts`. Los errores de validacion HTTP 422 tienen respuesta `HTTPValidationError`. Una lista vacia (`[]`) es un resultado correcto, no un error.

## Mapa de rutas, tipos y UI

| Ruta | Query de request | Tipo de respuesta | UI que presenta o debe presentar |
| --- | --- | --- | --- |
| `/health` | `HealthParams` (sin parametros) | `HealthResponse` | Estado de conectividad del servicio; indicador discreto, no una metrica financiera. |
| `/api/metrics` | `MetricsParams` | `FinancialMovement[]` | Dashboard actual: `KPIRow`, `IncomeOutcomeChart` y `ProfitPercentChart`. |
| `/api/metrics/facets` | `MetricsFacetsParams` (sin parametros) | `FacetsResponse` | Opciones y limites para controles de fecha, categoria, operacion y segmento. |
| `/api/metrics/summary` | `MetricsSummaryParams` | `MetricsSummaryItem[]` | Adaptar las series a `MonthlyDataPoint` antes de alimentar los charts actuales; derivar el margen desde income y net. |
| `/api/metrics/categories/top` | `TopCategoriesParams` | `TopCategoriesResponse` (`CategoryEntry[]`) | Tabla comparativa ordenada por importe, con categoria, tipo de operacion y total. |
| `/api/metrics/comparison` | `MetricsComparisonParams` | `MetricsComparison` | KPI de neto actual, neto anterior, delta absoluto y delta porcentual. |
| `/api/metrics/alerts` | `AlertParams` | `AlertsResponse` (`AlertEntry[]`) | Tabla de anomalias con periodo, egreso observado, baseline y razon de aumento. |
| `/api/metrics/b2b` | `BusinessMetricsParams` | `FinancialMovement[]` | Vista de movimientos B2B, reutilizando KPI y graficos del dashboard. |
| `/api/metrics/b2c` | `BusinessMetricsParams` | `FinancialMovement[]` | Vista de movimientos B2C, reutilizando KPI y graficos del dashboard. |

`MetricsFacetsParams` y `HealthParams` representan una query vacia. `TopCategoriesResponse` y `AlertsResponse` son arrays porque OpenAPI no define objetos envolventes para esas rutas.

## Parametros: valores y restricciones

- `start_date` y `end_date`: strings de fecha calendario `YYYY-MM-DD`; inclusivos. Son opcionales salvo en `/api/metrics/comparison`, donde ambos son requeridos. El backend no declara que `start_date <= end_date` sea una regla de validacion; la UI de fechas debe impedir rangos invertidos antes de enviar la query.
- `category`: `suppliers`, `sales`, `operational`, `administrative` u `others`.
- `operation_type`: `income` u `outcome`. En categorias principales el default es `outcome`.
- `business_type`: `B2B` o `B2C`; opcional en summary, top categories, comparison y alerts. Los endpoints `/b2b` y `/b2c` ya aplican el segmento y no reciben este parametro.
- `group_by`: `day`, `week` o `month`; default `month` en summary y alerts. Semanas usan clave ISO `YYYY-Www`.
- `limit`: entero de 1 a 20 en top categories; default 5.
- `threshold`: numero mayor o igual a 0 en alerts; default 0.3, sin maximo declarado. Tanto `threshold` como `increase_ratio` usan una razon (0.3 equivale a 30%). La alerta solo se genera cuando la razon es estrictamente mayor al threshold.
- `MetricsParams` y `BusinessMetricsParams` aceptan fechas, categoria y tipo de operacion. Summary acepta fechas, agrupacion, categoria, tipo de operacion y segmento. Ningun endpoint recibe body.

## Componentes actuales

- `DashboardHeader`: titulo y periodo; actualmente recibe el periodo fijo `2024 - Full Year`.
- `KPIRow`: cuatro indicadores: ingresos, egresos, beneficio neto y margen. Recibe `KPIMetrics | null` y estado `loading`.
- `KPICard`: etiqueta, valor, texto auxiliar e icono; variantes `income`, `outcome`, `profit` y `profitPercent`.
- `IncomeOutcomeChart`: lineas mensuales de ingresos y egresos.
- `ProfitPercentChart`: margen mensual con linea de referencia en cero.

Los importes actuales se muestran como USD sin decimales, los porcentajes con un decimal y los meses usan `en-US`. La UI actual no incluye filtros, selector B2B/B2C, tabla de categorias, comparacion, tabla de alertas ni indicador de salud.

## Estados compartidos

- **Carga:** conservar los esqueletos actuales para KPI y graficos. Las tablas futuras deben mostrar filas skeleton sin perder encabezados.
- **Exito con datos:** renderizar la UI asociada a la ruta de la tabla anterior.
- **Exito sin datos:** mostrar mensaje vacio especifico de la vista, nunca un error de red. No inventar registros.
- **Error HTTP/red:** conservar la vista y mostrar un mensaje de error; para 422 asociar el detalle a los parametros invalidos cuando sea posible.
- **Reintento:** no esta implementado actualmente; si se incorpora, debe ser una accion explicita y conservar los filtros.

## Casos limite y resultado visible

### `/health`

- `status: "ok"`: mostrar el indicador de servicio disponible; no agregar una tarjeta financiera.
- Error de red o respuesta no exitosa: mostrar estado de servicio no disponible; no inferir que los movimientos financieros son cero.

### `/api/metrics`

- La respuesta es `[]` tras aplicar fechas validas: KPI actuales calculados sobre el array muestran ceros; los graficos muestran su estado `No data available to display`. La vista debe conservar esta respuesta vacia diferenciada del error.
- Fecha malformada o enum de categoria/operacion invalido produce 422: mostrar el error del filtro y no sustituirlo por KPI en cero.

### `/api/metrics/facets`

- Una lista de opciones llega vacia (estado defensivo; no sucede con el dataset simulado actual): mostrar el selector sin opciones y deshabilitado; no inventar categorias o segmentos.
- `min_date` y `max_date` son el mismo dia (estado defensivo): permitir ese unico dia en el selector de fechas y mantener ambos extremos inclusivos.

### `/api/metrics/summary`

- No hay movimientos para los filtros: la grafica muestra estado vacio con el agrupamiento seleccionado; no muestra una linea artificial en cero.
- `net` es negativo porque `outcome > income`: mostrar el valor bajo cero y mantener la escala alrededor de cero; no truncar valores negativos.

### `/api/metrics/categories/top`

- La respuesta es `[]`: la tabla conserva encabezados y muestra “Sin categorias para estos filtros”.
- `limit=1` muestra una fila y `limit=20` no puede mostrar mas de veinte; `limit=0` o `limit=21` produce 422, que debe mostrarse como error del control de limite.

### `/api/metrics/comparison`

- `previous_period` es cero: la API devuelve `delta_pct: null`; mostrar el delta absoluto y un guion/“Sin base para calcular porcentaje”, nunca dividir por cero.
- `delta_abs` es negativo: presentar disminucion con signo/estilo semantico correcto. Aunque el nombre contenga `abs`, el campo es la diferencia firmada `current_period - previous_period`.
- Falta `start_date` o `end_date`: la API responde 422; marcar el rango como incompleto y no renderizar una comparacion fabricada.

### `/api/metrics/alerts`

- La respuesta es `[]`: mostrar “Sin anomalias para estos filtros”, distinto de carga o error.
- El baseline de egresos es cero: el backend no emite alerta para ese periodo; no calcular un porcentaje infinito ni generar una fila local.
- `threshold=0` sigue usando comparacion estricta `increase_ratio > threshold`; un aumento exactamente igual a cero no es alerta.

### `/api/metrics/b2b`

- No quedan movimientos B2B tras filtrar fechas/categoria/operacion: mostrar vista vacia B2B y mantener activo el segmento seleccionado.
- Movimiento situado exactamente en `start_date` o `end_date`: incluirlo; ambos limites son inclusivos y los filtros se combinan.

### `/api/metrics/b2c`

- No quedan movimientos B2C tras filtrar fechas/categoria/operacion: mostrar vista vacia B2C sin reutilizar cifras B2B ni datos de respaldo.
- Movimiento situado exactamente en `start_date` o `end_date`: incluirlo; ambos limites son inclusivos y los filtros se combinan.

## Preguntas de integracion resueltas

- Las rutas de filtros, comparacion, alertas y segmentacion estan descritas, pero no se conectan desde la UI actual salvo `/api/metrics`.
- Las respuestas de alertas y categorias son arrays planos, y pueden estar vacias.
- `MetricsSummaryItem` usa `period` y `net`, mientras que los graficos actuales esperan `month` y `profitPercent`; hace falta adaptar/agregar esos campos antes de conectarlos.
- `delta_abs` es firmado; solo `delta_pct` usa `null` cuando no hay base para calcular el porcentaje.
- `delta_pct` se calcula en porcentaje y puede ser `null`; `increase_ratio` es una razon decimal.
- Una validacion 422 es un error de request; una lista vacia con HTTP exitoso es un estado vacio.
- La UI debe validar rangos de fecha invertidos antes de consultar, porque OpenAPI no especifica esa restriccion.
