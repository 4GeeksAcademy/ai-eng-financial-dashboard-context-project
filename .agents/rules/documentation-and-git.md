# Documentación y Git

Reglas derivadas de convenciones ya presentes en el repositorio. Cada una está respaldada por evidencia concreta — ver `memory-bank/conventions.md` para el análisis completo.

## Reglas

1. **Cualquier edición de `README.md` debe reflejarse en la misma sección de `README.es.md`, y viceversa.**
   - Evidencia: `README.md:3,14,39-50` vs `README.es.md:3,14,39-50` (estructura idéntica sección por sección).
   - Riesgo que evita: romper la paridad bilingüe que el repo mantiene hoy.

2. **No añadas docstrings ni comentarios de bloque al código del backend como "mejora" no solicitada. El estilo actual es cero comentarios, apoyado en nombres descriptivos y type hints.**
   - Evidencia: `backend/app/routes.py` (392 líneas, sin docstrings); único comentario de `backend/` está en `backend/app/__init__.py:1`.
   - Riesgo que evita: desviarse del estilo minimalista que sigue el 100% del código backend existente.

3. **Antes de añadir una regla de `.gitignore`, revisa ambos archivos: el `.gitignore` raíz (reglas con prefijo de carpeta) y `frontend/.gitignore` (reglas relativas del scaffold de Vite).**
   - Evidencia: `.gitignore:16-38` vs `frontend/.gitignore`.
   - Riesgo que evita: añadir una regla duplicada o inconsistente en uno de los dos sin saber que el otro también existe.
