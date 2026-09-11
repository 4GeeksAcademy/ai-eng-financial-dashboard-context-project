# Plan de implementación — Tabla de alertas de anomalías

Referencia: [spec.md](spec.md) (requisitos EARS RF1–RF8, RNF1–RNF2).

## Alcance de este plan

Backend + frontend. A diferencia de la Funcionalidad 1, aquí sí se requiere un cambio de backend: `detect_outcome_alerts` debe recalcular `baseline_average` como media móvil de los 3 períodos anteriores.

## Pasos

### Paso 1 — Ajustar `detect_outcome_alerts` (backend)

- **Archivo**: [backend/app/routes.py](../../../backend/app/routes.py).
- **Acción**: modificar `detect_outcome_alerts` para que `baseline` se calcule con los últimos 3 valores de `historical_outcomes` (`historical_outcomes[-3:]`) en vez de con la lista completa acumulada. Los períodos con menos de 3 anteriores disponibles no generan alerta (mantener el comportamiento actual de "sin historial suficiente = sin alerta").
- **Por qué**: cumple RNF2 y el requisito explícito del spec de usar media móvil de 3 períodos, no promedio acumulado.
- **Cómo verificar que quedó bien**: con una secuencia de `outcome` conocida de más de 3 períodos, el `baseline_average` reportado en cada alerta coincide con el promedio de los 3 valores inmediatamente anteriores, no con el promedio de todo el historial previo.
- **Depende de**: ningún paso previo.

### Paso 2 — Test de backend para la media móvil

- **Archivo**: [backend/tests/test_routes.py](../../../backend/tests/test_routes.py).
- **Acción**: añadir un test (`test_<accion>_<resultado_esperado>`) que construya una secuencia de `MetricsSummaryItem` con al menos 4-5 períodos y verifique que `detect_outcome_alerts` calcula `baseline_average` como la media de los 3 períodos previos al evaluado (no del acumulado).
- **Por qué**: regla del proyecto de no aceptar cambios sin test que cubra el caso feliz y un caso borde (aquí, el caso borde es un período con menos de 3 anteriores).
- **Cómo verificar que quedó bien**: `pytest` pasa incluyendo el nuevo test.
- **Depende de**: Paso 1.

### Paso 3 — Tipo `MetricsAlert` en el frontend

- **Archivo**: [frontend/src/lib/financial-types.ts](../../../frontend/src/lib/financial-types.ts).
- **Acción**: crear `interface MetricsAlert` con `period: string`, `outcome_total: number`, `baseline_average: number`, `increase_ratio: number`, reflejando el modelo Pydantic `MetricsAlert`.
- **Por qué**: tipar la respuesta de `GET /api/metrics/alerts` siguiendo la convención de reflejo manual backend→frontend.
- **Cómo verificar que quedó bien**: el tipo compila y puede importarse en el componente del Paso 4 y en `App.tsx`.
- **Depende de**: ningún paso previo (puede hacerse en paralelo con los Pasos 1–2).

### Paso 4 — Componente `AlertTable`

- **Archivo nuevo**: `frontend/src/components/dashboard/alert-table.tsx`.
- **Acción**:
  1. Definir `interface AlertTableProps` con `alerts: MetricsAlert[]`, `threshold: number`, `onThresholdChange: (value: number) => void`, `loading?: boolean`.
  2. Exportar `export function AlertTable(props: AlertTableProps)`.
  3. Renderizar un input numérico de umbral (`type="number"`, `min={0.01}`, `max={1}`, `step={0.01}`) con el valor actual de `threshold`; validar en el `onChange` que el valor esté en `[0.01, 1.0]` antes de invocar `onThresholdChange` (si está fuera de rango, mostrar un mensaje de validación bajo el input y no propagar el cambio).
  4. Si `loading` es `true`, mostrar el `Skeleton` existente en `components/ui/skeleton.tsx`.
  5. Si `alerts.length === 0` (y no está cargando), mostrar un mensaje explícito de estado vacío (ej. "No se detectaron anomalías con el umbral actual").
  6. Si hay alertas, renderizar una tabla con columnas: período, outcome registrado (`formatCurrency`), media móvil 3 períodos (`formatCurrency`), incremento porcentual (`formatPercent`).
- **Por qué**: centraliza la UI de la tabla y el input de umbral en un componente propio, siguiendo la separación de capas del proyecto y reutilizando utilidades de formato existentes.
- **Cómo verificar que quedó bien**: el componente compila y pasa `npm run lint`; se puede probar visualmente con datos mock.
- **Depende de**: Paso 3.

### Paso 5 — Integración en `App.tsx`

- **Archivo**: [frontend/src/App.tsx](../../../frontend/src/App.tsx).
- **Acción**:
  1. Agregar estado `const [threshold, setThreshold] = useState(0.3)` y `const [alerts, setAlerts] = useState<MetricsAlert[]>([])`.
  2. Crear `fetchAlerts(threshold, startDate, endDate)` que llame a `GET /api/metrics/alerts` con `URLSearchParams`, incluyendo `threshold` siempre y `start_date`/`end_date` solo si están definidos (reutilizando el mismo estado de rango de fechas de la Funcionalidad 1).
  3. Agregar un `useEffect` que invoque `fetchAlerts` cuando cambien `threshold`, `startDate` o `endDate`, gestionando `loading`/`error` de forma independiente al fetch de `/api/metrics` (o reutilizando el mismo patrón de estado, según se decida al implementar).
  4. Renderizar `<AlertTable alerts={alerts} threshold={threshold} onThresholdChange={setThreshold} loading={alertsLoading} />` debajo de las secciones de gráficos existentes.
- **Por qué**: conecta el estado de umbral y el rango de fechas activo (Funcionalidad 1) con la solicitud de alertas, cumpliendo RF3 y RF4 sin duplicar la lógica de filtros ya existente.
- **Cómo verificar que quedó bien**: al cambiar el umbral o el rango de fechas, la tabla se actualiza; con un umbral que no genera alertas, se muestra el mensaje de estado vacío.
- **Depende de**: Pasos 3 y 4, y de la integración de fechas de la Funcionalidad 1 (`startDate`/`endDate` ya existentes en `App.tsx`).

### Paso 6 — Verificación manual funcional

- **Acción**: con el proyecto levantado (`docker compose up --build`), probar:
  1. Al cargar el dashboard, la tabla aparece bajo los gráficos con el umbral por defecto `0.3`.
  2. Cambiar el umbral a un valor más bajo aumenta (o mantiene) el número de alertas; a un valor más alto lo reduce.
  3. Con un umbral que no produce alertas, se muestra el mensaje de estado vacío (la tabla no desaparece).
  4. Al definir un rango de fechas (Funcionalidad 1), la tabla de alertas se recalcula solo con ese rango.
  5. Introducir un umbral fuera de `0.01`–`1.0` bloquea el envío y muestra el mensaje de validación.
- **Por qué**: confirma de extremo a extremo el cumplimiento de RF1–RF8.
- **Depende de**: Paso 5.

### Paso 7 — Pruebas automatizadas y lint

- **Acción**: ejecutar `pytest` en `backend/` (incluye el test del Paso 2) y `npm run lint` + `npm run test` en `frontend/`.
- **Por qué**: regla del proyecto de no mergear cambios que rompan lint o tests existentes.
- **Depende de**: Pasos 2, 4 y 5.

## Archivos a modificar/crear (resumen)

- `backend/app/routes.py` — ajuste de `detect_outcome_alerts`.
- `backend/tests/test_routes.py` — test de media móvil de 3 períodos.
- `frontend/src/lib/financial-types.ts` — añadir `MetricsAlert`.
- `frontend/src/components/dashboard/alert-table.tsx` — nuevo componente.
- `frontend/src/App.tsx` — estado de umbral/alertas e integración con el rango de fechas existente.

## Fuera de alcance

Control de UI para `group_by`/`business_type`, persistencia del umbral en URL o `localStorage`, notificaciones fuera de la tabla (ver `spec.md`, sección "Fuera de alcance").
