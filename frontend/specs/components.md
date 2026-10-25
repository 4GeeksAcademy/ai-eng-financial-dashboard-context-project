# Especificación de componentes

## Funcionalidad 1 — Filtro de rango de fechas

### 1. Propósito
Permitir filtrar el dashboard por fechas de inicio y fin opcionales, mostrando como referencia el rango disponible del dataset.

### 2. Componentes
- `DashboardDateFilter`
- `AvailableDateRange`

### 3. Props de cada componente

#### `DashboardDateFilter`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `value` | `DateRangeFilter` | sí | Valores actuales `start_date` y `end_date`; cualquiera puede omitirse. |
| `onChange` | `(value: DateRangeFilter) => void` | sí | Notifica los límites seleccionados para aplicarlos a `/api/metrics`. |

#### `AvailableDateRange`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `range` | `Pick<FacetsResponse, 'min_date' \| 'max_date'>` | sí | Fechas mínima y máxima recibidas de `/api/metrics/facets`. |

### 4. Estados

| estado | qué ve exactamente el usuario |
|---|---|
| cargando | Los dos campos de fecha están disponibles y junto a ellos aparece «Cargando rango disponible…». |
| vacío | Si el filtro deja el dashboard sin movimientos, aparece «No hay movimientos para las fechas seleccionadas.»; los campos conservan sus valores. |
| error | Si falla la carga de facetas, aparece «No se pudo cargar el rango disponible.» y los campos de fecha siguen disponibles. |
| dato parcial o inválido | Si solo se rellena una fecha, se aplica solo ese límite inclusivo y el otro se omite de la petición. Se muestra «Rango disponible: {min_date} – {max_date}». Una fecha con formato inválido no se envía y muestra «Introduce una fecha válida (AAAA-MM-DD).»; si falta o es inválido `min_date` o `max_date`, se muestra «Rango disponible no disponible». |

### 5. Decisiones aplicadas (de verification.md)
- Se consulta `FacetsResponse` para obtener `min_date` y `max_date`; ambas se muestran cerca de los campos como rango disponible.
- `DateRangeFilter.start_date` y `end_date` son opcionales e independientes, inclusivos y se envían en formato `YYYY-MM-DD`. No se exige que estén rellenos ambos.
- La pantalla principal obtiene los movimientos de la API; no se usa `mock-data.ts` como fuente del dashboard.
- La etiqueta fija «2024 - Full Year» no se considera evidencia del rango de los datos; el rango visible procede de las facetas.

## Funcionalidad 2 — Tabla de alertas de anomalías

### 1. Propósito
Mostrar los periodos con incremento inusual del gasto para el umbral seleccionado y respetando el rango de fechas activo.

### 2. Componentes
- `AnomalyAlertsSection`
- `AlertThresholdInput`
- `AnomalyAlertsTable`

### 3. Props de cada componente

#### `AnomalyAlertsSection`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `params` | `AlertsParams` | sí | Parámetros activos; incluye el umbral y los límites de fecha opcionales. |
| `alerts` | `AlertsResponse` | sí | Alertas devueltas por `/api/metrics/alerts`. Una lista vacía es una respuesta válida. |
| `onParamsChange` | `(params: AlertsParams) => void` | sí | Solicita actualizar umbral o fechas y cargar las alertas correspondientes. |

#### `AlertThresholdInput`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `threshold` | `AlertsParams['threshold']` | sí | Umbral expresado como ratio; el valor predeterminado es `0.3` (30 %). |
| `onThresholdChange` | `(threshold: AlertsParams['threshold']) => void` | sí | Notifica el nuevo umbral solo cuando es válido. |

#### `AnomalyAlertsTable`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `alerts` | `AlertsResponse` | sí | Filas que se presentan en la tabla. |
| `threshold` | `AlertsParams['threshold']` | sí | Umbral actual, usado en el mensaje de estado vacío. |

Las cuatro columnas son:

| columna | tipo de dato | formato de visualización |
|---|---|---|
| Periodo (`period`) | `string` | Texto del periodo; el formato mensual observado es `YYYY-MM`. |
| Gasto registrado (`outcome_total`) | `number` | Importe monetario con formato de moneda. |
| Media de referencia (`baseline_average`) | `number` | Importe monetario con formato de moneda. El contrato no confirma que sea la media móvil de exactamente los tres periodos anteriores. |
| Incremento (`increase_ratio`) | `number` | Porcentaje: multiplicar el ratio por 100 y mostrar el signo `%` (por ejemplo, `0.45` como `45 %`). |

### 4. Estados

| estado | qué ve exactamente el usuario |
|---|---|
| cargando | Aparece «Cargando alertas…» en el área de la tabla. |
| vacío | La tabla se sustituye por «No se detectaron anomalías para el umbral {threshold × 100} %.»; por ejemplo, con `0.3`: «No se detectaron anomalías para el umbral 30 %.» |
| error | Aparece «No se pudieron cargar las alertas.» en el área de la tabla, sin presentar el error como una lista vacía. |
| dato parcial o inválido | El umbral aceptado por la interfaz es de `0.01` a `1.0`, inclusive. Fuera de ese intervalo no se solicita la API ni se ajusta el valor automáticamente; el campo conserva lo escrito y muestra «El umbral debe estar entre 0,01 y 1,00.» Si la respuesta contiene filas inválidas, se muestran las filas válidas y «Algunas alertas no se pudieron mostrar.» |

### 5. Decisiones aplicadas (de verification.md)
- `AlertEntry` establece `period: string`, `outcome_total: number`, `baseline_average: number` e `increase_ratio: number`; el ratio se presenta como porcentaje, no como valor fraccionario.
- `AlertsParams.threshold` usa ratio, tiene valor predeterminado `0.3` y la decisión de interfaz limita su entrada a `0.01–1.0`, sin corregirla automáticamente.
- Los límites de fecha opcionales de `DateRangeFilter` también se aplican a las alertas.
- El brief pide la media móvil de los tres periodos previos, pero el contrato verificado solo nombra el campo `baseline_average` y no confirma esa ventana. Por eso la columna se identifica como «Media de referencia» y no se atribuye una fórmula no verificada.

## Funcionalidad 3 — Comparativa de ingresos B2B vs B2C

### 1. Propósito
Comparar en una vista los ingresos y las cinco categorías principales de B2B y B2C para el rango de fechas elegido.

### 2. Componentes
- `BusinessComparisonPage`
- `ComparisonDateFilter`
- `BusinessTopCategoriesPanel`
- `RevenueComparisonChart`

### 3. Props de cada componente

#### `BusinessComparisonPage`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `dateRange` | `DateRangeFilter` | sí | Límites de fecha compartidos por ambas consultas. |
| `facets` | `FacetsResponse` | sí | Facetas disponibles; se usa `categories` para las categorías de ingreso. |
| `b2bCategories` | `TopCategoriesResponse` | sí | Hasta cinco categorías de ingreso de B2B. |
| `b2cCategories` | `TopCategoriesResponse` | sí | Hasta cinco categorías de ingreso de B2C. |
| `b2bTotal` | `number` | sí | Ingreso total de B2B para el rango, fuente del punto B2B del gráfico y denominador de porcentajes. |
| `b2cTotal` | `number` | sí | Ingreso total de B2C para el rango, fuente del punto B2C del gráfico y denominador de porcentajes. |

#### `ComparisonDateFilter`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `value` | `DateRangeFilter` | sí | Rango de fechas actual; cada límite es opcional. |
| `availableRange` | `Pick<FacetsResponse, 'min_date' \| 'max_date'>` | sí | Rango de fechas disponible para mostrar junto a los campos. |
| `onChange` | `(value: DateRangeFilter) => void` | sí | Actualiza el rango usado por las consultas B2B y B2C. |

#### `BusinessTopCategoriesPanel`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `businessType` | `BusinessType` | sí | Identifica el panel como `B2B` o `B2C`. |
| `categories` | `TopCategoriesResponse` | sí | Filas del grupo obtenidas con `operation_type=income` y `limit=5`. |
| `availableCategories` | `FacetsResponse['categories']` | sí | Categorías disponibles según las facetas. |
| `groupTotal` | `number` | sí | Total de ingresos del grupo; se usa como denominador del porcentaje por categoría. |

#### `RevenueComparisonChart`

| nombre | tipo | obligatoria sí/no | descripción |
|---|---|---|---|
| `b2bTotal` | `number` | sí | Ingreso total B2B para el rango seleccionado. |
| `b2cTotal` | `number` | sí | Ingreso total B2C para el rango seleccionado. |

### 4. Estados

| estado | qué ve exactamente el usuario |
|---|---|
| cargando | Los dos paneles paralelos muestran «Cargando categorías…» y el área del gráfico muestra «Cargando comparativa…». |
| vacío | Si la lista B2B está vacía, su panel muestra «No hay categorías de ingresos B2B para el rango seleccionado.»; si la lista B2C está vacía, su panel muestra «No hay categorías de ingresos B2C para el rango seleccionado.» El gráfico sigue comparando los totales disponibles; si ambos totales son cero, muestra dos valores `0` y sus etiquetas B2B y B2C. |
| error | Si falla la carga de una lista, el panel afectado muestra «No se pudieron cargar las categorías B2B.» o «No se pudieron cargar las categorías B2C.»; si falla la carga de los totales, el gráfico muestra «No se pudo cargar la comparativa de ingresos.» |
| dato parcial o inválido | Si una lista llega vacía y la otra contiene datos, se representa normalmente la lista disponible y se muestra el mensaje vacío en el otro panel; el gráfico conserva el punto cuyo total está disponible y rotula el otro «Sin datos», sin convertirlo en cero. Si `groupTotal` es cero, el porcentaje por categoría se muestra como «—»; no se divide por cero. Si una fecha es inválida, se muestra «Introduce una fecha válida (AAAA-MM-DD).» y no se consulta con ella. |

El gráfico comparativo tiene dos puntos: `B2B`, que representa el ingreso total B2B del rango seleccionado, y `B2C`, que representa el ingreso total B2C del mismo rango. No son los totales de las listas top-5. En cada tabla, el porcentaje de una categoría es `total_amount / groupTotal × 100`.

### 5. Decisiones aplicadas (de verification.md)
- La vista usa dos paneles en paralelo y aplica el mismo `DateRangeFilter` a las consultas de ambos grupos. La tabla muestra categoría, total monetario y porcentaje sobre el total de todo el grupo.
- `FacetsResponse` aporta `categories`, `business_types`, `min_date` y `max_date`; las categorías top se consultan con `operation_type=income`, `limit=5` y el `business_type` correspondiente.
- `CategoryEntry` solo entrega `total_amount` por categoría, no un porcentaje ni el total del grupo. El porcentaje se calcula contra el ingreso total del grupo, no contra la suma de sus cinco categorías.
- `api-types.ts` no define el tipo de respuesta de `/api/metrics/comparison`. `b2bTotal` y `b2cTotal` se especifican como `number`; antes de integrar el gráfico se debe confirmar que ese endpoint entrega los totales de ingreso completos para el rango pedido. No se deben inferir del top-5.
- La verificación indica que la pantalla principal inspeccionada aún no consume estos endpoints; esta funcionalidad requiere su propia carga y estado para facetas, listas B2B/B2C y totales de comparación.