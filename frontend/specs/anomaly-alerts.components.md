# Especificación de componentes: tabla de alertas

## Ubicación

Añadir la sección debajo de los gráficos actuales `IncomeOutcomeChart` y `ProfitPercentChart`.

La sección debe contener:

1. Un input numérico de umbral.
2. Una tabla de anomalías.
3. Un estado vacío explícito cuando la respuesta no contiene alertas.

No debe desaparecer la sección cuando no existan anomalías.

## Input de umbral

- Etiqueta accesible: `Umbral de alerta`.
- Valor inicial de UI: `0.10`, según el brief actual; no omitir el parámetro esperando que la API aplique `0.3`.
- Ratio permitido por la UI: `0.01` a `1.00`.
- `step="0.01"`.
- Mostrar el valor como ratio decimal; si se usa una ayuda porcentual, aclarar la conversión.
- Rechazar valores fuera de rango, vacíos o no numéricos antes de solicitar datos.
- Al cambiar un valor válido, volver a cargar las alertas.

La validación frontend satisface el outcome PM, pero no reemplaza la validación backend actual, que solo garantiza `threshold >= 0`.

## Tabla

Columnas visibles solicitadas por PM:

- `Período` (`period`);
- `Outcome registrado` (`outcome_total`);
- `Media móvil de los 2 períodos anteriores` — **pendiente de contrato**: la API actual solo ofrece `baseline_average`, que no está verificado como media móvil de dos períodos;
- `Categoría registrada` — **pendiente de contrato**: la API actual no devuelve un campo de categoría en las alertas;
- `Incremento porcentual` (`increase_ratio * 100`, formateado como porcentaje).

Hasta que el backend cambie o se verifique una ventana de tres períodos, no presentar `baseline_average` con esa etiqueta. La alternativa compatible actual es `Promedio histórico anterior`.

## Estados

- Carga: mostrar skeleton o indicador dentro de la sección.
- Error: mostrar un mensaje recuperable sin presentar datos parciales como resultado actual.
- Éxito con filas: mostrar tabla.
- Éxito con array vacío: mostrar explícitamente `No se detectaron anomalías para este umbral.`
- La tabla y la consulta deben respetar `startDate` y `endDate` activos de la Funcionalidad 1.

## Accesibilidad y presentación

- Usar encabezados de tabla asociados correctamente a sus celdas.
- Mantener orden de filas devuelto por la API salvo que una decisión de producto indique lo contrario.
- Formatear outcomes como moneda mediante el formateador existente y ratios como porcentajes.
- No ocultar la sección en estados vacío, carga o error.

## Evidencia

- ✅ Existen `Card`, `CardHeader`, `CardContent`, `Skeleton`, `formatCurrency` y `formatPercent` reutilizables.
- ✅ Existen dos gráficos bajo los que puede ubicarse la sección.
- ❌ No existe actualmente un componente de alertas ni input de umbral.
- ✅ La API puede devolver un array vacío; la UI debe tratarlo como estado válido.
