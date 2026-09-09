# Estructura y imports del frontend

Reglas derivadas de convenciones ya presentes en el repositorio. Cada una está respaldada por evidencia concreta — ver `memory-bank/conventions.md` para el análisis completo.

## Reglas

1. **Coloca componentes de dominio en `src/components/dashboard/`, primitivos sin lógica de negocio en `src/components/ui/`, y tipos/utilidades puras en `src/lib/`. No mezcles categorías.**
   - Evidencia: `frontend/components.json:13-18` (alias `ui`/`components`/`lib`); estructura real de `frontend/src/components/dashboard/*` vs `ui/*`.
   - Riesgo que evita: romper la separación que asumen los alias de shadcn/ui para futuros componentes.

2. **Nombra archivos nuevos de componentes/librería en kebab-case (`nuevo-widget.tsx`), no PascalCase. No renombres `App.tsx`/`main.tsx`.**
   - Evidencia: `dashboard-header.tsx`, `income-outcome-chart.tsx`, `kpi-card.tsx`, `kpi-row.tsx`, `profit-percent-chart.tsx`, `financial-types.ts`, `financial-utils.ts` (100% de los archivos existentes).
   - Riesgo que evita: inconsistencia de nombres frente a todo el árbol actual.

3. **Usa el alias `@/` para importar cualquier archivo fuera del directorio actual; usa `./` solo dentro del mismo directorio.**
   - Evidencia: `frontend/src/components/dashboard/kpi-row.tsx:1-3` (`./kpi-card` vs `@/lib/financial-types`); config en `frontend/vite.config.ts:18-21`, `frontend/tsconfig.app.json:12-13`.
   - Riesgo que evita: rutas relativas profundas (`../../lib/x`) compilan pero rompen la convención y dificultan mover archivos.

4. **Marca los imports de solo-tipo con `type` inline (`import { type X } from ...`), nunca sin el modificador.**
   - Evidencia: `frontend/tsconfig.app.json:16` (`verbatimModuleSyntax: true`); uso en `frontend/src/App.tsx:6-10`.
   - Riesgo que evita: un import de tipo sin `type` puede romper `npm run build` (`tsc -b`) bajo `verbatimModuleSyntax`.
