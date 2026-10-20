# X1: Distinguir orden de arranque y disponibilidad del backend

**Alcance:** Arranque coordinado en `docker-compose.yml` y primera carga de datos en `frontend/src/App.tsx`.

**Justificación:** Compose declara `depends_on` pero no un `healthcheck`; el frontend solicita `/api/metrics` una sola vez al montar y muestra un error si la petición falla.

**Guía accionable:**
- No uses `depends_on` como prueba de que la API ya acepta solicitudes.
- Si el frontend puede arrancar antes que la API, implementa reintento limitado o una acción de recuperación y conserva un estado de error claro.
- Si Compose debe esperar a la API, añade un healthcheck que consulte `/health` y configura la dependencia según la disponibilidad; prueba el arranque desde cero.