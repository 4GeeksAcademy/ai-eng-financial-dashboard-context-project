# Funcionalidad 3: Vista de Comparativa B2B vs B2C

## Objetivo

Construir una nueva página para comparar el rendimiento de ingresos entre líneas de negocio B2B y B2C.

## Estructura de la vista

- Filtros superiores por fecha (`start_date`, `end_date`) en formato `YYYY-MM-DD`.
- Dos secciones paralelas:
  - Tabla Top 5 categorías de ingreso B2B.
  - Tabla Top 5 categorías de ingreso B2C.
- Un gráfico inferior comparativo con total de ingresos B2B vs B2C.

## Fuentes de datos

- `GET /api/metrics/categories/top`
- `GET /api/metrics/facets`

## Contrato API relevante

### GET /api/metrics/categories/top

Query params relevantes:

- `operation_type=income` (obligatorio para esta vista).
- `limit=5`.
- `business_type=B2B|B2C`.
- `start_date` opcional.
- `end_date` opcional.

Ejemplos:

- `/api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B`
- `/api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C&start_date=2025-03-01&end_date=2025-06-30`

Respuesta esperada por item:

```json
{
  "category": "sales",
  "operation_type": "income",
  "total_amount": 120340.5
}
```

### GET /api/metrics/facets

Uso en esta vista:

- Mostrar rango de fechas disponible.
- Obtener conjunto de categorías disponibles del sistema.

## Cálculos de presentación

En cada tabla (B2B y B2C):

- `Total ingresos grupo` = suma de `total_amount` de sus 5 filas.
- `% sobre grupo` por fila = `(total_amount / total_grupo) * 100`.
- Si `total_grupo = 0`, mostrar `0%` para evitar división por cero.

En el gráfico comparativo:

- Serie o barras con 2 valores:
  - `B2B total` = suma total_amount de resultados B2B.
  - `B2C total` = suma total_amount de resultados B2C.

## Reglas de comportamiento

- Ambos bloques (B2B y B2C) se consultan con el mismo rango de fechas activo.
- Si no hay rango, consultas sin fechas.
- Si un bloque no devuelve datos, mostrar estado vacío en esa sección sin romper la otra.
- El gráfico siempre se renderiza con los totales disponibles (incluyendo 0 cuando no hay datos).

## Criterios de aceptación

1. Existe una página nueva de comparativa B2B vs B2C navegable desde el dashboard.
2. Cada sección muestra máximo 5 categorías de ingreso con monto y porcentaje.
3. El gráfico inferior compara total de ingresos B2B contra B2C.
4. El rango de fechas afecta simultáneamente ambas tablas y el gráfico.
5. La pantalla muestra rango disponible de fechas basado en `facets`.
6. Estados vacíos parciales o totales se muestran explícitamente.

## Pruebas sugeridas

- Sin filtros de fecha.
- Rango corto con datos en ambos grupos.
- Rango con datos solo en un grupo.
- Rango sin datos en ambos grupos.
- Verificación de porcentaje por grupo y suma de totales del gráfico.
