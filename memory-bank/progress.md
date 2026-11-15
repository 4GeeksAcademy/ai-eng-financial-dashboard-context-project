# Progress - Financial Dashboard

**Last Updated:** 2026-11-15
**Base de referencia:** commit `c881c0d` (rama `feature/agent-skills`)
**Status:** Skills aplicadas y verificadas; QA pre-merge documentado

---

## 1. Skills aplicadas

| Skill | Origen | Commit | Qué se aplicó |
|-------|--------|--------|---------------|
| `accessibility` | `addyosmani/web-quality-skills` | `ba38427` | Título de página, `role="alert"` en errores, `aria-busy` en KPIs y tarjetas en carga, encabezados semánticos (`h2`/`h3`) en tarjetas y títulos de gráficos, `role="img"` con `aria-label` en gráficos, `accessibilityLayer` en Recharts, `aria-hidden` en iconos decorativos y `:focus-visible` global en [index.css](/workspaces/ai-eng-financial-dashboard-context-project/frontend/src/index.css) |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | `1d8698c` | Gráficos cargados con `lazy` + `Suspense` en [App.tsx](/workspaces/ai-eng-financial-dashboard-context-project/frontend/src/App.tsx); `useMemo` para KPIs y datos mensuales; `AbortController` en el fetch con limpieza en el efecto; `computeKPIs` con un solo bucle y `Intl.NumberFormat` creado una sola vez en [financial-utils.ts](/workspaces/ai-eng-financial-dashboard-context-project/frontend/src/lib/financial-utils.ts); skeletons con alturas que coinciden con el contenido real (evita saltos de layout) |
| `vitest` | `antfu/skills` | `28b4b0f`, `c881c0d` | Pruebas unitarias de `computeKPIs`, `computeMonthlyData` y formateadores en [financial-utils.test.ts](/workspaces/ai-eng-financial-dashboard-context-project/frontend/src/lib/financial-utils.test.ts) |

Las tres skills externas están registradas en [skills-lock.json](/workspaces/ai-eng-financial-dashboard-context-project/skills-lock.json) con su hash, y sus archivos viven en `.agents/skills/`.

---

## 2. Justificación de la skill comunitaria `vitest` (antfu/skills)

Se eligió la skill `vitest` de `antfu/skills` (registrada en `skills-lock.json`) por estas razones:

- **Mismo pipeline que la app:** Vitest comparte `vite.config.ts`, incluido el alias `@`, así que las pruebas resuelven imports igual que el código de producción.
- **TypeScript nativo:** no requiere configuración adicional de transpilación para `strict: true`.
- **Foco en lógica financiera:** `computeKPIs` es el núcleo aritmético del dashboard (totales, utilidad, `profitPercent`), y las pruebas cubren casos límite: ingreso cero y lista vacía.

**Advertencia de versión:** la skill indica estar basada en Vitest 5.1.0-beta.1, mientras que el proyecto usa Vitest 4.1.4 ([package.json](/workspaces/ai-eng-financial-dashboard-context-project/frontend/package.json)). Revisar diferencias de API contra la versión instalada antes de copiar ejemplos.

---

## 3. Verificación de cambios (build y tests)

Ejecutado el 2026-11-15 sobre el árbol de trabajo limpio en `c881c0d`, desde los directorios correctos:

| Check | Directorio | Comando | Resultado |
|-------|------------|---------|-----------|
| Lint | `frontend/` | `npm run lint` | PASS (exit 0) |
| Tests | `frontend/` | `npm test` | PASS (1 archivo, 8 tests) |
| Build | `frontend/` | `npm run build` (`tsc -b && vite build`) | PASS (exit 0) |
| Backend | `backend/` | `pytest -q` (venv con `requirements.txt`) | PASS (15 tests) |

**Notas:**
- `npm test` desde la raíz **falla** (`ENOENT`): la raíz no tiene `package.json`. Los scripts viven en `frontend/`.
- `pytest` con el Python del sistema falla por dependencias faltantes. Se requiere un entorno con `requirements.txt` instalado (el Dockerfile usa Python 3.13).

---

## 4. Skill interna de QA pre-merge

Se creó la skill interna [qa-pre-merge](/workspaces/ai-eng-financial-dashboard-context-project/.agents/skills/qa-pre-merge/SKILL.md) en `.agents/skills/qa-pre-merge/SKILL.md`, la ubicación que usa el proyecto para sus skills según [AGENTS.md](/workspaces/ai-eng-financial-dashboard-context-project/AGENTS.md). No se usó `.skills/`, que no existe en el repo.

Contenido:
- **Objetivo:** veredicto APTO o BLOQUEADO antes de merge, con evidencia por check.
- **Inputs:** rama, rama base (`origin/main`) y ámbito derivado de `git diff --name-only`.
- **Checks obligatorios:** en `frontend/`, `lint`, `test` y `build`; en `backend/`, `pytest`; y revisión de reglas de [coding-standards.md](/workspaces/ai-eng-financial-dashboard-context-project/.agents/rules/coding-standards.md) sobre los archivos cambiados.
- **Output:** tabla de checks con directorio, comando y resultado.
- **Criterios de aceptación:** ocho criterios verificables, entre ellos directorio correcto, veredicto coherente y ausencia de efectos colaterales.

---

## 5. Pendientes conocidos (fuera de este trabajo)

- No hay CI en `.github/`: el QA pre-merge es manual.
- El backend mantiene `debugpy` en su [Dockerfile](/workspaces/ai-eng-financial-dashboard-context-project/backend/Dockerfile) y CORS abierto. Ambos están listados en [activeContext.md](/workspaces/ai-eng-financial-dashboard-context-project/memory-bank/activeContext.md) como fixes pendientes de Fase 1.
- Cobertura de pruebas limitada a la lógica de `financial-utils`. Los componentes de UI no tienen pruebas.
