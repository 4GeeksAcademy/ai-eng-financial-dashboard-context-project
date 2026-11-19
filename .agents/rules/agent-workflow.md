# Nombre: Trabajo de agentes y documentacion

## Alcance

Tareas de agentes, instrucciones del repositorio y documentacion de analisis/verificacion.

## Justificacion

[AGENTS.md](../../AGENTS.md) pide consultar reglas, skills y memoria del proyecto. [ANALISIS_FASE_2.md](../../ANALISIS_FASE_2.md) contiene propuestas historicas; [verification.md](../../verification.md) registra evidencia de ejecucion.

## Guia del proyecto

- Consultar AGENTS.md y las reglas cuyo alcance coincida con la tarea antes de editar. Revisar tambien skills y memoria indicadas si existen; informar ausencias o lecturas bloqueadas sin inventar su contenido.
- Comprobar cambios existentes y preservarlos. No crear ramas, hacer staging, commit o push sin solicitud del usuario.
- Mantener el analisis historico separado de reglas vigentes y resultados de nuevas ejecuciones. No sobrescribir evidencia anterior para hacerla pasar por actual.
- Usar nombres kebab-case para reglas y las secciones Nombre, Alcance, Justificacion, Guia del proyecto y Verificacion, con evidencia enlazada del repositorio.
- La carpeta `.agents/rules/` se descubre por la instruccion de AGENTS.md; no afirmar auto-carga mediante `applyTo` sin verificar soporte de la herramienta.

## Verificacion

Revisar estado/diff antes y despues de la tarea. Para cada regla aplicada, registrar tarea, instruccion concreta, archivos, comando o revision, resultado y limites. Comprobar enlaces y secciones de documentos nuevos, incluidos archivos sin seguimiento; `git diff` solo no los incluye. No afirmar que pruebas de codigo demuestran auto-descubrimiento de instrucciones.