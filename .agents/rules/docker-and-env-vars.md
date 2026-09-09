# Docker y variables de entorno

Reglas derivadas de convenciones ya presentes en el repositorio. Cada una está respaldada por evidencia concreta — ver `memory-bank/conventions.md` y `memory-bank/status.md` para el análisis completo.

## Reglas

1. **Mantén el orden de capas en ambos Dockerfiles: copiar el manifiesto de dependencias → instalar → copiar el resto del código. No reordenes a `COPY . .` antes de instalar.**
   - Evidencia: `frontend/Dockerfile:5-8`, `backend/Dockerfile:5-8` (mismo patrón en ambos, pese a ser stacks distintos).
   - Riesgo que evita: validado en esta sesión con `docker compose build backend` real. Con el orden actual, tocar `backend/app/routes.py` y reconstruir mantuvo `RUN pip install ...` como `CACHED`. Invirtiendo el orden (`COPY . .` antes del `RUN pip install`) y repitiendo el mismo experimento (tocar `backend/app/main.py` y reconstruir), la capa de instalación **dejó de estar cacheada** y se reinstalaron las dependencias desde cero en cada build. Confirma que el orden actual no es cosmético: reordenar reinstala dependencias en cada cambio de código, no solo cuando cambia `requirements.txt`.

2. **Accede a variables de entorno del frontend siempre con fallback: `import.meta.env.VITE_X ?? "<valor>"`. Toda variable nueva necesita el prefijo `VITE_` y un comentario en `.env.example`.**
   - Evidencia: `frontend/src/App.tsx:13`; `frontend/.env.example:1-4`.
   - Riesgo que evita: validado en esta sesión quitando el `?? ""` (sin `.env` presente, como en el setup real de este repo). Resultado real observado en el navegador: la petición pasó de `GET /api/metrics` a `GET /undefined/api/metrics`, la respuesta ya no era el JSON esperado, y la UI cayó al estado de error fijo ("No se pudo cargar la información financiera..."), sin ningún error en consola. Nota operativa: el HMR de Vite no recogió el cambio hecho desde el host a través del bind mount de Docker Desktop en Windows — hizo falta `docker restart` del contenedor `frontend` para que sirviera el código editado. Si cambias `App.tsx` y no ves el efecto esperado en el navegador, no asumas que tu cambio está mal: reinicia el contenedor antes de descartar la hipótesis.

3. **El backend no lee ninguna variable de entorno hoy. Si añades `os.getenv(...)`, tienes que declararla también en la clave `environment` de `docker-compose.yml` (que hoy no existe para ningún servicio).**
   - Evidencia: `docker-compose.yml` completo (sin `environment:`); ausencia de `os.environ`/`os.getenv` en `backend/`.
   - Riesgo que evita: una variable leída en código pero nunca inyectada por Compose, que falla silenciosamente solo en el entorno dockerizado.

4. **`backend/requirements.txt` no fija versiones (sin `==`). No asumas una versión concreta de `fastapi`/`uvicorn`/etc. al razonar sobre comportamiento; si la reproducibilidad importa para la tarea, señálalo en vez de fijar versiones por tu cuenta.**
   - Evidencia: `backend/requirements.txt` (6 líneas, ninguna con `==`).
   - Riesgo que evita: fijar versiones como "mejora" no solicitada, o asumir un comportamiento específico de una versión que puede no ser la instalada.
