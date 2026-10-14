# Evidencia de uso de skills

## Alcance
Skills de agentes ubicadas en `.agents/skills/` y documentación de tareas del repositorio, incluyendo `memory-bank/skills-usage.md` como registro persistente de evidencias.

## Regla
Antes de iniciar una tarea, revisar si existe una skill pertinente. Si se utiliza, registrar su ruta y la guía aplicada en la documentación de cambios. Si no existe una skill pertinente o el directorio no está disponible, declararlo explícitamente y no afirmar que se utilizó una skill.

## Razon
`AGENTS.md` indica revisar `.agents/skills/`, pero la existencia de una instrucción o carpeta no demuestra que una skill se haya aplicado. La documentación debe reflejar únicamente el uso comprobable.

## Como verificarla
1. Revisar el inventario de `.agents/skills/` antes de trabajar.
2. Contrastar cualquier afirmación de uso con una skill existente y su contenido.
3. Registrar las skills aplicadas y los resultados en `memory-bank/skills-usage.md`, o en otra documentación de tarea cuando tenga una ubicación explícita.
4. Confirmar que el registro distingue skills aplicadas, solo consultadas, creadas y no disponibles.