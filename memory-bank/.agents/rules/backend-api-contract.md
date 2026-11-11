# Reglas del contrato de la API

## Fuentes de verdad

- Para el comportamiento implementado, prevalecen los modelos, funciones y rutas en `backend/app/routes.py`; `backend/app/main.py` registra el router y `/health`.
- Contrastar cambios de contrato con `backend/tests/test_routes.py` y los tipos y decisiones documentados en `frontend/specs/`.
- La especificación describe también integraciones futuras. No afirmar que una ruta está conectada a la interfaz sin verificar `frontend/src/App.tsx` y sus llamadas.

## Comportamiento confirmado

- La API expone rutas GET para movimientos, facetas, resúmenes, categorías principales, comparación, alertas y segmentos B2B/B2C. Los modelos y `Literal` del backend definen los valores aceptados.
- Los movimientos son datos simulados: cada endpoint los genera con semilla `42`; no hay persistencia de movimientos en estas rutas.
- Las fechas `start_date` y `end_date` son inclusivas. Los filtros que admite cada ruta se combinan; no atribuir a una ruta filtros que su firma no declare.
- Los resúmenes agrupan por día, semana ISO o mes. Categorías principales se ordenan de mayor a menor; `limit` va de 1 a 20. Comparación requiere las dos fechas y `delta_abs` es una diferencia firmada. `delta_pct` puede ser `null`. Alertas comparan el egreso con el promedio de periodos anteriores y solo se producen si el aumento supera estrictamente `threshold`.
- La validación de parámetros de FastAPI puede responder HTTP 422. Una lista vacía con respuesta exitosa no es un error.
- El año de los movimientos simulados depende de `date.today()`; no deducir un año fijo a partir de la semilla.

## Al cambiar la API

- Mantener sincronizados firmas/modelos, pruebas backend y los tipos/contratos de `frontend/specs/api-types.ts`, `frontend/specs/param-types.ts` y `frontend/specs/README.md` cuando cambie el contrato.
- Añadir o ajustar pruebas para límites inclusivos, filtros combinados, valores por defecto y casos límite afectados por el cambio.
- No cambiar silenciosamente unidades, categorías, reglas de periodo o semántica de porcentajes. Documentar explícitamente cualquier cambio incompatible.