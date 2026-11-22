# Objetivo claro

Verificar el proxy `/api` y los checks requeridos antes de integrar cambios en este repositorio, distinguiendo entre Vite en Docker Compose y Vite ejecutado localmente en Codespaces. No asumir que el hostname `backend` es accesible desde el host ni que un contenedor iniciado ya está listo para atender solicitudes.

# Inputs definidos

- Modo de ejecución: Docker Compose o Vite local en Codespaces.
- Cambios y estado actual de `frontend/vite.config.ts`, `docker-compose.yml` y configuración de entorno relacionada.
- Variables disponibles, en particular `VITE_DEV_PROXY_TARGET` para el modo local.
- Scripts declarados en `frontend/package.json` y checks exigidos por las reglas del repositorio.
- Estado y disponibilidad del backend, más evidencia HTTP de `/health` y `/api/metrics`.

# Output esperado

- Modo de ejecución identificado y destino efectivo del proxy `/api`.
- Resultados de conectividad al backend y de la solicitud a través del proxy de Vite, con limitaciones observadas.
- Resultados de los checks de compilación y calidad pertinentes, con comandos, éxitos, fallos y advertencias.
- Bloqueos o verificaciones pendientes. No presentar resultados históricos como pruebas del estado actual.

# Criterios de aceptación

- Para Compose, comprobar que `/api` apunta al servicio `backend:8000` dentro de la red de Compose.
- Para Vite local en Codespaces, comprobar que el destino configurable puede usar `VITE_DEV_PROXY_TARGET=http://localhost:8000`, sin sustituir el destino Compose ni presuponer que `backend` resuelve desde el host.
- Verificar disponibilidad HTTP real del backend —incluyendo `/health` y `/api/metrics` cuando aplique— y la respuesta de `/api/metrics` a través del proxy en el modo probado. El estado `running` del contenedor por sí solo no basta.
- Ejecutar `npx tsc --noEmit` y `npm run build` desde `frontend`; ejecutar lint y pruebas existentes cuando correspondan al cambio y a las reglas vigentes.
- Informar cada comando y resultado por separado; distinguir fallos, advertencias y pruebas no ejecutadas. No afirmar que una verificación de un modo cubre el otro.
- No añadir dependencias, alterar contratos de API ni cambiar configuración fuera del alcance solicitado.
