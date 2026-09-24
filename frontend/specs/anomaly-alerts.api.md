# Especificación de contrato de datos: alertas de anomalías

## Endpoint

```http
GET /api/metrics/alerts
```

Query base:

```http
GET /api/metrics/alerts?threshold=0.3&group_by=month
```

Cuando existe un rango activo, reenviar los mismos filtros de la Funcionalidad 1:

```http
GET /api/metrics/alerts?threshold=0.3&group_by=month&start_date=2025-01-01&end_date=2025-12-31
```

Los parámetros de fecha vacíos deben omitirse.

## Parámetros verificados

- ✅ `threshold` existe; default actual `0.3`.
- ✅ `group_by` existe y acepta `day`, `week` y `month`; esta tabla debe usar explícitamente `month`.
- ✅ `start_date` y `end_date` existen y son opcionales.
- ✅ `business_type` existe, pero queda fuera de esta funcionalidad.
- ❌ El backend no declara actualmente `le=1.0` ni `ge=0.01`; declara mínimo `0`.
- ❌ No debe afirmarse que el backend garantiza el rango PM `0.01..1.0`. La UI sí debe validarlo como requisito de producto.

## Respuesta actual

La respuesta exitosa es un array de objetos:

```json
[
  {
    "period": "2025-12",
    "outcome_total": 103378.98,
    "baseline_average": 59573.44,
    "increase_ratio": 0.7353
  }
]
```

Mapeo de presentación:

- `period` → período;
- `outcome_total` → outcome registrado;
- `increase_ratio * 100` → incremento porcentual.

## Discrepancia crítica: media móvil

El outcome exige la media móvil de los tres períodos anteriores. El endpoint actual calcula `baseline_average` como promedio de los períodos históricos anteriores disponibles, no como promedio de una ventana de tres.

No es válido convertir o renombrar ese campo en frontend y afirmar que cumple el outcome.

Antes de implementar la tabla se necesita una decisión contractual:

1. cambiar backend para devolver una media móvil de tres períodos;
2. añadir un campo explícito, por ejemplo `moving_average_3`, manteniendo compatibilidad;
3. modificar el copy del producto a `Promedio histórico anterior`.

Esta spec adopta temporalmente la opción 3 solo como representación fiel del contrato actual; no considera completado el outcome original hasta resolverlo.

## Rangos, filtros y casos de respuesta

- `threshold=0.01`, `0.3` y `1.0` fueron verificados como valores utilizables en runtime.
- Un resultado `200` con array vacío es un estado válido y debe mostrar el mensaje vacío explícito.
- Errores HTTP o de red deben mostrar un estado de error recuperable.
- `increase_ratio` debe tratarse como ratio decimal.
- La semántica de inclusión de fechas en los extremos y el comportamiento funcional de rangos parciales permanecen ❓ sin verificar; no deben documentarse como garantías.

## Compatibilidad con Funcionalidad 1

Cuando `start_date` o `end_date` estén seleccionados en el filtro global, la consulta de alertas debe incluirlos con los mismos nombres y formato `YYYY-MM-DD`. Al cambiar el rango, se debe invalidar y recargar la tabla para evitar mostrar alertas de otro conjunto de datos.
