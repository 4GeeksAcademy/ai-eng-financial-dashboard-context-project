# Funcionalidad 2: Tabla de Alertas de Anomalías

## Objetivo

Agregar una tabla debajo de los gráficos existentes para detectar periodos donde el gasto (`outcome`) sube de forma inesperada respecto a una línea base.

## Componentes de UI

- Input numérico `Umbral de alerta`.
- Tabla con columnas:
  - `Periodo`
  - `Outcome registrado`
  - `Media móvil (3 periodos previos)`
  - `Incremento porcentual`
- Estado vacío explícito cuando no hay alertas.

## Fuentes de datos

- `GET /api/metrics/alerts`
- Filtro de fechas global reutilizado de la Funcionalidad 1.

## Contrato API relevante

### GET /api/metrics/alerts

Query params relevantes:

- `threshold` opcional (backend default `0.3`).
- `group_by` opcional (default `month`).
- `start_date` opcional.
- `end_date` opcional.

Respuesta esperada (shape por fila):

```json
{
  "period": "2025-06",
  "outcome_total": 52100.25,
  "baseline_average": 40110.8,
  "increase_ratio": 0.2989
}
```

## Reglas de comportamiento

- Valor por defecto del umbral en UI: `0.3`.
- Rango permitido en UI según requerimiento: `0.01` a `1.0`.
- Cada cambio confirmado en umbral vuelve a consultar alertas.
- Si existe filtro global de fechas, se envía en la query de alertas.
- `increase_ratio` se renderiza en porcentaje (`ratio * 100`, por ejemplo `0.2989 => 29.89%`).

## Estado vacío

Cuando el endpoint devuelve `[]`, se debe mostrar mensaje explícito:

- Texto sugerido: `No se detectaron anomalías para el umbral actual en el rango seleccionado.`

## Gap actual backend vs requerimiento

- Requerimiento: media móvil de 3 periodos previos.
- Backend actual: `baseline_average` se calcula con todo el histórico previo dentro del summary filtrado.

Decisión de implementación recomendada:

- Opción A: mantener cálculo backend actual y renombrar texto UI a `Media histórica previa`.
- Opción B: ajustar backend para devolver baseline de ventana móvil de 3 periodos y mantener texto solicitado.

## Criterios de aceptación

1. La tabla se renderiza bajo los gráficos existentes.
2. El umbral inicial es `0.3`.
3. Cambiar el umbral actualiza resultados.
4. El filtro de fechas global afecta también la tabla de alertas.
5. Si no hay alertas, se muestra estado vacío explícito.
6. Se muestra periodo, outcome, baseline e incremento con formato legible.

## Pruebas sugeridas

- Umbral por defecto (`0.3`).
- Umbral bajo (`0.01`) y alto (`1.0`).
- Rango de fechas sin alertas.
- Rango de fechas con alertas.
- Validación de input fuera de rango.
