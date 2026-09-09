# Manejo de errores

Reglas derivadas de convenciones ya presentes en el repositorio. Cada una está respaldada por evidencia concreta — ver `memory-bank/conventions.md` y `memory-bank/status.md` para el análisis completo.

## Reglas

1. **No añadas `try/except` ni `raise HTTPException` genéricos en el backend salvo que el usuario lo pida explícitamente. Hoy la validación se delega 100% a FastAPI/Pydantic.**
   - Evidencia: búsqueda de `try/except/raise/HTTPException` en `backend/` → 0 resultados.
   - Riesgo que evita: un `try/except` que capture y silencie errores oculta los 422 automáticos de Pydantic que hoy funcionan correctamente.

2. **Si añades una llamada `fetch` nueva en el frontend, sigue el patrón mínimo existente (`.catch()` con mensaje fijo) salvo que te pidan explícitamente mejorar el manejo de errores del proyecto. No añadas `console.error`/logging por tu cuenta como efecto secundario de otra tarea.**
   - Evidencia: `frontend/src/App.tsx:35-39` (único `.catch()` de la app, sin loguear); búsqueda de `console.(log|error|warn)` en `frontend/src` → 0 resultados.
   - Riesgo que evita: validado en esta sesión provocando un fallo real de fetch (ver regla de env vars en `docker-and-env-vars.md`) y observando el navegador: la UI mostró el mensaje fijo en español y la pestaña de consola no registró **ningún** error (`read_console_messages` con `onlyErrors: true` → "No console logs"). Confirma que hoy, si algo falla, no queda ningún rastro depurable en el navegador — cambiarlo sin que te lo pidan altera un comportamiento intencional (o al menos consistente) del proyecto.
