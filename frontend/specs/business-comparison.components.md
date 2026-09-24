# Especificación de componentes: vista comparativa B2B vs B2C

## Página

Crear una nueva vista/página del dashboard dedicada a la comparativa de ingresos entre B2B y B2C. La navegación hacia esta vista queda pendiente de la arquitectura actual; no asumir una librería de routing no verificada.

La página debe incluir:

1. filtro de rango de fechas reutilizado de la Funcionalidad 1;
2. dos secciones paralelas, una para B2B y otra para B2C;
3. un único gráfico inferior que compare el ingreso total de ambos grupos.

## Secciones paralelas

Cada sección debe identificar claramente su grupo (`B2B` o `B2C`) y mostrar una tabla con hasta cinco categorías:

- Categoría;
- Ingresos totales;
- Porcentaje sobre el total de ingresos del grupo.

Las filas proceden de `categories/top` con `operation_type=income`, `limit=5` y el `business_type` de la sección.

Si un grupo devuelve menos de cinco filas, mostrar solo las filas recibidas; no fabricar categorías o ceros.

## Gráfico comparativo

Debe existir un único gráfico bajo ambas tablas con dos valores agregados:

- total de ingresos B2B;
- total de ingresos B2C.

Los totales se derivan sumando `income` de las respuestas de `/api/metrics/summary` filtradas por `operation_type=income`, `group_by=month` y cada `business_type`.

No usar `/api/metrics/comparison`: su `current_period` representa neto (`income - outcome`), no ingresos totales.

## Filtro de fechas

- Dos controles opcionales: inicio y fin.
- Valores `YYYY-MM-DD`.
- Vacíos significan rango abierto y se omiten de las consultas.
- Reutilizar `min_date` y `max_date` de facets como referencia y restricciones visuales.
- Al cambiar el rango, recargar ambas tablas y el gráfico con exactamente el mismo filtro.
- Marcar un rango invertido como inválido y no enviar consultas.

## Estados y casos límite

- Mostrar carga de la página/secciones/gráfico sin ocultar la estructura completa.
- Mostrar error recuperable si falla facets, una tabla o los totales.
- Un array vacío de categorías es un resultado válido; mostrar estado vacío de esa sección.
- Si el total de ingresos de un grupo es `0`, no dividir: mostrar `N/D` o `0%` según una decisión de producto explícita, pero no `NaN`/`Infinity`.
- Si ambos grupos están vacíos o sus totales son cero, el gráfico debe mostrar estado sin datos explícito.
- No mezclar datos de un rango anterior con el rango actual.

## Evidencia

- ✅ Existen `Card`, `CardHeader`, `CardContent`, `formatCurrency` y `formatPercent` reutilizables.
- ✅ `BusinessType` admite exactamente `B2B` y `B2C`.
- ✅ `facets` proporciona categorías globales y tipos de negocio.
- ❌ `facets` no proporciona categorías separadas por grupo; cada tabla debe obtener sus filas de `categories/top` con `business_type`.
- ❌ `/api/metrics/comparison` no proporciona ingresos totales comparables; devuelve neto.
