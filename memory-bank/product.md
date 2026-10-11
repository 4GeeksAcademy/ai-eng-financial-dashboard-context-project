# Resumen del producto

## Resumen
Dashboard financiero con datos simulados. Presenta ingresos, gastos, beneficio
y margen, junto con graficos mensuales de ingresos frente a gastos y de margen.
Fuente: [App.tsx](../frontend/src/App.tsx).

## Hechos verificados: datos y calculos
- La API genera 360 movimientos: 30 por mes durante los doce meses completos anteriores al mes actual. Las fechas dependen de `date.today()`; no es un ano fijo. Fuente: [routes.py](../backend/app/routes.py).
- Cada movimiento incluye fecha, importe, operacion (`income`/`outcome`), categoria y tipo de negocio (`B2B`/`B2C`). Fuente: [financial-types.ts](../frontend/src/lib/financial-types.ts).
- Beneficio = ingresos - gastos. Margen = beneficio / ingresos multiplicado por 100; sin ingresos, el margen calculado es cero. Los importes se presentan como USD sin decimales. Fuente: [financial-utils.ts](../frontend/src/lib/financial-utils.ts).

## Hechos verificados: interfaz
- Consulta `/api/metrics` y calcula los KPIs y agregados mensuales en el frontend; no consume los endpoints de resumen o comparacion. Fuente: [App.tsx](../frontend/src/App.tsx).
- Muestra cuatro indicadores y dos graficos mensuales. Fuentes: [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx).
- Incluye estados de carga y un mensaje de error cuando falla la carga de informacion. Fuente: [App.tsx](../frontend/src/App.tsx).

## Hechos verificados: API
El backend ofrece las siguientes capacidades, que no deben describirse como
controles disponibles en la interfaz actual:

- Consulta de movimientos con filtros por fecha, categoria y operacion, y endpoints especificos B2B/B2C.
- Opciones de filtros y rango de fechas mediante facetas.
- Resumenes por dia, semana o mes y categorias principales por importe.
- Comparacion del saldo neto entre un periodo y el periodo anterior de igual duracion.
- Deteccion de aumentos de gastos respecto al promedio historico de los periodos resumidos.

Fuente: [routes.py](../backend/app/routes.py).

## Limites y aspectos no confirmados
- Los datos servidos son mocks; no deben presentarse como movimientos financieros reales.
- El encabezado mantiene `2024 - Full Year`, aunque los mocks dependen de la fecha actual. El grafico de margen confunde una serie de ceros con ausencia de datos y la agrupacion mensual depende de la zona horaria. Fuentes: [App.tsx](../frontend/src/App.tsx), [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts).
- No se atribuyen usuarios objetivo, integraciones futuras ni funcionalidades planificadas: no fueron confirmados en la revision.
- No se afirma que el producto este preparado para produccion ni que las pruebas funcionales hayan pasado. La revision fue estatica; los hallazgos y propuestas no equivalen a correcciones implementadas. Fuente: [engerineering-findings.md](../engerineering-findings.md).