# Filtro por rango de fechas

## Objetivo
Permitir analizar los datos del dashboard financiero para un período seleccionado.

## Usuario
Equipo de Finanzas.

## Historia de usuario
Como integrante del equipo de Finanzas, quiero seleccionar una fecha de inicio y una de fin para analizar los datos de un período específico.

## Requisitos funcionales
- Mostrar campos de fecha de inicio y fin en la parte superior del dashboard.
- Permitir seleccionar ambas fechas, solo una o dejar ambas vacías para mostrar todos los datos.
- Aplicar las fechas seleccionadas a todos los datos del dashboard.
- Enviar las fechas a la API como `start_date` y `end_date`, en formato `YYYY-MM-DD`.
- Mostrar el rango de fechas disponible obtenido de `GET /api/metrics/facets` (`min_date` y `max_date`).
- Informar cuando la fecha de inicio sea posterior a la de fin, cuando el período no tenga datos o cuando ocurra un error de API, sin bloquear la interfaz.

## Criterios de aceptación
1. Los campos de inicio y fin aparecen en la parte superior del dashboard.
2. El usuario puede seleccionar ambas fechas o solo una.
3. Si ambos campos están vacíos, se muestran todos los datos.
4. Las fechas seleccionadas se envían como `start_date` y `end_date` en formato `YYYY-MM-DD`.
5. Todos los datos del dashboard reflejan el período seleccionado.
6. El rango disponible (`min_date` y `max_date`) es visible.
7. Se informa al usuario de un rango inválido, de un período sin datos o de un error de API sin bloquear la interfaz.

## Fuera de alcance
- Comparación entre períodos.
- Filtros por otras dimensiones.
- Exportación de datos filtrados.
