# Estado actual
**Última verificación:** 2026-10-31, sobre el commit 295fd8c.

## Dónde está el proyecto
- Rama de trabajo `agent-ready-context`, con un commit por fase: `docs(fase-1)`, `docs(fase-2)`, `feat(fase-3)` y `docs(fase-4)` (`git --no-pager log --oneline`).
- El código de la aplicación no se ha modificado. Las pruebas de la Fase 3 que tocaban código se revirtieron con `git restore`; por ejemplo, el código HTTP del error NO se muestra en el dashboard.

## Dónde está cada cosa
- `docs/project-summary.md`: resumen del proyecto, verificado contra el código.
- `docs/analysis/engineering-findings.md`: 20 hallazgos (convenciones C y riesgos R) y reglas propuestas P1 a P10.
- `docs/rules-validation.md`: pruebas de las reglas con un agente.
- `verification.md`: rastro de verificación; cada afirmación lleva una marca (✅, ❌, ❓).
- `AGENTS.md`: apunta a `.agents/rules`, `.agents/skills` y `memory-bank`. No se modifica.

## Riesgos conocidos (detalle en `docs/analysis/engineering-findings.md`)
- CORS con `*` y credenciales (`backend/app/main.py:9`) y debugpy escuchando en `0.0.0.0:5678`, publicado por Compose.
- El `.catch` del frontend descarta el status HTTP (`frontend/src/App.tsx:35`).
- Periodo del encabezado fijo frente a años calculados con `date.today()`.
- Tests solo de rutas y de `financial-utils`; ninguno de componentes.

## Sin confirmar (❓)
- Primer registro `2025-10-02` (ningún archivo lo respalda).
- R5: agrupación mensual con zona local, sin probar en un navegador.
- Efecto de CORS en un navegador (P7); P7 no tuvo tarea con agente.
- Que un agente descubra `.agents/rules` solo por `AGENTS.md` (una prueba, sin éxito).
