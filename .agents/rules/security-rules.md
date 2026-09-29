# 🔒 Reglas de Seguridad

> Aplica a: backend, Dockerfile, docker-compose.yml

---

## SEC-01: CORS con lista explícita

`allow_origins` debe configurarse con una **lista explícita de orígenes permitidos**. Prohibido usar `["*"]` en configuración que se despliegue a producción.

**Motivación:** Previene CSRF y consumo no autorizado de la API.

**Verificación:** Buscar `allow_origins=["*"]` en `main.py`. Debe ser una variable de entorno o lista concreta.

---

## SEC-02: Sin debugpy ni --reload en producción

El `CMD` del `Dockerfile` de producción **nunca debe incluir `debugpy` ni `--reload`**. Estas herramientas solo deben estar presentes en un perfil de desarrollo (devcontainer o docker-compose.dev.yml).

**Motivación:** Elimina la exposición de un debugger remoto y evita el desperdicio de recursos.

**Verificación:** Revisar `backend/Dockerfile`: el CMD debe ser `uvicorn app.main:app --host 0.0.0.0 --port 8000` sin debugpy.

---

## SEC-03: Puerto de depuración aislado

No exponer puertos de depuración (5678) en el `docker-compose.yml` principal. Si se necesita depuración, usar un archivo `docker-compose.override.yml` local.

**Motivación:** Evita que el debugger quede accidentalmente abierto al desplegar.

**Verificación:** Verificar que `ports:` no incluya `5678` en el compose principal.
