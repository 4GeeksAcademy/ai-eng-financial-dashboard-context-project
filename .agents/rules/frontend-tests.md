# Regla: frontend-tests

**Alcance:** `frontend/src/**/*.test.ts`.
**Justificación:** F18 y F19. Solo hay 5 tests, sobre `src/lib`; no existe entorno para probar componentes y el fallo de zona horaria no tenía test porque las fechas de prueba eran de mitad de mes.

## Qué hacer

- Escribe los tests con `vitest` (`describe`, `it`, `expect` desde `"vitest"`) junto al archivo que prueban, con el nombre `<archivo>.test.ts` (`src/lib/financial-utils.test.ts`). Estilo del archivo existente: comillas dobles y punto y coma.
- Ejecuta `cd frontend && npm test` (`vitest run`); `npm run test:coverage` para cobertura.
- Crea los movimientos de prueba con los 5 campos de `FinancialMovement`.
- Si tocas código que lee fechas, añade casos del día 1 y del último día del mes (ejemplo: «keeps the first and last day of a month in their own month» en `financial-utils.test.ts`) y ejecuta también `TZ=America/New_York npm test`: en `UTC` o `Europe/Madrid` ese tipo de fallo no se detecta.

## Qué no hacer

- No añadas pruebas de componentes sin avisar antes: `package.json` no tiene `jsdom` ni `@testing-library`, y `vite.config.ts` no define bloque `test`. Añadirlos es una decisión de dependencias.
- No uses fechas que dependan de hoy.
