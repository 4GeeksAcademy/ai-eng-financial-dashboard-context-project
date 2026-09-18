# Especificación de componentes por funcionalidad

**Estado:** Diseño previo a implementación  
**Fecha:** 2026-09-17  
**Ámbito:** Frontend React + TypeScript

## 1. Reglas comunes

- Los componentes nuevos se ubicarán en `frontend/src/components/dashboard/`, salvo la página comparativa si la estructura de navegación requiere otra carpeta de dominio.
- Los nombres de archivo usarán `kebab-case`.
- Los componentes nuevos usarán exports nombrados; no se añadirá `export default`.
- Los imports internos usarán el alias `@/` y los imports exclusivamente de tipos usarán `type`.
- No se modificarán manualmente los componentes generados de `frontend/src/components/ui/`.
- Los componentes no deben inventar campos que no existan en OpenAPI. Las respuestas usarán los tipos de `frontend/specs/api-types.ts` y los parámetros usarán `frontend/specs/param-type.ts`.
- Los estados de carga, error, vacío y datos disponibles deben ser distinguibles visualmente y mediante texto accesible.
- Se mantendrá el tema oscuro mediante las variables existentes del tema; no se introducirán colores hardcodeados.
- Las tablas podrán desplazarse horizontalmente en viewport estrecho sin provocar overflow de la página.

## 2. Funcionalidad 1 — Rango de fechas y dashboard principal

### 2.1 `DateRangeFilter`

**Archivo propuesto:** `frontend/src/components/dashboard/date-range-filter.tsx`

**Responsabilidad:** Permitir seleccionar un rango opcional compartido por el dashboard y por las consultas de alertas/comparación.

**Props propuestas:**

```ts
interface DateRangeFilterProps {
  value: DateRangeFilter
  facets?: FacetsResponse
  disabled?: boolean
  onChange: (value: DateRangeFilter) => void
  onApply?: () => void
}
```

**Reglas:**

- Renderizar dos controles etiquetados: `Desde` y `Hasta`.
- Usar valores `YYYY-MM-DD`, compatibles con `DateRangeFilter` de `param-type.ts`.
- Ambas fechas son opcionales; sin fecha se consulta el período completo disponible.
- No emitir una petición desde el componente. Solo comunicar cambios mediante `onChange` y, si se usa, `onApply`.
- Impedir aplicar un rango en el que `start_date > end_date`.
- Mostrar un mensaje accesible para fechas inválidas, incompletas o inconsistentes.
- `facets.min_date` y `facets.max_date` son límites de selección derivados de `FacetsResponse`; no deben confundirse con `start_date` y `end_date` enviados a la API.
- Como `FacetsResponse.min_date` y `FacetsResponse.max_date` están tipados como `string`, el componente o su adaptador debe validarlos antes de usarlos como valores de un `<input type="date">`; no se debe afirmar que son `ApiDateString` sin esa validación.
- Asociar cada `<label>` con su control y exponer el error mediante `aria-describedby` y `aria-invalid`.

**Estados:**

- Inicial: ambos campos vacíos o con el rango activo.
- Edición: permite modificar cada fecha sin consultar todavía.
- Inválido: conserva el último rango aplicado y bloquea `onApply`.
- Aplicable: rango vacío o válido.
- Deshabilitado: controles inactivos mientras la vista padre lo indique.

**Criterios:**

- La validación se realiza antes de construir URLs.
- El componente no duplica el estado de rango de una página; recibe el valor y notifica cambios.
- El texto visible debe indicar qué rango está aplicado cuando exista.

### 2.2 `DashboardHeader` (existente)

**Archivo:** `frontend/src/components/dashboard/dashboard-header.tsx`

**Responsabilidad:** Mostrar título, subtítulo y período activo del dashboard.

**Evolución requerida:**

- Mantener el componente actual y su prop `period?: string`.
- Recibir el período derivado del rango activo o de las facetas cuando se implemente el selector.
- No presentar `2024 — Full Year` como dato real si el rango aún no ha sido consultado; el valor por defecto actual es una limitación documentada.

### 2.3 `DashboardDataState`

**Archivo propuesto:** `frontend/src/components/dashboard/dashboard-data-state.tsx`

**Responsabilidad:** Convención visual para carga, error y contenido del dashboard principal.

**Props propuestas:**

```ts
interface DashboardDataStateProps {
  loading: boolean
  error: string | null
  children: React.ReactNode
  onRetry?: () => void
}
```

**Reglas:**

- No ocultar el resto del dashboard por un error aislado de alertas o comparación.
- El `children` solo se muestra cuando no hay carga ni error.
- El error debe incluir texto comprensible y, si existe `onRetry`, un control de reintento accesible.
- El skeleton no debe anunciarse como contenido definitivo.

## 3. Funcionalidad 2 — Alertas de anomalías

### 3.1 `AnomalyAlertsSection`

**Archivo propuesto:** `frontend/src/components/dashboard/anomaly-alerts-section.tsx`

**Responsabilidad:** Coordinar el umbral, la consulta de alertas y los estados de la sección situada debajo de los gráficos.

**Props propuestas:**

```ts
interface AnomalyAlertsSectionProps {
  dateRange: DateRangeFilter
  onRetry?: () => void
}
```

**Reglas:**

- Consultar `GET /api/metrics/alerts` con `AlertsParams`.
- Enviar `threshold` como ratio decimal: `0.3` significa `30%`.
- Reutilizar `start_date` y `end_date` del rango compartido cuando estén definidos.
- Usar `group_by=month` explícitamente si la construcción de URL lo requiere; es el default verificado del endpoint.
- No enviar valores de umbral incompletos, no numéricos o fuera del rango funcional `0.01–1.0`.
- Mantener la sección visible cuando la respuesta sea `[]`.
- Aislar sus errores del estado de KPIs y gráficos del dashboard.
- `dateRange` es el único rango recibido; la sección no mantiene una copia paralela.
- `onRetry` reintenta la última consulta válida y no cambia el rango ni el umbral.

**Estados:**

- `loading`: título y control visibles; tabla sustituida por skeleton.
- `ready`: muestra el control y la tabla.
- `empty`: muestra `No se detectaron anomalías de gasto con el umbral actual.`
- `error`: muestra un mensaje de error y permite reintentar si se proporciona la acción.

### 3.2 `AlertThresholdControl`

**Archivo propuesto:** `frontend/src/components/dashboard/alert-threshold-control.tsx`

**Responsabilidad:** Editar y validar el umbral de alertas.

**Props propuestas:**

```ts
interface AlertThresholdControlProps {
  value: number
  disabled?: boolean
  onChange: (value: number) => void
}
```

**Reglas:**

- Valor inicial: `0.3`.
- Rango funcional: `0.01` a `1.0`, ambos inclusive.
- Mostrar ayuda: `0.3 = 30%`.
- No llamar a `onChange` para valores vacíos o inválidos.
- Los límites no se reciben como props porque son una regla fija de esta funcionalidad: `0.01 <= threshold <= 1.0`.
- El valor visible debe diferenciar el ratio decimal del porcentaje presentado.
- La etiqueta será `Umbral de incremento` y el mensaje de error debe estar asociado al input.

### 3.3 `AnomalyAlertsTable`

**Archivo propuesto:** `frontend/src/components/dashboard/anomaly-alerts-table.tsx`

**Responsabilidad:** Renderizar `AlertResponse` sin recalcular la detección.

**Props propuestas:**

```ts
interface AnomalyAlertsTableProps {
  alerts: AlertResponse
  loading?: boolean
}
```

**Columnas, en este orden:**

1. `period` → Período.
2. `outcome_total` → Outcome registrado, moneda USD con dos decimales.
3. `baseline_average` → Media móvil, moneda USD con dos decimales.
4. `increase_ratio` → Incremento porcentual, multiplicado por 100 y con dos decimales.

**Reglas:**

- No añadir columnas derivadas adicionales.
- Ordenar cronológicamente ascendente si la respuesta no llega ordenada.
- Usar `<table>`, `<caption>` o nombre accesible equivalente, `<thead>` y encabezados asociados.
- La tabla debe conservar contraste en tema oscuro y permitir scroll horizontal interno.
- `loading` no debe renderizar filas parciales.

## 4. Funcionalidad 3 — Comparativa B2B vs B2C

### 4.1 `BusinessComparisonPage`

**Archivo propuesto:** `frontend/src/components/dashboard/business-comparison-page.tsx`

**Responsabilidad:** Página coordinadora de la ruta `/comparison`.

**Props propuestas:**

```ts
interface BusinessComparisonPageProps {
  dateRange?: DateRangeFilter
  facets?: FacetsResponse
  onDateRangeChange?: (value: DateRangeFilter) => void
}
```

**Reglas:**

- Mostrar siempre las dos líneas de negocio y en este orden: B2B, B2C.
- Coordinar la consulta de facetas, las dos consultas de `categories/top` y las dos consultas de movimientos específicos.
- Si `facets` no se recibe, la página debe solicitar `GET /api/metrics/facets` antes de presentar límites de fecha; no debe hardcodear `min_date`, `max_date` ni categorías.
- `dateRange` es controlado por el propietario cuando se proporciona; `onDateRangeChange` comunica cambios al propietario. No se deben mantener dos fuentes de verdad.
- Enviar `operation_type=income` y `limit=5` a `categories/top`.
- Enviar el mismo rango válido a todas las consultas relevantes.
- No presentar resultados parciales como una comparación completa.
- No consumir `categories_by_business_type`, `group_total_amount` ni `business_type` en `/api/metrics`, porque no existen en el contrato verificado.
- Mostrar error diferenciado para facetas y para datos comparativos.

### 4.2 `BusinessIncomeTable`

**Archivo propuesto:** `frontend/src/components/dashboard/business-income-table.tsx`

**Responsabilidad:** Renderizar las cinco categorías de ingreso principales de un grupo.

**Props propuestas:**

```ts
interface BusinessIncomeTableProps {
  businessType: BusinessType
  entries: TopCategoriesResponse
  groupIncomeTotal: number
  loading?: boolean
}
```

**Columnas:**

1. Categoría → `CategoryEntry.category`.
2. Total de ingresos → `CategoryEntry.total_amount`, USD con dos decimales.
3. Porcentaje del grupo → cálculo local `total_amount / groupIncomeTotal * 100`.

**Reglas:**

- El `entries` recibido debe proceder de `categories/top` con `operation_type=income`, `business_type` del grupo y `limit=5`.
- `businessType` es una prop de presentación (`B2B` o `B2C`), no un campo de `TopCategoriesParams` en Fase 2. El adaptador de API debe combinarlo con `TopCategoriesParams` al construir la URL, porque el endpoint real sí acepta `business_type`.
- No calcular el total del grupo sumando solo las filas visibles.
- Si `groupIncomeTotal === 0`, mostrar `0.00%` y no producir `NaN` o `Infinity`.
- Mostrar estado vacío manteniendo el nombre del grupo si no hay ingresos.
- El nombre accesible de la tabla debe incluir B2B o B2C.

### 4.3 `BusinessIncomeChart`

**Archivo propuesto:** `frontend/src/components/dashboard/business-income-chart.tsx`

**Responsabilidad:** Mostrar un único gráfico comparando los totales de ingresos B2B y B2C.

**Props propuestas:**

```ts
interface BusinessIncomeChartProps {
  b2bTotal: number
  b2cTotal: number
  loading?: boolean
}
```

**Reglas:**

- Renderizar exactamente dos valores: B2B y B2C.
- Usar totales calculados sumando `amount` de los movimientos filtrados por `operation_type=income`.
- No usar la suma de las cinco categorías como denominador o total gráfico.
- Mantener el gráfico visible cuando uno o ambos totales sean cero.
- Usar etiquetas, tooltip o leyenda accesibles para identificar B2B y B2C.
- Mostrar importes en USD.

## 5. Matriz de contratos y componentes

| Componente | Endpoint/fuente | Tipos de respuesta | Tipos de parámetros |
|---|---|---|---|
| `DateRangeFilter` | `GET /api/metrics/facets` como referencia de límites | `FacetsResponse` | `DateRangeFilter` |
| `AnomalyAlertsSection` | `GET /api/metrics/alerts` | `AlertResponse` | `AlertsParams` |
| `AnomalyAlertsTable` | Datos recibidos por la sección | `AlertEntry` | — |
| `BusinessComparisonPage` | `facets`, `categories/top`, `/api/metrics/b2b`, `/api/metrics/b2c` | `FacetsResponse`, `TopCategoriesResponse`, `FinancialMovement[]` | `DateRangeFilter`, `TopCategoriesParams` |
| `BusinessIncomeTable` | `GET /api/metrics/categories/top` | `CategoryEntry` | `TopCategoriesParams` |
| `BusinessIncomeChart` | `/api/metrics/b2b` y `/api/metrics/b2c` | `FinancialMovement[]` | `DateRangeFilter` más `operation_type=income` |

## 6. Decisiones cerradas sobre props y parámetros

1. **Propiedad frente a parámetro de API:** `dateRange` se representa con `DateRangeFilter`; `facets` se representa con `FacetsResponse`. La primera contiene filtros opcionales y la segunda contiene metadatos/catálogo.
2. **Fechas de facetas:** `min_date` y `max_date` solo limitan los controles. No se envían automáticamente como `start_date` y `end_date`; si el usuario deja el rango vacío, la consulta no incluye fechas.
3. **Umbral:** `AlertThresholdControl` usa siempre `0.01–1.0` y `0.3` como valor inicial. No se exponen `min`/`max` configurables porque el brief no define variantes de esta regla.
4. **Rango en alertas:** `AnomalyAlertsSection` recibe el rango compartido y construye `AlertsParams`; no crea un selector propio.
5. **B2B/B2C:** `BusinessComparisonPage` muestra exactamente ambos grupos. `BusinessIncomeTable.businessType` identifica la tabla, mientras que el adaptador añade el filtro `business_type` verificado por OpenAPI a la petición de `categories/top`.
6. **Parámetros no modelados en Fase 2:** `group_by=month` para alertas y `business_type` para categorías son constantes/filtros de integración descritos en la spec de componentes; no se duplican como props de UI ni se inventan respuestas nuevas.

## 7. Accesibilidad y responsive

- Cada control de fecha y umbral tendrá una etiqueta visible asociada.
- Los errores de validación se expondrán mediante texto y relaciones ARIA apropiadas.
- Las tablas tendrán nombre accesible, encabezados semánticos y foco de teclado cuando exista scroll horizontal.
- El gráfico tendrá título o descripción accesible con los valores B2B y B2C; no dependerá solo del color.
- Los estados de carga y error se anunciarán sin bloquear innecesariamente el resto de la aplicación.
- En pantallas estrechas, las tablas usarán contenedor con desplazamiento horizontal; el layout general no desbordará el viewport.
- Se respetarán las variables de tema existentes para mantener contraste en modo oscuro.

## 8. Fuera de alcance de esta fase

- Implementar los componentes.
- Modificar endpoints o modelos backend.
- Añadir `categories_by_business_type` al contrato.
- Añadir `group_total_amount` a `TopCategoryItem`.
- Añadir `business_type` a `GET /api/metrics`.
- Corregir en backend la validación actual de `threshold` o la línea base acumulativa de alertas; esos cambios pertenecen a la implementación y a sus pruebas.
