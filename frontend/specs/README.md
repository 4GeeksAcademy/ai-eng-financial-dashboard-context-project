# Guía de especificaciones del dashboard

Punto de entrada para continuar el trabajo en una sesión nueva. El brief del PM es el requisito original; las decisiones y discrepancias verificadas están en [verification.md](verification.md), y el comportamiento esperado de los componentes se detalla en [components.md](components.md). Las rutas y parámetros se contrastaron con el backend en [routes.py](../../backend/app/routes.py).

## Funcionalidad 1: filtro de fechas del dashboard

**Requisito del PM:** [pm-brief.md](pm-brief.md), Funcionalidad 1: dos fechas opcionales, aplicadas al dashboard, con el rango disponible visible.

**Endpoints verificados**
- `GET /api/metrics/facets`: devuelve `min_date` y `max_date` para mostrar el rango disponible. No recibe parámetros.
- `GET /api/metrics`: devuelve movimientos y admite `start_date` y `end_date`.

**Tipos**
- Respuesta de facetas: [FacetsResponse](api-types.ts#L3).
- Filtros de fecha: [DateRangeFilter](param-types.ts#L3) y [MetricsParams](param-types.ts#L65).

**Parámetros y restricciones**
- `start_date`, `end_date`: opcionales e independientes; fechas `YYYY-MM-DD`; límites inclusivos. Si se omiten ambos, se devuelven todos los movimientos disponibles.
- `/api/metrics` conserva además `category` (categoría válida del dominio) y `operation_type` (`income` o `outcome`), ambos opcionales; el nuevo control de fechas no debe eliminarlos si la pantalla ya aplica esos filtros.
- `min_date` y `max_date` son valores de referencia de facetas, no restricciones de consulta impuestas por la API.
- Las fechas inválidas no deben enviarse desde la UI. El cliente debe comprobar también que la fecha inicial no sea posterior a la final; la ruta no declara esa validación y, con límites invertidos, el filtro devuelve una lista vacía.

**Casos límite y UI**

| caso | qué muestra la UI |
|---|---|
| Solo se indica fecha de inicio o solo fecha de fin | Aplica únicamente el límite indicado, omite el otro parámetro y mantiene visible «Rango disponible: {min_date} – {max_date}». |
| Fecha de inicio posterior a la fecha de fin | No consulta la API; muestra «La fecha de inicio no puede ser posterior a la fecha de fin.» |
| Rango válido, pero completamente fuera de `min_date`–`max_date` | No ajusta las fechas silenciosamente. La API devuelve cero movimientos; muestra «No hay movimientos para las fechas seleccionadas.» y conserva el rango disponible como referencia. |
| Ambos campos vacíos | Omite ambos parámetros y muestra todos los datos; el rango de facetas sigue visible. |

## Funcionalidad 2: alertas de anomalías

**Requisito del PM:** [pm-brief.md](pm-brief.md), Funcionalidad 2: alertas de gasto, cuatro columnas, umbral configurable, estado vacío explícito y respeto del filtro de fechas.

**Endpoint verificado**
- `GET /api/metrics/alerts`.

**Tipos**
- Respuesta: [AlertEntry](api-types.ts#L32) y [AlertsResponse](api-types.ts#L59).
- Parámetros: [AlertsParams](param-types.ts#L22), que extiende [DateRangeFilter](param-types.ts#L3).

**Parámetros y restricciones**
- `threshold`: ratio; API default `0.3`, mínimo `0`, sin máximo declarado. La decisión de producto limita la UI a `0.01–1.0`, inclusive; no ajustar el valor automáticamente. La API crea una alerta cuando `increase_ratio > threshold`.
- `group_by`: `day`, `week` o `month`; default `month`.
- `start_date` y `end_date`: opcionales, `YYYY-MM-DD`, inclusivos; `business_type`: opcional, `B2B` o `B2C`.
- `period` es `string` (para `month` se observó `YYYY-MM`); `outcome_total`, `baseline_average` e `increase_ratio` son `number`. El ratio se presenta como porcentaje (`0.3` → `30 %`).

**Casos límite y UI**

| caso | qué muestra la UI |
|---|---|
| `threshold` menor que `0.01` o mayor que `1.0` | Rechaza el valor, no consulta la API y muestra «El umbral debe estar entre 0,01 y 1,00.» |
| La respuesta no contiene alertas | Muestra «No se detectaron anomalías para el umbral {threshold × 100} %.»; no oculta la tabla sin explicación. |
| Periodo sin tres periodos previos | El brief exige una media móvil de los tres periodos anteriores, pero el backend actual promedia todos los periodos anteriores y la respuesta no señala periodos no evaluables. No presentar esa media como una ventana de tres. Para cumplir el requisito, el backend debe usar una ventana fija de tres; la UI debe excluir esos periodos de la evaluación y mostrar «Período no evaluable: faltan 3 períodos anteriores.» La API actual no devuelve una señal explícita para este estado. |

## Funcionalidad 3: comparativa B2B vs B2C

**Requisito del PM:** [pm-brief.md](pm-brief.md), Funcionalidad 3: dos paneles paralelos con top-5 de ingresos, porcentaje del total del grupo y un gráfico comparativo filtrable por fechas.

**Endpoints verificados**
- `GET /api/metrics/facets`: categorías, líneas de negocio y rango de fechas disponible.
- `GET /api/metrics/categories/top`: consulta independiente por línea de negocio para la tabla de categorías.
- `GET /api/metrics/summary`: resumen por periodo; permite filtros de fecha, tipo de operación y línea de negocio. Se usa para calcular el ingreso total de cada grupo sumando `income`.
- `GET /api/metrics/comparison` existe, pero calcula neto del periodo actual frente al anterior; no es la fuente adecuada para las dos barras de ingreso B2B/B2C.

**Tipos**
- Facetas y categorías: [FacetsResponse](api-types.ts#L3), [CategoryEntry](api-types.ts#L61) y [TopCategoriesResponse](api-types.ts#L81).
- Parámetros de categorías: [TopCategoriesParams](param-types.ts#L43); rango: [DateRangeFilter](param-types.ts#L3); línea de negocio: [BusinessType](../src/lib/financial-types.ts).
- No existe en `api-types.ts` un tipo para la respuesta de `/api/metrics/summary`. El backend devuelve filas con `period`, `income`, `outcome` y `net`; añadir y probar el tipo frontend antes de consumir esa respuesta.

**Parámetros y restricciones**
- `/api/metrics/categories/top`: `operation_type` acepta `income` o `outcome` (default `outcome`; usar `income`); `limit` es entero de `1` a `20` (default `5`); `business_type` es opcional, `B2B` o `B2C`; fechas opcionales `YYYY-MM-DD`, inclusivas.
- `/api/metrics/summary`: `group_by` acepta `day`, `week` o `month` (default `month`); fechas opcionales inclusivas; `category` acepta una categoría del dominio; `operation_type` acepta `income` o `outcome`; `business_type` acepta `B2B` o `B2C`. Para los totales de las barras, filtrar por grupo, fechas y `operation_type=income`, y sumar el campo `income` de las filas.
- El porcentaje de cada categoría se calcula como `total_amount / ingreso total del grupo × 100`; el top-5 no es el denominador.

**Casos límite y UI**

| caso | qué muestra la UI |
|---|---|
| La API devuelve menos de cinco categorías | Muestra solo las filas recibidas; no añade categorías ni completa con importes cero. |
| Un grupo no tiene ingresos / su lista está vacía | El panel correspondiente muestra «No hay categorías de ingresos B2B para el rango seleccionado.» o el mensaje equivalente para B2C. Si el total del grupo es cero, el porcentaje se muestra como «—», sin dividir por cero. |
| El rango no contiene datos | Cada panel vacío muestra su mensaje explícito. Si el resumen también viene vacío, el gráfico debe mostrar «Sin datos para el rango seleccionado», no convertir la ausencia de filas en dos totales cero. Distinguirlo de un total numérico cero. |

**Origen del gráfico:** dos barras, B2B y B2C, con los ingresos totales del grupo para el mismo rango. Cada valor se calcula desde `/api/metrics/summary`; no se toma de la lista top-5 ni de `/api/metrics/comparison`. Esta distinción y el estado vacío deben mantenerse alineados con [components.md](components.md).