# Logica de metricas del frontend fuera de componentes

## Alcance
Frontend en src/components y src/lib.

## Regla
Los calculos de negocio del dashboard deben implementarse en src/lib y no dentro de componentes de presentacion.
Los componentes deben consumir funciones reutilizables.

## Razon
La base actual usa utilidades puras para KPI y agregaciones, lo que mejora testabilidad y claridad.
Evidencia de Fase 2: frontend/src/lib/financial-utils.ts y frontend/src/App.tsx.

## Como verificarla
1. Revisar componentes en frontend/src/components/.
2. Confirmar que no exista calculo de negocio complejo embebido en JSX.
3. Confirmar que los calculos se deleguen a modulos de frontend/src/lib/.