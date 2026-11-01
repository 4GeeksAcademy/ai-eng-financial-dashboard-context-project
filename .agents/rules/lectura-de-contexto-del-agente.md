# lectura-de-contexto-del-agente (P8)
**Prioridad:** media
**Alcance:** `AGENTS.md`; `.agents/rules/**`; `.agents/skills/**`; `memory-bank/**`
**Regla:** ANTES de editar, DEBES listar y leer los archivos de `.agents/rules` y `.agents/skills` y, si existe, `memory-bank`; DEBES indicar qué leíste y NO DEBES presuponer el contenido de rutas inexistentes.
**Justificación:** C9; `AGENTS.md:6` — `./.agents/rules`; `AGENTS.md:9` — `./.agents/skills`; `AGENTS.md:12` — `./memory-bank`; `AGENTS.md:13` — `_(if the directory exists)_`; `AGENTS.md:15` — `Before taking action (analyzing code, modifying files, or generating outputs), always review the latest files in these locations to ensure compliance with project conventions, context, and operational constraints.`.
**Verificación:** checklist: la respuesta enumera los archivos leídos; `ls -a .agents/rules .agents/skills memory-bank` (esperado: existen reglas, skill y `memory-bank`).
**Línea base:** al redactar el informe en `dbd0a2b`, las tres rutas no existían; ahora se crean `.agents/rules` y `.agents/skills`; `memory-bank` se creó en la Fase 4. Antes de escribir, `ls -a` confirmó que las tres rutas faltaban.
