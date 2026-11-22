# Estado actual

Actualizado: 2026-10-18. Esta fecha identifica la revisión de la documentación, no una ejecución de pruebas o servicios.

## Comportamiento comprobable en el código

- La pantalla hace una petición inicial a `GET /api/metrics`; al recibir movimientos calcula KPI y datos mensuales. Renderiza los indicadores y dos gráficos. Si la petición falla, muestra un mensaje de error ([App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [componentes del dashboard](../frontend/src/components/dashboard/)).
- El backend implementa `/health`, `/api/metrics` y rutas adicionales para facetas, resúmenes, categorías principales, comparación, alertas y movimientos B2B/B2C ([routes.py](../backend/app/routes.py)).
- La interfaz no solicita actualmente las rutas adicionales ni presenta controles de filtros; su solicitud a `/api/metrics` no incorpora parámetros. Esto describe el código visible, no determina si esas funciones son requisitos del producto ([App.tsx](../frontend/src/App.tsx)).
- El flujo de carga visible hace una solicitud al montar y maneja el rechazo mostrando un error; no se observa reintento ni acción de recuperación ([App.tsx](../frontend/src/App.tsx)).

## Verificaciones históricas

[verification.md](../verification.md) registra ejecuciones del 2026-10-16. Entre ellas, informa que `/health`, `/api/metrics` directo al backend y la página respondieron HTTP 200, mientras que el proxy de Vite para `/api/metrics` respondió 502 por timeout entre contenedores. El mismo registro deja el diagnóstico de conectividad pendiente y advierte que HTTP 200 de la página no demuestra que el dashboard cargue datos.

El registro también contiene resultados de pruebas, build y lint, y avisos de tamaño de bundle y deprecación. Son evidencia fechada de esas ejecuciones, no resultados de esta revisión ni garantía del estado actual. No se volvió a probar la integración en esta tarea.

## Seguimiento sin roadmap

1. **Verificación operativa sugerida:** volver a comprobar el flujo navegador/Vite hacia `/api/metrics` y confirmar que la interfaz recibe y representa datos. Se propone por el fallo histórico documentado; la situación actual permanece sin verificar.
2. **Decisión de producto pendiente, no compromiso:** decidir si las capacidades adicionales ya presentes en la API deben exponerse en la interfaz. El código prueba que las rutas existen y que `App.tsx` no las consume; no prueba que haya un requisito para integrarlas.

No se infieren fechas de entrega, prioridades aprobadas, usuarios objetivo ni alcance futuro. Cualquier roadmap requiere una decisión de producto fuera de la evidencia técnica aquí citada.
