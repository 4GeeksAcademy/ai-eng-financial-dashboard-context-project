# Especificación de componentes por funcionalidad

Los nombres de componentes nuevos son propuestas, no componentes ya implementados. Los contratos de la API se describen en [api-contract.md](./api-contract.md).

## Funcionalidad 1 — Filtro de fechas

### `DateRangeFilter` — propuesto

- Dos inputs de fecha etiquetados: inicio y fin.
- Ambos opcionales y vacíos inicialmente.
- Muestra cerca el rango disponible obtenido de `/api/metrics/facets`.
- Recibe los valores y comunica los cambios al componente padre.
- Si inicio supera a fin, muestra un error; no se envían consultas y se conservan los últimos datos válidos.
- Reutilizable en el dashboard principal y la comparativa.

**Nota:** comparte nombre con la interfaz de parámetros `DateRangeFilter` de [param-types.ts](./param-types.ts); al importarlos juntos, utilizar un alias de tipo para distinguirlos.

### Integración en `App` — componente existente, cambios propuestos

- Mantiene las fechas compartidas y las conserva al navegar.
- Consulta métricas al cambiar un rango válido.
- Actualiza conjuntamente `KPIRow`, `IncomeOutcomeChart`, `ProfitPercentChart` y el período de `DashboardHeader`, componentes ya utilizados en [App.tsx](../src/App.tsx).
- Distingue el rango disponible del dataset del período mostrado.
- Gestiona carga, errores y respuestas obsoletas.

## Funcionalidad 2 — Tabla de anomalías

### `AlertsSection` — propuesto

- Se sitúa debajo de los gráficos del dashboard.
- Coordina el umbral, la consulta de alertas y sus estados.
- Utiliza las fechas compartidas de la Funcionalidad 1.

### `AlertThresholdInput` — propuesto

- Input numérico con etiqueta y explicación: `0.3` equivale al 30 %.
- Valor inicial `0.3`; valores válidos entre `0.01` y `1.0`.
- Aplica automáticamente valores válidos.
- Muestra validación ante un valor vacío o fuera del intervalo, sin consultar.

### `AlertsTable` — propuesto

- Recibe una lista de `AlertEntry`, definido en [api-types.ts](./api-types.ts).
- Columnas: período, outcome registrado, media móvil de 3 períodos e incremento porcentual.
- Convierte `increase_ratio` a porcentaje para presentarlo.
- No calcula anomalías: esa responsabilidad corresponde a la API.
- Muestra carga, error o el mensaje: **No se detectaron anomalías para el umbral actual**.
- No desaparece cuando la respuesta está vacía.

**Dependencia de contrato:** el backend debe corregir la media acumulada actual para utilizar los 3 períodos anteriores.

## Funcionalidad 3 — Comparativa B2B vs B2C

### `BusinessComparisonPage` — propuesto

- Accesible mediante `#/comparativa`, sin dependencias nuevas.
- Utiliza las fechas compartidas con el dashboard.
- Coordina las consultas de facetas, categorías principales y resúmenes para ambos grupos.
- Evita mezclar respuestas de distintos rangos.

### `BusinessIncomeSection` — propuesto

- Se reutiliza para B2B y B2C.
- Muestra el nombre del grupo y su tabla.
- Ambas secciones aparecen en paralelo en escritorio y apiladas en móvil.

### `TopCategoriesTable` — propuesto

- Columnas: categoría, ingresos y porcentaje sobre los ingresos completos del grupo.
- Muestra hasta 5 categorías reales, ordenadas por importe descendente.
- Recibe categorías y total del grupo; no realiza consultas propias.
- Evita dividir por cero y muestra un estado vacío cuando no hay ingresos.
- No inventa filas para alcanzar cinco categorías.

### `BusinessIncomeComparisonChart` — propuesto

- Un único gráfico bajo ambas secciones.
- Dos barras: ingresos totales de B2B y B2C.
- Utiliza los mismos totales completos empleados para calcular los porcentajes.
- Distingue ingresos cero de un fallo de consulta.

**Dependencia de contrato:** ampliar facets para obtener categorías por negocio y tipo de operación.

## Criterios comunes

- Reutilizar estilos, formatos monetarios y componentes existentes.
- Mantener la URL base y el tratamiento de errores del patrón `fetch` actual.
- Usar los tipos de respuesta y parámetros definidos en [api-types.ts](./api-types.ts) y [param-types.ts](./param-types.ts).
- Controles con etiquetas accesibles y tablas con encabezados semánticos.
- Diferenciar carga, error y ausencia de datos.
- Cancelar o descartar respuestas obsoletas.
- Estos componentes describen responsabilidades; no requieren crear un archivo independiente para cada uno.
