# Reglas de frontend

## Objetivo

Preservar la separación entre carga de datos, cálculos financieros y presentación, y mantener estable el contrato con la API.

## Justificación

`App.tsx` carga `/api/metrics` y gestiona carga y error; `financial-utils.ts` calcula KPI y agregados mensuales; los componentes de dashboard presentan los datos. Los nombres y valores de `FinancialMovement` deben coincidir con el modelo backend. Ver [App.tsx](../../frontend/src/App.tsx), [financial-utils.ts](../../frontend/src/lib/financial-utils.ts) y [financial-types.ts](../../frontend/src/lib/financial-types.ts).

## Reglas

- Mantén los cálculos financieros en `src/lib/financial-utils.ts` y las pruebas correspondientes en `src/lib/financial-utils.test.ts`; no dupliques fórmulas dentro de componentes.
- Conserva los campos y valores del contrato (`create_date`, `operation_type`, `income`, `outcome`, `category`, `business_type`) alineados con backend.
- Mantén los estados de carga, error y ausencia de datos en las vistas que dependen de la API.
- Conserva beneficio como ingresos menos gastos y margen como beneficio dividido por ingresos; el margen es cero cuando no hay ingresos. Cambia estas fórmulas solo con requisito de producto y pruebas actualizadas.
- Trata `create_date` como fecha de calendario. Si agrupas fechas ISO por mes, añade pruebas para límites de mes y zona horaria antes de cambiar la conversión actual con `Date`.

## Ejemplos

### Correcto

El cálculo de [financial-utils.ts](../../frontend/src/lib/financial-utils.ts) mantiene la fórmula y el caso sin ingresos:

```ts
const profit = totalIncome - totalOutcome;
const profitPercent = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
```

### Incorrecto

No uses los gastos como denominador del margen ni omitas el caso sin ingresos:

```ts
const profitPercent = (profit / totalOutcome) * 100;
```