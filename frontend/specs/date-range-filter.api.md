# Especificación de contrato de datos: filtro de rango de fechas

## Carga del rango disponible

Al inicializar el dashboard:

```http
GET /api/metrics/facets
```

Usar únicamente:

```json
{
  "min_date": "YYYY-MM-DD",
  "max_date": "YYYY-MM-DD"
}
```

Los demás campos de facets (`operation_types`, `business_types`, `categories`) quedan fuera de esta funcionalidad.

## Carga de métricas

```http
GET /api/metrics
```

Query params permitidos para esta funcionalidad:

- `start_date=YYYY-MM-DD`, cuando hay fecha inicial;
- `end_date=YYYY-MM-DD`, cuando hay fecha final.

Ejemplos:

```http
GET /api/metrics
GET /api/metrics?start_date=2024-01-01
GET /api/metrics?end_date=2024-12-31
GET /api/metrics?start_date=2024-01-01&end_date=2024-12-31
```

Los valores vacíos deben omitirse; no enviar `null`, `undefined` ni cadenas vacías.

La respuesta sigue siendo un array de `FinancialMovement`; KPI y datos de gráficos se recalculan a partir de ese array.

## Reglas y límites

- ✅ Ambos endpoints están publicados en `/docs` y `/openapi.json` y fueron verificados en runtime.
- ✅ `start_date` y `end_date` son parámetros opcionales de `/api/metrics`.
- ✅ `min_date` y `max_date` son campos de `/api/metrics/facets`.
- ✅ La respuesta de `/api/metrics` es un array de movimientos, no KPI precalculados.
- ❌ No usar `date_from`, `date_to`, `from`, `to` ni un campo inventado `date_range`.
- ❓ La OpenAPI no confirma inclusión de extremos ni semántica funcional de rangos parciales; debe verificarse antes de convertirlos en requisito definitivo.
- ❓ La OpenAPI no define qué hacer si facets devuelve fechas vacías/nulas o un rango inválido; la UI debe mostrar disponibilidad desconocida y no inventar valores.

## Respuestas

- `200` con movimientos: reemplazar el dataset visible y recalcular todo.
- `200` con array vacío: estado sin datos, no error de red.
- Error de facets: conservar inputs disponibles, marcar rango no disponible y mostrar error recuperable.
- Error de métricas: conservar la última selección válida solo si la UX lo documenta; no presentar datos parciales como resultado filtrado.
