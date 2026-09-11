# Tasks — Filtro de rango de fechas en el dashboard

Desglose ejecutable de [plan.md](plan.md), derivado de [spec.md](spec.md). Cada tarea referencia el requisito EARS que satisface y los pasos del plan de los que depende. Las tareas marcadas `[P]` pueden ejecutarse en paralelo (no comparten archivo ni dependencia directa).

## Fase 1 — Tipos y utilidades base

- [ ] **T001 [P]** Definir `interface MetricsFacets` en [frontend/src/lib/financial-types.ts](../../../frontend/src/lib/financial-types.ts) con `operation_types`, `business_types`, `categories`, `min_date`, `max_date`.
  - Satisface: RF2, RF3. Plan: Paso 1. Depende de: —.
- [ ] **T002 [P]** Implementar `isValidDateString(value: string): boolean` en [frontend/src/lib/financial-utils.ts](../../../frontend/src/lib/financial-utils.ts).
  - Satisface: RF11. Plan: Paso 2. Depende de: —.
- [ ] **T003** Añadir casos de test para `isValidDateString` en [financial-utils.test.ts](../../../frontend/src/lib/financial-utils.test.ts) (fecha válida, cadena vacía, formato incorrecto, fecha inexistente).
  - Satisface: RF11. Plan: Paso 2 / 6. Depende de: T002.

## Fase 2 — Componente de filtro

- [ ] **T004** Crear `frontend/src/components/dashboard/date-range-filter.tsx` con `interface DateRangeFilterProps` (`startDate?`, `endDate?`, `onStartDateChange`, `onEndDateChange`, `minDate?`, `maxDate?`, `loading?`) y `export function DateRangeFilter(...)`.
  - Satisface: RF1. Plan: Paso 3. Depende de: T001.
- [ ] **T005** Renderizar dos `<input type="date">` ("Desde"/"Hasta") con `min`/`max` desde `minDate`/`maxDate`, y el texto de referencia del rango disponible.
  - Satisface: RF1, RF2. Plan: Paso 3. Depende de: T004.
- [ ] **T006** Integrar validación de formato en el `onChange` de ambos inputs usando `isValidDateString`; si es inválido, mostrar mensaje de error bajo el input y no propagar el cambio; si está vacío, propagar normalmente.
  - Satisface: RF11. Plan: Paso 3. Depende de: T002, T005.

## Fase 3 — Integración en la aplicación

- [ ] **T007** En [frontend/src/App.tsx](../../../frontend/src/App.tsx), agregar estados `startDate`, `endDate` (`string | undefined`) y `facets` (`MetricsFacets | null`).
  - Plan: Paso 4. Depende de: T001.
- [ ] **T008** Crear `fetchFacets()` (`GET /api/metrics/facets`) e invocarla en un `useEffect` con dependencias vacías al montar `App`.
  - Satisface: RF3. Plan: Paso 4. Depende de: T007.
- [ ] **T009** Modificar `fetchFinancialData` para aceptar `startDate`/`endDate` y construir la URL con `URLSearchParams`, incluyendo `start_date`/`end_date` solo si tienen valor.
  - Satisface: RF4, RF5, RF6, RNF1. Plan: Paso 4. Depende de: T007.
- [ ] **T010** Actualizar el `useEffect` que llama a `fetchFinancialData` para que dependa de `startDate`/`endDate`, reutilizando `loading`/`error` existentes.
  - Satisface: RF7, RF8, RF10. Plan: Paso 4. Depende de: T009.
- [ ] **T011** Renderizar `<DateRangeFilter />` junto a `<DashboardHeader />`, pasando `startDate`, `endDate`, `onStartDateChange={setStartDate}`, `onEndDateChange={setEndDate}`, `minDate={facets?.min_date}`, `maxDate={facets?.max_date}`, `loading`.
  - Satisface: RF1, RF2. Plan: Paso 4. Depende de: T004–T006, T007–T010.

## Fase 4 — Verificación

- [ ] **T012** Verificación manual: dashboard sin filtros muestra todos los datos y el rango disponible.
  - Satisface: RF2, RF4. Plan: Paso 5. Depende de: T011.
- [ ] **T013** Verificación manual: definir "Desde"/"Hasta" válidos filtra KPIs y gráficos correctamente.
  - Satisface: RF5. Plan: Paso 5. Depende de: T011.
- [ ] **T014** Verificación manual: limpiar un campo vuelve a incluir los datos de ese lado del rango.
  - Satisface: RF6. Plan: Paso 5. Depende de: T011.
- [ ] **T015** Verificación manual: rango sin resultados no rompe la UI (KPIs en cero, gráficos vacíos).
  - Satisface: RF10. Plan: Paso 5. Depende de: T011.
- [ ] **T016** Verificación manual: valor de fecha inválido bloquea el envío y muestra el error de validación.
  - Satisface: RF11. Plan: Paso 5. Depende de: T006, T011.
- [ ] **T017** Ejecutar `npm run lint` y `npm run test` en `frontend/` y confirmar que pasan sin errores nuevos.
  - Plan: Paso 6. Depende de: T003, T011.

## Fuera de alcance

No se generan tareas de backend ni de persistencia de filtros (URL/localStorage), según lo definido en [spec.md](spec.md).
