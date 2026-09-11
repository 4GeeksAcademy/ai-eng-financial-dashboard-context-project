# Frontend API Specs

Este documento resume los contratos que debe consumir el frontend para las tres funcionalidades conectadas al dashboard. Las rutas y reglas provienen de las specs verificadas en `docs/specs` y los tipos TypeScript viven en [`api-types.ts`](api-types.ts).

## Tipos compartidos

```ts
type OperationType = 'income' | 'outcome'
type Category = 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'
type BusinessType = 'B2B' | 'B2C'
type GroupBy = 'day' | 'week' | 'month'
type DateString = string // YYYY-MM-DD
type PeriodString = string
type RatioDecimal = number // 0.3 = 30%
```

## 1. Filtro de rango de fechas

Fuente funcional: [`../../docs/specs/01-filtroRangoFechas/spec.md`](../../docs/specs/01-filtroRangoFechas/spec.md).

### Endpoints consumidos

| Endpoint | Uso |
|----------|-----|
| `GET /api/metrics/facets` | Obtiene opciones globales y rango disponible del dataset. |
| `GET /api/metrics` | Obtiene movimientos financieros filtrados por rango de fechas para recalcular KPIs y gráficos. |

### Tipos de petición y respuesta

```ts
interface DateRangeFilter {
  start_date?: DateString
  end_date?: DateString
}

interface FacetsResponse {
  operation_types: OperationType[]
  business_types: BusinessType[]
  categories: Category[]
  min_date: DateString
  max_date: DateString
}
```

`GET /api/metrics` devuelve `FinancialMovement[]`. El tipo operativo ya existe en `src/lib/financial-types.ts`; para esta funcionalidad solo se necesita construir la query con `DateRangeFilter`.

### Parámetros válidos y restricciones

| Parámetro | Endpoint | Requerido | Valores válidos | Restricciones UI/API |
|-----------|----------|-----------|------------------|----------------------|
| `start_date` | `/api/metrics` | No | Fecha `YYYY-MM-DD` | Debe omitirse si no está definido. FastAPI rechaza formatos inválidos con `422`. |
| `end_date` | `/api/metrics` | No | Fecha `YYYY-MM-DD` | Debe omitirse si no está definido. Se permite enviar una fecha anterior a `start_date`; la UI no debe bloquearlo. |

### Casos límite esperados

| Caso límite | Comportamiento UI esperado |
|-------------|----------------------------|
| Ambos campos vacíos | Solicitar `/api/metrics` sin `start_date` ni `end_date`; mostrar todos los datos disponibles. |
| Solo una fecha definida | Enviar únicamente el parámetro definido; recalcular KPIs y gráficos con la respuesta. |
| `end_date` anterior a `start_date` | Enviar la solicitud igualmente; si la API devuelve lista vacía, mostrar KPIs en cero y gráficos vacíos sin error. |
| Valor de fecha inválido | No enviar la solicitud; mostrar indicación visual junto al campo afectado y conservar los datos actuales. |

## 2. Tabla de alertas de anomalías

Fuente funcional: [`../../docs/specs/02-tablaAlertaAnomalia/spec.md`](../../docs/specs/02-tablaAlertaAnomalia/spec.md).

### Endpoints consumidos

| Endpoint | Uso |
|----------|-----|
| `GET /api/metrics/alerts` | Obtiene períodos cuyo gasto supera el umbral configurado respecto a `baseline_average`. |

### Tipos de petición y respuesta

```ts
interface AlertsParams extends DateRangeFilter {
  threshold: RatioDecimal
  group_by?: GroupBy
  business_type?: BusinessType
}

interface AlertEntry {
  period: PeriodString
  outcome_total: number
  baseline_average: number
  increase_ratio: RatioDecimal
}

type AlertResponse = AlertEntry[]
```

### Parámetros válidos y restricciones

| Parámetro | Requerido | Valores válidos | Restricciones UI/API |
|-----------|-----------|------------------|----------------------|
| `threshold` | Sí en frontend | Ratio decimal; default `0.3` | La UI debe restringir `0.01` a `1.0`. La API actual solo garantiza `threshold >= 0`. |
| `group_by` | No | `day`, `week`, `month` | La UI de esta funcionalidad lo omite y usa el default backend `month`. |
| `start_date` | No | Fecha `YYYY-MM-DD` | Debe reutilizar el rango activo del dashboard y omitirse si no está definido. |
| `end_date` | No | Fecha `YYYY-MM-DD` | Debe reutilizar el rango activo del dashboard y omitirse si no está definido. |
| `business_type` | No | `B2B`, `B2C` | Existe en API, pero queda fuera del control UI de esta funcionalidad. |

`threshold` e `increase_ratio` son ratios decimales: `0.3` equivale a `30%`. La UI debe formatear `increase_ratio` como porcentaje y `outcome_total`/`baseline_average` como moneda.

### Casos límite esperados

| Caso límite | Comportamiento UI esperado |
|-------------|----------------------------|
| La API devuelve `[]` | Mantener visible el área de tabla y mostrar un estado vacío explícito. |
| `threshold` fuera de `0.01` a `1.0` o no numérico | No propagar el cambio ni solicitar la API; mostrar mensaje de validación y conservar la última tabla válida. |
| Solicitud en curso | Mostrar skeleton en el área de la tabla. |
| Error de `/api/metrics/alerts` | Mostrar el mensaje genérico de error del dashboard sin romper el resto de la pantalla. |

## 3. Vista comparativa B2B vs B2C

Fuente funcional: [`../../docs/specs/03-vistaComparativaB2BvsB2C/spec.md`](../../docs/specs/03-vistaComparativaB2BvsB2C/spec.md).

### Endpoints consumidos

| Endpoint | Uso |
|----------|-----|
| `GET /api/metrics/categories/top` | Obtiene las categorías principales por línea de negocio. Se llama una vez para `B2B` y otra para `B2C`. |
| `GET /api/metrics/b2b` | Obtiene movimientos B2B de ingreso para calcular el total real del grupo. |
| `GET /api/metrics/b2c` | Obtiene movimientos B2C de ingreso para calcular el total real del grupo. |
| `GET /api/metrics/facets` | Reutiliza el rango disponible y categorías globales ya cargadas por el filtro de fechas. |

### Tipos de petición y respuesta

```ts
interface TopCategoriesParams extends DateRangeFilter {
  operation_type: OperationType
  limit?: number
  business_type?: BusinessType
}

interface CategoryEntry {
  category: Category
  operation_type: OperationType
  total_amount: number
}

type TopCategoriesResponse = CategoryEntry[]
```

Los totales B2B/B2C para el gráfico comparativo se derivan de `FinancialMovement[]`, sumando `amount` de movimientos devueltos por `/api/metrics/b2b` y `/api/metrics/b2c` con `operation_type=income`.

### Parámetros válidos y restricciones

| Parámetro | Endpoint | Requerido | Valores válidos | Restricciones UI/API |
|-----------|----------|-----------|------------------|----------------------|
| `operation_type` | `/api/metrics/categories/top`, `/api/metrics/b2b`, `/api/metrics/b2c` | Sí en frontend | `income` | Aunque la API permite `outcome`, esta vista solo compara ingresos. |
| `limit` | `/api/metrics/categories/top` | No | Entero `1` a `20` | Usar `5` para cumplir la funcionalidad top-5. |
| `business_type` | `/api/metrics/categories/top` | Sí en frontend | `B2B`, `B2C` | Llamar el endpoint una vez por cada línea de negocio. |
| `start_date` | Todos | No | Fecha `YYYY-MM-DD` | Reutilizar el rango activo y omitir si no está definido. |
| `end_date` | Todos | No | Fecha `YYYY-MM-DD` | Reutilizar el rango activo y omitir si no está definido. |

La API no devuelve el porcentaje sobre el total del grupo. La UI debe derivarlo como `category.total_amount / groupIncomeTotal` y formatearlo con `formatPercent`.

### Casos límite esperados

| Caso límite | Comportamiento UI esperado |
|-------------|----------------------------|
| Una línea de negocio no tiene ingresos en el rango | Mostrar estado vacío en su tabla y usar total `0` en el gráfico comparativo. |
| `groupIncomeTotal` es `0` | Mostrar porcentajes como `0%` o estado vacío, evitando divisiones por cero. |
| Una solicitud falla y otra responde | Mostrar mensaje genérico de error sin romper la sección que sí pudo cargarse. |
| Solicitudes en curso | Mostrar skeletons en tablas y gráfico comparativo. |