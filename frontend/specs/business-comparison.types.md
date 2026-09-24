# Especificación de tipos: comparativa B2B vs B2C

## Tipos existentes reutilizables

```ts
type BusinessType = "B2B" | "B2C"
type Category = "suppliers" | "sales" | "operational" | "administrative" | "others"
type OperationType = "income" | "outcome"
```

Estos tipos ya existen en `frontend/src/lib/financial-types.ts`.

## Contratos de respuesta

```ts
interface TopCategoryItem {
  category: Category
  operation_type: OperationType
  total_amount: number
}

interface MetricsSummaryItem {
  period: string
  income: number
  outcome: number
  net: number
}
```

`TopCategoryItem` refleja `/api/metrics/categories/top`. `MetricsSummaryItem` refleja `/api/metrics/summary`.

## Tipos derivados de vista

```ts
interface ComparisonCategoryRow {
  category: Category
  totalIncome: number
  groupPercentage: number
}

interface BusinessComparisonGroup {
  businessType: BusinessType
  categories: ComparisonCategoryRow[]
  totalIncome: number
}

interface BusinessComparisonState {
  groups: Record<BusinessType, BusinessComparisonGroup>
  status: "idle" | "loading" | "success" | "empty" | "error"
  errorMessage: string | null
}
```

- `groupPercentage` se calcula como `total_amount / group total income * 100`.
- El porcentaje no es un campo de API.
- `totalIncome` se calcula sumando `income` de `/api/metrics/summary` filtrado por `business_type` y `operation_type=income`.

## Filtro

Puede reutilizarse `DateRangeFilter` de la Funcionalidad 1:

```ts
interface BusinessComparisonDateRange {
  startDate: string
  endDate: string
}
```

Los valores de estado vacíos son `""`; los valores enviados usan `YYYY-MM-DD`.

## Facets

```ts
interface MetricsFacets {
  operation_types: OperationType[]
  business_types: BusinessType[]
  categories: Category[]
  min_date: string
  max_date: string
}
```

`facets.categories` es una lista global; no representa categorías separadas por B2B/B2C.

## Evidencia

- ✅ `BusinessType`, `Category` y `OperationType` están definidos en frontend.
- ✅ `TopCategoryItem` contiene `category`, `operation_type` y `total_amount`.
- ✅ `MetricsSummaryItem` contiene `period`, `income`, `outcome` y `net`.
- ✅ Facets contiene `business_types` y `categories`.
- ❌ `categories/top` no devuelve porcentaje ni total de grupo.
- ❌ `facets` no devuelve categorías agrupadas por línea de negocio.
- ❓ No existe un endpoint dedicado que devuelva directamente ambos totales en un único objeto.
