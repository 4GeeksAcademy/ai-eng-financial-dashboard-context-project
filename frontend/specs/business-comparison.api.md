# Especificación de contrato de datos: comparativa B2B vs B2C

## 1. Facets

```http
GET /api/metrics/facets
```

Usar:

- `business_types` para confirmar los grupos disponibles (`B2B`, `B2C`);
- `categories` como catálogo global de categorías;
- `min_date` y `max_date` para el rango disponible.

No usar `facets.categories` como si estuviera agrupado por negocio: la respuesta es una lista global.

## 2. Categorías principales por grupo

Hacer una consulta por grupo:

```http
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C
```

Con filtros de fecha, añadir únicamente los valores no vacíos:

```http
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B&start_date=2025-01-01&end_date=2025-12-31
```

Parámetros verificados:

- ✅ `operation_type=income`.
- ✅ `limit=5`; el endpoint permite de 1 a 20.
- ✅ `business_type=B2B|B2C`.
- ✅ `start_date` y `end_date` opcionales con formato `YYYY-MM-DD`.
- ✅ Respuesta: array de `{ category, operation_type, total_amount }`.
- ❌ La solicitud sin `business_type` no separa B2B y B2C.
- ❌ La respuesta no incluye porcentajes ni total del grupo.

## 3. Totales para tablas y gráfico

Para cada grupo, hacer una consulta de resumen mensual:

```http
GET /api/metrics/summary?group_by=month&operation_type=income&business_type=B2B
GET /api/metrics/summary?group_by=month&operation_type=income&business_type=B2C
```

Añadir `start_date` y/o `end_date` cuando estén seleccionados.

Calcular:

```text
groupTotalIncome = sum(summaryItem.income)
categoryPercentage = category.total_amount / groupTotalIncome * 100
```

El gráfico inferior usa `groupTotalIncome` de B2B y B2C.

Parámetros/campos verificados:

- ✅ `group_by=month`.
- ✅ `operation_type=income`.
- ✅ `business_type=B2B|B2C`.
- ✅ `start_date` y `end_date`.
- ✅ Cada elemento contiene `period`, `income`, `outcome` y `net`.
- ✅ Con `operation_type=income`, `income` es el campo relevante para sumar.
- ❌ No usar `net` ni el endpoint `/api/metrics/comparison` para representar ingresos.
- ❌ No sumar solo las cinco categorías para calcular el denominador: el porcentaje es sobre todos los ingresos del grupo.

## 4. Número de consultas y consistencia

Una carga completa puede requerir:

1. una consulta de facets;
2. dos consultas `categories/top`;
3. dos consultas `summary`.

Todas las consultas deben usar el mismo rango de fechas. Si cambia el rango, invalidar los cinco resultados anteriores y cargar un conjunto nuevo.

Si el sistema decide optimizar o combinar consultas, debe mantener exactamente estos campos y semántica; no asumir un endpoint agregado que no existe.

## 5. Respuestas y casos límite

- `200` con menos de cinco categorías: mostrar las recibidas.
- `200` con categorías vacías: estado vacío de esa tabla.
- `200` con resumen vacío: total del grupo es `0` y el gráfico debe mostrar estado sin datos si no hay valores comparables.
- Error de una consulta: mostrar error de la sección afectada o error de página según la estrategia UX; no mostrar datos parciales como si fueran completos.
- `groupTotalIncome=0`: evitar división por cero y mostrar `N/D` o `0%` mediante decisión de producto explícita.
- No inventar campos como `percentage`, `group_total`, `b2b_total` o `b2c_total` en respuestas API.

## 6. Contratos que no deben utilizarse

- ❌ `/api/metrics/comparison` para el gráfico: `current_period` es neto.
- ❌ `/api/metrics/facets` como fuente de categorías específicas B2B/B2C.
- ❌ `categories/top` sin `business_type` para construir tablas separadas.
- ❌ Nombres de query `from`, `to`, `segment`, `group` o `business_segment`.
