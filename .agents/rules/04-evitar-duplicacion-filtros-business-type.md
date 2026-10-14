# Evitar duplicacion en filtros por tipo de negocio

## Alcance
Endpoints de metricas en backend.

## Regla
No duplicar el mismo flujo de generacion, filtrado y orden en endpoints variantes por business_type.
La variacion por tipo de negocio debe centralizarse en una funcion reutilizable.

## Razon
Actualmente hay duplicacion en rutas B2B y B2C, lo que incrementa riesgo de divergencia.
Evidencia de Fase 2: backend/app/routes.py (get_b2b_metrics y get_b2c_metrics).

## Como verificarla
1. Buscar endpoints que solo cambian un parametro de negocio.
2. Confirmar que comparten una misma funcion de filtrado reusable.
3. Rechazar cambios que copien y peguen bloques casi identicos para cada variante.