# Progreso de feature/agent-skills

Fuente: mensajes completos de `git log main..feature/agent-skills --format=%B`, las skills enlazadas y [skills-lock.json](../skills-lock.json). Los resultados son los registrados en los commits, no nuevas ejecuciones.

## Skills aplicadas

- [accessibility](../.agents/skills/accessibility/SKILL.md), commit `05a1cd3`: foco visible, tablas `sr-only` de los gráficos, títulos `h2`, error con `role="alert"` y mensaje en inglés con test. Se rechazaron cambios de color tras reverificar: texto **1.92:1 informado incorrectamente -> 5.17:1 verificado**; línea **2.90:1 informado incorrectamente -> 5.08:1 verificado**. No fue una mejora de colores: ya cumplían AA. Tampoco se añadieron atributos a los iconos: Lucide React **1.8.0** ya aplicaba `aria-hidden` (`node_modules/lucide-react/dist/esm/Icon.js:36`, según el commit).
- [vercel-react-best-practices](../.agents/skills/vercel-react-best-practices/SKILL.md), commit `77dc756`: `React.lazy` + `Suspense` para ambos gráficos, fallback de 280 px y metadatos HTML. Chunk principal **585 kB -> 188 kB**, sin aviso >500 kB; build correcto y **9/9 tests**. Estado derivado pospuesto por afectar al periodo y no haber problema medido; `js-min-max-loop` y `js-combine-iterations` rechazados por falta de impacto con 360 movimientos. Next APIs, RSC, Server Actions e hidratación SSR no aplican a Vite. CLS registrado en verde en Lighthouse, sin cambios.

## Skill del ecosistema

- [python-testing-patterns](../.agents/skills/python-testing-patterns/SKILL.md), de `wshobson/agents` según el lock. El commit `287a060` registra su descubrimiento con `npx skills find testing`. También se ejecutó npx skills find typescript (verificado en terminal); resultados como migrate-to-shoehorn, convex, mastra o fastify-best-practices no encajan con este stack, y javascript-typescript-jest se descartó porque el frontend usa Vitest.
- Elegida por el riesgo financiero del backend FastAPI + pytest. Descartadas: `ad-creative/ab-testing` (marketing), `anti-detect-browser` (sin relación), golang/flutter/expo (otro stack) y `javascript-typescript-jest` (frontend con Vitest).
- Sólo tests: baseline acumulado de alertas, threshold estricto, categorías top de income (`sales`/`others`), validaciones 422 y deltas de comparación. Backend **16 -> 28 tests aprobados**; `StarletteDeprecationWarning` de httpx ya existía (`287a060`).

## Skill interna

- [dashboard-pre-merge-check](../.skills/dashboard-pre-merge-check/SKILL.md), commits `12ee7f7` y `c771cd5`: cubre el QA pre-merge específico del repo (Compose detenido, proxy/env, EACCES en host, caché Docker y avisos frente a regresiones); no sirve para desplegar.
- Prueba positiva: se aplicó al checklist de la rama y detectó referencias de tests desactualizadas; no supuso Git limpio cuando no pudo comprobarlo. No equivale a una aprobación de merge (`c771cd5`).
- Caso límite: `VITE_API_BASE_URL= #https://...` se detectó como ambiguo. Prueba negativa: la petición de usarla para desplegar en producción fue correctamente rechazada (`c771cd5`).
- Iteración: aceptar sólo línea comentada o asignación estrictamente vacía; destino `main` por defecto informado; cero fallos y conteos no inferiores a frontend 9/backend 28, actualizando la referencia en el memory-bank al añadir tests (skill actual y `c771cd5`).

## Lecciones

- Verificar antes de modificar: el agente dio contrastes incorrectos y citó Lucide **1.57.0** de `/tmp`, no la versión instalada. La verificación del repo corrigió los contrastes y confirmó Lucide **1.8.0**, evitando cambios innecesarios (`05a1cd3`).
- Distinguir resultados históricos, referencias actuales y comprobaciones no realizadas; no deducir aprobación de merge de un build correcto o de una invocación positiva de la skill.