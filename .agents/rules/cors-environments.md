# X2: Restringir CORS por entorno

**Alcance:** Middleware CORS en `backend/app/main.py` y configuración de despliegue.

**Justificación:** La aplicación usa `allow_origins=["*"]` junto con `allow_credentials=True`.

**Guía accionable:**
- Para cualquier entorno accesible fuera de desarrollo local, define una lista explícita de orígenes permitidos mediante configuración.
- No habilites credenciales para orígenes arbitrarios; valida origen y necesidad de credenciales por entorno.
- Añade una prueba de configuración que confirme que el origen permitido responde y que un origen externo no está autorizado.