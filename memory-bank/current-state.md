# Estado actual

## Evidencia registrada

- En la fase 3, [`App.tsx`](../frontend/src/App.tsx) pasó a conservar los movimientos como fuente de datos; [`financial-utils.ts`](../frontend/src/lib/financial-utils.ts) calcula el intervalo mínimo-máximo y el encabezado lo muestra. La respuesta consultada contenía 360 movimientos, del `2025-11-01` al `2026-10-28`, y coincidió con la etiqueta observada. Las fechas dependen del momento de generación.
- Las pruebas de [`financial-utils.test.ts`](../frontend/src/lib/financial-utils.test.ts) pasaron 8/8 en UTC y 8/8 con `TZ=America/Bogota` dentro del contenedor frontend. `npm run lint` y `npm run build` terminaron correctamente; el build emitió dos avisos de rendimiento de origen no verificado.
- Con el backend detenido, el usuario observó el error, `Period unavailable`, gráficos sin datos y el fin de carga; confirmó la recuperación del dashboard después de restaurarlo. Las consultas previas verificaron `/health`, `/api/metrics` directo y por proxy, y `/docs`. Detalles y alcance: [`verification.md`](../verification.md).
- Las reglas de trabajo están en [`.agents/rules`](../.agents/rules). La auditoría de fase 3 verificó aspectos aplicables, no todas las reglas ni todos los casos.

## Riesgos y comprobaciones pendientes

- [`computeMonthlyData`](../frontend/src/lib/financial-utils.ts) interpreta fechas ISO con `new Date(...)`: en una zona negativa un día 1 puede agruparse en el mes anterior. La prueba del intervalo en Bogotá no cubre esa agrupación.
- [`generate_mock_movements`](../backend/app/routes.py) modifica el estado aleatorio global. No se verificó la interacción con otros consumidores de aleatoriedad.
- La prueba de comparación de períodos usa fechas fijas y comprueba campos, no importes ni intersección con el rango generado: [`test_routes.py`](../backend/tests/test_routes.py). No se ejecutó pytest en la fase 3.
- No se comprobó visualmente la respuesta vacía, ni se probaron por separado todos los fallos HTTP y de red; tampoco se comprobó la depuración. Los avisos del build no tienen causa verificada.

## Posibles investigaciones

Como recomendaciones, no como planes oficiales: comprobar y corregir la agrupación de fechas con una prueba de día 1 en zona negativa; investigar el estado aleatorio global; reforzar las pruebas de comparación de períodos y de estados de error/vacío de la interfaz. Respetar las reglas de [`.agents/rules`](../.agents/rules) antes de cualquier cambio.