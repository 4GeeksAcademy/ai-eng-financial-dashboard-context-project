# Overview del producto

## Descripción respaldada

El README presenta el proyecto como un panel de métricas financieras con frontend React + TypeScript y backend FastAPI ([README.es.md](../README.es.md)). En el código, la pantalla principal solicita `GET /api/metrics`, calcula indicadores y agregados mensuales y muestra KPI, ingresos frente a egresos y margen ([App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [componentes del dashboard](../frontend/src/components/dashboard/)).

El contrato de cada movimiento contiene fecha, importe, tipo de operación, categoría y tipo de negocio. El backend define además endpoints para facetas, resúmenes, categorías principales, comparación, alertas y segmentos B2B/B2C ([routes.py](../backend/app/routes.py)). La existencia de esos endpoints no implica que estén disponibles en la interfaz: `App.tsx` solo solicita `/api/metrics`.

## Datos

`generate_mock_movements` construye movimientos simulados con un generador aleatorio local y las rutas usan la semilla `42`. Las fechas se calculan en relación con `date.today()`, por lo que una misma semilla no implica fechas de calendario invariables ([routes.py](../backend/app/routes.py)). El código citado respalda que esta fuente es simulada; no respalda una conexión a cuentas, bancos o sistemas financieros reales.

## Límites de esta descripción

Esta memoria no atribuye al producto usuarios objetivo, casos de negocio, requisitos de producción ni funcionalidades que solo aparezcan en propuestas. Para comportamiento visible, consultar `App.tsx` y sus componentes; para comportamiento de API, consultar `routes.py` y sus pruebas.
