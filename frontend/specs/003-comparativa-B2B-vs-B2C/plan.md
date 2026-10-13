# Plan técnico: comparativa B2B vs B2C

Basado en [spec.md](spec.md) y en el contrato del código de la API; no se ha verificado una instancia activa de `/docs`.

## API y diferencias

- Ranking: `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B` (también `B2C`), con `start_date`/`end_date` opcionales. Devuelve `category`, `operation_type` y `total_amount`, sin porcentaje ni total del grupo.
- Totales: `GET /api/metrics/summary?operation_type=income&business_type=B2B` (también `B2C`), con las mismas fechas. Sumar sus campos `income` permite obtener el total completo de cada grupo para el gráfico y los porcentajes, sin limitarlo al ranking.
- Facetas: `GET /api/metrics/facets` devuelve categorías globales, no categorías de ingreso por negocio; actualmente no acepta filtros.
- Pendiente de aclaración: la spec exige cinco categorías, pero `limit=5` devuelve hasta cinco y el generador solo produce ingresos en `sales` y `others`. No inventar categorías ni modificar los datos simulados para completar filas.

## Cambios de backend

- Ampliar las facetas para consultar categorías por `business_type` y `operation_type=income`, conservando la respuesta global sin filtros y contemplando grupos sin resultados.
- Mantener los contratos existentes de ranking y resumen. No se necesitan nuevos endpoints para los totales ni porcentajes.

## Cambios de frontend

- Añadir la página comparativa y acceso desde el dashboard con React y las herramientas actuales, sin nuevas dependencias.
- Reutilizar el patrón `fetch`, `VITE_API_BASE_URL` y proxy `/api` de `App.tsx`; la pantalla actual solo consulta movimientos y no consume ranking, resumen ni facetas.
- Consultar ambos negocios con el mismo rango `YYYY-MM-DD`; presentar tablas paralelas y un gráfico de totales con Recharts. Mantener los cálculos de totales y porcentajes en las utilidades financieras.
- Obtener las categorías por grupo desde las facetas ampliadas y mantener las solicitudes alineadas al cambiar las fechas.

## Archivos afectados

- `backend/app/routes.py` y `backend/tests/test_routes.py`: facetas por grupo y verificación de contratos.
- `frontend/src/App.tsx`: acceso a la comparativa.
- `frontend/src/lib/financial-types.ts`: tipos de ranking, resumen y facetas.
- `frontend/src/lib/financial-utils.ts` y `financial-utils.test.ts`: totales y porcentajes.
- Nuevos componentes de página, tablas y gráfico en `frontend/src/components/dashboard/`.

## Orden recomendado

1. Resolver la expectativa de cinco categorías y comprobar los contratos en `/docs`.
2. Ampliar y verificar las facetas sin alterar su uso actual.
3. Añadir tipos, cálculos y página; conectar ranking, totales, facetas y fechas.

## Verificación básica

- Comprobar ranking de ingresos por negocio, orden descendente, máximo de cinco filas, fechas y categorías de facetas; ejecutar `pytest -q` con pruebas en el archivo existente.
- Verificar porcentajes respecto al total completo, no al top cinco; cubrir los cálculos con Vitest existente.
- Comprobar navegación, tablas y gráfico con el mismo período en el navegador; ejecutar `npm test`, `npm run build` y `npm run lint`. Confirmar antes el modo proxy o la configuración de `VITE_API_BASE_URL` necesaria.