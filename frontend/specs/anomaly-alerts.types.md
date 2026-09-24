# Especificación de tipos: alertas de anomalías

## Contrato actual de API

```ts
interface MetricsAlert {
  period: string
  outcome_total: number
  baseline_average: number
  increase_ratio: number
}
```

`increase_ratio` es un ratio decimal: `0.7353` se presenta como `73.5%`, no como `0.7353%`.

## Tipos de estado y consulta

```ts
type AlertsStatus = "idle" | "loading" | "success" | "empty" | "error"

type AlertsQuery = {
  threshold: number
  groupBy: "month"
  startDate?: string
  endDate?: string
}

interface AlertsState {
  alerts: MetricsAlert[]
  status: AlertsStatus
  errorMessage: string | null
  threshold: number
}
```

- `threshold` inicia en `0.3`.
- La UI valida `0.01 <= threshold <= 1.0`, con precisión de `0.01`.
- Fechas opcionales usan `YYYY-MM-DD`; valores vacíos se omiten de la consulta.
- `groupBy` se fija en `month` para esta tabla.

## Discrepancia que debe conservarse explícitamente

El PM solicita una media móvil de los tres períodos anteriores. El contrato actual devuelve `baseline_average`, que representa el promedio histórico anterior disponible, no una ventana móvil de tres períodos.

Por tanto:

- ✅ `MetricsAlert` refleja fielmente la respuesta actual.
- ❌ No debe etiquetarse `baseline_average` como media móvil de tres períodos sin cambiar/verificar el backend.
- ❓ La decisión de cambiar el backend o ajustar la etiqueta sigue pendiente.

## Evidencia API

- ✅ `/api/metrics/alerts` devuelve un array con `period`, `outcome_total`, `baseline_average` e `increase_ratio`.
- ✅ El endpoint acepta `threshold`, `group_by`, `start_date` y `end_date`.
- ✅ `group_by=month` está permitido.
- ✅ El default actual de `threshold` es `0.3` y el backend acepta valores `>= 0`.
- ❌ El backend actual no declara el rango `0.01..1.0`; la validación frontend del PM es adicional.
