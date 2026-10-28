---
applyTo:
	- "backend/**"
	- "frontend/**"
	- "docker-compose.yml"
---

# Regla: reproducibilidad y operación local

**Alcance:** Dependencias, scripts, Dockerfiles, Docker Compose, configuración del servidor de desarrollo y CORS.

**Justificación basada en el repositorio:** `backend/requirements.txt` lista dependencias sin versiones. `frontend/package.json` define scripts de desarrollo, build, lint y pruebas; `docker-compose.yml` publica puertos y usa `depends_on`, pero no declara healthcheck. `backend/app/main.py` configura CORS con comodines y `allow_credentials=True`.

**Guía específica del proyecto:**
- Al añadir dependencias Python, declara una política reproducible de versiones compatible con el despliegue en `backend/Dockerfile`; verifica que las dependencias directas estén declaradas en `backend/requirements.txt`.
- Conserva `package-lock.json` y usa el lockfile para instalaciones reproducibles del frontend. No confundas rangos de `package.json` con versiones exactas instaladas.
- Añade o actualiza scripts npm en `frontend/package.json` para tareas repetibles y documenta los comandos de ejecución relevantes en los README si cambia el flujo de desarrollo.
- No interpretes `depends_on` de Compose como garantía de disponibilidad. Si un servicio necesita que otro esté listo, agrega healthcheck/espera o maneja la indisponibilidad en el cliente.
- No uses CORS abierto en configuración expuesta fuera del entorno local. Configura orígenes permitidos por entorno y revisa `allow_credentials` junto a `allow_origins`.
- Mantén consistentes los puertos y hosts entre `docker-compose.yml`, los Dockerfiles y `frontend/vite.config.ts`; el proxy actual dirige `/api` a `http://host.docker.internal:8000`. Compose configura el alias mediante `extra_hosts: host.docker.internal:host-gateway` y el backend publica el puerto `8000`.
- La ruta por el host es una alternativa al fallo observado de comunicación directa entre contenedores, no un requisito general de Docker. No asumas que el alias resuelve al ejecutar Vite fuera de Docker; conserva las opciones documentadas en los README para configurar el proxy o `VITE_API_BASE_URL`.
