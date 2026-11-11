# Reglas de datos del dashboard

## Estado real de la interfaz

- `frontend/src/App.tsx` actualmente solicita solo `GET /api/metrics`; calcula KPI y agrupaciones mensuales en el cliente mediante `frontend/src/lib/financial-utils.ts`.
- No asumir que facetas, resumen, categorías principales, comparación, alertas o segmentos B2B/B2C estén integrados: verificar la llamada y el estado de UI antes de describirlos como funcionalidad existente.
- Los contratos de `frontend/specs/` describen tanto la API como decisiones o integración prevista. Distinguir esos estados de lo que efectivamente renderiza la aplicación.

## Coherencia de los datos

- Tratar `frontend/specs/api-types.ts` y `param-types.ts` como el contrato de transporte documentado; `frontend/src/lib/financial-types.ts` contiene modelos de presentación. Comprobar y mantener su compatibilidad al tocar cualquiera de los dos lados.
- Mantener fechas de calendario como strings ISO al cruzar la API. Si se transforman para agrupar o mostrar, evitar desplazamientos de día por zona horaria.
- Distinguir carga, error y éxito vacío. No reemplazar fallos de red/HTTP por arrays vacíos ni inventar datos para cubrir una respuesta vacía.
- Respetar unidades y formato actuales: importes en USD sin decimales, porcentajes con un decimal y meses `en-US`, salvo que haya una decisión de producto explícita.
- No presentar `2024 - Full Year` como rango real devuelto por la API: es texto fijo en `App.tsx`, mientras los datos simulados dependen del año actual y del anterior. Si se cambia, derivar el periodo de los datos o definir un contrato de producto antes de mostrarlo como dinámico.
- Al integrar agregados, adaptar explícitamente `period`/`net` de `MetricsSummaryItem` al modelo que esperan los gráficos; no confundir `net` con margen porcentual.

## Cambios y comprobaciones

- Reutilizar componentes y utilidades existentes; evitar duplicar cálculos financieros entre componentes.
- Actualizar las pruebas de `frontend/src/lib/financial-utils.test.ts` para cambios de cálculo o formato y comprobar los estados de carga/error afectados.
- Ejecutar las comprobaciones frontend pertinentes (`npm test`, `npm run build` y/o `npm run lint`, desde `frontend/`) y reportar las que no se hayan podido ejecutar.