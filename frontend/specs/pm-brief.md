# Pedido original del PM
> Fuente original. No editar. Las decisiones y correcciones van en verification.md.

## Funcionalidad 1 — Filtro de rango de fechas en el dashboard principal
El equipo de finanzas quiere centrarse en períodos concretos sin ver todos los datos históricos a la vez. Añade dos inputs de fecha en la parte superior del dashboard — una fecha de inicio y una fecha de fin — que filtren todos los datos que se muestran actualmente en la página. Las fechas se envían a la API en formato YYYY-MM-DD. Ambos inputs son opcionales; cuando están vacíos, el dashboard muestra todos los datos disponibles. El rango de fechas disponible (la fecha más antigua y la más reciente del dataset) debe mostrarse cerca de los inputs como referencia para que el usuario sepa qué rango es válido.

Endpoint relevante: GET /api/metrics/facets (para obtener el rango de fechas disponible) y la extensión de filtros sobre el endpoint de métricas existente.

## Funcionalidad 2 — Tabla de alertas de anomalías en el dashboard principal
Bajo los gráficos existentes, añade una tabla que destaque los períodos en los que el gasto subió de forma inesperada. La tabla tiene cuatro columnas: período, outcome registrado, media móvil de los 3 períodos anteriores e incremento porcentual. El umbral de alerta es configurable por el usuario mediante un input numérico (un ratio entre 0.01 y 1.0, por defecto 0.3). Si no se detectan anomalías para el umbral actual, la tabla debe mostrar un mensaje explícito de estado vacío — no simplemente desaparecer. La tabla también debe respetar el rango de fechas establecido en la Funcionalidad 1 si está activo.

Endpoint relevante: GET /api/metrics/alerts?threshold=<ratio>

## Funcionalidad 3 — Vista comparativa B2B vs B2C
Crea una nueva página en el dashboard para comparar el rendimiento de ingresos entre las dos líneas de negocio: B2B y B2C. La vista tiene dos secciones en paralelo. Cada sección muestra una tabla con las 5 categorías de ingreso principales de esa línea de negocio, mostrando nombre de categoría, total de ingresos y porcentaje sobre el total del grupo. Bajo ambas secciones, un único gráfico compara visualmente el total de ingresos de B2B frente a B2C. El usuario puede filtrar la comparativa por un rango de fechas (mismo formato YYYY-MM-DD). Las categorías disponibles para cada grupo deben obtenerse del endpoint de facetas.

Endpoints relevantes: GET /api/metrics/categories/top?operation_type=income&limit=5 y GET /api/metrics/facets