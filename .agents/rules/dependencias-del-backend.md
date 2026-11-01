# dependencias-del-backend (P10)
**Prioridad:** media
**Alcance:** `backend/requirements.txt`
**Regla:** Al añadir una dependencia, DEBES fijar su versión con `==` e indicar en la respuesta si es de ejecución, depuración o pruebas; NO DEBES reordenar ni cambiar las seis entradas actuales sin que la tarea lo pida.
**Justificación:** R11; `backend/requirements.txt:1-6` — `fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov`, `httpx`.
**Verificación:** `cat -n backend/requirements.txt` (esperado: 6 entradas); `grep -c "==" backend/requirements.txt` (esperado: 0 antes del cambio; grep devuelve código 1 si no hay coincidencias).
**Línea base:** 6 entradas; `grep -c "==" backend/requirements.txt` devolvió 0.
