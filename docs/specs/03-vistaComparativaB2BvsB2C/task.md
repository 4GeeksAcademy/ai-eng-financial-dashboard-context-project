# Tasks — Vista comparativa B2B vs B2C

Desglose ejecutable de [plan.md](plan.md), derivado de [spec.md](spec.md). Cada tarea referencia el requisito EARS que satisface y el paso del plan del que depende. Las tareas marcadas `[P]` pueden ejecutarse en paralelo (no comparten archivo ni dependencia directa).

## Fase 1 — Tipos base

- [ ] **T001 [P]** Definir `interface TopCategoryItem` en [frontend/src/lib/financial-types.ts](../../../frontend/src/lib/financial-types.ts) con `category`, `operation_type`, `total_amount`.
  - Plan: Paso 1. Depende de: —.
- [ ] **T002 [P]** Confirmar/agregar `interface MetricsFacets` en el mismo archivo si no existe aún (reutilizada de la Funcionalidad 1).
  - Plan: Paso 1. Depende de: —.

## Fase 2 — Componentes de presentación

- [ ] **T003** Crear `frontend/src/components/dashboard/top-categories-table.tsx` con `interface TopCategoriesTableProps` (`title`, `items`, `groupTotal`, `loading?`) y `export function TopCategoriesTable(...)`.
  - Satisface: RF2. Plan: Paso 2. Depende de: T001.
- [ ] **T004** Mostrar `Skeleton` cuando `loading` sea `true` en `TopCategoriesTable`.
  - Satisface: RF6. Plan: Paso 2. Depende de: T003.
- [ ] **T005** Mostrar estado vacío explícito cuando `items.length === 0` y no esté cargando.
  - Satisface: RF8. Plan: Paso 2. Depende de: T003.
- [ ] **T006** Renderizar la tabla (categoría, total con `formatCurrency`, porcentaje con `formatPercent(item.total_amount / groupTotal)`), protegiendo división por cero.
  - Satisface: RF2, RNF1, RNF2. Plan: Paso 2. Depende de: T003.
- [ ] **T007 [P]** Crear `frontend/src/components/dashboard/business-comparison-chart.tsx` que reciba `{ b2bTotal, b2cTotal, loading? }` y renderice un gráfico comparativo (Recharts) con manejo de `loading`.
  - Satisface: RF3, RF6. Plan: Paso 3. Depende de: —.

## Fase 3 — Contenedor de datos de la vista

- [ ] **T008** Crear `frontend/src/components/dashboard/business-comparison-view.tsx` con props `startDate?`, `endDate?`.
  - Plan: Paso 4. Depende de: T001, T003, T007.
- [ ] **T009** Implementar el fetch a `GET /api/metrics/categories/top` (por `business_type`, `operation_type=income&limit=5`) y a `GET /api/metrics/b2b`/`GET /api/metrics/b2c` (`operation_type=income`) para calcular `groupTotal`, incluyendo `start_date`/`end_date` solo si están definidos.
  - Satisface: RF4, RF5. Plan: Paso 4. Depende de: T008.
- [ ] **T010** Gestionar `loading`/`error` por sección, evitando que el fallo de una solicitud rompa la sección que sí cargó.
  - Satisface: RF6, RF7. Plan: Paso 4. Depende de: T009.
- [ ] **T011** Renderizar las dos `<TopCategoriesTable />` en paralelo y `<BusinessComparisonChart />` debajo, pasando los datos calculados.
  - Satisface: RF2, RF3. Plan: Paso 4. Depende de: T003, T007, T009, T010.

## Fase 4 — Integración en `App.tsx`

- [ ] **T012** Agregar estado `view: "overview" | "comparison"` en [frontend/src/App.tsx](../../../frontend/src/App.tsx).
  - Plan: Paso 5. Depende de: —.
- [ ] **T013** Renderizar un control de navegación (botones/tabs) siempre visible para alternar `view`.
  - Satisface: RF1. Plan: Paso 5. Depende de: T012.
- [ ] **T014** Cuando `view === "comparison"`, renderizar `<BusinessComparisonView startDate={startDate} endDate={endDate} />` reutilizando el estado de fechas de la Funcionalidad 1.
  - Satisface: RF1, RF5. Plan: Paso 5. Depende de: T008–T011, T012, T013.

## Fase 5 — Verificación

- [ ] **T015** Verificación manual: el control de navegación es visible y funcional.
  - Satisface: RF1. Plan: Paso 6. Depende de: T014.
- [ ] **T016** Verificación manual: la vista comparativa muestra ambas tablas y el gráfico con datos coherentes.
  - Satisface: RF2, RF3. Plan: Paso 6. Depende de: T014.
- [ ] **T017** Verificación manual: aplicar un rango de fechas acota ambas tablas y el gráfico por igual.
  - Satisface: RF5. Plan: Paso 6. Depende de: T014.
- [ ] **T018** Verificación manual: un grupo sin ingresos en el rango muestra estado vacío sin romper la vista.
  - Satisface: RF8. Plan: Paso 6. Depende de: T005, T014.
- [ ] **T019** Verificación manual: los porcentajes de cada tabla usan el total real del grupo, no la suma de filas visibles.
  - Satisface: RNF2. Plan: Paso 6. Depende de: T006, T014.
- [ ] **T020** Ejecutar `npm run lint` y `npm run test` en `frontend/`, confirmando que pasan sin errores nuevos.
  - Plan: Paso 7. Depende de: T003, T007, T008, T014.

## Fuera de alcance

No se generan tareas para añadir una librería de enrutamiento, comparar `outcome`/`net` entre grupos, cambios de backend, ni persistencia de la vista activa en URL/`localStorage`, según [spec.md](spec.md).
