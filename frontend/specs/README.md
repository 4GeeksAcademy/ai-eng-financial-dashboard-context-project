# Especificaciones Frontend

Documento maestro para las tres funcionalidades solicitadas.

Validación de rutas: se verificaron contra OpenAPI activo en /docs.

## Convenciones globales

- Fechas en query: YYYY-MM-DD (formato date de OpenAPI).
- Parámetros opcionales no deben enviarse vacíos.
- Todas las vistas deben manejar loading, error y estado vacío explícito.

## Funcionalidad 1: Filtro de rango de fechas en dashboard principal

### Endpoints consumidos (verificados en /docs)

- GET /api/metrics/facets
- GET /api/metrics

### Tipos TypeScript usados

- Request:
	- DateRangeFilter (frontend/specs/param-tzpes.ts)
- Response:
	- FacetsResponse (frontend/specs/api-types.ts)
	- Para métricas del dashboard actual: FinancialMovement[] (frontend/src/lib/financial-types.ts)

### Parámetros válidos y restricciones

- GET /api/metrics/facets:
	- Sin query params.

- GET /api/metrics:
	- start_date: opcional, formato YYYY-MM-DD.
	- end_date: opcional, formato YYYY-MM-DD.
	- category: opcional, valores válidos: suppliers, sales, operational, administrative, others.
	- operation_type: opcional, valores válidos: income, outcome.

Reglas de UI para esta funcionalidad:

- Solo se usan start_date y end_date para el filtro global visible.
- Ambos opcionales; vacíos => sin filtro de fechas.
- Si start_date > end_date: no disparar consulta y mostrar error de validación.

### Edge cases mínimos y comportamiento UI

1. start_date mayor que end_date.
	 - UI esperada: mensaje de validación, sin refrescar KPIs ni gráficos.

2. Fechas fuera del rango disponible de facets.
	 - UI esperada: mostrar estado sin datos en KPIs/gráficos (o ceros según diseño), manteniendo visible la referencia de rango válido.

3. facets responde pero metrics falla.
	 - UI esperada: inputs y rango visible, más mensaje de error para datos del dashboard.

## Funcionalidad 2: Tabla de alertas de anomalías

### Endpoints consumidos (verificados en /docs)

- GET /api/metrics/alerts

### Tipos TypeScript usados

- Request:
	- AlertsParams (frontend/specs/param-tzpes.ts)
	- Reutiliza DateRangeFilter (frontend/specs/param-tzpes.ts)
- Response:
	- AlertEntry
	- AlertResponse
	- (todos en frontend/specs/api-types.ts)

### Parámetros válidos y restricciones

- GET /api/metrics/alerts:
	- threshold: opcional, number, mínimo backend 0, default backend 0.3.
	- group_by: opcional, day | week | month, default month.
	- start_date: opcional, formato YYYY-MM-DD.
	- end_date: opcional, formato YYYY-MM-DD.
	- business_type: opcional, B2B | B2C.

Reglas de UI para esta funcionalidad:

- Umbral configurable por usuario.
- Recomendación de validación en UI según requerimiento funcional: 0.01 a 1.0.
- increase_ratio se muestra como porcentaje.

### Edge cases mínimos y comportamiento UI

1. El endpoint responde lista vacía.
	 - UI esperada: mensaje explícito de estado vacío, la tabla no desaparece.

2. threshold inválido en UI (por ejemplo, -0.2 o texto no numérico).
	 - UI esperada: validación inline y bloqueo del fetch hasta corregir.

3. Rango de fechas activo sin suficiente histórico para baseline.
	 - UI esperada: puede no haber alertas; mantener mensaje de estado vacío sin error técnico.

## Funcionalidad 3: Vista comparativa B2B vs B2C

### Endpoints consumidos (verificados en /docs)

- GET /api/metrics/categories/top
- GET /api/metrics/facets

### Tipos TypeScript usados

- Request:
	- TopsCategoriesParams (frontend/specs/param-tzpes.ts)
	- DateRangeFilter (frontend/specs/param-tzpes.ts)
	- business_type: B2B | B2C (puede modelarse como extensión de TopsCategoriesParams en la capa de servicio)
- Response:
	- CategoryEntry
	- TopCategoriesResponse
	- FacetsResponse
	- (todos en frontend/specs/api-types.ts)

### Parámetros válidos y restricciones

- GET /api/metrics/categories/top:
	- operation_type: opcional en backend, pero para esta vista debe enviarse income.
	- limit: opcional, integer, mínimo 1, máximo 20, default 5.
	- start_date: opcional, formato YYYY-MM-DD.
	- end_date: opcional, formato YYYY-MM-DD.
	- business_type: opcional, B2B | B2C.

- GET /api/metrics/facets:
	- Sin query params; usado para rango de fechas y categorías disponibles.

### Edge cases mínimos y comportamiento UI

1. B2B con datos y B2C sin datos (o viceversa).
	 - UI esperada: cada tabla maneja su estado de forma independiente; el gráfico compara con 0 en el grupo vacío.

2. limit fuera de rango en capa cliente (por ejemplo, 0 o 100).
	 - UI esperada: normalizar a 5 o bloquear envío con validación antes de llamar API.

3. Rango de fechas sin datos para ambos grupos.
	 - UI esperada: estado vacío en ambas tablas y gráfico con ambos totales en 0.

## Nota de consistencia funcional

- Requerimiento de anomalías menciona media móvil de 3 periodos previos.
- Backend actual en /api/metrics/alerts calcula baseline con el histórico previo disponible del summary filtrado.
- Si se requiere estrictamente ventana de 3 periodos, debe ajustarse el backend o aclararse en UX.
