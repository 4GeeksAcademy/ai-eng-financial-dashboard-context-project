# Resumen del producto

## Descripción

Aplicación web de métricas financieras. El frontend presenta totales de ingresos y egresos, beneficio, porcentaje de beneficio y gráficos mensuales de ingresos, egresos y margen. Obtiene los movimientos desde la API del backend.

## Componentes y flujo

- **Frontend:** React y TypeScript. `frontend/src/App.tsx` solicita `/api/metrics`, calcula los KPI y los datos mensuales con `frontend/src/lib/financial-utils.ts`, y muestra las tarjetas y gráficos del dashboard.
- **Backend:** FastAPI. `backend/app/routes.py` sirve movimientos y ofrece rutas para salud, filtros, segmentos B2B/B2C, facets, resúmenes, categorías principales, comparación y alertas.
- **Comunicación:** Vite reenvía `/api` a `http://backend:8000`, el servicio backend definido en Docker Compose.

## Datos y cálculos

- Las rutas generan datos de ejemplo: 360 movimientos, 30 por mes durante 12 meses, con semilla `42` y fechas calculadas en relación con la fecha actual.
- El frontend calcula beneficio como ingresos menos egresos. Calcula el porcentaje como beneficio dividido por ingresos, o cero si los ingresos son cero.
- La generación de datos y las fórmulas describen el comportamiento del código; no constituyen por sí mismas requisitos de negocio aprobados.

## Límites confirmados

- El título visible está fijado en `2024 - Full Year`; no debe presentarse como prueba de que los movimientos corresponden a 2024.
- En las rutas revisadas, los movimientos se generan como datos de ejemplo. No describirlos como datos reales o persistidos.
- El proyecto revisado no especifica un perfil de usuario, requisitos de negocio para las fórmulas ni una fuente de datos real. No atribuirle esos objetivos o capacidades sin documentación adicional.

## Referencias

- `frontend/src/App.tsx`
- `frontend/src/lib/financial-utils.ts`
- `frontend/src/lib/financial-types.ts`
- `backend/app/routes.py`
- `docker-compose.yml`
