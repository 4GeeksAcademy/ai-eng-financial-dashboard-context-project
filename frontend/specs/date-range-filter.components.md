# Especificación de componentes: filtro de rango de fechas

## Ubicación y controles

Añadir en la zona superior del dashboard, asociado al encabezado y antes de los KPI:

- control accesible con etiqueta `Fecha de inicio`;
- control accesible con etiqueta `Fecha de fin`;
- ayuda contextual con `Datos disponibles: min_date – max_date`.

Los controles pueden pertenecer a `DashboardHeader` o a un componente de filtros separado, pero deben aparecer visualmente junto al encabezado.

## Comportamiento

- Usar controles nativos de fecha o equivalentes accesibles.
- Permitir que ambos valores estén vacíos.
- No seleccionar fechas por defecto.
- Conservar valores en `YYYY-MM-DD`.
- Usar `min` y `max` del rango disponible cuando las facets estén cargadas.
- Si ambos están vacíos, mostrar todos los datos.
- Aplicar el filtro a KPI, ambos gráficos y período del encabezado; no mezclar datos viejos y nuevos.
- Una respuesta válida con cero movimientos debe mostrar estado vacío, no error de red.

## Validación y estados

- Rechazar o marcar un rango invertido (`inicio > fin`).
- No inventar rango si falla la carga de facets; mostrar estado no disponible.
- Mostrar estado de carga de facets cerca de la ayuda contextual.
- Mostrar estado de carga de métricas sin ocultar innecesariamente los controles.
- Mostrar error recuperable si falla facets o la consulta de métricas.
- La política de aplicación automática, debounce y rangos parciales queda pendiente de decisión de producto; no implementarla implícitamente en esta spec.

## Evidencia

- ✅ `DashboardHeader`, `KpiRow`, `IncomeOutcomeChart` y `ProfitPercentChart` existen.
- ✅ El frontend actual calcula KPI y gráficos desde los movimientos cargados.
- ✅ El rango mostrado debe usar `min_date` y `max_date` de facets.
- ❌ No debe afirmarse que el frontend actual ya tiene estos inputs.
- ❓ No está verificado el formato localizado de presentación; solo el formato enviado a API (`YYYY-MM-DD`).
