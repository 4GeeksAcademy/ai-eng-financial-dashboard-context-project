# Estilos

Reglas derivadas de convenciones ya presentes en el repositorio. Cada una está respaldada por evidencia concreta — ver `memory-bank/conventions.md` para el análisis completo.

## Reglas

1. **Usa solo clases utilitarias de Tailwind en `className`, combinadas con `cn()` (`@/lib/utils`) para clases condicionales. No introduzcas CSS Modules ni `styled-components`.**
   - Evidencia: `frontend/src/lib/utils.ts`; uso en `card.tsx:9`, `skeleton.tsx:7`, `kpi-card.tsx:59`; ausencia de `.module.css` en el repo.
   - Riesgo que evita: añadir un segundo sistema de estilos sin precedente.

2. **Referencia colores semánticos como `var(--nombre)` (p. ej. `var(--chart-income)`), nunca hex/rgb hardcodeado. Defínelos en `frontend/src/index.css` bajo `:root` y `.dark`.**
   - Evidencia: `income-outcome-chart.tsx:104,113`; `kpi-card.tsx:17-31`; definiciones en `frontend/src/index.css:5-40,42-76`.
   - Riesgo que evita: un color hardcodeado rompe el soporte de tema claro/oscuro. Matiz confirmado en esta sesión: `frontend/src/App.tsx:46` fuerza `className="dark ..."` de forma permanente, así que hoy la app **nunca** muestra el tema claro a un usuario real — las variables de `:root` (claro) están definidas pero son inalcanzables en el flujo actual. El riesgo de esta regla es real de cara a un futuro toggle de tema (o a quien reutilice estos componentes fuera de este layout forzado), no un bug visible hoy mismo.

3. **No crees `tailwind.config.js`. La configuración de Tailwind v4 vive en `index.css` (`@theme inline`) vía el plugin `@tailwindcss/vite`.**
   - Evidencia: ausencia de `tailwind.config.js`/`.ts` en el repo; `frontend/src/index.css:1,78-109`; `frontend/vite.config.ts:3,8`.
   - Riesgo que evita: validado en esta sesión creando `frontend/tailwind.config.js` con un color custom (`canary-test-9x: #ff00ff`) y usando la clase `bg-canary-test-9x` en un componente. El CSS servido por Vite en dev (`curl http://localhost:5173/src/index.css`) **no generó esa clase ni el color** — el plugin `@tailwindcss/vite` ignora por completo un `tailwind.config.js` no referenciado explícitamente. Un config JS tradicional (v3) creado por error queda completamente muerto, sin ningún error ni warning que lo señale.
