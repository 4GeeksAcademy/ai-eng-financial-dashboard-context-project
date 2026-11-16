# Plan función 1: filtro de rango de fechas

## Objetivo

Permitir filtrar todos los datos del dashboard principal por un período opcional. Mostrar el rango real del dataset junto a los controles como referencia.

Este documento describe el trabajo previsto; no implica implementar la funcionalidad.

## Estado actual

- [App.tsx](../frontend/src/App.tsx) consulta `GET /api/metrics` sin filtros y utiliza los movimientos recibidos para calcular los KPIs, ambos gráficos y el período del encabezado.
- La [API](../backend/app/routes.py) ya acepta `start_date` y `end_date` opcionales, con límites inclusivos.
- `GET /api/metrics/facets` ya devuelve `min_date` y `max_date` del dataset completo.
- Los datos son simulados y su rango depende de la fecha de ejecución; no se debe fijar un período en la interfaz.

## Tareas previstas

### 1. Obtener y mostrar el rango disponible

- Añadir en [financial-types.ts](../frontend/src/lib/financial-types.ts) el tipo necesario para los metadatos de fechas.
- Consultar `GET /api/metrics/facets` al cargar el dashboard, utilizando la misma URL base que la petición de métricas.
- Mostrar `min_date` y `max_date` cerca de los controles, independientemente del filtro aplicado.
- Indicar que los datos son simulados.
- Mostrar un error explícito si no se puede obtener el rango, sin bloquear la carga independiente de métricas.

### 2. Añadir los controles de fecha

- Incorporar dos inputs de tipo `date` en la parte superior de [App.tsx](../frontend/src/App.tsx), con etiquetas accesibles para inicio y fin.
- Mantener ambos campos vacíos inicialmente y permitir utilizarlos por separado.
- Aplicar automáticamente el filtro al cambiar cualquiera de las fechas, sin botón de aplicación.
- Si inicio es posterior a fin, mostrar un error, no enviar la consulta y conservar los últimos datos válidos.

### 3. Conectar el filtro con todos los datos visibles

- Extender la petición existente a `GET /api/metrics` con `start_date` y `end_date` en formato `YYYY-MM-DD`.
- Omitir los parámetros correspondientes a campos vacíos; si ambos están vacíos, solicitar todos los movimientos.
- Recalcular los KPIs, los dos gráficos y el período del encabezado a partir de la misma respuesta filtrada.
- Mantener el rango disponible de facets separado del período de los movimientos mostrados.
- Cancelar o descartar respuestas obsoletas para que una petición anterior no sobrescriba la selección actual, incluso si se introduce un rango inválido durante una carga.
- Gestionar estados de carga, error y respuesta vacía sin presentar datos antiguos como resultado del nuevo filtro.

### 4. Actualizar la documentación relacionada

- Documentar el filtro y sus estados en las especificaciones del frontend.
- Actualizar [income-expense-chart.md](../frontend/specs/income-expense-chart.md) para reflejar que el gráfico utiliza los movimientos del período seleccionado, conservando el agrupamiento mensual existente.

### 5. Verificar el comportamiento

- Ejecutar la compilación de frontend con `npm run build` desde `frontend`.
- Ejecutar ESLint sobre los archivos TypeScript modificados.
- Comprobar manualmente:
  - Ambos campos vacíos: se muestran todos los datos.
  - Solo inicio: se incluyen movimientos desde esa fecha.
  - Solo fin: se incluyen movimientos hasta esa fecha.
  - Ambos extremos: límites inclusivos, también cuando inicio y fin coinciden.
  - Inicio posterior a fin: error visible, sin consulta y conservando los últimos datos válidos.
  - Rango sin movimientos: estados vacíos coherentes, sin datos residuales.
  - Cambios rápidos: los resultados corresponden a la última selección válida.
  - Fallos de métricas o facets: errores explícitos y estados diferenciados.
  - Rango disponible: coincide con `min_date` y `max_date` de facets.
  - KPIs, ambos gráficos y encabezado: corresponden a la misma respuesta filtrada.
- No añadir tests nuevos ni ejecutar repetidamente la suite completa.
- Indicar en el resultado qué verificaciones se ejecutaron y cuáles quedaron pendientes.

## Alcance y límites

- Reutilizar los filtros existentes: no se prevén cambios de backend.
- No añadir dependencias, nuevos gráficos, otros filtros ni refactorizaciones ajenas.
- Preservar el diseño responsive y los patrones visuales y de idioma existentes.
- Mantener sin cambios los archivos preexistentes que no estén relacionados con la funcionalidad.
- La implementación requiere una petición posterior explícita.
