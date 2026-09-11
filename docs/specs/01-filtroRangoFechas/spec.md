# Spec 01 — Filtro de rango de fechas en el dashboard principal

## 1. Resumen

Añadir dos campos de fecha opcionales ("Desde" y "Hasta") en la parte superior del dashboard principal que filtren todos los datos mostrados actualmente en la página (KPIs y gráficos). Junto a los campos se debe mostrar el rango de fechas disponible en el dataset, como referencia para el usuario.

## 2. Contexto

- El backend ([backend/app/routes.py](../../../backend/app/routes.py)) ya expone:
  - `GET /api/metrics/facets` → devuelve `MetricsFacets`, que incluye `min_date` y `max_date` del dataset.
  - `GET /api/metrics` → ya acepta `start_date` y `end_date` como query params opcionales (`date | None`) y filtra vía `filter_movements_by_date`.
- El frontend ([frontend/src/App.tsx](../../../frontend/src/App.tsx)) hoy solo hace `fetch('/api/metrics')` sin ningún parámetro ni control de fechas; [DashboardHeader](../../../frontend/src/components/dashboard/dashboard-header.tsx) no tiene inputs.
- **No se requiere trabajo de backend**: esta funcionalidad consiste en conectar el frontend a endpoints ya existentes.

## 3. Alcance

**Incluye:**
- Dos inputs de fecha ("Desde" / "Hasta") en la parte superior del dashboard, ambos opcionales.
- Texto de referencia con el rango de fechas disponible (`min_date`–`max_date`), obtenido de `/api/metrics/facets`.
- Refetch de `/api/metrics` con los filtros de fecha aplicados, y recálculo de KPIs y datos mensuales (`computeKPIs`, `computeMonthlyData`) a partir del resultado filtrado.

**Fuera de alcance:**
- Filtros por categoría, tipo de operación o `business_type` (ya existen en el backend, no se piden aquí).
- Persistencia del filtro en la URL o en `localStorage`.
- Cambios en el backend (los endpoints necesarios ya existen).

## 4. Requisitos funcionales (notación EARS)

| ID | Tipo | Requisito |
|----|------|-----------|
| RF1 | Ubicuo | El dashboard SIEMPRE DEBE mostrar dos campos de entrada de fecha ("Desde" y "Hasta") en la parte superior de la página. |
| RF2 | Ubicuo | El sistema SIEMPRE DEBE mostrar, cerca de los campos de fecha, el rango de fechas disponible (`min_date`–`max_date`) obtenido de `/api/metrics/facets`. |
| RF3 | Evento | CUANDO el dashboard se monta por primera vez, EL SISTEMA DEBE solicitar `GET /api/metrics/facets` y renderizar `min_date`/`max_date` como referencia. |
| RF4 | Estado | MIENTRAS ambos campos de fecha estén vacíos, EL SISTEMA DEBE solicitar `GET /api/metrics` sin parámetros `start_date`/`end_date`, mostrando todos los datos disponibles. |
| RF5 | Evento | CUANDO el usuario modifica el campo "Desde" y/o "Hasta" con un valor válido, EL SISTEMA DEBE solicitar `GET /api/metrics` incluyendo solo los parámetros de fecha definidos (formato `YYYY-MM-DD`) y recalcular KPIs y datos mensuales con la respuesta. |
| RF6 | Evento | CUANDO el usuario limpia un campo de fecha previamente definido, EL SISTEMA DEBE volver a solicitar los datos omitiendo ese parámetro. |
| RF7 | Estado | MIENTRAS la solicitud de datos filtrados esté en curso, EL SISTEMA DEBE mostrar el estado de carga existente (skeletons en `KPIRow`/gráficos). |
| RF8 | Comportamiento no deseado | SI la solicitud a `/api/metrics` o `/api/metrics/facets` falla, ENTONCES EL SISTEMA DEBE mostrar el mensaje de error genérico ya usado en `App.tsx`, sin romper el resto de la interfaz. |
| RF9 | Comportamiento no deseado | SI el usuario define una fecha "Hasta" anterior a la fecha "Desde", ENTONCES EL SISTEMA DEBE igualmente enviar la solicitud (el backend puede devolver una lista vacía) sin bloquear la interacción ni lanzar un error de validación bloqueante. |
| RF10 | Comportamiento no deseado | SI el rango de fechas filtrado no produce movimientos, ENTONCES EL SISTEMA DEBE mostrar KPIs en cero y gráficos vacíos, reutilizando los estados vacíos/skeleton existentes, sin mostrar un error. |
| RF11 | Comportamiento no deseado | SI el valor introducido en un campo de fecha no tiene un formato de fecha válido (`YYYY-MM-DD`), ENTONCES EL SISTEMA DEBE impedir el envío de la solicitud a la API con ese valor y mostrar una indicación visual de error junto al campo afectado, sin alterar los datos mostrados actualmente. |

## 5. Requisitos no funcionales

| ID | Tipo | Requisito |
|----|------|-----------|
| RNF1 | Ubicuo | El sistema SIEMPRE DEBE enviar las fechas a la API en formato `YYYY-MM-DD`. |
| RNF2 | Ubicuo | El sistema NO DEBE requerir debounce en los inputs de fecha, dado que el evento `onChange` de `<input type="date">` es discreto, no de texto libre. |

## 6. Contrato de API (existente, sin cambios de backend)

- `GET /api/metrics/facets` → `MetricsFacets { operation_types, business_types, categories, min_date, max_date }` (fechas en formato `YYYY-MM-DD`).
- `GET /api/metrics?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` → `FinancialMovement[]` filtrado por `filter_movements_by_date`. Ambos parámetros son opcionales e independientes.

## 7. Diseño técnico (frontend)

- Nuevo componente `frontend/src/components/dashboard/date-range-filter.tsx` (`export function DateRangeFilter`), con props `startDate`, `endDate`, `onStartDateChange`, `onEndDateChange`, `minDate`, `maxDate`, `loading?`.
- [App.tsx](../../../frontend/src/App.tsx): agregar estado `startDate`/`endDate` (`string | undefined`) y `facets` (`MetricsFacets | null`); un `useEffect` para cargar `facets` una sola vez, y otro que recarga `/api/metrics` cuando cambian `startDate`/`endDate`.
- Agregar el tipo `MetricsFacets` a [financial-types.ts](../../../frontend/src/lib/financial-types.ts) (reflejo manual del modelo Pydantic, según convención del proyecto).
- Construir el query string incluyendo solo los parámetros de fecha definidos (`URLSearchParams`).
- Validación de formato (RF11): usar `<input type="date">` (el navegador ya normaliza o vacía valores inválidos) más una validación explícita en `DateRangeFilter` (regex `/^\d{4}-\d{2}-\d{2}$/` o `Date.parse`) antes de propagar el cambio a `App.tsx`.

## 8. Plan de pruebas

- **Backend**: no se requieren tests nuevos (endpoints ya cubiertos en [test_routes.py](../../../backend/tests/test_routes.py)).
- **Frontend**: pruebas manuales — cambiar fechas y verificar refetch; dejar ambos campos vacíos y verificar que se muestra el dataset completo; definir un rango sin resultados y verificar que la UI no se rompe; introducir un valor de fecha inválido y verificar que se bloquea el envío. Opcionalmente, test unitario para la función que construye el query string si se extrae a `lib/`.
