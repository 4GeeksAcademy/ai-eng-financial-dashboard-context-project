# Plan de implementación — Vista comparativa B2B vs B2C

Referencia: [spec.md](spec.md) (requisitos EARS RF1–RF8, RNF1–RNF2).

## Alcance de este plan

Solo frontend. Los endpoints `GET /api/metrics/categories/top`, `GET /api/metrics/b2b`, `GET /api/metrics/b2c` y `GET /api/metrics/facets` ya existen y no requieren cambios. No se añade ninguna librería de enrutamiento (ver decisión de diseño en el spec).

## Pasos

### Paso 1 — Tipo `TopCategoryItem`

- **Archivo**: [frontend/src/lib/financial-types.ts](../../../frontend/src/lib/financial-types.ts).
- **Acción**: crear `interface TopCategoryItem` con `category: Category`, `operation_type: OperationType`, `total_amount: number`, reflejando el modelo Pydantic homónimo. Si `MetricsFacets` de la Funcionalidad 1 no existe aún en este archivo, agregarla también (se reutiliza aquí para el rango de fechas y la lista global de categorías).
- **Por qué**: tipar la respuesta de `GET /api/metrics/categories/top`.
- **Cómo verificar que quedó bien**: el tipo compila y puede importarse en los componentes del Paso 2.
- **Depende de**: ningún paso previo.

### Paso 2 — Componente `TopCategoriesTable` (reutilizable por línea de negocio)

- **Archivo nuevo**: `frontend/src/components/dashboard/top-categories-table.tsx`.
- **Acción**:
  1. Definir `interface TopCategoriesTableProps` con `title: string` (p. ej. "B2B" / "B2C"), `items: TopCategoryItem[]`, `groupTotal: number`, `loading?: boolean`.
  2. Exportar `export function TopCategoriesTable(props: TopCategoriesTableProps)`.
  3. Si `loading`, mostrar `Skeleton` (reutilizar `components/ui/skeleton.tsx`).
  4. Si `items.length === 0` (y no está cargando), mostrar un estado vacío explícito (RF8).
  5. Si hay datos, renderizar tabla con columnas: categoría, total de ingresos (`formatCurrency`), porcentaje (`formatPercent(item.total_amount / groupTotal)`, protegiendo división por cero cuando `groupTotal === 0`).
- **Por qué**: evita duplicar la tabla para B2B y B2C; el porcentaje usa `groupTotal` (ingreso real del grupo) en vez de la suma de filas visibles, cumpliendo RNF2.
- **Cómo verificar que quedó bien**: el componente compila, pasa `npm run lint`, y con datos mock produce porcentajes coherentes que no superan el 100% combinado más allá de lo esperado.
- **Depende de**: Paso 1.

### Paso 3 — Componente `BusinessComparisonChart`

- **Archivo nuevo**: `frontend/src/components/dashboard/business-comparison-chart.tsx`.
- **Acción**: crear un gráfico (Recharts, mismo patrón que `income-outcome-chart.tsx`) que reciba `{ b2bTotal: number; b2cTotal: number; loading?: boolean }` y muestre una comparación visual simple (por ejemplo, gráfico de barras con dos categorías: "B2B" y "B2C"). Incluir manejo de `loading` (Skeleton) igual que el resto de gráficos del dashboard.
- **Por qué**: satisface RF3 (comparación visual del ingreso total) de forma independiente de las tablas de categorías.
- **Cómo verificar que quedó bien**: el gráfico renderiza dos barras/puntos con los valores de ingreso total de cada grupo.
- **Depende de**: ningún paso previo (puede hacerse en paralelo con el Paso 2).

### Paso 4 — Componente contenedor `BusinessComparisonView`

- **Archivo nuevo**: `frontend/src/components/dashboard/business-comparison-view.tsx`.
- **Acción**:
  1. Definir props: `startDate?: string`, `endDate?: string`.
  2. Dentro del componente, hacer fetch a `GET /api/metrics/categories/top` (una vez por `business_type`, con `operation_type=income&limit=5`) y a `GET /api/metrics/b2b`/`GET /api/metrics/b2c` (con `operation_type=income`) para obtener los movimientos y calcular `groupTotal` (suma de `amount`), incluyendo `start_date`/`end_date` solo si están definidos (RF4, RF5).
  3. Gestionar `loading`/`error` por sección, de forma que si falla una solicitud no se rompa la sección que sí cargó (RF7).
  4. Renderizar dos `<TopCategoriesTable />` en paralelo (grid de 2 columnas, similar al patrón de `xl:grid-cols-2` usado en `App.tsx`) y `<BusinessComparisonChart />` debajo.
- **Por qué**: encapsula toda la lógica de datos de la vista comparativa fuera de `App.tsx`, siguiendo la separación de capas del proyecto.
- **Cómo verificar que quedó bien**: al renderizar el componente con `startDate`/`endDate` de prueba, ambas tablas y el gráfico muestran datos coherentes entre sí.
- **Depende de**: Pasos 1, 2 y 3.

### Paso 5 — Integración del control de navegación en `App.tsx`

- **Archivo**: [frontend/src/App.tsx](../../../frontend/src/App.tsx).
- **Acción**:
  1. Agregar estado `const [view, setView] = useState<"overview" | "comparison">("overview")`.
  2. Renderizar un control simple (p. ej. dos botones o un `Tabs` básico) para alternar `view`, visible siempre (RF1).
  3. Cuando `view === "comparison"`, renderizar `<BusinessComparisonView startDate={startDate} endDate={endDate} />` en vez de (o debajo de) las secciones actuales de KPIs/gráficos, reutilizando los mismos `startDate`/`endDate` de la Funcionalidad 1.
- **Por qué**: conecta la nueva vista con el estado de filtro de fechas ya existente, sin añadir un router.
- **Cómo verificar que quedó bien**: alternar entre vistas funciona sin recargar la página; el rango de fechas activo se respeta al cambiar de vista.
- **Depende de**: Paso 4, y del estado `startDate`/`endDate` ya integrado por la Funcionalidad 1.

### Paso 6 — Verificación manual funcional

- **Acción**: con el proyecto levantado, probar:
  1. El control de navegación a la vista comparativa es visible y funcional.
  2. La vista comparativa muestra ambas tablas (B2B, B2C) y el gráfico comparativo con datos coherentes.
  3. Aplicar un rango de fechas (Funcionalidad 1) y verificar que ambas tablas y el gráfico se acotan igual.
  4. Simular (o encontrar) un rango sin ingresos para un grupo y verificar el estado vacío sin romper la vista.
  5. Verificar que los porcentajes de cada tabla reflejan el ingreso real del grupo, no solo la suma de las filas mostradas.
- **Por qué**: confirma de extremo a extremo el cumplimiento de RF1–RF8.
- **Depende de**: Paso 5.

### Paso 7 — Lint y tests

- **Acción**: ejecutar `npm run lint` y `npm run test` en `frontend/`, confirmando que pasan sin errores nuevos. No se requieren cambios ni tests en `backend/`.
- **Por qué**: regla del proyecto de no mergear cambios que rompan lint o tests existentes.
- **Depende de**: Pasos 2, 3, 4 y 5.

## Archivos a modificar/crear (resumen)

- `frontend/src/lib/financial-types.ts` — añadir `TopCategoryItem` (y `MetricsFacets` si no existe aún).
- `frontend/src/components/dashboard/top-categories-table.tsx` — nuevo componente.
- `frontend/src/components/dashboard/business-comparison-chart.tsx` — nuevo componente.
- `frontend/src/components/dashboard/business-comparison-view.tsx` — nuevo componente contenedor.
- `frontend/src/App.tsx` — estado de vista (`overview`/`comparison`) y control de navegación.

## Fuera de alcance

Añadir una librería de enrutamiento, comparar `outcome`/`net` entre grupos, cambios de backend, persistencia de la vista activa en URL/`localStorage` (ver `spec.md`, sección "Fuera de alcance").
