---
name: verify-financial-dashboard-contract
description: Use when changing or documenting the financial dashboard API, its frontend integration, or discrepancies between implementation and specifications. Verify claims against backend routes, tests, frontend call sites, and the documented data contract before editing.
---

# Verificar el contrato del dashboard financiero

## Cuándo usarla

Usa esta Skill al modificar endpoints o filtros financieros, conectar datos del backend a la UI, cambiar cálculos del dashboard o actualizar documentación de API/componentes.

## Objetivo

Determinar, con evidencia local reproducible, si el contrato de la API, los cálculos del frontend y las afirmaciones documentadas coinciden para la tarea solicitada. Separar fallos del producto, recomendaciones y comprobaciones pendientes. Una auditoría no autoriza cambios de aplicación.

## Inputs

- Tarea concreta, modo (`auditar` o `modificar`) y alcance: rutas, filtros, cálculos o afirmaciones que se quieren verificar. Si solo se pide comprobar, usa `auditar`.
- Estado de trabajo y revisión Git, fecha de ejecución y zona horaria de los casos de calendario; no sobrescribas cambios ajenos.
- Implementación y pruebas de las capas afectadas, reglas enlazadas y especificaciones si existen. Registra explícitamente los archivos ausentes, sin inventar contratos.
- Casos con input y resultado esperado definidos antes de ejecutarlos: caso normal, vacío y frontera aplicables. Para meses incluye el primer día del mes en UTC y una zona UTC negativa.

## Ubicación y resolución de rutas

La fuente única de esta skill es `memory-bank/.skills/verify-financial-dashboard-contract/SKILL.md`. Mantén esta ubicación; no la muevas a `.agents/skills/` ni dupliques su contenido.

Las rutas de código se resuelven desde la raíz del repositorio. Los enlaces a recursos son relativos a este archivo. Los comandos siguientes seleccionan explícitamente la raíz o el paquete frontend y funcionan desde cualquier carpeta dentro de este repositorio Git.

### Comandos y diagnóstico de npm

El manifiesto de la aplicación es [frontend/package.json](../../../frontend/package.json). [memory-bank/package.json](../../package.json) contiene solo scripts de delegación: permite ejecutar directamente `npm test`, `npm run build` y `npm run lint` desde `memory-bank/`, utilizando el frontend y propagando argumentos y errores. Las dependencias se mantienen e instalan únicamente en el frontend.

El error anterior `ENOENT` se debía a que aún no existía el manifiesto de delegación, no a que faltara npm. Desde la carpeta de esta skill, usa el destino explícito siguiente; no copies manifiestos ni dependencias a cada subdirectorio.

```bash
npm --prefix "$(git rev-parse --show-toplevel)/frontend" run
npm --prefix "$(git rev-parse --show-toplevel)/frontend" test -- src/lib/financial-utils.test.ts
npm --prefix "$(git rev-parse --show-toplevel)/frontend" run build
npm --prefix "$(git rev-parse --show-toplevel)/frontend" run lint
```

`npm run` solo lista scripts; para ejecutar uno hay que nombrarlo. `npm test` ejecuta el script `test` (Vitest) del manifiesto seleccionado. El filtro después de `--` se resuelve dentro del frontend. Si falla una prueba con `AssertionError`, registra ese fallo por separado: corregir el destino de npm no corrige errores del contrato.

## Procedimiento

1. Lee las reglas de [API](../../.agents/rules/backend-api-contract.md) y [datos del frontend](../../.agents/rules/frontend-data-contract.md) en `memory-bank/.agents/rules/` y, si existe, las especificaciones aplicables en `frontend/specs/`. Conserva sin editar `frontend/specs/pm-brief.md` si está presente.
2. Verifica el comportamiento en `backend/app/routes.py` y `backend/tests/test_routes.py`: método y ruta, modelos, valores admitidos, defaults, límites, semántica de fechas, agregaciones y casos vacíos.
3. Verifica la integración efectiva en `frontend/src/App.tsx`, los tipos de `frontend/src/lib/financial-types.ts` y las funciones/pruebas de `frontend/src/lib/financial-utils.ts`. Separa claramente las rutas documentadas de las que consume la UI.
4. Registra las discrepancias con evidencia local y clasifícalas como comportamiento implementado, contrato documentado o decisión pendiente. Cita archivo y línea; distingue inspección estática de ejecución. Si existen `verification.md` o `components.md`, no presentes sus recomendaciones como funcionalidades ya construidas.
5. Propón el cambio mínimo en la capa propietaria del comportamiento. Si cambia un contrato, sincroniza backend, tipos, documentación existente y pruebas pertinentes; si solo cambia la presentación, evita alterar semántica de API.
6. Ejecuta pruebas enfocadas del alcance: backend (`pytest "$(git rev-parse --show-toplevel)/backend/tests/test_routes.py" -q`) y/o frontend con el comando `test` de la sección anterior. Añade build/lint cuando cambies código que lo requiera. Para el caso de calendario usa el [repro](./calendar-contract-case.cjs): `TZ=UTC node "$(git rev-parse --show-toplevel)/memory-bank/.skills/verify-financial-dashboard-contract/calendar-contract-case.cjs"` y `TZ=America/Los_Angeles node "$(git rev-parse --show-toplevel)/memory-bank/.skills/verify-financial-dashboard-contract/calendar-contract-case.cjs"`. Un código de salida distinto de cero es un fallo, no éxito de contrato.
7. Entrega la salida y evalúa los criterios siguientes. En modo `auditar`, no cambies frontend/backend para forzar resultados verdes. Si faltan herramientas o cobertura, marca `blocked` o `not run`; una lectura de código no demuestra el comportamiento HTTP o visual.

## Salida requerida

1. Objetivo, modo, alcance, revisión/estado Git, fecha y inputs.
2. Tabla de evidencia: `ID | afirmación/caso | input | esperado | observado | evidencia (archivo:línea o comando) | estado`. Estados permitidos: `passed`, `failed`, `blocked`, `not run`. Para inspección estática, decláralo en evidencia.
3. Discrepancias: capa propietaria, impacto comprobado, cambio mínimo recomendado y pruebas faltantes. No presentes una recomendación como corrección aplicada.
4. Veredicto separado: criterios de ejecución de la skill satisfechos o pendientes; contrato del producto verificado, con discrepancias o pendiente. Tests verdes por sí solos no prueban todo el contrato.
5. Archivos cambiados, comandos exactos/resultados y siguiente paso.

## Criterios comprobables

- **C1 — Trazabilidad:** cada afirmación del alcance tiene evidencia con ubicación o comando y tipo de comprobación; cero afirmaciones sin evidencia presentadas como verificadas.
- **C2 — Inputs/salida:** cada caso ejecutado declara input, esperado, observado, comando y estado; los archivos o herramientas ausentes se registran.
- **C3 — Cobertura:** se prueban casos normal, vacío y frontera del alcance. Para agrupación mensual, las dos zonas deben conservar el mes del ISO date; un fallo queda como discrepancia del producto.
- **C4 — Integración:** se identifican las llamadas reales de la UI y los cálculos propietarios, sin equiparar rutas disponibles a integración existente.
- **C5 — Honestidad:** códigos no cero se registran como `failed`; cobertura no ejecutada como `not run`/`blocked`. Distinguir tests existentes de nuevos repros e inspección de runtime.
- **C6 — Alcance:** en `auditar`, no se modifica la aplicación; en `modificar`, se sincronizan contratos/pruebas afectados y se reejecuta el caso que detectó el fallo.

## Contrastes a revalidar, no supuestos permanentes

- Comprobar semilla y fechas reales del generador: el año puede depender del día de ejecución.
- Comprobar qué rutas consume la UI y dónde calcula KPI/meses; las rutas agregadas no implican integración automática.
- Contrastar el periodo mostrado en la cabecera con el rango de los datos, sin dar por hecho un texto o año fijo.
- Verificar unidades/signo/nulos de `delta_abs`, `delta_pct`, `threshold` e `increase_ratio` cuando estén en alcance.
- Distinguir `[]` exitoso, HTTP 422 y fallo de red. No afirmar cobertura de esos estados si no se ejecutaron.

## Registro por día de uso

Consulta y actualiza [EVALUATION.md](./EVALUATION.md) cada día en que ejecutes esta skill: fecha real, tarea, evidencia fresca, comandos, resultados y pendientes. Conserva el historial y añade otra entrada si hay otra ejecución el mismo día. No actualices fechas sin revalidar ni reutilices resultados antiguos como actuales. No hay actualización automática en días sin ejecución; programarla requiere una automatización independiente. Registra también la sesión en `memory-bank/progress.md`.