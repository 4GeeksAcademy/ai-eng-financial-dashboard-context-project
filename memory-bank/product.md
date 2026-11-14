# Producto

## Propósito y funcionalidades

- **Hecho verificado:** el producto es un dashboard de métricas financieras. El frontend solicita movimientos, calcula ingresos, gastos, beneficio y margen, y presenta indicadores y gráficos mensuales. Fuentes: [`frontend/src/App.tsx`](../frontend/src/App.tsx), [`frontend/src/lib/financial-utils.ts`](../frontend/src/lib/financial-utils.ts), `frontend/src/components/dashboard/`.
- **Hecho verificado:** la API también expone filtros, facetas, resúmenes temporales, categorías principales, comparaciones, alertas y endpoints segmentados B2B/B2C. Fuente: [`backend/app/routes.py`](../backend/app/routes.py).
- **Hecho verificado:** los datos se generan de forma simulada con semilla `42`; las fechas se calculan respecto a la fecha del servidor y no se encontró persistencia en la implementación de rutas. Fuente: [`backend/app/routes.py`](../backend/app/routes.py).

## Usuarios y límites

- **No verificado:** no hay evidencia suficiente para identificar usuarios previstos. El subtítulo “Executive metrics dashboard” en `frontend/src/components/dashboard/dashboard-header.tsx` describe la interfaz, pero no confirma una persona o segmento de usuario.
- **Hecho verificado:** el dashboard visible carga `/api/metrics`; no está demostrado que la pantalla consuma las demás capacidades analíticas de la API. Fuente: [`frontend/src/App.tsx`](../frontend/src/App.tsx).
- **Pendiente de decisión:** la interfaz etiqueta el periodo como `2024 - Full Year`, mientras el backend genera un intervalo móvil de doce meses determinado por la fecha actual. No está definida en el repositorio cuál de esas opciones representa el periodo deseado. Fuentes: [`frontend/src/App.tsx`](../frontend/src/App.tsx), [`backend/app/routes.py`](../backend/app/routes.py), [hallazgos de Fase 2](../docs/phase2-engineering-findings.md).

## Mantenimiento de esta memoria

Al cambiar comportamiento, datos o alcance del producto, actualiza esta página con evidencia del código o documentación. Marca por separado hechos, inferencias y decisiones pendientes; no conviertas la etiqueta de la UI en un requisito de negocio sin confirmación.
