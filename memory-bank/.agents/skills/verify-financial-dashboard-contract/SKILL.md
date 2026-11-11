---
name: verify-financial-dashboard-contract
description: Use when changing or documenting the financial dashboard API, its frontend integration, or discrepancies between implementation and specifications. Verify claims against backend routes, tests, frontend call sites, and the documented data contract before editing.
---

# Verificar el contrato del dashboard financiero

## Cuándo usarla

Usa esta Skill al modificar endpoints o filtros financieros, conectar datos del backend a la UI, cambiar cálculos del dashboard o actualizar documentación de API/componentes.

## Procedimiento

1. Lee las reglas de `memory-bank/.agents/rules/` y las especificaciones aplicables en `frontend/specs/`. Conserva sin editar `frontend/specs/pm-brief.md`, que contiene el texto original del pedido.
2. Verifica el comportamiento en `backend/app/routes.py` y `backend/tests/test_routes.py`: método y ruta, modelos, valores admitidos, defaults, límites, semántica de fechas, agregaciones y casos vacíos.
3. Verifica la integración efectiva en `frontend/src/App.tsx`, los tipos de `frontend/src/lib/financial-types.ts` y las funciones/pruebas de `frontend/src/lib/financial-utils.ts`. Separa claramente las rutas documentadas de las que consume la UI.
4. Registra las discrepancias con evidencia local y clasifícalas como comportamiento implementado, contrato documentado o decisión pendiente. No presentes recomendaciones de `verification.md`/`components.md` como funcionalidades ya construidas.
5. Propón el cambio mínimo en la capa propietaria del comportamiento. Si cambia un contrato, sincroniza backend, tipos, especificación y pruebas pertinentes; si solo cambia la presentación, evita alterar semántica de API.
6. Valida el cambio con pruebas enfocadas: backend (`pytest backend/tests`) y/o frontend (`npm test`, `npm run build`, `npm run lint` ejecutados desde `frontend/`). Informa fallos preexistentes o comprobaciones no ejecutadas, sin afirmar validación que no ocurrió.

## Contrastes que no se deben perder

- Los movimientos del backend son simulados, se generan con semilla `42` y su año depende de la fecha actual.
- La UI actual consume `/api/metrics` y calcula KPI/meses en el cliente; las rutas agregadas no implican integración automática.
- El periodo `2024 - Full Year` de la cabecera es fijo y no describe de forma fiable el rango de esos datos.
- `delta_abs` es firmado; `delta_pct` puede ser `null`; `threshold` e `increase_ratio` son razones, no puntos porcentuales.
- `[]` es una respuesta válida sin resultados; HTTP 422 o un fallo de red deben seguir siendo errores diferenciados.