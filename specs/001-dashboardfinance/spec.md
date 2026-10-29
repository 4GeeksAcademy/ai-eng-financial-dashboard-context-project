# Dashboard financiero: filtros, alertas y comparación

## Objetivo

Permitir filtrar el dashboard por fechas, consultar alertas de aumentos inesperados de gastos y comparar los ingresos de los grupos B2B y B2C.

## Historia de usuarios

- Como integrante del equipo de finanzas, quiero limitar el dashboard a un rango de fechas para analizar un período concreto.
- Como integrante del equipo de finanzas, quiero ver los períodos con aumentos inesperados de gastos y la media de los tres períodos anteriores.
- Como usuario del dashboard, quiero comparar las cinco categorías de ingresos principales y el ingreso total de B2B frente a B2C para un rango seleccionado.

## Requisitos

### Funcionales

**RF-1. Filtro del dashboard**

- Mostrar inputs opcionales de fecha de inicio y fin en el dashboard principal.
- Enviar las fechas como `YYYY-MM-DD` a `GET /api/metrics`; omitir los parámetros vacíos.
- Consultar `GET /api/metrics/facets` y mostrar `min_date` y `max_date` como rango disponible.
- Aplicar el mismo rango a todos los KPI y gráficos actuales, y a la consulta de alertas.
- El esquema de `/api/metrics` declara ambas fechas opcionales; `MetricsFacets` declara `min_date` y `max_date`.

**RF-2. Alertas de gastos**

- Añadir debajo de los gráficos una tabla con período, gasto registrado, media de los tres períodos anteriores e incremento porcentual.
- Añadir un input numérico de ratio con valor por defecto `0.3` y límites `0.01` a `1.0`.
- Consultar `GET /api/metrics/alerts` con umbral y fechas seleccionadas. Usar períodos mensuales, coherentes con el valor por defecto `group_by=month` del endpoint.
- Mostrar un estado vacío explícito cuando no haya alertas.
- Comparar cada mes con la media de los tres meses calendario completos inmediatamente anteriores. La búsqueda de esos meses de referencia puede extenderse antes del inicio del rango elegido; solo se muestran alertas dentro del rango elegido.
- El incremento dispara una alerta solo cuando `increase_ratio` es mayor que `threshold`. Mostrar `increase_ratio` como porcentaje multiplicándolo por 100.

**RF-3. Comparativa B2B/B2C**

- Añadir una página accesible desde la navegación con dos secciones paralelas, una por grupo, y un gráfico común de ingresos totales.
- Mostrar hasta cinco categorías de ingreso por grupo, con nombre, total y porcentaje sobre el total de ingresos de ese grupo.
- Consultar `/api/metrics/categories/top` con `operation_type=income`, `limit=5`, fechas y `business_type=B2B|B2C`.
- Obtener los totales de ingresos por grupo con `/api/metrics/summary`, que admite `business_type`, `operation_type` y fechas.
- Obtener las facetas desde `/api/metrics/facets`.
- Calcular cada porcentaje usando el total de ingresos del grupo para el rango completo, no la suma del top cinco.

### Resolución de desajustes con la API

- **Umbral:** ampliar la validación de `GET /api/metrics/alerts` a `0.01 <= threshold <= 1.0`, conservando `0.3` como valor predeterminado.
- **Media de alertas:** cambiar `baseline_average` para que represente la media de `outcome` de los tres meses calendario completos anteriores. Mantener el contexto previo aunque quede fuera del rango solicitado y devolver únicamente alertas dentro de ese rango.
- **Fechas invertidas:** validar `start_date <= end_date` en el backend y responder con error HTTP 422 si no se cumple. El frontend también debe evitar enviar ese rango y mostrar el error junto al filtro.
- **Facetas por grupo:** ampliar `MetricsFacets` con `categories_by_business_type`, un mapa de `B2B` y `B2C` a sus categorías disponibles. Mantener `categories` global si otros consumidores la usan.
- **Top categorías e ingresos:** enviar siempre `operation_type=income` porque el endpoint usa `outcome` por defecto. `TopCategoryItem` no necesita incluir porcentaje: calcularlo en el frontend dividiendo `total_amount` por la suma de `income` devuelta por `/api/metrics/summary` para el mismo grupo y rango.

### No funcionales

- Los parámetros de fechas enviados a la API deben conservar el formato `YYYY-MM-DD`.
- El umbral se representa como ratio decimal entre `0.01` y `1.0`; la interfaz lo muestra como incremento porcentual.
- No se definen en esta solicitud objetivos de rendimiento, accesibilidad o compatibilidad.

## Casos límite

- Fechas vacías, solo inicio, solo fin, mismo día, fechas fuera del rango disponible e inicio posterior al fin.
- Rango válido sin movimientos; inputs inválidos o respuesta fallida de facetas, métricas o alertas.
- Menos de tres períodos anteriores disponibles, media previa igual a cero y aumento exactamente igual al umbral.
- Umbral vacío o fuera del rango permitido; ninguna alerta para el rango y umbral actuales.
- Menos de cinco categorías, grupo sin ingresos, total del grupo igual a cero y empate en los totales de categorías.
- En la comparativa, fechas y totales deben corresponder al mismo rango para ambos grupos.

## Fuera de alcance

- Cambiar el origen o la persistencia de los datos financieros.
- Añadir métricas distintas de las descritas para el dashboard principal y la comparativa B2B/B2C.
- Añadir agrupaciones de alertas distintas del período mensual indicado en estos requisitos.

## Criterios de aceptación

1. Con ambos inputs de fecha vacíos se consulta sin parámetros de fecha; con fechas definidas se envían como `YYYY-MM-DD` y se muestran `min_date` y `max_date` cerca de los inputs.
2. Los KPI y gráficos del dashboard y las filas de alertas reflejan el rango seleccionado. Un rango invertido no se envía a la API y se informa al usuario.
3. El umbral inicia en `0.3`, solo admite valores entre `0.01` y `1.0`, y la tabla muestra las cuatro columnas solicitadas.
4. Cada alerta compara el mes con los tres meses calendario completos anteriores, incluso si quedan antes del inicio del filtro; solo aparecen alertas dentro del rango seleccionado. El umbral aplica como ratio decimal y la interfaz muestra el incremento en porcentaje; sin alertas se muestra un estado vacío.
5. La nueva página muestra una tabla B2B y otra B2C con hasta cinco categorías de ingreso, sus totales y porcentajes calculados sobre el ingreso total del grupo.
6. El gráfico compara los ingresos totales de B2B y B2C para el mismo rango utilizado en ambas tablas.
7. Las facetas devuelven categorías diferenciadas para B2B y B2C. Las consultas de top categorías envían explícitamente `operation_type=income`, y el porcentaje se calcula sobre el total completo de ingresos del mismo grupo y rango.
8. El backend rechaza con HTTP 422 cualquier rango con inicio posterior al fin; el frontend muestra validación y no envía esa consulta.
9. Las situaciones de grupo sin ingresos, rango sin resultados y error de consulta muestran estados distinguibles y no porcentajes indefinidos.