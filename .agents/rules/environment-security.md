# Nombre: Entorno, dependencias y seguridad

## Alcance

Compose, Dockerfiles, dependencias, Vite, CORS y documentacion de ejecucion/despliegue.

## Justificacion

[vite.config.ts](../../frontend/vite.config.ts) reenvia `/api` a `backend:8000`. [frontend/Dockerfile](../../frontend/Dockerfile) usa `npm install` y Vite dev; [backend/Dockerfile](../../backend/Dockerfile) usa recarga y debugpy. [requirements.txt](../../backend/requirements.txt) no fija versiones; [main.py](../../backend/app/main.py) configura CORS abierto con credenciales.

## Guia del proyecto

- Describir este Compose como entorno de desarrollo, no como despliegue de produccion. No publicar debugpy como servicio de produccion.
- `backend` es DNS interno de la red de Compose, no un host para el navegador. El proxy de Vite es de desarrollo; no asumir que acompana a los archivos compilados.
- `VITE_API_BASE_URL` es configuracion publica del frontend. Nunca colocar secretos en variables `VITE_*`.
- En tareas de dependencias, mantener lockfiles coherentes y preferir `npm ci` para instalaciones reproducibles; fijar versiones Python verificadas, sin inventarlas ni actualizarlas fuera del alcance.
- Para despliegues con credenciales, definir origenes CORS explicitos. CORS no sustituye autenticacion y no bloquea clientes servidor-a-servidor.
- No confundir esta guia con remediaciones ya aplicadas: no cambiar dependencias, CORS o despliegue sin una tarea que lo requiera.

## Verificacion

Contrastar instrucciones de arranque con Dockerfiles, Compose y Vite. En cambios CORS, comprobar preflight y cabeceras del navegador, no afirmar que toda solicitud de otro origen es rechazada. En documentacion, comprobar consistencia entre [README.md](../../README.md) y [README.es.md](../../README.es.md). Registrar que clausulas fueron realmente ejercitadas.