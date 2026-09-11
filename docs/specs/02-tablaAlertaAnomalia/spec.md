# Spec 02 — Tabla de alertas de anomalías en el dashboard principal

## 1. Resumen

Añadir, bajo los gráficos existentes del dashboard, una tabla que destaque los períodos con incremento inesperado del gasto (`outcome`), con un umbral de alerta configurable por el usuario. La tabla debe respetar el rango de fechas activo definido en la Funcionalidad 1 ([01-filtroRangoFechas](../01-filtroRangoFechas/spec.md)).

## 2. Contexto

- El backend ([backend/app/routes.py](../../../backend/app/routes.py)) ya expone `GET /api/metrics/alerts`, con params `threshold` (default `0.3`), `group_by` (default `"month"`), `start_date`, `end_date`, `business_type`, y devuelve `MetricsAlert[]` (`period`, `outcome_total`, `baseline_average`, `increase_ratio`).
- **Discrepancia a resolver (requiere cambio de backend)**: `detect_outcome_alerts` calcula hoy `baseline_average` como el promedio de **todos** los períodos anteriores (acumulado), no como la media móvil de los **3 períodos anteriores** que pide esta funcionalidad. Es necesario ajustar esa función para que la media base se calcule sobre una ventana fija de los últimos 3 períodos previos al actual (y omitir períodos que no tengan al menos 3 anteriores disponibles, o documentar el criterio elegido).
- El frontend hoy no consume `/api/metrics/alerts` en ninguna vista.

### Normalización de wording PM ↔ API

Para evitar ambigüedades entre el lenguaje funcional y el contrato real de la API, la UI debe mapear los campos de la siguiente forma:

| Wording PM/UI | Campo API | Semántica |
|---------------|-----------|-----------|
| Período | `period` | Identificador del período agregado según `group_by` (`YYYY-MM`, `YYYY-Www` o `YYYY-MM-DD`). |
| Outcome registrado / gasto registrado | `outcome_total` | Total de gastos (`outcome`) registrados en el período. |
| Media móvil de los 3 períodos anteriores | `baseline_average` | Promedio base contra el que se compara el gasto del período. La especificación funcional exige que represente la media de los 3 períodos inmediatamente anteriores. |
| Incremento porcentual | `increase_ratio` | Ratio decimal del incremento respecto a la base. Ejemplo: `0.3` representa `30%`. |
| Umbral de alerta | `threshold` | Ratio decimal usado para decidir si un incremento es anomalía. Ejemplo: `0.3` representa `30%`. |

La UI puede mostrar `increase_ratio` y `threshold` como porcentajes, pero al comunicarse con la API debe tratarlos como ratios decimales.

## 3. Alcance

**Incluye:**
- Ajuste en `detect_outcome_alerts` (backend) para calcular `baseline_average` como media móvil de los 3 períodos anteriores.
- Tabla de alertas bajo los gráficos, con columnas: período (`period`), gasto registrado (`outcome_total`), media móvil de 3 períodos (`baseline_average`) e incremento porcentual mostrado a partir de `increase_ratio`.
- Input numérico de umbral (`threshold`), rango `0.01`–`1.0`, valor por defecto `0.3`.
- Mensaje explícito de estado vacío cuando no hay anomalías para el umbral actual.
- La tabla usa el mismo `start_date`/`end_date` activo de la Funcionalidad 1.

**Fuera de alcance:**
- Control de UI para `group_by` (se usa `"month"` fijo, igual que el resto del dashboard) o `business_type`.
- Persistencia del umbral en URL o `localStorage`.
- Notificaciones o alertas fuera de la tabla (push, email, etc.).

## 4. Requisitos funcionales (notación EARS)

| ID | Tipo | Requisito |
|----|------|-----------|
| RF1 | Ubicuo | El dashboard SIEMPRE DEBE mostrar, bajo los gráficos existentes, una tabla de alertas con las columnas: período, outcome registrado, media móvil de los 3 períodos anteriores e incremento porcentual. |
| RF2 | Ubicuo | El dashboard SIEMPRE DEBE mostrar un input numérico de umbral con valor por defecto `0.3`, restringido al rango `0.01`–`1.0`. |
| RF3 | Evento | CUANDO el dashboard se monta o cambia el umbral, el rango de fechas activo, EL SISTEMA DEBE solicitar `GET /api/metrics/alerts` con `threshold` y, si están definidos, `start_date`/`end_date`. |
| RF4 | Estado | MIENTRAS exista un rango de fechas activo (Funcionalidad 1), EL SISTEMA DEBE incluir esos mismos `start_date`/`end_date` en la solicitud de alertas. |
| RF5 | Comportamiento no deseado | SI la respuesta de `/api/metrics/alerts` no contiene elementos, ENTONCES EL SISTEMA DEBE mostrar un mensaje explícito de estado vacío en el lugar de la tabla (no ocultarla ni dejarla en blanco). |
| RF6 | Comportamiento no deseado | SI el usuario introduce un valor de umbral fuera del rango `0.01`–`1.0` o no numérico, ENTONCES EL SISTEMA DEBE impedir el envío de la solicitud con ese valor y mostrar un mensaje de validación junto al input, conservando la última tabla válida mostrada. |
| RF7 | Comportamiento no deseado | SI la solicitud a `/api/metrics/alerts` falla, ENTONCES EL SISTEMA DEBE mostrar el mensaje de error genérico ya usado en el resto del dashboard. |
| RF8 | Estado | MIENTRAS la solicitud de alertas esté en curso, EL SISTEMA DEBE mostrar un estado de carga (skeleton) en el área de la tabla. |

## 5. Requisitos no funcionales

| ID | Tipo | Requisito |
|----|------|-----------|
| RNF1 | Ubicuo | El sistema SIEMPRE DEBE formatear `outcome_total`/`baseline_average` como moneda e `increase_ratio` como porcentaje, reutilizando `formatCurrency`/`formatPercent` de `financial-utils.ts`. |
| RNF2 | Ubicuo | El backend SIEMPRE DEBE devolver `baseline_average` calculado sobre una ventana fija de 3 períodos anteriores, de forma determinista (sin aleatoriedad adicional). |

## 6. Contrato de API

- `GET /api/metrics/alerts?threshold=<ratio_decimal>&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` → `MetricsAlert[] { period, outcome_total, baseline_average, increase_ratio }`.
- `threshold` se expresa como ratio decimal: `0.3` equivale a `30%`.
- La UI debe restringir `threshold` al rango funcional `0.01`–`1.0`. El contrato backend actual solo garantiza validación mínima `threshold >= 0`, por lo que la validación estricta del rango funcional pertenece a la UI salvo que se modifique explícitamente el backend.
- `increase_ratio` también se expresa como ratio decimal y debe formatearse como porcentaje en la UI.
- `group_by` se omite en la UI (se usa el valor por defecto `"month"` del backend).
- Cambio de backend requerido: `detect_outcome_alerts` en [backend/app/routes.py](../../../backend/app/routes.py) debe calcular `baseline_average` con media móvil de los 3 períodos previos en vez de promedio acumulado.

## 7. Diseño técnico (resumen)

- **Backend**: modificar `detect_outcome_alerts` para usar una ventana deslizante de los últimos 3 `outcome` anteriores al período evaluado; añadir/actualizar test en [test_routes.py](../../../backend/tests/test_routes.py) que verifique el cálculo con más de 3 períodos previos.
- **Frontend**: nuevo componente `alert-table.tsx` (`components/dashboard/`) con input de umbral y tabla; `App.tsx` obtiene alertas con `threshold`, `startDate`, `endDate` actuales y gestiona `loading`/`error`/estado vacío igual que el resto del dashboard.

## 8. Plan de pruebas

- **Backend**: test que confirme que `baseline_average` corresponde a la media de los 3 períodos inmediatamente anteriores (no al acumulado histórico).
- **Frontend**: pruebas manuales — cambiar umbral y verificar refetch; definir un umbral que no genere alertas y verificar el mensaje de estado vacío; combinar con un rango de fechas de la Funcionalidad 1 y verificar que la tabla se acota igual que los gráficos; introducir un umbral fuera de rango y verificar el bloqueo de validación.
