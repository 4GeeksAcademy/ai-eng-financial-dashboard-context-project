# ⚙️ Reglas de DevOps / Despliegue

> Aplica a: Dockerfile, docker-compose.yml

---

## DEV-01: Separar volúmenes de desarrollo

El `docker-compose.yml` principal debe reflejar la configuración de producción. Los volúmenes que montan código fuente (`./backend:/app`, `./frontend:/app`) deben moverse a `docker-compose.override.yml`.

**Motivación:** Mantiene el compose principal desplegable tal cual, y separa las herramientas de desarrollo.

**Verificación:** Verificar que `docker-compose.yml` no tenga volúmenes que monten código fuente.

---

## DEV-02: Dockerfile multi-stage

Los `Dockerfile` deben tener un **multi-stage build**: una etapa de `development` (con debugpy, reload, herramientas) y una etapa `production` (optimizada, sin herramientas de dev).

**Motivación:** Produce imágenes de producción ligeras y seguras sin cambiar de Dockerfile.

**Verificación:** Verificar que el Dockerfile tenga `FROM ... AS development` y `FROM ... AS production`.

---

## DEV-03: Variables de entorno para configuración

Las variables de entorno sensibles (CORS origins, secrets de DB, API keys) deben pasarse al contenedor vía archivo `.env` o variables de entorno del orquestador. Prohibido hardcodearlas.

**Motivación:** Evita exponer credenciales en el código fuente y facilita la configuración por entorno.

**Verificación:** Buscar valores sensibles hardcodeados en `main.py`, `docker-compose.yml` o `Dockerfile`.
