# Componentes y estado del frontend

Reglas derivadas de convenciones ya presentes en el repositorio. Cada una está respaldada por evidencia concreta — ver `memory-bank/conventions.md` para el análisis completo.

## Reglas

1. **Exporta componentes nuevos como export nombrado (`export function X`), nunca `export default`. La única excepción es `App.tsx`.**
   - Evidencia: `export function DashboardHeader/KPIRow/KPICard/IncomeOutcomeChart/ProfitPercentChart`; `export { Card, ... }`; `export { Skeleton }`; vs. `frontend/src/App.tsx:74`.
   - Riesgo que evita: un default export nuevo rompe los imports nombrados usados en todo el árbol.

2. **Tipa las props con `interface <NombreComponente>Props`.**
   - Evidencia: `interface DashboardHeaderProps/KPIRowProps/KPICardProps/IncomeOutcomeChartProps/ProfitPercentChartProps`.
   - Riesgo que evita: inconsistencia frente a los 5 componentes existentes.

3. **Todo componente que muestra datos acepta `loading?: boolean` y renderiza su propio `<Skeleton>` — no un loader global.**
   - Evidencia: `frontend/src/components/dashboard/kpi-card.tsx:37-50`, `income-outcome-chart.tsx:50-62`, `profit-percent-chart.tsx:51-63`.
   - Riesgo que evita: un widget nuevo sin este patrón rompe la experiencia de carga consistente.

4. **No introduzcas Redux/Zustand/Context ni ninguna librería de estado global. El estado vive en `App.tsx` (`useState`/`useEffect`) y se pasa por props.**
   - Evidencia: `frontend/src/App.tsx:24-27,29-43`; ausencia de librerías de estado en `frontend/package.json`.
   - Riesgo que evita: romper la arquitectura de estado único que siguen los 4 componentes hijos actuales.

5. **Las transformaciones de datos van en `lib/financial-utils.ts` como funciones puras, no inline en componentes.**
   - Evidencia: `frontend/src/lib/financial-utils.ts`, uso en `frontend/src/App.tsx:11`.
   - Riesgo que evita: perder la separación lógica/presentación que hoy permite testear `financial-utils.test.ts` sin renderizar nada.

6. **No uses `frontend/src/lib/mock-data.ts` como fuente de datos. La app real llama a `/api/metrics` desde `App.tsx`; `mock-data.ts` es código muerto, no importado por nadie.**
   - Evidencia: `frontend/src/App.tsx:15-21` (fetch real); búsqueda de `mock-data`/`mockMovements` en el repo → única coincidencia es su propia definición.
   - Riesgo que evita: cablear accidentalmente datos estáticos donde se espera el flujo real vía API.
