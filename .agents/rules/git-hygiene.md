# Regla: Higiene de cambios y commits

## Alcance

Aplica al preparar cualquier cambio para revisión o commit, incluidos código, pruebas, documentación y reglas de agentes.

## Justificación basada en el repositorio

- Las reglas del proyecto se encuentran bajo `.agents/rules/` y deben versionarse junto con el código que describen.
- Los documentos nuevos bajo `.agents/rules/` deben añadirse explícitamente al índice; crear archivos en el sistema de archivos no los incluye automáticamente en Git.
- Los cambios de comportamiento pueden involucrar varios archivos: por ejemplo, un filtro API requiere cambios en `backend/app/routes.py` y cobertura en `backend/tests/test_routes.py`.

## Guía específica del proyecto

1. Antes de preparar un commit, ejecuta `git status --short` y revisa `git diff`.
2. Añade explícitamente los archivos previstos con `git add <rutas>`; no des por hecho que archivos nuevos o directorios vacíos están bajo seguimiento.
3. Antes de confirmar, revisa `git diff --cached` para comprobar que el commit contiene solo cambios relacionados y no incluye archivos ajenos.
4. Usa un mensaje que identifique la fase o propósito y describa el cambio, por ejemplo: `Fase 2: documentar reglas y validar contratos`.
5. Después del commit, comprueba `git status --short` y comunica el hash junto con las validaciones ejecutadas.
