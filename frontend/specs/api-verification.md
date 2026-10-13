# Verificación de contratos TypeScript

## Alcance y estado

Contratos de [api-types.ts](api-types.ts) y [param-types.ts](param-types.ts) para las funcionalidades 001 (fechas), 002 (alertas) y 003 (comparativa B2B/B2C).

**Verificados contra las declaraciones del código del backend. Pendientes de contrastar con el JSON OpenAPI generado.** No se consultó `/openapi.json` ni se ejecutó `app.openapi()` durante esta revisión. No se verificó la disponibilidad del servicio.

FastAPI configura `/openapi.json` por defecto en [main.py](../../backend/app/main.py#L6).

## Resultados

| Definición | Endpoint / esquema fuente | Resultado y discrepancias |
|---|---|---|
| `FacetsResponse` | `/api/metrics/facets` → `MetricsFacets` | Coinciden los cinco nombres: `operation_types`, `business_types`, `categories`, `min_date`, `max_date`. Arrays de valores permitidos y fechas como `string`; todos obligatorios y no nulos. `string` no valida el formato de fecha. |
| `AlertEntry` | `/api/metrics/alerts` → `MetricsAlert` | Coinciden `period: string`, `outcome_total`, `baseline_average` e `increase_ratio: number`. Todos obligatorios y no nulos; sin diferencias estructurales. |
| `AlersResponse` | `/api/metrics/alerts` → `list[MetricsAlert]` | Array sin envoltorio correcto. La errata del nombre TypeScript no afecta al contrato JSON. |
| `CategoryEntry` | `/api/metrics/categories/top` → `TopCategoryItem` | Coinciden `category`, `operation_type` y `total_amount`. Valores permitidos correctos en los dos primeros y `number` en el tercero; todos obligatorios y no nulos. |
| `TopCategoriesReponse` | `/api/metrics/categories/top` → `list[TopCategoryItem]` | Array sin envoltorio correcto. La errata del nombre TypeScript no afecta al contrato JSON. |
| `DateRangeFiler` | `/api/metrics`, `/api/metrics/alerts`, `/api/metrics/categories/top` | `start_date` y `end_date` correctamente opcionales. El backend declara `date \| None`; TypeScript representa ausencia mediante omisión, pero no admite `null` ni valida formato. |
| `AlertsParams` | `/api/metrics/alerts` | Fechas heredadas, `threshold`, `group_by` y `business_type`: nombres, opcionalidad y valores permitidos correctos. Predeterminados: `threshold=0.3`, `group_by=month`. `number` no impone mínimo `0`; `business_type` no admite `null`. |
| `TopCategoriesParams` | `/api/metrics/categories/top` | Fechas heredadas, `operation_type`, `limit` y `business_type`: nombres y opcionalidad correctos. Predeterminados: `operation_type=outcome`, `limit=5`. `number` no exige entero ni límites `1–20`; `business_type` no admite `null`. |

Omitir parámetros opcionales es adecuado para construir las peticiones. La nulabilidad declarada en Python no significa que enviar el texto `null` en la URL sea válido.

## Comentarios y diferencias con las funcionalidades

- Los JSDoc son coherentes con las declaraciones y la implementación revisadas; los límites numéricos y formatos documentados no se validan automáticamente mediante estos tipos.
- Las facetas son globales, sin categorías de ingreso separadas por B2B/B2C ni filtros de query.
- La media de alertas usa todos los períodos anteriores del rango filtrado, no los tres períodos de la spec 002. El umbral admite valores desde `0`, sin máximo, frente al intervalo solicitado `0.01–1.0`.
- El ranking no entrega porcentaje ni total completo del grupo. `limit=5` devuelve hasta cinco entradas; los datos simulados solo generan ingresos en `sales` y `others`.
- Estas afirmaciones de comportamiento se contrastaron con código; no son garantías verificadas leyendo el JSON OpenAPI.

## Fuentes

- Modelos y valores permitidos: [backend/app/routes.py](../../backend/app/routes.py#L11).
- Fechas del endpoint principal: [backend/app/routes.py](../../backend/app/routes.py#L248).
- Facetas: [backend/app/routes.py](../../backend/app/routes.py#L262).
- Ranking y parámetros: [backend/app/routes.py](../../backend/app/routes.py#L287).
- Alertas y parámetros: [backend/app/routes.py](../../backend/app/routes.py#L342).
- Cálculo de alertas: [backend/app/routes.py](../../backend/app/routes.py#L219).

## Comprobación pendiente

Con el backend arrancado, obtener el esquema sin crear archivos:

```bash
curl -fsS http://localhost:8000/openapi.json
```

Alternativamente, generarlo directamente desde la aplicación:

```bash
docker compose exec -T backend python -c 'import json; from app.main import app; print(json.dumps(app.openapi(), indent=2))'
```

Contrastar `components.schemas` y los parámetros y respuestas de `paths` con la tabla antes de marcar los contratos como verificados contra OpenAPI.