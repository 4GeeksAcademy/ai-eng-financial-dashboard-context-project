# Comparativa del brief del PM con la API real

Fecha de revisión: 2026-11-15

## Alcance y fuentes

Este documento contrasta las tres funcionalidades del brief con los recursos
actuales de FastAPI, sus parámetros y sus modelos de respuesta. La API usa
datos simulados generados en memoria; no hay una fuente persistente de datos.

Fuentes revisadas:

- `backend/app/routes.py`
- `backend/tests/test_routes.py`
- `frontend/src/App.tsx`
- Esquema OpenAPI disponible en `/openapi.json` (la interfaz `/docs`)

## Resumen ejecutivo

| Funcionalidad | Cobertura actual | Conclusión |
|---|---|---|
| 1. Filtro de rango de fechas | Parcial | La API ya acepta `start_date` y `end_date` en `/api/metrics`; `/api/metrics/facets` ya entrega `min_date` y `max_date`. Falta conectar los inputs y reenviar los filtros desde el frontend. |
| 2. Alertas de anomalías | Parcial | La respuesta contiene los datos necesarios para la tabla y respeta fechas, pero el cálculo compara contra todos los periodos anteriores, no exactamente contra la media móvil de los tres anteriores. El límite superior del ratio tampoco está validado por la API. |
| 3. Comparativa B2B vs B2C | Insuficiente para el contrato completo | Se pueden obtener top categorías y movimientos por grupo, pero no existe una respuesta que incluya porcentajes sobre el total ni un total de ingresos B2B y B2C listo para el gráfico. |

## Funcionalidad 1 — Filtro de rango de fechas

### Recursos reales

#### `GET /api/metrics/facets`

No acepta parámetros de query.

Respuesta:

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": [
    "administrative",
    "operational",
    "others",
    "sales",
    "suppliers"
  ],
  "min_date": "YYYY-MM-DD",
  "max_date": "YYYY-MM-DD"
}
```

El modelo `MetricsFacets` contiene:

```typescript
{
  operation_types: ("income" | "outcome")[];
  business_types: ("B2B" | "B2C")[];
  categories: Category[];
  min_date: string; // fecha ISO YYYY-MM-DD
  max_date: string; // fecha ISO YYYY-MM-DD
}
```

La respuesta permite mostrar el rango válido junto a los inputs, pero es un
rango global del dataset. No se recalcula según otros filtros.

#### `GET /api/metrics`

Parámetros relevantes:

| Parámetro | Tipo | Obligatorio | Default |
|---|---|---:|---:|
| `start_date` | `date` (`YYYY-MM-DD`) | No | `null` |
| `end_date` | `date` (`YYYY-MM-DD`) | No | `null` |
| `category` | `Category` | No | `null` |
| `operation_type` | `income \| outcome` | No | `null` |

La respuesta es un array de movimientos:

```json
[
  {
    "create_date": "YYYY-MM-DD",
    "amount": 1234.56,
    "operation_type": "income",
    "category": "sales",
    "business_type": "B2B"
  }
]
```

Los límites son inclusivos. Si ambos parámetros están vacíos, devuelve todos
los movimientos disponibles.

### Comparación con el brief

La capacidad backend necesaria ya existe. Para cumplir la funcionalidad falta
en el frontend:

1. Solicitar `/api/metrics/facets` para inicializar `min_date` y `max_date`.
2. Añadir inputs opcionales `start_date` y `end_date`.
3. Enviar ambos valores en formato `YYYY-MM-DD` a `/api/metrics`.
4. Volver a solicitar los datos cuando cambie cualquiera de las fechas.
5. Mantener el estado de carga, error y datos vacíos.
6. Mostrar el rango recibido por `facets` como referencia.

Estado actual: `frontend/src/App.tsx` solo solicita `/api/metrics` sin
parámetros, por lo que la funcionalidad aún no está conectada.

## Funcionalidad 2 — Tabla de alertas

### Recurso real

#### `GET /api/metrics/alerts`

Parámetros:

| Parámetro | Tipo | Obligatorio | Default | Restricciones actuales |
|---|---|---:|---:|---|
| `threshold` | `number` | No | `0.3` | `>= 0`; la API no limita a `1.0` |
| `group_by` | `day \| week \| month` | No | `month` | Valores literales |
| `start_date` | `date` | No | `null` | `YYYY-MM-DD` |
| `end_date` | `date` | No | `null` | `YYYY-MM-DD` |
| `business_type` | `B2B \| B2C` | No | `null` | Valores literales |

Ejemplo:

```http
GET /api/metrics/alerts?threshold=0.3&group_by=month
```

Respuesta `200`:

```json
[
  {
    "period": "2026-03",
    "outcome_total": 88076.90,
    "baseline_average": 55334.29,
    "increase_ratio": 0.5917
  }
]
```

Forma:

```typescript
{
  period: string;
  outcome_total: number;
  baseline_average: number;
  increase_ratio: number; // ratio decimal, no porcentaje 0-100
}[]
```

La respuesta vacía válida es `[]`, que el frontend debe representar mediante
un estado explícito como “No se detectaron anomalías para este umbral”.

### Comparación con el brief

La API ya permite:

- Configurar el umbral.
- Filtrar por `start_date` y `end_date`.
- Agrupar por mes, semana o día.
- Recibir periodo, gasto, baseline y ratio para las cuatro columnas.

Hay dos discrepancias funcionales:

1. **Ventana de baseline:** `detect_outcome_alerts` calcula la media de todos
   los gastos históricos anteriores al periodo actual. El brief exige la
   media móvil de los **3 periodos anteriores**. Para cumplirlo, el backend
   debe conservar solo los últimos tres valores al calcular el baseline.
2. **Validación del umbral:** el brief exige un ratio entre `0.01` y `1.0`.
   La API actual solo valida `threshold >= 0`. Debe cambiarse a
   `Query(default=0.3, ge=0.01, le=1.0)`, o el frontend debe asumir una
   responsabilidad que actualmente no está respaldada por el contrato API.

El frontend debe enviar el rango activo a la misma petición de alertas y
convertir `increase_ratio` a porcentaje visual multiplicándolo por 100, si la
columna se presenta como porcentaje.

## Funcionalidad 3 — Comparativa B2B vs B2C

### Recursos reales disponibles

#### `GET /api/metrics/categories/top`

Parámetros:

| Parámetro | Tipo | Obligatorio | Default |
|---|---|---:|---:|
| `operation_type` | `income \| outcome` | No | `outcome` |
| `limit` | `integer` | No | `5` |
| `start_date` | `date` | No | `null` |
| `end_date` | `date` | No | `null` |
| `business_type` | `B2B \| B2C` | No | `null` |

Petición para un grupo:

```http
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B
```

Respuesta:

```json
[
  {
    "category": "sales",
    "operation_type": "income",
    "total_amount": 123456.78
  }
]
```

La respuesta no incluye:

- `business_type` en cada elemento, aunque se conoce por la petición;
- porcentaje de la categoría sobre el total de ingresos del grupo;
- total global de ingresos del grupo.

Para obtener las dos tablas se necesitan dos peticiones, una con
`business_type=B2B` y otra con `business_type=B2C`, manteniendo
`operation_type=income` y `limit=5`.

#### `GET /api/metrics/facets`

Devuelve la lista global `categories`, pero no una lista de categorías
separada por `B2B` y `B2C`. Además, las categorías realmente presentes en
cada grupo deben inferirse de las respuestas filtradas de datos.

Por tanto, satisface parcialmente la necesidad de conocer categorías
disponibles, pero no el requisito “por cada grupo” como contrato explícito.

#### `GET /api/metrics/b2b` y `GET /api/metrics/b2c`

Estas rutas devuelven movimientos filtrados por grupo y aceptan:

```text
start_date, end_date, category, operation_type
```

El frontend podría sumar los movimientos `income` para calcular:

- total de ingresos B2B frente a B2C;
- porcentaje de cada categoría sobre el total de su grupo.

Sin embargo, esto desplaza agregación de negocio al cliente y obliga a
descargar todos los movimientos del periodo. No es una respuesta específica
para la vista comparativa.

#### `GET /api/metrics/comparison`

Acepta `start_date` y `end_date` obligatorios y devuelve:

```json
{
  "current_period": 1234.56,
  "previous_period": 1100.00,
  "delta_abs": 134.56,
  "delta_pct": 12.23
}
```

No devuelve pares B2B/B2C ni separa ingresos de gastos, por lo que no cubre
el gráfico requerido.

### Comparación con el brief

El endpoint `categories/top` cubre la identificación de las cinco categorías
de ingreso principales por grupo y admite el rango de fechas. No cubre por sí
solo los porcentajes ni el total de ingresos necesario para el gráfico.

Para un cumplimiento robusto se recomienda ampliar la API con una respuesta
comparativa que incluya, por grupo:

```typescript
{
  business_type: "B2B" | "B2C";
  total_income: number;
  categories: {
    category: Category;
    total_amount: number;
    percentage_of_group: number;
  }[];
}
```

La petición debería aceptar:

```text
start_date: date opcional
end_date: date opcional
```

Mientras no exista ese recurso, la alternativa de frontend es:

1. Pedir `categories/top` dos veces con `business_type=B2B` y `B2C`.
2. Pedir `/api/metrics/b2b` y `/api/metrics/b2c` con el mismo rango y
   `operation_type=income`.
3. Calcular en el cliente los totales y porcentajes.

Esta alternativa funciona con los recursos actuales, pero duplica consultas y
mantiene lógica financiera fuera de la API.

## Contrato de integración recomendado

Para mantener el mismo rango en las funcionalidades 1, 2 y 3, el frontend
debe conservar un estado compartido:

```typescript
type DateRange = {
  startDate?: string;
  endDate?: string;
};
```

Los parámetros vacíos deben omitirse de la URL, no enviarse como cadenas
vacías. Cuando no hay rango seleccionado, las peticiones deben usar los
valores por defecto de la API y mostrar todos los datos disponibles.

## Brechas que deben resolverse antes de considerar el brief completo

1. Conectar el filtro de fechas con el dashboard actual.
2. Añadir la tabla de alertas y representar explícitamente la respuesta `[]`.
3. Cambiar alertas a una ventana de tres periodos anteriores.
4. Restringir `threshold` a `0.01..1.0`.
5. Crear la nueva vista B2B/B2C.
6. Definir dónde se calculan porcentajes y totales de grupo; preferiblemente
   en un endpoint agregado de la API.
7. Decidir si `facets.categories` global es suficiente o si el contrato debe
   exponer categorías por `business_type`.
