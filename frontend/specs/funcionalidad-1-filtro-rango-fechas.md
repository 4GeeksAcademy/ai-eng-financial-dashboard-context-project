# Funcionalidad 1: Filtro de Rango de Fechas en Dashboard Principal

## Objetivo

Permitir al equipo de finanzas filtrar todos los datos visibles del dashboard principal por fecha de inicio y fecha de fin, sin perder la posibilidad de ver el dataset completo cuando no hay filtros.

## Componentes de UI

- Input `Fecha inicio` (tipo `date`, opcional).
- Input `Fecha fin` (tipo `date`, opcional).
- Texto de referencia de rango disponible: `Disponible: <min_date> a <max_date>`.

## Fuentes de datos

- `GET /api/metrics/facets`
- `GET /api/metrics`

## Contrato API relevante

### GET /api/metrics/facets

Respuesta esperada (shape):

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-01-03",
  "max_date": "2025-12-28"
}
```

### GET /api/metrics

Query params relevantes:

- `start_date` opcional (`YYYY-MM-DD`).
- `end_date` opcional (`YYYY-MM-DD`).

Ejemplos:

- Sin filtros: `/api/metrics`
- Solo inicio: `/api/metrics?start_date=2025-03-01`
- Solo fin: `/api/metrics?end_date=2025-06-30`
- Rango completo: `/api/metrics?start_date=2025-03-01&end_date=2025-06-30`

## Reglas de comportamiento

- Al cargar la pantalla, se consulta `facets` para mostrar rango disponible.
- Si ambos inputs están vacíos, se usa `/api/metrics` sin fechas.
- Si solo hay `start_date`, se envía solo `start_date`.
- Si solo hay `end_date`, se envía solo `end_date`.
- Si ambos existen, se envían ambos.
- El filtro afecta todo lo que ya se muestra en la pantalla actual (KPIs y gráficos).

## Validaciones UI

- Si `start_date > end_date`, no se dispara request y se muestra mensaje de validación.
- El usuario puede limpiar fechas y volver al estado sin filtros.
- El formato enviado siempre debe ser `YYYY-MM-DD`.

## Criterios de aceptación

1. La pantalla muestra el rango disponible usando `min_date` y `max_date` de `facets`.
2. Con ambos inputs vacíos, se muestran datos globales (sin filtro de fecha en query).
3. Al setear fechas válidas, todos los widgets reflejan el mismo rango.
4. Con rango inválido (`start_date > end_date`) no se ejecuta consulta de datos y se informa al usuario.
5. Limpiar filtros restituye datos globales.

## Pruebas sugeridas

- Caso base sin fechas.
- Solo fecha inicio.
- Solo fecha fin.
- Rango válido.
- Rango inválido.
- Borrar filtros tras aplicar rango.
