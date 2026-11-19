# Regla: Contratos API ↔ UI y naming

**Alcance:** `backend/app/routes.py` (modelos), `frontend/src/lib/financial-types.ts`,
`frontend/specs/api-types.ts`, `frontend/specs/param-types.ts`, componentes que consuman `/api/*`.
**Origen:** R-3, R-4 · hallazgos H-6, H-7, H-8, H-9.

## Por qué
Los tipos se duplican a mano entre Python y TypeScript (no hay generación). Un cambio en un solo lado
compila pero rompe en tiempo de ejecución. Además la API mezcla ratios y porcentajes.

## Qué hacer
1. **Cambio de contrato = 3 archivos en el mismo commit:** modelo/`Literal` en `routes.py`, tipo en
   `frontend/src/lib/financial-types.ts` y, si aplica, `frontend/specs/api-types.ts`.
2. **Naming por capa:**
   - Campos que viajan por HTTP: `snake_case`, idénticos al modelo Pydantic (`create_date`, `operation_type`).
   - Modelos solo de UI: `camelCase` (`totalIncome`, `profitPercent`).
   - Archivos de componentes en kebab-case exportando PascalCase (`kpi-card.tsx` → `KPICard`).
   - Imports internos con alias `@/` (`@/lib/financial-utils`).
3. **Ratio vs. porcentaje:** `formatPercent` espera un porcentaje (`15.6` → `"15.6%"`).
   - `MetricsComparison.delta_pct` ya es porcentaje → pasar directo.
   - `MetricsAlert.increase_ratio` es ratio → multiplicar por 100 antes de `formatPercent`.
   - Un campo nuevo debe indicar en su nombre o JSDoc cuál de los dos es (`*_pct` o `*_ratio`).
4. No inventar endpoints ni campos: comprobar en `http://localhost:8000/docs` u `openapi.json`.

## Comprobar
```bash
grep -n "Literal\[" backend/app/routes.py
grep -n "export type" frontend/src/lib/financial-types.ts
```
Los valores de cada `Literal` deben coincidir con la unión TS del mismo nombre.

## Ejemplos
- ✅ Añadir `"marketing"` a `Category` en `routes.py` **y** en `financial-types.ts` **y** en `specs/api-types.ts`.
- ❌ Renombrar `create_date` → `createDate` solo en TypeScript.
- ❌ `formatPercent(alert.increase_ratio)` (muestra `0.4%` en lugar de `40.0%`).
