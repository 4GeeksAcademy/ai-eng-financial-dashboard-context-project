# Desglose de Componentes por Funcionalidad

Este documento define los componentes frontend recomendados para implementar las tres funcionalidades solicitadas, con sus responsabilidades, props y estados clave.

## Funcionalidad 1: Filtro de rango de fechas en dashboard principal

### 1) DateRangeFilterBar

Responsabilidad:

- Renderizar inputs de fecha de inicio y fin.
- Mostrar rango disponible (`min_date`, `max_date`) como referencia.
- Emitir cambios de filtro al contenedor.

Props sugeridas:

- `value: DateRangeFilter`
- `availableRange: { min_date: string; max_date: string } | null`
- `onChange: (next: DateRangeFilter) => void`
- `onClear: () => void`
- `error?: string`
- `loading?: boolean`

Estado interno sugerido:

- Ninguno o solo control visual temporal de inputs.

Reglas UI:

- Ambos campos opcionales.
- Si `start_date > end_date`, mostrar validación.
- Formato de envío: `YYYY-MM-DD`.

### 2) DashboardPageContainer

Responsabilidad:

- Orquestar la carga de `facets` y `metrics`.
- Mantener el estado global de filtros por fecha.
- Distribuir datos filtrados a KPIs y gráficos existentes.

Estado sugerido:

- `dateRange: DateRangeFilter`
- `availableRange: FacetsResponse | null`
- `loading`, `error`

Integración con componentes existentes:

- `DashboardHeader`
- `KPIRow`
- `IncomeOutcomeChart`
- `ProfitPercentChart`

## Funcionalidad 2: Tabla de alertas de anomalías

### 1) AlertsThresholdControl

Responsabilidad:

- Renderizar input numérico para `threshold`.
- Validar rango permitido en UI.

Props sugeridas:

- `value: number`
- `min?: number` (recomendado `0.01`)
- `max?: number` (recomendado `1.0`)
- `step?: number` (recomendado `0.01`)
- `onChange: (next: number) => void`
- `error?: string`

Estado interno sugerido:

- `draftValue` opcional para edición controlada.

### 2) AlertsTable

Responsabilidad:

- Mostrar alertas en tabla con columnas requeridas.
- Mostrar estado vacío explícito cuando no haya resultados.

Props sugeridas:

- `rows: AlertResponse`
- `loading?: boolean`
- `emptyMessage?: string`

Columnas:

- `period`
- `outcome_total`
- `baseline_average`
- `increase_ratio` (renderizado en `%`)

### 3) AlertsSection

Responsabilidad:

- Componer `AlertsThresholdControl` + `AlertsTable`.
- Ejecutar request de alertas con `threshold` y `dateRange`.

Props sugeridas:

- `dateRange: DateRangeFilter`

Estado sugerido:

- `threshold: number` (default `0.3`)
- `alerts: AlertResponse`
- `loading`, `error`

Posición en layout:

- Debajo de los gráficos existentes del dashboard principal.

## Funcionalidad 3: Vista comparativa B2B vs B2C

### 1) B2BvsB2CPage

Responsabilidad:

- Contenedor de la nueva página de comparativa.
- Gestionar filtro de fechas compartido para ambas secciones.

Estado sugerido:

- `dateRange: DateRangeFilter`
- `availableRange: FacetsResponse | null`
- `b2bRows: TopCategoriesResponse`
- `b2cRows: TopCategoriesResponse`
- `loading`, `error`

### 2) TopCategoriesTableCard

Responsabilidad:

- Mostrar top 5 categorías para una línea de negocio.
- Calcular y mostrar `% sobre total del grupo`.

Props sugeridas:

- `title: string`
- `businessType: "B2B" | "B2C"`
- `rows: TopCategoriesResponse`
- `loading?: boolean`
- `emptyMessage?: string`

Columnas:

- `category`
- `total_amount`
- `% sobre grupo`

### 3) B2BvsB2CTotalsChart

Responsabilidad:

- Mostrar comparación visual de total ingresos B2B vs B2C.

Props sugeridas:

- `b2bTotal: number`
- `b2cTotal: number`
- `loading?: boolean`

Datos:

- `b2bTotal = sum(b2bRows.total_amount)`
- `b2cTotal = sum(b2cRows.total_amount)`

### 4) ComparisonDateFilterBar

Responsabilidad:

- Reutilizar patrón de filtro por rango de fechas para la vista comparativa.

Props sugeridas:

- Mismas que `DateRangeFilterBar`.

## Servicios/Helpers transversales recomendados

### 1) metricsApi (módulo de acceso a datos)

Funciones sugeridas:

- `getFacets(): Promise<FacetsResponse>`
- `getAlerts(params: AlertsParams): Promise<AlertResponse>`
- `getTopCategories(params: TopsCategoriesParams & { business_type: "B2B" | "B2C" }): Promise<TopCategoriesResponse>`

### 2) query-string helpers

Responsabilidad:

- Serializar parámetros opcionales evitando enviar claves vacías.

Reglas:

- No incluir `start_date` o `end_date` si vienen vacías.
- No incluir `limit` o `threshold` si no están definidos.

## Mapa rápido de reutilización

- `DateRangeFilterBar`: se usa en Dashboard principal y en vista B2B vs B2C.
- `DateRangeFilter`: tipo compartido entre funcionalidades 1, 2 y 3.
- `AlertsSection`: depende del filtro global de fechas del dashboard principal.
- `TopCategoriesTableCard`: componente reutilizable para B2B y B2C.
