# Contrato de specs del dashboard financiero

## Alcance

Este directorio especifica la capa frontend para tres funcionalidades. No implementa componentes React, llamadas API, routing ni cambios backend.

## Fuentes verificadas

- OpenAPI runtime: http://localhost:8000/openapi.json
- Swagger UI: http://localhost:8000/docs
- Rutas backend: `backend/app/routes.py`
- Frontend existente: `frontend/src`
- Proxy de desarrollo: `frontend/vite.config.ts`
- Datos: mock generados en memoria; no asumir persistencia ni datos reales.

## Archivos

### Tipos y parámetros compartidos

- `api-types.ts`: respuestas y tipos de dominio verificados.
- `param-types.ts`: parámetros de query verificados.

### Especificaciones por funcionalidad

- Fechas: `date-range-filter.types.md`, `date-range-filter.components.md`, `date-range-filter.api.md`.
- Alertas: `anomaly-alerts.types.md`, `anomaly-alerts.components.md`, `anomaly-alerts.api.md`.
- Comparativa: `business-comparison.types.md`, `business-comparison.components.md`, `business-comparison.api.md`.
- Contrato consolidado: `components.md`.

## Convenciones

- Fechas de API: `start_date` y `end_date`, formato `YYYY-MM-DD`.
- Estado UI: puede usar cadenas vacías para fecha no seleccionada; los valores vacíos se omiten de URLs.
- `BusinessType`: `B2B | B2C`.
- `OperationType`: `income | outcome`.
- `Category`: `suppliers | sales | operational | administrative | others`.
- `GroupBy`: `day | week | month`.
- No usar `from`, `to`, `date_from`, `date_to`, `segment`, `group` o `business_segment`.
- Las respuestas no incluyen campos inventados como `percentage`, `group_total`, `moving_average_3`, `b2b_total` o `b2c_total`.

## Endpoints por funcionalidad

| Funcionalidad | Endpoint | Uso |
|---|---|---|
| Filtro de fechas | `GET /api/metrics/facets` | `min_date`, `max_date` y disponibilidad |
| Filtro de fechas | `GET /api/metrics` | movimientos filtrados; recalcular KPI y gráficos |
| Alertas | `GET /api/metrics/alerts` | anomalías; `threshold` y `group_by=month` |
| Comparativa | `GET /api/metrics/categories/top` | cinco categorías de ingresos por `business_type` |
| Comparativa | `GET /api/metrics/summary` | sumar `income` para total B2B/B2C |
| No usar para ingresos | `GET /api/metrics/comparison` | devuelve neto, no ingresos brutos |

## Contratos usados

- Facets: `FacetsResponse`.
- Movimientos: `FinancialMovement[]`.
- Alertas: `AlertsResponse` (`AlertEntry[]`).
- Categorías: `TopCategoriesResponse` (`CategoryEntry[]`).
- Totales comparativos: `SummaryResponse` (`MetricsSummaryItem[]`).
- Parámetros: `DateRangeFilter`, `AlertsParams`, `TopCategoriesParams` y `SummaryParams`.

## Funcionalidad 1: rango de fechas

Dos inputs opcionales envían `start_date`/`end_date`. Facets aporta `min_date`/`max_date`. El rango inválido no consulta. Un rango parcial envía solo el extremo disponible. El filtro se aplica a todos los datos visibles relacionados.

Casos límite:

1. Ambas fechas vacías: omitir ambos parámetros y mostrar todos los datos.
2. `start_date > end_date`: mostrar validación y no consultar.
3. Facets fallida: mantener controles, mostrar rango no disponible y no inventar fechas.

## Funcionalidad 2: alertas

Consultar `/api/metrics/alerts` con `threshold`, `group_by=month` y el rango activo. La UI limita `threshold` a `0.01..1.0` y usa default `0.1` según el brief actual. La API usa `0.3` como default cuando se omite el parámetro y solo declara mínimo `0`, por lo que la UI debe enviar explícitamente `threshold=0.1`.

Mostrar `period`, `outcome_total`, `baseline_average` e `increase_ratio * 100`. El array vacío es estado válido con mensaje explícito.

Casos límite:

1. Array vacío: conservar tabla/sección y mostrar `No se detectaron anomalías para este umbral.`
2. Error de red/HTTP: mostrar error recuperable, no datos parciales.
3. El brief solicita categoría y media móvil de dos períodos, pero `AlertEntry` solo devuelve `outcome_total`, `baseline_average` e `increase_ratio`. No inventar la categoría ni llamar a `baseline_average` media móvil de dos períodos; resolver la discrepancia antes de afirmar cumplimiento literal del PM.

## Funcionalidad 3: comparativa B2B vs B2C

Para cada grupo consultar `/api/metrics/categories/top` con `operation_type=income`, `limit=5`, `business_type=B2B|B2C` y rango activo. Consultar también `/api/metrics/summary` con `group_by=month`, `operation_type=income`, `business_type` y rango. Sumar `income` para el total de grupo; calcular porcentaje de categoría contra ese total.

`facets.categories` es catálogo global, no categorías separadas por grupo.

Casos límite:

1. Menos de cinco categorías: mostrar solo las recibidas; no fabricar filas.
2. Resumen vacío o total cero: evitar división por cero, mostrar `N/D` en porcentajes y estado sin datos en gráfico cuando corresponda.
3. Error parcial: identificar el panel o recurso fallido y no presentar una comparativa incompleta como completa.

## Estados de UI

Cada funcionalidad debe distinguir `idle`, `loading`, `success`, `empty` y `error` cuando aplique. Las secciones permanecen visibles durante carga, vacío y error. No mezclar respuestas de un rango anterior con el actual.

## Decisiones pendientes antes de implementación

1. Aplicar fechas automáticamente, con debounce o mediante botón `Aplicar`.
2. Confirmar semántica de extremos y rangos parciales como requisito de producto; OpenAPI no lo expresa completamente.
3. Resolver categoría y media móvil de dos períodos versus el contrato actual (`baseline_average`).
4. Resolver el default de UI `0.1` frente al default API `0.3`.
4. Confirmar si `N/D` es el copy definitivo para grupo con ingresos cero.
5. Definir estrategia final de error parcial en comparativa.
6. Integrar la navegación de la nueva página sin asumir una librería de routing no verificada.

## Verificación

Archivos TypeScript de contrato: `api-types.ts` y `param-types.ts`. Deben validar con TypeScript estricto, sin `any` ni `object`, y cada propiedad pública debe conservar JSDoc. Este repositorio especifica, pero no implementa, las funcionalidades.
