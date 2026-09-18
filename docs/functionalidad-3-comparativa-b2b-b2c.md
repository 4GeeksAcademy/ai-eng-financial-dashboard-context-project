# Funcionalidad 3 — Vista comparativa B2B vs B2C

**Estado:** Especificación aprobada para implementación  
**Fecha:** 2026-09-17  
**Área:** Nueva página del dashboard

## 1. Objetivo

Crear una página independiente del dashboard para comparar el rendimiento de **ingresos** de las líneas de negocio B2B y B2C durante un rango de fechas seleccionado por el usuario.

La vista debe presentar dos secciones paralelas, una por línea de negocio. Cada sección contiene una tabla con las cinco categorías de ingreso principales del grupo. Debajo de ambas tablas se muestra un único gráfico que compara el total de ingresos B2B frente al total de ingresos B2C.

## 2. Alcance

### Incluido

- Nueva vista accesible desde el dashboard principal.
- Ruta frontend propuesta: `/comparison`.
- Selector de fecha inicial y fecha final en formato `YYYY-MM-DD`.
- Dos tablas paralelas: B2B y B2C.
- Cinco categorías de ingreso principales por grupo.
- Nombre de categoría, total de ingresos y porcentaje sobre el total del grupo.
- Un único gráfico comparativo de ingresos totales B2B vs B2C.
- Consulta de categorías disponibles mediante el endpoint de facetas.
- Respeto del rango de fechas activo en todas las consultas de la vista.
- Estados de carga, error, datos vacíos y validación del rango.

### Fuera de alcance

- Comparar outcomes, beneficio, margen o alertas en esta página.
- Comparar más líneas de negocio que B2B y B2C.
- Edición manual de categorías o ingresos.
- Persistencia del rango seleccionado entre sesiones.
- Exportación CSV/PDF.
- Cambios en la generación de datos mock.
- Modificación manual de los componentes generados de `frontend/src/components/ui/`.

## 3. Modelo funcional

### 3.1 Líneas de negocio

La vista siempre muestra exactamente estos dos grupos:

- `B2B`
- `B2C`

El orden visual será B2B a la izquierda y B2C a la derecha en pantallas amplias. En pantallas estrechas las secciones se apilan, manteniendo ese orden.

### 3.2 Categorías

- Las categorías disponibles deben consultarse mediante el endpoint `GET /api/metrics/facets`; en el contrato actual, este endpoint proporciona la lista global de categorías permitidas.
- **Contrato verificado actualmente:** `MetricsFacets` solo contiene `operation_types`, `business_types`, `categories`, `min_date` y `max_date`. `categories` es una lista global de tipo `Category`; no contiene una relación categoría–grupo de negocio ni está filtrada por `operation_type=income`.
- Por tanto, `categories_by_business_type` no es un campo existente y no se tratará como si lo fuera. La especificación resuelve el desajuste usando `facets.categories` como catálogo global y `categories/top?business_type=...&operation_type=income` como fuente de las categorías de ingreso efectivamente disponibles para cada grupo. No se debe inventar una relación grupo–categoría en el frontend.
- Solo se consideran categorías asociadas a movimientos con `operation_type=income`.
- El endpoint de categorías debe devolver como máximo cinco categorías por grupo, ordenadas de mayor a menor total.
- Si un grupo tiene menos de cinco categorías disponibles, se muestran únicamente las categorías existentes.
- Las categorías sin ingresos no se muestran.
- La lista de facetas no debe estar hardcodeada en el frontend.

### 3.3 Porcentajes

> `category_income_total`, `group_income_total` y `percentage` son nombres conceptuales de la fórmula; no son campos de la respuesta API verificada.

Para cada grupo, `total_amount` es el campo real de categoría y el total del grupo se deriva sumando `amount` de los movimientos de ingresos del endpoint específico B2B/B2C:

```text
percentage = category_income_total / group_income_total * 100
```

- El denominador es el total de **todos** los ingresos del grupo dentro del rango seleccionado, no la suma de las cinco categorías visibles.
- Si el total de ingresos del grupo es cero, el porcentaje debe mostrarse como `0.00%` y no debe producir `NaN`, `Infinity` ni error.
- Los porcentajes se muestran con dos decimales.
- Los importes se muestran en USD con dos decimales.

## 4. Selector de rango

### Controles

La página debe incluir:

- Campo `Desde` (`start_date`).
- Campo `Hasta` (`end_date`).
- Ambos usan controles de fecha nativos o equivalentes y representan valores `YYYY-MM-DD`.
- El rango es inclusivo en ambos extremos.
- La página debe mostrar claramente el rango aplicado.

### Validación

- La fecha inicial no puede ser posterior a la fecha final.
- Una fecha inválida o incompleta no debe provocar una petición.
- Ante un rango inválido se muestra un mensaje accesible y se conservan los últimos resultados válidos o un estado vacío inicial.
- El rango puede estar vacío: en ese caso se consulta el período completo disponible.
- La vista debe evitar peticiones duplicadas cuando el usuario modifica ambos campos de forma consecutiva; se permite aplicar al cambiar un rango válido o mediante un botón `Aplicar`.
- La decisión recomendada es usar un botón `Aplicar` para que ambas fechas se envíen juntas.

## 5. Contrato de API

### 5.1 Facetas

```http
GET /api/metrics/facets
```

#### Contrato verificado en `/docs`

La respuesta actual de `GET /api/metrics/facets` es `MetricsFacets` y contiene únicamente estos campos:

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "YYYY-MM-DD",
  "max_date": "YYYY-MM-DD"
}
```

Los nombres anteriores están verificados en `backend/app/routes.py`, en el modelo `MetricsFacets`, y en la prueba existente `test_metrics_facets_returns_filter_options_and_date_range`.

#### Resolución del desajuste

El PM wording “categorías disponibles para cada grupo deben obtenerse del endpoint de facetas” no corresponde literalmente al contrato actual: `facets` no devuelve categorías por grupo. Por ello, esta especificación no inventa `categories_by_business_type` ni exige ese campo para la primera implementación. La resolución es:

1. Consultar `facets.categories` para obtener el catálogo global real.
2. Consultar `categories/top` dos veces, con `operation_type=income`, `limit=5` y un `business_type` distinto, para obtener las categorías y totales efectivos de cada grupo.
3. Tratar `TopCategoryItem.category` como la categoría de ingreso disponible para ese grupo en la tabla.

El siguiente campo queda registrado únicamente como una posible evolución futura, no como requisito de esta implementación:

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["sales", "others"],
  "categories_by_business_type": {
    "B2B": ["sales", "others"],
    "B2C": ["sales", "others"]
  },
  "min_date": "2025-01-01",
  "max_date": "2025-12-28"
}
```

No se debe implementar ni consumir `categories_by_business_type` en esta funcionalidad mientras no exista en OpenAPI.

### 5.2 Categorías principales

Para cada grupo:

```http
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C
```

Si existe un rango activo, se añaden:

```http
&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

Respuesta esperada:

```json
[
  {
    "category": "sales",
    "operation_type": "income",
    "total_amount": 125430.50
  }
]
```

La respuesta debe estar ordenada por `total_amount` descendente y contener como máximo cinco elementos.

### 5.3 Total de ingresos del grupo

Para calcular el porcentaje y alimentar el gráfico, se necesita el total de todos los ingresos de cada grupo en el rango activo. El contrato actual de `categories/top` no incluye ese total y solo devuelve las cinco categorías principales.

#### Campos y filtros verificados

- `GET /api/metrics/categories/top` sí acepta `operation_type`, `limit`, `start_date`, `end_date` y `business_type`.
- `GET /api/metrics/b2b` y `GET /api/metrics/b2c` sí existen y aceptan `start_date`, `end_date`, `category` y `operation_type`.
- `GET /api/metrics` **no acepta actualmente `business_type`**; su firma verificada solo incluye `start_date`, `end_date`, `category` y `operation_type`.

#### Resolución del total del grupo

Para calcular el porcentaje y alimentar el gráfico, se necesita el total de todos los ingresos de cada grupo en el rango activo. El contrato actual de `categories/top` no incluye ese total y solo devuelve las categorías principales.

Se utilizarán los endpoints específicos existentes:

```http
GET /api/metrics/b2b?operation_type=income&start_date=...&end_date=...
GET /api/metrics/b2c?operation_type=income&start_date=...&end_date=...
```

Esta opción usa únicamente parámetros verificados. El total se calcula sumando `amount` en el frontend. No se añadirá `business_type` a `/api/metrics` ni `group_total_amount` a `TopCategoryItem` como parte de esta especificación.

No se debe calcular el denominador sumando únicamente las cinco filas visibles.

## 6. Gráfico comparativo

- Debe existir un único gráfico bajo las dos tablas.
- El gráfico compara dos valores: `B2B` y `B2C`.
- El valor representado es el total de ingresos del grupo, no el total de las cinco categorías.
- Se recomienda un gráfico de barras con dos barras claramente etiquetadas.
- El eje y debe usar formato monetario o un tooltip monetario.
- Debe incluir leyenda o etiquetas accesibles que identifiquen B2B y B2C.
- No se deben crear dos gráficos separados.
- Si ambos totales son cero, el gráfico sigue visible con valores cero y un mensaje contextual de ausencia de ingresos puede acompañarlo.

## 7. Estados de interfaz

### Carga

- Mostrar el título de la página, el selector de rango y skeletons para las dos tablas y el gráfico.
- Las dos tablas deben cargar de forma coordinada para evitar mostrar una comparación incompleta como definitiva.

### Datos disponibles

- Mostrar ambas secciones, incluso si una línea de negocio tiene cero ingresos.
- Mostrar las columnas de cada tabla:
  1. Categoría
  2. Total de ingresos
  3. Porcentaje del grupo
- Mostrar el gráfico comparativo debajo de ambas secciones.

### Sin datos

Si el rango no contiene ingresos para uno de los grupos:

- Mantener visible la sección del grupo.
- Mostrar un mensaje explícito, por ejemplo: `No hay ingresos B2B en el rango seleccionado.`
- Mostrar el total del grupo como `$0.00` y el gráfico con valor cero cuando corresponda.

Si no hay ingresos para ninguno de los grupos, ambas secciones deben permanecer visibles y el gráfico no debe desaparecer silenciosamente.

### Error

- Un fallo de facetas impide construir la vista y debe mostrar un error específico.
- Un fallo en una consulta de datos debe mostrar un estado de error en la comparación, sin presentar resultados parciales como si fueran completos.
- El mensaje debe ser comprensible y ofrecer reintento.
- El error debe distinguirse del estado sin datos.

## 8. Integración frontend prevista

- Crear un componente de página, por ejemplo `frontend/src/components/dashboard/business-comparison-page.tsx`, o una estructura equivalente coherente con el router que se incorpore.
- Crear componentes de dominio para la tabla y el gráfico si ello mejora la separación, por ejemplo `business-income-table.tsx` y `business-income-chart.tsx`.
- Añadir los tipos necesarios a `frontend/src/lib/financial-types.ts`.
- Mantener imports internos con `@/` e imports de tipos usando `type`.
- Usar exports nombrados para componentes nuevos.
- Reutilizar las variables de color del tema y no introducir colores hardcodeados.
- La navegación desde el dashboard principal debe ser visible y accesible; la ruta propuesta es `/comparison`.
- La vista comparativa no debe romper ni ocultar el dashboard principal existente.

## 9. Criterios de aceptación

### Mapeo de columnas y conceptos

| Wording del producto | Campo real usado | Cálculo/presentación |
|---|---|---|
| Nombre de categoría | `TopCategoryItem.category` | Texto de la categoría. |
| Total de ingresos | `TopCategoryItem.total_amount` | Solo se solicitan filas con `operation_type=income`. |
| Porcentaje sobre total del grupo | No existe como campo API | `total_amount / sum(FinancialMovement.amount) * 100` para el grupo y rango activos. |
| Total comparado en el gráfico | No existe como campo API | `sum(amount)` de `/api/metrics/b2b` y `/api/metrics/b2c` filtrados por `operation_type=income`. |

- [ ] Existe una página independiente para la comparación B2B vs B2C.
- [ ] La página muestra dos secciones paralelas en desktop y apiladas en viewport estrecho.
- [ ] Se muestra una tabla B2B y una tabla B2C.
- [ ] Cada tabla muestra como máximo las cinco categorías de ingreso principales.
- [ ] Cada fila muestra nombre de categoría, total de ingresos y porcentaje sobre el total del grupo.
- [ ] El porcentaje usa todos los ingresos del grupo como denominador, no solo las cinco categorías visibles.
- [ ] El catálogo global de categorías se obtiene desde `facets.categories`, y las categorías efectivas de ingreso por grupo se obtienen desde `categories/top` filtrado por `operation_type=income` y `business_type`; ninguna lista se hardcodea en el frontend.
- [ ] Se pueden seleccionar fechas `YYYY-MM-DD` desde y hasta.
- [ ] El rango se envía a todas las consultas relevantes y es inclusivo.
- [ ] Un rango inválido no dispara una petición.
- [ ] La página muestra un único gráfico debajo de las dos tablas.
- [ ] El gráfico compara los totales de ingresos B2B y B2C.
- [ ] Una línea de negocio sin datos conserva su sección y muestra un estado vacío explícito.
- [ ] La carga, el error y la ausencia de datos son estados visualmente diferenciados.
- [ ] La interfaz es usable con teclado, etiquetas asociadas y nombre accesible para tablas y gráfico.
- [ ] La página mantiene el tema oscuro y no introduce desbordamiento horizontal fuera de las tablas.
- [ ] El dashboard principal existente sigue funcionando sin la ruta comparativa.

## 10. Plan de pruebas previo a implementación

### Backend

Añadir o ajustar pruebas para:

1. `facets` devuelve el catálogo global `categories`; `categories/top` devuelve las categorías de ingreso por B2B/B2C mediante sus filtros verificados. No se asume un campo `categories_by_business_type`.
2. `categories/top` respeta `operation_type=income`, `business_type` y `limit=5`.
3. `categories/top` respeta `start_date` y `end_date`, incluidos los extremos.
4. Cada grupo devuelve resultados ordenados de mayor a menor total.
5. El total de ingresos de un grupo puede obtenerse respetando negocio, operación y rango.
6. Los filtros no mezclan movimientos B2B con B2C.
7. Un grupo sin ingresos devuelve lista vacía o total cero según el endpoint utilizado.

### Frontend

Añadir pruebas para funciones puras y componentes:

1. Validación de rango `start_date <= end_date`.
2. Construcción de URLs con fechas y `business_type`.
3. Cálculo del porcentaje sobre el total completo del grupo.
4. Comportamiento con total de grupo igual a cero.
5. Orden y límite de cinco categorías.
6. Renderizado de ambas tablas y exactamente un gráfico.
7. Renderizado de estados de carga, error y ausencia de datos.
8. Renderizado responsive básico y nombres accesibles.

### Verificación

```bash
cd backend && pytest
cd ../frontend && npm run test
npx tsc --noEmit
npm run lint
```

## 11. Decisiones necesarias antes de construir

1. Confirmar si se añadirá un router real o una navegación mínima basada en pathname para la nueva ruta `/comparison`.
2. Usar `/api/metrics/b2b` y `/api/metrics/b2c` para calcular los totales; no se añade `business_type` a `/api/metrics`.
3. Confirmar si el rango se aplica mediante botón `Aplicar` o automáticamente al completar ambas fechas; esta especificación recomienda botón.
