# Contrato de API para las tres funcionalidades

## Alcance y evidencia

Esta especificación distingue el contrato existente del comportamiento requerido por el PM. No implementa los cambios descritos ni presupone que los planes estén ejecutados.

- Se consultaron `/docs` y el `/openapi.json` enlazado desde Swagger con el backend iniciado temporalmente durante esta sesión.
- Se comprobaron respuestas reales de métricas, facetas, alertas, categorías y resumen, además de validaciones de fechas y umbral.
- Se contrastaron los resultados con [App.tsx](../src/App.tsx), [financial-types.ts](../src/lib/financial-types.ts), [financial-utils.ts](../src/lib/financial-utils.ts), [vite.config.ts](../vite.config.ts) y [routes.py](../../backend/app/routes.py).
- El backend temporal se detuvo tras la exploración. Los datos son simulados y su rango depende de la fecha de ejecución.

## Patrón de consumo existente

- El único `fetch` encontrado en el frontend está en `fetchFinancialData`, dentro de [App.tsx](../src/App.tsx). Consulta `/api/metrics` sin parámetros y declara devolver `FinancialMovement[]`.
- La base es `import.meta.env.VITE_API_BASE_URL ?? ""`. No fijar `localhost:8000` en los nuevos consumidores.
- Con base vacía, las peticiones son relativas. En desarrollo, Vite redirige `/api` mediante `VITE_API_PROXY_TARGET`, cuyo valor predeterminado es `http://backend:8000`.
- Se comprueba `response.ok`, se lanza un error para respuestas no satisfactorias y se obtiene el cuerpo con `response.json()`.
- La respuesta es un array directo, no un objeto con una propiedad `data`. Los KPIs, agregados mensuales y período del encabezado se calculan en el frontend a partir de esos movimientos.
- El código actual muestra un error general y finaliza el estado de carga. No incorpora aún filtros, consumo de alertas, navegación comparativa ni cancelación de peticiones.

**Criterio para las futuras funcionalidades:** conservar la URL base y la comprobación HTTP; construir parámetros sin campos vacíos, tipar cada respuesta y distinguir errores de arrays vacíos. Cancelar o descartar respuestas obsoletas al cambiar filtros. El tipado TypeScript actual no constituye validación del JSON en tiempo de ejecución.

## Terminología del PM y campos reales

| Término funcional | Campo o parámetro real | Resolución en la especificación |
|---|---|---|
| Fecha de inicio / fin | `start_date` / `end_date` | Query opcional en `YYYY-MM-DD`; límites inclusivos. |
| Fecha del movimiento | `create_date` | No existe un campo `date` en el movimiento. |
| Ingresos / gastos | `operation_type=income` / `operation_type=outcome` | La API usa `outcome`, no `expense`. |
| Línea de negocio / grupo | `business_type=B2B` o `B2C` | No confundir con `operation_type`. |
| Categoría | `category` | Identificador de la API; las facetas suministran categorías disponibles, no nombres traducidos. |
| Outcome registrado de una alerta | `outcome_total` | No confundir con `amount` de un movimiento ni `outcome` de un resumen. |
| Media móvil de 3 períodos | `baseline_average` | El campo existe, pero el cálculo actual es acumulado; requiere corregir la semántica. |
| Incremento porcentual | `increase_ratio` | La API devuelve ratio: multiplicar por 100 antes de presentarlo como porcentaje. |
| Umbral de alerta | `threshold` | El input usa ratio: `0.3` significa 30 %, no `30`. |
| Total de ingresos de una categoría | `total_amount` con `operation_type=income` | No existe `total_income` en la respuesta del top. |
| Porcentaje de categoría sobre el grupo | No viene en la respuesta | Calcular `total_amount / ingresos_totales_del_grupo × 100`. |
| Período | `period` en alertas y resumen | Con agrupación mensual es `YYYY-MM`; no es el rango global del dataset. |

El helper existente `formatPercent` recibe porcentajes ya escalados: `formatPercent(15.555)` produce `15.6%`. Por ello, `increase_ratio=0.3` debe convertirse a `30` antes de usarlo. Los porcentajes de categorías también se calculan en escala 0–100. `formatCurrency` presenta USD sin decimales; el redondeo de presentación no debe alterar los cálculos.

## 1. Filtro de rango de fechas

### Contrato existente

`GET /api/metrics`

Parámetros opcionales:

- `start_date`, `end_date`: fechas.
- `category`: `suppliers`, `sales`, `operational`, `administrative`, `others`.
- `operation_type`: `income` o `outcome`.

Respuesta 200: array de movimientos con esta forma:

```json
[{
  "create_date": "2025-11-01",
  "amount": 5465.56,
  "operation_type": "income",
  "category": "sales",
  "business_type": "B2C"
}]
```

`GET /api/metrics/facets` no declara parámetros y devuelve un objeto con:

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-11-01",
  "max_date": "2026-10-28"
}
```

Las fechas del ejemplo se observaron durante la exploración, no son constantes del producto.

### Comportamiento requerido

- Ambos inputs son opcionales y comienzan vacíos. Omitir los parámetros vacíos, no enviarlos como `start_date=`.
- Sin fechas se muestran todos los movimientos; con un único extremo, el intervalo queda abierto por el otro.
- Aplicación automática. Si inicio supera a fin, mostrar error, no consultar y conservar los últimos datos válidos.
- Todos los KPIs, ambos gráficos y el período del encabezado deben representar la misma respuesta filtrada.
- Mostrar el rango disponible de facets por separado del período efectivamente mostrado. No fijar años ni presentar datos simulados como datos reales.
- Los filtros necesarios ya existen en el backend. El consumo y los controles aún deben añadirse al frontend.

## 2. Tabla de alertas de anomalías

### Contrato existente

`GET /api/metrics/alerts`

Todos los parámetros son opcionales:

| Parámetro | Contrato actual |
|---|---|
| `threshold` | Número mayor o igual a `0`, defecto `0.3`, sin máximo. |
| `group_by` | `day`, `week`, `month`; defecto `month`. |
| `start_date`, `end_date` | Fechas. |
| `business_type` | `B2B` o `B2C`. |

Respuesta 200: array de objetos con `period` (string), `outcome_total`, `baseline_average` e `increase_ratio` (números). Sin alertas devuelve `[]`.

### Desajustes y comportamiento requerido

- **Ventana:** el backend usa todos los períodos anteriores. Se requiere exactamente la media de los 3 períodos anteriores, excluyendo el actual, y no generar alertas hasta disponer de esos 3.
- **Alcance temporal:** filtrar primero por fechas y calcular después usando únicamente los períodos dentro del rango seleccionado. Mantener la agrupación mensual existente y no añadir períodos artificiales.
- **Condición:** generar alerta si `(outcome - media) / media > threshold`. Con media cero no generar una alerta por división indefinida.
- **Validación:** exigir `0.01 ≤ threshold ≤ 1.0`, valor inicial `0.3`, tanto en el input como en la API. Actualmente `threshold=1.1` devuelve 200; un valor negativo devuelve 422.
- **Presentación:** cuatro columnas: período, outcome registrado, media móvil e incremento porcentual. Aplicar automáticamente cambios de umbral válido y las fechas compartidas.
- **Estado vacío:** mantener visible el contenedor con «No se detectaron anomalías para el umbral actual». Un fallo HTTP no equivale a ausencia de anomalías.

## 3. Comparativa B2B vs B2C

### Contrato existente

`GET /api/metrics/categories/top`

- `operation_type`: `income` o `outcome`; **por defecto `outcome`**, por lo que la comparativa debe enviar `income` explícitamente.
- `limit`: entero entre `1` y `20`, defecto `5`.
- `business_type`, `start_date`, `end_date`: opcionales.
- Respuesta 200: array ordenado por importe descendente de `{ category: string, operation_type: string, total_amount: number }`.

Ejemplo de consulta por grupo:

```text
/api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B
```

`GET /api/metrics/summary`

- Parámetros opcionales: `group_by` (`day`, `week`, `month`, defecto `month`), `category`, `operation_type`, `business_type`, `start_date`, `end_date`.
- Respuesta 200: array de `{ period: string, income: number, outcome: number, net: number }`.
- Consultar por grupo con `operation_type=income`, sumar `income` de todos sus períodos y utilizar ese total en el gráfico y como denominador de los porcentajes.

### Desajustes y comportamiento requerido

- **Cinco categorías:** significa hasta 5 categorías reales, no cinco filas obligatorias. Se observaron solo `sales` y `others` como categorías de ingreso; no modificar datos ni inventar filas.
- **Porcentajes:** el top no devuelve porcentajes ni el total completo del grupo. No calcular el denominador sumando solo el top 5, aunque ahora existan menos categorías.
- **Facetas por grupo:** el endpoint actual solo ofrece categorías globales. Se requiere ampliarlo con filtros opcionales `business_type` y `operation_type`, manteniendo el contrato sin filtros y el rango global de referencia. Para combinaciones sin movimientos, devolver listas vacías sin acceder a elementos inexistentes.
- **Página y filtros:** navegación `#/comparativa`, sin dependencias nuevas; fechas compartidas con el dashboard principal, conservadas al navegar.
- **Presentación:** dos tablas en paralelo en escritorio, apiladas en móvil; debajo, un solo gráfico de dos barras con los ingresos completos B2B y B2C.
- **Sin ingresos:** mostrar estado vacío y evitar dividir por cero. Un fallo de consulta no debe convertirse silenciosamente en un total cero.

## Verificación y límites

- Swagger enlaza `/openapi.json`; se contrastaron parámetros, valores predeterminados y esquemas de respuesta.
- Una consulta con inicio y fin iguales devolvió movimientos de ese día, confirmando inclusión de extremos.
- Una fecha inválida y un umbral negativo devolvieron 422 con objeto `detail` que contiene una lista de errores.
- Para `2026-03`, la API devolvió `baseline_average=55334.29`, coincidente con la media acumulada anterior; la media de los 3 períodos anteriores era `59977.58`. Esto confirma el desajuste de ventana.
- Se probaron top de categorías y resumen para B2B y B2C, verificando que el resumen permite obtener los totales completos.
- El contraste de `fetch`, URL base, proxy, tipado y formatos fue estático. No se validó una interfaz de estas funcionalidades, que aún no está implementada.
- Esta entrega solo añade documentación: no modifica backend, frontend ejecutable, dependencias ni tests.
