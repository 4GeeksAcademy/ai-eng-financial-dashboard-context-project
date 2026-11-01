# fuente-de-datos-que-consume-la-ui (P3)
**Prioridad:** alta
**Alcance:** `frontend/src/App.tsx`; `frontend/src/lib/mock-data.ts`; `frontend/src/components/**/*.tsx`
**Regla:** Al cambiar datos visibles, DEBES seguir el fetch de `frontend/src/App.tsx:16` hasta el componente que los muestra; NO DEBES editar `mock-data.ts` esperando cambiar la UI mientras ningún archivo lo importe; si añades un consumidor para otra ruta `/api/metrics/*`, DEBES conectarlo en `App.tsx` e indicarlo en la respuesta.
**Justificación:** R2; `frontend/src/App.tsx:16` — `const response = await fetch(`${API_BASE_URL}/api/metrics`);`; `frontend/src/lib/mock-data.ts:3` — `export const mockMovements: FinancialMovement[] = [`.
**Verificación:** `grep -rn "mockMovements\|mock-data" frontend/src` (esperado: solo `frontend/src/lib/mock-data.ts:3`); `grep -rn "fetch(" frontend/src` (esperado: una sola coincidencia en `frontend/src/App.tsx`; hoy en la línea 16).
**Línea base:** solo una coincidencia de mock (`frontend/src/lib/mock-data.ts:3`) y un fetch (`frontend/src/App.tsx:16`).
