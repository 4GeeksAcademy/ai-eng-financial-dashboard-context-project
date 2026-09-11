# Tasks — Tabla de alertas de anomalías

Desglose ejecutable de [plan.md](plan.md), derivado de [spec.md](spec.md). Cada tarea referencia el requisito EARS que satisface y el paso del plan del que depende. Las tareas marcadas `[P]` pueden ejecutarse en paralelo (no comparten archivo ni dependencia directa).

## Fase 1 — Backend: media móvil de 3 períodos

- [ ] **T001** Modificar `detect_outcome_alerts` en [backend/app/routes.py](../../../backend/app/routes.py) para calcular `baseline` con `historical_outcomes[-3:]` en vez del acumulado completo.
  - Satisface: RNF2. Plan: Paso 1. Depende de: —.
- [ ] **T002** Añadir test en [backend/tests/test_routes.py](../../../backend/tests/test_routes.py) que verifique `baseline_average` con más de 3 períodos previos (caso feliz) y con menos de 3 anteriores (caso borde, sin alerta).
  - Satisface: RNF2. Plan: Paso 2. Depende de: T001.

## Fase 2 — Tipos y componente de frontend

- [ ] **T003 [P]** Definir `interface MetricsAlert` en [frontend/src/lib/financial-types.ts](../../../frontend/src/lib/financial-types.ts) con `period`, `outcome_total`, `baseline_average`, `increase_ratio`.
  - Plan: Paso 3. Depende de: —.
- [ ] **T004** Crear `frontend/src/components/dashboard/alert-table.tsx` con `interface AlertTableProps` (`alerts`, `threshold`, `onThresholdChange`, `loading?`) y `export function AlertTable(...)`.
  - Satisface: RF1, RF2. Plan: Paso 4. Depende de: T003.
- [ ] **T005** Renderizar el input numérico de umbral (`min=0.01`, `max=1`, `step=0.01`) con el valor actual de `threshold`.
  - Satisface: RF2. Plan: Paso 4. Depende de: T004.
- [ ] **T006** Validar en el `onChange` del umbral que el valor esté en `[0.01, 1.0]`; si no, mostrar mensaje de validación y no propagar el cambio.
  - Satisface: RF6. Plan: Paso 4. Depende de: T005.
- [ ] **T007** Mostrar `Skeleton` cuando `loading` sea `true`.
  - Satisface: RF8. Plan: Paso 4. Depende de: T004.
- [ ] **T008** Mostrar mensaje explícito de estado vacío cuando `alerts.length === 0` y no esté cargando.
  - Satisface: RF5. Plan: Paso 4. Depende de: T004.
- [ ] **T009** Renderizar la tabla con columnas período / outcome registrado / media móvil 3 períodos / incremento porcentual, usando `formatCurrency`/`formatPercent`.
  - Satisface: RF1, RNF1. Plan: Paso 4. Depende de: T004.

## Fase 3 — Integración en la aplicación

- [ ] **T010** En [frontend/src/App.tsx](../../../frontend/src/App.tsx), agregar estados `threshold` (default `0.3`) y `alerts` (`MetricsAlert[]`).
  - Plan: Paso 5. Depende de: T003.
- [ ] **T011** Crear `fetchAlerts(threshold, startDate, endDate)` que construya la URL de `GET /api/metrics/alerts` con `URLSearchParams`, incluyendo `threshold` siempre y `start_date`/`end_date` solo si están definidos.
  - Satisface: RF3, RF4. Plan: Paso 5. Depende de: T010.
- [ ] **T012** Agregar `useEffect` que invoque `fetchAlerts` cuando cambien `threshold`, `startDate` o `endDate`, gestionando `loading`/`error` de la tabla.
  - Satisface: RF3, RF4, RF7, RF8. Plan: Paso 5. Depende de: T011.
- [ ] **T013** Renderizar `<AlertTable />` debajo de las secciones de gráficos, pasando `alerts`, `threshold`, `onThresholdChange={setThreshold}`, `loading`.
  - Satisface: RF1, RF2. Plan: Paso 5. Depende de: T004–T009, T010–T012.

## Fase 4 — Verificación

- [ ] **T014** Verificación manual: al cargar el dashboard, la tabla aparece bajo los gráficos con umbral por defecto `0.3`.
  - Satisface: RF1, RF2. Plan: Paso 6. Depende de: T013.
- [ ] **T015** Verificación manual: cambiar el umbral modifica el número de alertas mostradas.
  - Satisface: RF3. Plan: Paso 6. Depende de: T013.
- [ ] **T016** Verificación manual: un umbral sin alertas muestra el mensaje de estado vacío (la tabla no desaparece).
  - Satisface: RF5. Plan: Paso 6. Depende de: T013.
- [ ] **T017** Verificación manual: definir un rango de fechas (Funcionalidad 1) recalcula la tabla solo con ese rango.
  - Satisface: RF4. Plan: Paso 6. Depende de: T013.
- [ ] **T018** Verificación manual: un umbral fuera de `0.01`–`1.0` bloquea el envío y muestra el mensaje de validación.
  - Satisface: RF6. Plan: Paso 6. Depende de: T006, T013.
- [ ] **T019** Ejecutar `pytest` en `backend/` y `npm run lint` + `npm run test` en `frontend/`, confirmando que pasan sin errores nuevos.
  - Plan: Paso 7. Depende de: T002, T009, T013.

## Fuera de alcance

No se generan tareas para control de UI de `group_by`/`business_type`, persistencia del umbral en URL/`localStorage`, ni notificaciones fuera de la tabla, según [spec.md](spec.md).
