# cors-y-puertos-publicados (P7)
**Prioridad:** alta
**Alcance:** `backend/app/main.py`; `docker-compose.yml`; `backend/Dockerfile`
**Regla:** NO DEBES ampliar ni copiar la política CORS ni añadir puertos publicados sin que la tarea lo pida; al tocar estos archivos, DEBES informar los puertos publicados y la política CORS actual (`*` con credenciales).
**Justificación:** R8, R9; `backend/app/main.py:9` — `allow_origins=["*"],`; `backend/app/main.py:10` — `allow_credentials=True,`; `backend/app/main.py:11` — `allow_methods=["*"],`; `backend/app/main.py:12` — `allow_headers=["*"],`; `backend/Dockerfile:12` — `"--listen", "0.0.0.0:5678"`; `docker-compose.yml:7` — `- "5173:5173"`; `docker-compose.yml:19` — `- "8000:8000"`; `docker-compose.yml:20` — `- "5678:5678"`.
**Verificación:** `grep -cE '^\s*- "[0-9]+:[0-9]+"' docker-compose.yml` (esperado: 3); `grep -n "allow_" backend/app/main.py` (esperado: cuatro líneas, 9-12). El efecto en el navegador no se probó (❓).
**Línea base:** 3 puertos publicados (5173, 8000, 5678); líneas CORS 9-12; efecto en navegador sin probar (❓).
