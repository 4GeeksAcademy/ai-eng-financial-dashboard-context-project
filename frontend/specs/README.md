# Feature Specifications

> Endpoints, tipos, restricciones, casos límite y comportamiento esperado de las
> tres nuevas funcionalidades del Financial Dashboard.

---

## Funcionalidad 1 — Filtro de rango de fechas

### Endpoints que consume

| Endpoint | Propósito |
|---|---|
| `GET /api/metrics/facets` | Obtener el rango de fechas disponible (`min_date`, `max_date`) para mostrarlo como referencia al usuario. |
| `GET /api/metrics/summary` | Obtener datos filtrados por fecha para los gráficos del dashboard. Se llama de nuevo cada vez que cambia el filtro. |

### Tipos de petición

No hay parámetros de entrada para `GET /api/metrics/facets`. Es un endpoint sin
query params.

```typescript
// El filtro de fechas se aplica como query params en /api/metrics/summary:
interface DateRangeFilter {
  /** YYYY-MM-DD. Opcional — cuando se omite no hay límite inferior. */
  start_date?: string;
  /** YYYY-MM-DD. Opcional — cuando se omite no hay límite superior. */
  end_date?: string;
}
```

### Tipo de respuesta

```typescript
interface FacetsResponse {
  /** Valores posibles: ["income", "outcome"] */
  operation_types: ApiOperationType[];
  /** Valores posibles: ["B2B", "B2C"] */
  business_types: ApiBusinessType[];
  /** Valores posibles: ["administrative", "operational", "others", "sales", "suppliers"] */
  categories: ApiCategory[];
  /** Fecha más antigua del dataset. Formato: YYYY-MM-DD. */
  min_date: string;
  /** Fecha más reciente del dataset. Formato: YYYY-MM-DD. */
  max_date: string;
}
```

### Valores válidos y restricciones

| Parámetro | Tipo | Valores / Restricciones |
|---|---|---|
| `start_date` | `string` opcional | Formato `YYYY-MM-DD`. Si se envía, debe ser una fecha real. |
| `end_date` | `string` opcional | Formato `YYYY-MM-DD`. Si se envía, debe ser una fecha real y no anterior a `start_date`. |

### Casos límite

1. **Ambos filtros vacíos** — La UI muestra los dos inputs sin valor y la línea
   de rango disponible. El dashboard carga todos los datos históricos. La llamada
   a `/api/metrics/summary` se hace sin `start_date` ni `end_date`.

   *Comportamiento esperado:* el backend devuelve datos completos; los gráficos
   muestran todas las métricas.

2. **`start_date` posterior a `end_date`** — El backend procesa ambos filtros
   de forma independiente y puede devolver un conjunto vacío (no hay movimientos
   que cumplan ambas condiciones). La UI debe mostrar los gráficos con el mensaje
   de estado vacío ("No data available to display") en cada componente que
   corresponda. El filtro de rango disponible debe seguir visible para que el
   usuario pueda corregir su selección.

3. **Fecha fuera del rango disponible** — El usuario selecciona una fecha
   anterior a `min_date` o posterior a `max_date`. El backend no tiene datos
   para esas fechas y devuelve un array vacío. La UI debe manejar esta respuesta
   sin errores y mostrar los mensajes de estado vacío correspondientes.

### UI esperada

- Dos inputs de tipo `date` en la parte superior del dashboard, etiquetados como
  "Desde" y "Hasta".
- Una línea de texto en gris claro debajo de los inputs con el formato:
  `"Rango disponible: 2024-01-05 – 2024-12-28"`.
- Los inputs deben tener los atributos `min` y `max` según el rango disponible
  para restringir la selección del native picker.
- Los gráficos y la tabla de alertas (Funcionalidad 2) deben reaccionar
  inmediatamente al cambio de filtro.

---

## Funcionalidad 2 — Tabla de alertas de anomalías

### Endpoint que consume

| Endpoint | Propósito |
|---|---|
| `GET /api/metrics/alerts` | Obtener los períodos donde el gasto superó el umbral respecto a la media móvil de los 3 períodos anteriores. |

### Tipos de petición

```typescript
interface AlertsParams extends DateRangeFilter {
  /** Ratio mínimo de incremento para disparar la alerta.
   *  Rango real del backend: >= 0 (ge=0). Por defecto: 0.3. */
  threshold?: number;
  /** Granularidad de agregación. Por defecto: "month". */
  group_by?: "day" | "week" | "month";
  /** Filtro opcional de línea de negocio. */
  business_type?: ApiBusinessType;
}
```

### Tipo de respuesta

```typescript
interface AlertEntry {
  /** Período en formato YYYY-MM (cuando group_by=month). */
  period: string;
  /** Total de outcome registrado en ese período. */
  outcome_total: number;
  /** Media del outcome de los 3 períodos anteriores (línea base). */
  baseline_average: number;
  /** Ratio de incremento: (outcome_total - baseline_average) / baseline_average.
   *  Si es mayor que threshold, se dispara la alerta. */
  increase_ratio: number;
}

// La respuesta es un array directamente:
type AlertsResponse = AlertEntry[];
```

### Valores válidos y restricciones

| Parámetro | Tipo | Valores / Restricciones |
|---|---|---|
| `threshold` | `number` opcional | `>= 0` (el backend usa `ge=0`). Defecto `0.3`. Un valor de `0` alerta cualquier período donde el outcome supere la media. |
| `group_by` | `string` opcional | `"day"` \| `"week"` \| `"month"`. Defecto `"month"`. |
| `business_type` | `string` opcional | `"B2B"` \| `"B2C"`. |
| `start_date` | `string` opcional | `YYYY-MM-DD`. |
| `end_date` | `string` opcional | `YYYY-MM-DD`. |

### Detalle del algoritmo de alertas (backend)

1. Se agrupan los movimientos filtrados según `group_by`.
2. Para cada período, se calcula el `outcome` total.
3. Se mantiene una lista histórica de outcomes. Para cada período (a partir del
   segundo), se calcula la media de todos los outcomes anteriores.
4. Si `(outcome_actual - media_historica) / media_historica > threshold`,
   se genera una alerta.
5. La `baseline_average` es la media de **todos** los períodos anteriores, no
   solo los 3 inmediatos (aunque la UI lo presenta como "media móvil de 3
   períodos anteriores" según la especificación funcional).

> **Nota sobre la discrepancia:** El frontend puede mostrar la columna como
> "Media móvil (períodos anteriores)" para ser fiel al dato real que devuelve
> la API, o mantener "3 períodos anteriores" como label aunque el backend
> calcule sobre todos los períodos históricos. La decisión queda a criterio
> de implementación.

### Casos límite

1. **Umbral en `0`** — El backend acepta `threshold=0`. Cualquier período con
   outcome mayor que cero disparará una alerta si los períodos anteriores tienen
   media > 0. La UI debe mostrar la tabla completa con todas las alertas y
   formatear correctamente valores como `increase_ratio: 1.2345`.

   *Comportamiento esperado:* la tabla se renderiza sin errores; puede tener
   muchas filas. El input numérico debe aceptar `0` como valor válido.

2. **Sin alertas para el umbral actual** — El endpoint devuelve un array vacío
   `[]`. La UI **no debe** desaparecer ni ocultar la tabla. Debe mostrar un
   mensaje explícito dentro del cuerpo de la tabla:
   > `"No se detectaron anomalías para el umbral seleccionado."`
   
   El encabezado de la tabla y el input de umbral deben seguir visibles.

3. **Fechas sin datos** — Cuando el filtro de rango de fechas (Funcionalidad 1)
   produce un conjunto vacío, el endpoint `/api/metrics/alerts` devuelve `[]`.
   La UI debe mostrar el mensaje de estado vacío de alertas, no un error.

### UI esperada

- Debajo de los gráficos existentes, una sección con:
  - Input numérico para el umbral (min `0`, max `1`, step `0.05`, valor por
    defecto `0.3`), con label "Umbral de alerta".
  - Tabla con 4 columnas: Período, Outcome registrado, Media móvil,
    Incremento %.
  - Mensaje de estado vacío cuando no hay alertas.
- Los valores numéricos deben estar alineados a la derecha.
- La tabla debe respetar el rango de fechas global del dashboard.

---

## Funcionalidad 3 — Vista comparativa B2B vs B2C

### Endpoints que consume

| Endpoint | Propósito |
|---|---|
| `GET /api/metrics/facets` | Obtener las categorías disponibles (referencia). |
| `GET /api/metrics/categories/top` | Obtener las top N categorías de ingreso para B2B y B2C por separado. |
| `GET /api/metrics/summary` | Obtener datos mensuales agregados por línea de negocio para el gráfico comparativo. |

### Tipos de petición

```typescript
interface TopCategoriesParams extends DateRangeFilter {
  /** Tipo de operación a agregar. Para la comparativa usar "income". */
  operation_type?: ApiOperationType;  // "income" | "outcome"
  /** Máximo de categorías a devolver. Rango: 1–20. Defecto: 5. */
  limit?: number;
  /** Filtro de línea de negocio. Para la comparativa se usa "B2B" y "B2C". */
  business_type?: ApiBusinessType;
}
```

### Tipos de respuesta

```typescript
interface CategoryEntry {
  /** Nombre de la categoría. */
  category: ApiCategory;
  /** Tipo de operación solicitada. */
  operation_type: ApiOperationType;
  /** Total acumulado de ingresos para esa categoría. */
  total_amount: number;
}

type TopCategoriesResponse = CategoryEntry[];
```

Para el gráfico comparativo se usa el endpoint de summary con filtro por
`business_type`:

```typescript
// Parámetros:
interface SummaryParams extends DateRangeFilter {
  group_by?: "day" | "week" | "month";
  business_type?: ApiBusinessType;
  category?: ApiCategory;
  operation_type?: ApiOperationType;
}

// Respuesta:
interface MetricsSummaryItem {
  period: string;
  income: number;
  outcome: number;
  net: number;
}
```

### Valores válidos y restricciones

| Parámetro | Tipo | Valores / Restricciones |
|---|---|---|
| `operation_type` | `string` opcional | `"income"` \| `"outcome"`. Defecto `"outcome"`. Para la comparativa se usa `"income"`. |
| `limit` | `number` opcional | Entero entre `1` y `20`. Defecto `5`. |
| `business_type` | `string` opcional | `"B2B"` \| `"B2C"`. |
| `start_date` | `string` opcional | `YYYY-MM-DD`. |
| `end_date` | `string` opcional | `YYYY-MM-DD`. |

### Casos límite

1. **Una línea de negocio sin datos** — Si B2B tiene categorías de ingreso pero
   B2C no (o viceversa), la tabla de la línea sin datos debe mostrar el mensaje
   de estado vacío:
   > `"No hay datos de ingresos para esta línea de negocio."`
   
   La otra tabla se renderiza normalmente con sus datos. El gráfico
   comparativo debe mostrar solo la serie con datos; la serie sin datos no
   debe generar errores. La UI debe mantener ambas secciones visibles para
   que el contraste sea evidente.

2. **Menos de 5 categorías disponibles** — El endpoint devuelve tantas
   categorías como existan en el dataset (máximo `limit`). Si solo hay 2
   categorías de ingreso para B2B, la tabla muestra 2 filos. La UI no debe
   rellenar con filas vacías ni asumir que siempre habrá 5 filas.

3. **Filtro de fechas que excluye todos los datos** — Cuando el rango de
   fechas seleccionado no contiene movimientos para ninguna línea de negocio,
   ambos endpoints (`/api/metrics/categories/top` para B2B y B2C) devuelven
   `[]`. Ambas tablas muestran el mensaje de estado vacío y el gráfico muestra:
   > `"No hay datos comparativos para el período seleccionado."`

### UI esperada

- **Nueva página/vista** dentro del dashboard, accesible mediante un botón o
  tab en el encabezado.
- Dos tablas en paralelo (izquierda: B2B, derecha: B2C), cada una con:
  - Título: "B2B" o "B2C".
  - Columnas: Categoría, Total ingresos (formateado como moneda),
    % del grupo (calculado como: `(total_amount / suma_total_del_grupo) * 100`).
- Debajo de ambas tablas, un gráfico de barras agrupadas (Recharts `<BarChart>`)
  que compara los ingresos mensuales de B2B vs B2C.
- Filtro de fechas opcional en la parte superior de la vista (puede ser
  independiente o compartir el estado global del dashboard).

---

## Mapa de tipos contra funcionalidades

| Archivo | Tipo | Funcionalidad |
|---|---|---|
| `api-types.ts` | `FacetsResponse` | 1 (rango de fechas) y 3 (categorías disponibles) |
| `api-types.ts` | `AlertEntry` | 2 (fila de alerta) |
| `api-types.ts` | `AlertsResponse` | 2 (respuesta completa) |
| `api-types.ts` | `CategoryEntry` | 3 (fila de categoría) |
| `api-types.ts` | `TopCategoriesResponse` | 3 (respuesta completa) |
| `param-types.ts` | `DateRangeFilter` | 1, 2, 3 (filtro compartido) |
| `param-types.ts` | `AlertsParams` | 2 (parámetros de alertas) |
| `param-types.ts` | `TopCategoriesParams` | 3 (parámetros de categorías top) |
| `financial-types.ts` | `MonthlyDataPoint` | 3 (gráfico comparativo) |

---

## Árbol de archivos propuesto (frontend)

```
src/
  components/
    dashboard/
      date-range-filter-bar.tsx   ← Feature 1
      alerts-panel.tsx             ← Feature 2
    comparison/
      comparison-view.tsx          ← Feature 3 (wrapper)
      category-table.tsx           ← Feature 3 (tabla reutilizable)
      comparison-chart.tsx         ← Feature 3 (gráfico)
      comparison-date-range.tsx    ← Feature 3 (filtro independiente)
  App.tsx                          ← Integración de las 3 funcionalidades
```