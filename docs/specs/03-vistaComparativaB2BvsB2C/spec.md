# Spec 03 — Vista comparativa B2B vs B2C

## 1. Resumen

Añadir una nueva vista al dashboard para comparar el rendimiento de ingresos entre B2B y B2C: dos tablas en paralelo con las 5 categorías de ingreso principales de cada línea de negocio (nombre, total, % sobre el total del grupo), y un único gráfico comparativo del ingreso total B2B vs B2C. Filtrable por el mismo rango de fechas (`YYYY-MM-DD`) de la Funcionalidad 1.

## 2. Contexto

- Backend ([backend/app/routes.py](../../../backend/app/routes.py)) ya soporta todo lo necesario, sin cambios:
  - `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=<B2B|B2C>&start_date&end_date` → top categorías de ingreso por línea de negocio.
  - `GET /api/metrics/b2b` / `GET /api/metrics/b2c` → movimientos crudos por línea de negocio, filtrables por fecha y `operation_type`, útiles para calcular el ingreso total del grupo.
  - `GET /api/metrics/facets` → lista global de categorías disponibles y rango de fechas (no está segmentada por `business_type`).
- **Decisión de diseño (sin cambio de backend)**: dado que en el dataset mock solo existen dos categorías de ingreso (`sales`, `others`), la tabla top-5 siempre cubre el 100% de las categorías de ingreso; aun así, el porcentaje "sobre el total del grupo" se calcula con el ingreso total real del grupo (suma de `GET /api/metrics/b2b`/`b2c` filtrado por `operation_type=income`), no con la suma de las 5 filas de la tabla, para que el cálculo siga siendo correcto si en el futuro hay más de 5 categorías de ingreso.
- **Decisión de diseño (sin nueva dependencia)**: el proyecto no tiene un router instalado (`react-router` u otro) y `docs/rules.md` exige justificar cualquier dependencia nueva. Esta "nueva página" se implementa como una vista alternable dentro de `App.tsx` mediante un estado local (p. ej. un control de pestañas "Overview" / "B2B vs B2C"), sin añadir librerías de enrutamiento.
- `GET /api/metrics/facets` se usa para: (a) el rango de fechas disponible (igual que en la Funcionalidad 1, reutilizable) y (b) la lista global de categorías, como referencia para saber si existen categorías de ingreso fuera del top-5 mostrado.

### Normalización de wording PM ↔ API

| Wording PM/UI | Campo/API real | Semántica |
|---------------|----------------|-----------|
| Categoría | `category` | Categoría financiera devuelta por `/api/metrics/categories/top`. |
| Total de ingresos | `total_amount` | Total agregado por categoría. Para esta vista debe solicitarse con `operation_type=income`. |
| Porcentaje sobre el total del grupo | Campo derivado en frontend | No viene directamente de la API. Se calcula como `total_amount / ingreso_total_del_grupo`. |
| Ingreso total B2B | Derivado de `/api/metrics/b2b?operation_type=income` | Suma de `amount` de los movimientos B2B de tipo `income`. |
| Ingreso total B2C | Derivado de `/api/metrics/b2c?operation_type=income` | Suma de `amount` de los movimientos B2C de tipo `income`. |
| Línea de negocio | `business_type` | Enum `B2B` o `B2C`. |

## 3. Alcance

**Incluye:**
- Un control para alternar entre la vista actual del dashboard y la nueva vista comparativa (sin router, estado local en `App.tsx`).
- Dos tablas en paralelo (B2B / B2C) con columnas: categoría, total de ingresos, porcentaje sobre el total del grupo.
- Un gráfico comparativo del ingreso total B2B vs B2C.
- Filtro de rango de fechas reutilizando el mismo estado (`startDate`/`endDate`) de la Funcionalidad 1.

**Fuera de alcance:**
- Añadir una librería de enrutamiento (`react-router` o similar).
- Comparar `outcome` o `net` entre B2B/B2C (solo ingresos, según lo pedido).
- Cambios de backend.
- Persistencia de la pestaña/vista activa en la URL o `localStorage`.

## 4. Requisitos funcionales (notación EARS)

| ID | Tipo | Requisito |
|----|------|-----------|
| RF1 | Ubicuo | El dashboard SIEMPRE DEBE ofrecer un control visible para navegar a la vista comparativa B2B vs B2C. |
| RF2 | Ubicuo | La vista comparativa SIEMPRE DEBE mostrar dos secciones en paralelo (B2B y B2C), cada una con una tabla de columnas: categoría, total de ingresos, porcentaje sobre el total del grupo. |
| RF3 | Ubicuo | La vista comparativa SIEMPRE DEBE mostrar, bajo ambas secciones, un único gráfico que compare el ingreso total de B2B frente a B2C. |
| RF4 | Evento | CUANDO el usuario entra a la vista comparativa o cambia el rango de fechas activo, EL SISTEMA DEBE solicitar `GET /api/metrics/categories/top` (con `operation_type=income`, `limit=5`, `business_type` correspondiente) y los totales de ingreso de `GET /api/metrics/b2b`/`GET /api/metrics/b2c`, incluyendo `start_date`/`end_date` solo si están definidos. |
| RF5 | Estado | MIENTRAS exista un rango de fechas activo (Funcionalidad 1), EL SISTEMA DEBE aplicar ese mismo rango a ambas tablas y al gráfico comparativo. |
| RF6 | Estado | MIENTRAS las solicitudes de la vista comparativa estén en curso, EL SISTEMA DEBE mostrar el patrón de carga (skeleton) existente en tablas y gráfico. |
| RF7 | Comportamiento no deseado | SI alguna de las solicitudes de la vista comparativa falla, ENTONCES EL SISTEMA DEBE mostrar el mensaje de error genérico ya usado en el resto del dashboard, sin romper la sección que sí cargó correctamente. |
| RF8 | Comportamiento no deseado | SI una línea de negocio no tiene movimientos de ingreso en el rango filtrado, ENTONCES EL SISTEMA DEBE mostrar un estado vacío explícito en su tabla y considerar su total como cero en el gráfico comparativo, sin romper la vista. |

## 5. Requisitos no funcionales

| ID | Tipo | Requisito |
|----|------|-----------|
| RNF1 | Ubicuo | El sistema SIEMPRE DEBE formatear los totales de ingreso con `formatCurrency` y el porcentaje con `formatPercent` (`financial-utils.ts`). |
| RNF2 | Ubicuo | El cálculo del porcentaje por categoría SIEMPRE DEBE usar como denominador el ingreso total real del grupo (suma de movimientos de `operation_type=income` en `/api/metrics/b2b`/`b2c`), no la suma de las filas visibles en la tabla top-5. |

## 6. Contrato de API (existente, sin cambios de backend)

- `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=<B2B|B2C>&start_date&end_date` → `TopCategoryItem[] { category, operation_type, total_amount }`.
- La API no devuelve el porcentaje sobre el total del grupo. Ese porcentaje es un campo derivado de frontend.
- `GET /api/metrics/b2b` / `GET /api/metrics/b2c` (con `operation_type=income`, `start_date`, `end_date`) → `FinancialMovement[]`, usados para calcular el ingreso total de cada grupo.
- El total de cada grupo se calcula sumando `amount` de los movimientos devueltos.
- `GET /api/metrics/facets` → `MetricsFacets`, usado para el rango de fechas disponible y la lista global de categorías de referencia.

## 7. Diseño técnico (resumen)

- **Frontend únicamente**. Nuevo componente `business-comparison-view.tsx` que compone dos tablas (`top-categories-table.tsx`, reutilizable por `business_type`) y un gráfico comparativo (Recharts, consistente con `income-outcome-chart.tsx`).
- `App.tsx` agrega un estado `view: "overview" | "comparison"` y reutiliza `startDate`/`endDate` de la Funcionalidad 1 al pasar props a la nueva vista.
- Tipos nuevos en `financial-types.ts`: `TopCategoryItem`, reflejo del modelo Pydantic homónimo.

## 8. Plan de pruebas

- **Backend**: no requiere tests nuevos (endpoints ya cubiertos en `test_routes.py`).
- **Frontend**: pruebas manuales — navegar a la vista comparativa y verificar ambas tablas y el gráfico; aplicar un rango de fechas y verificar que ambas tablas/gráfico se acotan igual; simular un grupo sin ingresos en el rango y verificar el estado vacío sin romper la vista; verificar que los porcentajes de cada tabla suman 100% respecto al total real del grupo.
