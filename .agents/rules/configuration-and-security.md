# Regla: Configuración e integración de servicios

## Alcance

Aplica a Docker Compose, proxy de desarrollo, orígenes API, CORS y configuración de ejecución frontend/backend.

## Justificación basada en el repositorio

- `docker-compose.yml` define los servicios `frontend` y `backend`.
- `frontend/vite.config.ts` reenvía `/api` a `http://backend:8000`, nombre de host disponible en la red de Compose.
- `backend/app/main.py` configura CORS con comodines para orígenes, métodos y headers, además de `allow_credentials=True`.
- `frontend/src/App.tsx` permite establecer `VITE_API_BASE_URL`; la URL vacía usa rutas relativas y el proxy de Vite.

## Guía específica del proyecto

1. Si se cambia el nombre o puerto del servicio backend en `docker-compose.yml`, actualiza `frontend/vite.config.ts` y valida una solicitud `/api` desde el frontend.
2. Para ejecución fuera de Docker, no des por hecho que el hostname `backend` resuelve: configura `VITE_API_BASE_URL` o el proxy de Vite según el entorno.
3. Antes de desplegar con otros orígenes, sustituye los comodines CORS de `backend/app/main.py` por una lista explícita de orígenes, métodos y headers necesarios.
4. Revisa la política CORS junto con `allow_credentials`; no amplíes el acceso sin un requisito documentado.
5. Mantén coherentes las instrucciones de `README.md` y `README.es.md` con las configuraciones reales de Compose, Vite y variables de entorno.
