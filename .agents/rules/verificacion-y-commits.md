# Regla: Verificación, commits y contexto

**Alcance:** cualquier tarea que modifique el repo; mensajes de commit y PR; `verification.md`,
`memory-bank/`, `.agents/`.
**Origen:** R-8, R-9, R-12 · hallazgos H-13, H-14, H-15, H-18.

## Por qué
No hay CI (`.github/workflows/` no existe) ni versiones fijadas, y el host tiene Python 3.14 mientras el
contenedor usa 3.13. La única garantía de que algo funciona es ejecutarlo en los contenedores y decirlo.

## Qué hacer
1. **Antes de cerrar una tarea**, con `docker compose up -d` activo, ejecutar lo que aplique y pegar el
   resultado real (no "debería pasar"):
   | Cambio en | Comando |
   |---|---|
   | `backend/**` | `docker compose exec backend python -m pytest -q` |
   | `frontend/src/**` | `docker compose exec frontend npm test` y `npm run build` |
   | `frontend/**/*.ts(x)` | `docker compose exec frontend npm run lint` |
   Si un comando falla por algo previo a tu cambio, decirlo explícitamente.
2. **No borrar ni debilitar tests** para que pasen; si un test cambia, explicar por qué en el commit.
3. **Commits:** un objetivo por commit. Asunto en español, imperativo, ≤ 72 caracteres; cuerpo con el
   *porqué* y la regla/hallazgo que lo motiva (`R-6`, `H-10`).
   - ✅ `Agrupar meses por string ISO para evitar desfase de zona horaria (H-10)`
   - ❌ `fix`, `cambios`, `update App.tsx`
4. **Rastro de verificación:** si el agente afirmó algo que resultó falso, añadir fila
   "afirmación → corrección → cómo se comprobó" en `verification.md`.
5. **Contexto de agentes:** reglas nuevas solo en `.agents/rules/`, skills en `.agents/skills/` (no en
   `.skills/` ni `frontend/.agents/`). Si la tarea cierra o abre un gap, actualizar
   `memory-bank/estado-actual.md` en el mismo commit.
6. No crear documentación nueva de producto ni roadmap sin evidencia en el código.
