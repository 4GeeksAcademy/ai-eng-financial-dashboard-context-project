# Funcionalidad 1 - Filtro de rango de fechas en el dashboard principal

El equipo de finanzas quiere centrarse en períodos concretos sin ver todos los datos históricos a la vez.

## Requisitos de producto

- Añadir dos inputs de fecha en la parte superior del dashboard:
  - Fecha de inicio.
  - Fecha de fin.
- Filtrar todos los datos que se muestran actualmente en la página.
- Enviar las fechas a la API en formato `YYYY-MM-DD`.
- Mantener ambos inputs opcionales.
- Mostrar todos los datos disponibles cuando ambos inputs estén vacíos.
- Mostrar cerca de los inputs el rango de fechas disponible:
  - Fecha más antigua del dataset.
  - Fecha más reciente del dataset.
- Usar el rango disponible como referencia para que el usuario sepa qué fechas son válidas.

## Contrato verificado en `/docs`

### `GET /api/metrics`

Parámetros query:

| Parámetro | Tipo OpenAPI | Obligatorio | Valores documentados |
|---|---|---|---|
| `start_date` | `string`, formato `date`, o `null` | No | — |
| `end_date` | `string`, formato `date`, o `null` | No | — |
| `category` | `string` o `null` | No | `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `operation_type` | `string` o `null` | No | `income`, `outcome` |

Esta funcionalidad añade controles para `start_date` y `end_date`; `category` y `operation_type` ya forman parte del mismo contrato y se documentan aquí para mantener completo el mapa del endpoint.

Respuesta `200`: array de `FinancialMovement`.

Campos obligatorios de cada elemento:

| Campo | Tipo OpenAPI | Valores documentados |
|---|---|---|
| `create_date` | `string`, formato `date` | — |
| `amount` | `number` | — |
| `operation_type` | `string` | `income`, `outcome` |
| `category` | `string` | `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `business_type` | `string` | `B2B`, `B2C` |

Respuesta `422`: `HTTPValidationError` cuando un parámetro no cumple el contrato, por ejemplo una fecha con formato inválido.

### `GET /api/metrics/facets`

No documenta parámetros query.

Respuesta `200`: objeto `MetricsFacets` con todos estos campos obligatorios:

| Campo | Tipo OpenAPI | Valores documentados |
|---|---|---|
| `operation_types` | array de `string` | `income`, `outcome` |
| `business_types` | array de `string` | `B2B`, `B2C` |
| `categories` | array de `string` | `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `min_date` | `string`, formato `date` | — |
| `max_date` | `string`, formato `date` | — |

Los inputs deben usar `min_date` y `max_date` como referencia del rango disponible.

## Correspondencia entre el PM y la API

| Expresión del PM | Contrato actual | Resolución en la spec |
|---|---|---|
| Fecha de inicio y fecha de fin | Query `start_date` y `end_date` de `/api/metrics`, opcionales y de formato `date` | Enviar solo las fechas indicadas; omitir los parámetros de inputs vacíos. |
| Fecha más antigua y más reciente del dataset | `min_date` y `max_date` de `/api/metrics/facets` | Mostrar esos campos cerca de los inputs; son una referencia del dataset, no una validación de la API. |
| Extensión de filtros sobre el endpoint existente | `/api/metrics` ya publica `start_date` y `end_date` | No solicitar un cambio de contrato para estos dos filtros; falta conectarlos a la UI. |
| Todos los datos visibles del dashboard | `FinancialMovement[]` alimenta los KPI y los dos gráficos actuales | Calcular todos esos elementos desde la misma respuesta filtrada. |

## Casos límite confirmados o no documentados

- Confirmado: `start_date` y `end_date` son opcionales.
- Confirmado: las fechas usan el formato OpenAPI `date`, representado como `YYYY-MM-DD`.
- Confirmado: un valor que no cumple el contrato puede producir `422`.
- No documentado: `/docs` no establece que `start_date` deba ser menor o igual que `end_date`.
- No documentado: `/docs` no indica que la API rechace fechas fuera de `min_date` y `max_date`.
- Requisito de producto, no garantía de `/docs`: mostrar todos los datos cuando ambos inputs estén vacíos.

## Contraste con el frontend existente

- `App.tsx` define `API_BASE_URL` como `import.meta.env.VITE_API_BASE_URL ?? ""` y solicita actualmente `${API_BASE_URL}/api/metrics`. La llamada filtrada debe conservar esa resolución de la URL base.
- `fetchFinancialData` comprueba `response.ok`, lanza un error que incluye `response.status` y devuelve `response.json()` como `Promise<FinancialMovement[]>`.
- La carga actual no incluye parámetros query. No existe en `frontend/src` un patrón previo con `URLSearchParams`; construir y omitir parámetros vacíos será comportamiento nuevo.
- Una única respuesta de `/api/metrics` alimenta `computeKPIs` y `computeMonthlyData`. Volver a ejecutar esa misma carga con `start_date` y `end_date` actualizará los KPI y los dos gráficos actuales a partir del mismo conjunto filtrado.
- La petición se ejecuta una sola vez en un `useEffect` sin dependencias. Para reaccionar a cambios de fechas habrá que ampliar ese ciclo de carga; el repositorio no contiene un patrón existente de recarga por filtros.
- El frontend ya mantiene estados `loading` y `error`. Los KPI y gráficos aceptan `loading` y muestran esqueletos; el error se presenta como un aviso global.
- No existe un patrón de reintento, cancelación con `AbortController` ni descarte de respuestas obsoletas.
- `DashboardHeader` recibe actualmente un período fijo. La spec no presupone cómo debe transformarse ese texto al activar un rango.
