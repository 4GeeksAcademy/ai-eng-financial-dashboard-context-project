# Reglas de datos del dashboard

## Estado real de la interfaz

- `frontend/src/App.tsx` actualmente solicita solo `GET /api/metrics`; calcula KPI y agrupaciones mensuales en el cliente mediante `frontend/src/lib/financial-utils.ts`.
- No asumir que facetas, resumen, categorías principales, comparación, alertas o segmentos B2B/B2C estén integrados: verificar la llamada y el estado de UI antes de describirlos como funcionalidad existente.
- Si existen contratos en `frontend/specs/`, pueden describir tanto la API como decisiones o integración prevista. Distinguir esos estados de lo que efectivamente renderiza la aplicación.

## Coherencia de los datos

- Si existen `frontend/specs/api-types.ts` y `param-types.ts`, tratarlos como contrato de transporte documentado; comprobar su compatibilidad con los modelos de presentación al tocar cualquiera de los dos lados.
- Mantener fechas de calendario como strings ISO al cruzar la API. Si se transforman para agrupar o mostrar, evitar desplazamientos de día por zona horaria.
- Distinguir carga, error y éxito vacío. No reemplazar fallos de red/HTTP por arrays vacíos ni inventar datos para cubrir una respuesta vacía.
- Respetar unidades y formato actuales: importes en USD sin decimales, porcentajes con un decimal y meses `en-US`, salvo que haya una decisión de producto explícita.
- No presentar `2024 - Full Year` como rango real devuelto por la API: es texto fijo en `App.tsx`, mientras los datos simulados dependen del año actual y del anterior. Si se cambia, derivar el periodo de los datos o definir un contrato de producto antes de mostrarlo como dinámico.
- Al integrar agregados, comprobar el modelo de respuesta real y adaptarlo al modelo que esperan los gráficos; no confundir el importe neto con un margen porcentual.

## Cambios y comprobaciones

- Reutilizar componentes y utilidades existentes; evitar duplicar cálculos financieros entre componentes.
- Actualizar las pruebas de `frontend/src/lib/financial-utils.test.ts` para cambios de cálculo o formato y comprobar los estados de carga/error afectados.
- Ejecutar las comprobaciones del paquete `frontend/package.json`. Desde `memory-bank/`, `npm test`, `npm run build` y `npm run lint` usan su manifiesto de delegación sin duplicar dependencias. Desde cualquier carpeta dentro del repositorio usar `npm --prefix "$(git rev-parse --show-toplevel)/frontend" test`, `npm --prefix "$(git rev-parse --show-toplevel)/frontend" run build` y/o `npm --prefix "$(git rev-parse --show-toplevel)/frontend" run lint`. Reportar las que no se hayan podido ejecutar.