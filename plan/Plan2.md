# Plan función 2: tabla de alertas de anomalías

## Objetivo

Añadir bajo los gráficos del dashboard una tabla que destaque los períodos con incrementos inesperados de gasto. Permitir configurar el umbral y respetar las fechas de la Funcionalidad 1.

Este documento describe el trabajo previsto; no implica implementar la funcionalidad.

## Estado actual y dependencia

- La [API](../backend/app/routes.py) dispone de `GET /api/metrics/alerts` con parámetros `threshold`, `group_by`, `start_date` y `end_date`.
- Su respuesta incluye `period`, `outcome_total`, `baseline_average` e `increase_ratio`.
- El cálculo actual compara cada período con todo su historial anterior, no con una media móvil de 3 períodos.
- La validación actual del umbral permite valores desde cero y no establece un máximo.
- [App.tsx](../frontend/src/App.tsx) todavía no consulta alertas ni muestra una tabla.
- La [Funcionalidad 1](./Plan1.md) está planificada, pero no implementada. La integración con sus controles de fecha depende de ella.

## Tareas previstas

### 1. Corregir el cálculo y la validación en la API

- Modificar `detect_outcome_alerts` en [routes.py](../backend/app/routes.py) para comparar el outcome de cada período con la media de los 3 períodos anteriores, excluyendo el período actual.
- No generar alertas hasta disponer de 3 períodos anteriores.
- Usar solo los períodos dentro del rango seleccionado, manteniendo el filtrado previo al cálculo.
- Mantener la agrupación mensual existente, sin añadir un selector de agrupación.
- Generar una alerta cuando `(outcome - media) / media` sea estrictamente mayor que el umbral.
- Mantener la protección existente frente a una media igual a cero.
- Validar `threshold` entre `0.01` y `1.0`, ambos incluidos, con valor predeterminado `0.3`.
- Preservar el contrato de respuesta existente.

### 2. Añadir el control del umbral

- Incorporar un input numérico etiquetado, con límites `0.01` y `1.0` y valor inicial `0.3`.
- Aclarar que el valor es un ratio: `0.3` equivale a un incremento del 30 %.
- Actualizar automáticamente la consulta al cambiar a un valor válido.
- Para un valor vacío o inválido, mostrar validación y no enviar una petición inválida ni sustituir silenciosamente el valor.

### 3. Mostrar la tabla bajo los gráficos

- Añadir un componente de alertas en [components/dashboard](../frontend/src/components/dashboard/) e integrarlo desde [App.tsx](../frontend/src/App.tsx).
- Tipar la respuesta en [financial-types.ts](../frontend/src/lib/financial-types.ts).
- Mostrar exactamente cuatro columnas:
  - Período.
  - Outcome registrado.
  - Media móvil de los 3 períodos anteriores.
  - Incremento porcentual.
- Reutilizar los formatos y estilos existentes para importes, porcentajes y períodos.
- Obtener los resultados desde `GET /api/metrics/alerts?threshold=<ratio>`, sin duplicar la detección en el frontend.

### 4. Integrar fechas y estados de la tabla

- Reutilizar `start_date` y `end_date` de la Funcionalidad 1 cuando esté implementada, enviándolos como `YYYY-MM-DD` y omitiendo los vacíos.
- No consultar con un rango invertido y mantener la validación acordada en la Funcionalidad 1.
- Cancelar o descartar respuestas obsoletas al cambiar fechas o umbral.
- Mostrar estados de carga y error explícitos, diferenciándolos de un resultado sin anomalías.
- Mantener visible la tabla o su contenedor cuando no haya alertas, con el mensaje: **No se detectaron anomalías para el umbral actual**.
- Evitar presentar resultados anteriores como si correspondiesen al filtro o umbral nuevo.

### 5. Documentar y verificar

- Documentar el contrato, la media móvil, el umbral, la dependencia de fechas y los estados visibles.
- Ejecutar `npm run build` desde `frontend` y lint sobre los archivos modificados con las herramientas existentes.
- Ejecutar únicamente las pruebas existentes relevantes del endpoint de alertas en [test_routes.py](../backend/tests/test_routes.py).
- Comprobar de forma dirigida la ventana de 3 períodos con datos donde difiera de la media acumulada; la prueba existente del endpoint solo verifica la forma de la respuesta.
- Verificar:
  - Menos de 3 períodos previos: no se generan alertas.
  - Media cero: no hay división por cero.
  - Incremento igual al umbral: no hay alerta; incremento superior: sí.
  - Valores límite `0.01` y `1.0`, y rechazo de entradas inválidas.
  - Fechas vacías, un solo extremo y ambos extremos.
  - Solo se utilizan períodos dentro del rango seleccionado.
  - Estados de carga, error y ausencia de anomalías.
  - Cambios rápidos de fechas o umbral: no se muestran respuestas obsoletas.
  - El ratio de incremento se muestra como porcentaje.
- No añadir tests nuevos ni dependencias. Informar qué verificaciones se ejecutaron y cuáles quedaron pendientes.

## Alcance y límites

- Cambios futuros limitados al cálculo y validación de alertas, su tabla, el input de umbral, la integración con fechas y la documentación relacionada.
- No implementar la Funcionalidad 1 como parte de esta tarea; utilizarla como requisito previo.
- No añadir otros filtros, gráficos ni refactorizaciones ajenas.
- Preservar los patrones visuales y de idioma del dashboard e identificar los datos como simulados cuando corresponda.
- Crear este documento no autoriza a implementar código ni a crear un commit.
