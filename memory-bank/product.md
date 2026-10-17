# Resumen del producto

## Descripción

Dashboard web de métricas financieras. La interfaz consulta movimientos a una API FastAPI y presenta indicadores agregados y tendencias mensuales.

## Lo que muestra la interfaz

- Ingresos, egresos, beneficio y margen de beneficio.
- Gráfico mensual de ingresos frente a egresos y gráfico mensual de margen.
- Estados de carga y error para la consulta de datos.
- Los cálculos de beneficio usan ingresos menos egresos; el porcentaje mostrado es beneficio dividido entre ingresos, o cero si no hay ingresos.
- Los importes se formatean en dólares estadounidenses.

La página actual consulta `GET /api/metrics` y calcula los indicadores y agregados mensuales en el frontend. No muestra controles de filtros en la página principal.

## Datos y API

- La API genera movimientos simulados: no se observa una conexión a una fuente financiera real en el flujo revisado.
- Cada movimiento tiene fecha, importe, tipo de operación (`income`/`outcome`), categoría (`suppliers`, `sales`, `operational`, `administrative` u `others`) y tipo de negocio (`B2B`/`B2C`).
- El generador produce 360 movimientos y las rutas de métricas lo invocan con semilla `42`. Las fechas se asignan a una ventana móvil de doce meses completos basada en la fecha actual.
- Además del endpoint que consume la interfaz, la API ofrece endpoints para facetas, resúmenes por día/semana/mes, categorías principales, comparaciones, alertas y movimientos B2B/B2C. Su existencia en la API no implica que estén expuestos como funcionalidades de la interfaz actual.

## Estado conocido

El encabezado de la interfaz está fijado en `2024 - Full Year`, aunque los movimientos generados corresponden a una ventana relativa a la fecha actual. No asumir que ese texto describe correctamente el período de los datos.

## Límites de lo verificado

El código revisado no permite afirmar que el producto procese datos reales, los persista, autentique usuarios, se integre con un sistema contable o esté dirigido a un perfil específico. Tampoco permite atribuir a la interfaz filtros, alertas o comparaciones que solo están disponibles como endpoints.

## Referencias del repositorio

- [Frontend y estados de la página](../frontend/src/App.tsx)
- [Cálculos y formatos financieros](../frontend/src/lib/financial-utils.ts)
- [Tipos financieros del frontend](../frontend/src/lib/financial-types.ts)
- [Modelos, generación de datos y endpoints](../backend/app/routes.py)
- [Verificación del período mostrado](../verification.md)