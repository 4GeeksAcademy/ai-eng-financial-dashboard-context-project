---
name: financial-dashboard-domain-rules
description: Aplica reglas de dominio del dashboard financiero: contratos ratio/porcentaje, naming por capas (snake_case API y camelCase UI) y validación de filtros de fecha antes de consultar API.
metadata:
  author: project-local
  version: "1.0"
  appliesTo:
    - frontend/src/lib/**/*.ts
    - frontend/src/**/*.tsx
    - frontend/specs/**/*.ts
    - frontend/specs/**/*.md
---

# Financial Dashboard Domain Rules

Skill de dominio para mantener consistencia funcional y de contrato en este proyecto financiero.

## Objetivo Claro

Garantizar que cualquier cambio en frontend respete tres convenciones críticas del dominio:

1. Contrato de ratios: la API usa ratios decimales y la UI muestra porcentajes.
2. Naming por capa: API/wire en snake_case, modelo de UI en camelCase.
3. Filtros de fecha: validación previa obligatoria antes de disparar fetch.

## Inputs Definidos

Esta skill espera recibir:

1. Código o cambios en:
   - `frontend/src/lib/financial-types.ts`
   - `frontend/src/lib/financial-utils.ts`
   - componentes de dashboard en `frontend/src/components/dashboard/`
   - clientes/servicios que llamen `/api/metrics*`
2. Tipos de contrato en:
   - `frontend/specs/api-types.ts`
   - `frontend/specs/param-types.ts`
3. Requerimiento funcional relacionado con métricas, alertas, filtros o comparación B2B/B2C.

## Output Esperado

La ejecución de la skill debe devolver:

1. Diagnóstico de cumplimiento por regla (OK/NO OK).
2. Lista de hallazgos con archivo y línea.
3. Cambios sugeridos o aplicados para corregir incumplimientos.
4. Resumen de impacto funcional (qué evita romper en el dashboard).

Formato recomendado de salida:

- `rule`: nombre de la regla
- `status`: `ok | fail`
- `evidence`: archivo(s) afectados
- `fix`: acción concreta

## Reglas Operativas

### Regla 1: Ratio API vs porcentaje UI

1. Campos ratio provenientes de API (`increase_ratio`, `threshold`, `delta_pct`) se tratan internamente como decimales.
2. La representación visual convierte ratio a porcentaje de forma explícita.
3. No mezclar semánticas: evitar guardar en estado un valor ya multiplicado por 100 si el contrato sigue en ratio.

### Regla 2: Naming por capa

1. Capa API y query params: snake_case (`create_date`, `operation_type`, `start_date`, `end_date`).
2. Capa de presentación y métricas derivadas: camelCase (`totalIncome`, `profitPercent`, `monthlyData`).
3. Si hay mapeo entre capas, debe estar centralizado y testeado.

### Regla 3: Filtros de fecha

1. `start_date` y `end_date` son opcionales, formato `YYYY-MM-DD`.
2. No enviar parámetros vacíos a la API.
3. Si `start_date > end_date`: bloquear request y mostrar validación en UI.

## Criterios de Aceptación

Para considerar la tarea aprobada, deben cumplirse todos:

1. Todos los ratios en API se conservan como decimal en lógica interna.
2. Toda visualización porcentual se formatea explícitamente en la capa UI.
3. No aparecen query params vacíos en requests salientes.
4. Existe validación que impide fetch cuando `start_date > end_date`.
5. Snake_case y camelCase se respetan por capa, sin mezclar contratos.
6. Si se introduce mapeo de datos, hay cobertura mínima de test para ese mapeo.

## Checklist Rápido

- [ ] Ratio decimal preservado en tipos/estado
- [ ] Conversión a % solo en render/formateador
- [ ] Params vacíos omitidos
- [ ] Validación de rango de fechas activa
- [ ] Naming por capa consistente
- [ ] Test de mapeo o regla afectada
