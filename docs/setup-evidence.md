# Evidencia de ejecución

Fecha: 2026-10-31

## Responsable y estado

❓ Declaración del usuario, reproducida literalmente: `El usuario ejecutó "docker compose up --build" en una terminal propia del Codespace antes de la ejecución del agente.` No fue verificada independientemente por el agente.

✅ La salida del `docker compose up --build` del agente mostró capas CACHED. Evidencia: salida de terminal del agente, sección «Arranque (salida de docker compose up --build)».

❓ La salida mostrada al agente truncó los nombres en las líneas de contenedor `Recreated`; no se conserva aquí una reproducción íntegra de esas líneas sin reconstruir el texto.

## Versiones y comandos

✅ Salida de `docker --version`:

```text
Docker version 29.9.2-2, build a82e528901260c8df6073311379eac65f92db204
```

✅ Salida de `docker compose version`:

```text
Docker Compose version v5.6.1
```

✅ Comandos ejecutados por el agente, en orden:

```text
docker compose up --build
curl --fail --silent --show-error http://localhost:8000/health
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code} %{content_type}\n' http://localhost:8000/docs
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code} %{content_type}\n' http://localhost:5173/
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code} %{content_type}\n' http://localhost:5173/api/metrics
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code} %{content_type}\n' http://localhost:5173/api/metrics
docker compose ps
curl -s -i http://localhost:8000/health
curl -s http://localhost:8000/api/metrics | head -c 600
curl -s http://localhost:5173/api/metrics | head -c 600
docker compose logs --tail 20 backend
docker compose logs --tail 20 frontend
docker --version
docker compose version
git status --short
```

✅ El usuario reportó estos comandos, en el orden mostrado en su terminal:

```text
docker --version
docker compose version
docker compose ps
curl -s -i http://localhost:8000/health
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:8000/docs
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:5173/
curl -s http://localhost:5173/api/metrics | head -c 400; echo
git status --short
```

✅ El usuario reportó además estos comandos, en este orden:

```text
docker images
date -u
docker history hnandrade_ai-eng-financial-dashboard-context-project-backend
docker compose ps -a
docker inspect --format '{{.Name}} estado={{.State.Status}} exit={{.State.ExitCode}} inicio={{.State.StartedAt}} fin={{.State.FinishedAt}}' hnandrade_ai-eng-financial-dashboard-context-project-backend-1 hnandrade_ai-eng-financial-dashboard-context-project-frontend-1
git status --short --ignored
```

## Puertos confirmados

✅ Compose configura frontend `5173:5173`, backend `8000:8000` y debugpy `5678:5678`. Evidencia: `docker-compose.yml:7`, `docker-compose.yml:19`, `docker-compose.yml:20`.

## Comprobaciones

| Comprobación | Comando | Resultado | Esperado (ruta completa:línea) | Ejecutó | Marca |
|---|---|---|---|---|---|
| Arranque | `docker compose up --build` | Build completado y servicios iniciados; salida en la sección Arranque. | `frontend/Dockerfile:12`, `backend/Dockerfile:12` | Agente | ✅ |
| Estado y puertos | `docker compose ps` | Ambos servicios Up; puertos 5173, 8000 y 5678 publicados. | `docker-compose.yml:7`, `docker-compose.yml:19`, `docker-compose.yml:20` | Agente | ✅ |
| Estado y puertos | `docker compose ps` | El usuario reportó ambos servicios Up y los puertos publicados. | `docker-compose.yml:7`, `docker-compose.yml:19`, `docker-compose.yml:20` | Usuario | ✅ |
| Health inicial | `curl --fail --silent --show-error http://localhost:8000/health` | `{"status":"ok"}`. | `backend/app/routes.py:243` | Agente | ✅ |
| Health con cabeceras | `curl -s -i http://localhost:8000/health` | `200 OK`, cuerpo `{"status":"ok"}`. | `backend/app/routes.py:243`, `backend/tests/test_routes.py:33` | Agente | ✅ |
| Health con cabeceras | `curl -s -i http://localhost:8000/health` | Usuario reportó `200`, `{"status":"ok"}` y fecha HTTP `Sat, 31 Oct 2026 04:48:18 GMT`. | `backend/app/routes.py:243` | Usuario | ✅ |
| Docs API | `curl --fail --silent --show-error --output /dev/null --write-out '%{http_code} %{content_type}\n' http://localhost:8000/docs` | `200 text/html; charset=utf-8`. | `README.md:50`, `backend/app/main.py:6` | Agente | ✅ |
| Docs API | `curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:8000/docs` | Usuario reportó `200 text/html`. | `README.md:50` | Usuario | ✅ |
| Página frontend | `curl --fail --silent --show-error --output /dev/null --write-out '%{http_code} %{content_type}\n' http://localhost:5173/` | `200 text/html`. | `frontend/index.html:10`, `frontend/index.html:11` | Agente | ✅ |
| Página frontend | `curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:5173/` | Usuario reportó `200 text/html`. | `frontend/index.html:10`, `frontend/index.html:11` | Usuario | ✅ |
| Métricas directas | `curl -s http://localhost:8000/api/metrics | head -c 600` | JSON en forma de arreglo; salida limitada a 600 bytes. | `frontend/src/App.tsx:16` | Agente | ✅ |
| Métricas vía proxy | `curl --fail --silent --show-error --output /dev/null --write-out '%{http_code} %{content_type}\n' http://localhost:5173/api/metrics` | `200 application/json`. | `frontend/vite.config.ts:12`, `frontend/vite.config.ts:13` | Agente | ✅ |
| Métricas vía proxy | `curl -s http://localhost:5173/api/metrics | head -c 600` | El prefijo JSON observado coincide con la respuesta directa del backend. | `frontend/vite.config.ts:12`, `frontend/vite.config.ts:13` | Agente | ✅ |
| Métricas vía proxy | `curl -s http://localhost:5173/api/metrics | head -c 400; echo` | Usuario reportó que devolvió JSON. | `frontend/src/App.tsx:16` | Usuario | ✅ |
| Logs backend | `docker compose logs --tail 20 backend` | Arranque, aviso debugpy y peticiones HTTP; salida en Logs del backend (b). | `backend/Dockerfile:12` | Agente | ✅ |
| Logs frontend | `docker compose logs --tail 20 frontend` | Vite ready y URL de red; salida en Logs del frontend. | `frontend/Dockerfile:12` | Agente | ✅ |
| Versión Docker | `docker --version` | `Docker version 29.9.2-2`. | No aplica | Usuario | ✅ |
| Versión Compose | `docker compose version` | `Docker Compose version v5.6.1`. | No aplica | Usuario | ✅ |
| Estado Git | `git status --short` | Salida vacía en la comprobación del agente. | No aplica | Agente | ✅ |
| Estado Git | `git status --short` | Usuario reportó salida vacía. | No aplica | Usuario | ✅ |
| Estado con ignorados | `git status --short --ignored` | Solo `.vscode/` y `backend/app/__pycache__/` aparecen como ignorados. | No aplica | Usuario | ✅ |

## Arranque (salida de docker compose up --build)

Salida recortada: se omiten líneas completas ajenas a las capas CACHED y al arranque. Las líneas de nombres de contenedor con `Recreated` quedaron truncadas en la notificación original y no se reconstruyen.

```text
[+] Building 2.1s (25/25) FINISHED
 => CACHED [backend 2/5] WORKDIR /app                                      0.0s
 => CACHED [backend 3/5] COPY requirements.txt ./                          0.0s
 => CACHED [backend 4/5] RUN pip install --no-cache-dir -r requirements.t  0.0s
 => CACHED [frontend 2/5] WORKDIR /app                                     0.0s
 => CACHED [frontend 3/5] COPY package*.json ./                            0.0s
 => CACHED [frontend 4/5] RUN npm install                                  0.0s
Attaching to backend-1, frontend-1
backend-1  | 0.00s - Debugger warning: It seems that frozen modules are being us
ed, which may
backend-1  | 0.00s - make the debugger miss breakpoints. Please pass -Xfrozen_mo
dules=off
backend-1  | 0.00s - to python to disable frozen modules.
backend-1  | 0.00s - Note: Debugging will proceed. Set PYDEVD_DISABLE_FILE_VALIDATION=1 to disable this validation.
frontend-1  | > frontend@0.0.0 dev
frontend-1  | > vite --host 0.0.0.0 --port 5173
backend-1   | INFO:     Will watch for changes in these directories: ['/app']
backend-1   | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
backend-1   | INFO:     Started reloader process [1] using WatchFiles
frontend-1  |   VITE v8.0.8  ready in 1201 ms
frontend-1  |   ➜  Local:   http://localhost:5173/
frontend-1  |   ➜  Network: http://172.18.0.3:5173/
backend-1   | INFO:     Started server process [20]
backend-1   | INFO:     Waiting for application startup.
backend-1   | INFO:     Application startup complete.
```

❓ El fragmento `requirements.t` de la salida disponible está truncado en la notificación de terminal; no se completa aquí.

## Logs de arranque

### (a) Arranque capturado por docker compose up --build

✅ Los mensajes de arranque de Uvicorn y Vite se reproducen en la sección «Arranque (salida de docker compose up --build)».

### (b) Salida de docker compose logs --tail 20 backend

Salida tal como fue presentada por la terminal; algunas líneas largas aparecen envueltas por la interfaz.

```text
backend-1  | 0.00s - Debugger warning: It seems that frozen modules are being us
ed, which may
backend-1  | 0.00s - make the debugger miss breakpoints. Please pass -Xfrozen_mo
dules=off
backend-1  | 0.00s - to python to disable frozen modules.
backend-1  | 0.00s - Note: Debugging will proceed. Set PYDEVD_DISABLE_FILE_VALID
ATION=1 to disable this validation.
backend-1  | 0.01s - Debugger warning: It seems that frozen modules are being us
ed, which may
backend-1  | 0.00s - make the debugger miss breakpoints. Please pass -Xfrozen_mo
dules=off
backend-1  | 0.00s - to python to disable frozen modules.
backend-1  | 0.00s - Note: Debugging will proceed. Set PYDEVD_DISABLE_FILE_VALID
ATION=1 to disable this validation.
backend-1  | INFO:     Started server process [20]
backend-1  | INFO:     Waiting for application startup.
backend-1  | INFO:     Application startup complete.
backend-1  | 172.18.0.1:37858 - "GET /health HTTP/1.1" 200 OK
backend-1  | 172.18.0.1:60704 - "GET /docs HTTP/1.1" 200 OK
backend-1  | 172.18.0.3:39720 - "GET /api/metrics HTTP/1.1" 200 OK
backend-1  | 172.18.0.1:43316 - "GET /health HTTP/1.1" 200 OK
backend-1  | 172.18.0.1:43332 - "GET /docs HTTP/1.1" 200 OK
backend-1  | 172.18.0.3:41416 - "GET /api/metrics HTTP/1.1" 200 OK
backend-1  | 172.18.0.1:54762 - "GET /health HTTP/1.1" 200 OK
backend-1  | 172.18.0.1:49778 - "GET /api/metrics HTTP/1.1" 200 OK
backend-1  | 172.18.0.3:57528 - "GET /api/metrics HTTP/1.1" 200 OK
```

## Logs del frontend

### Salida de docker compose logs --tail 20 frontend

```text
frontend-1  |
frontend-1  | > frontend@0.0.0 dev
frontend-1  | > vite --host 0.0.0.0 --port 5173
frontend-1  |
frontend-1  |
frontend-1  |   VITE v8.0.8  ready in 1201 ms
frontend-1  |
frontend-1  |   ➜  Local:   http://localhost:5173/
frontend-1  |   ➜  Network: http://172.18.0.3:5173/
```

✅ En el log backend (b), las peticiones `GET /api/metrics` provienen de `172.18.0.3`; el log de Vite anuncia `Network: http://172.18.0.3:5173/`. Esto, junto con el destino del proxy, confirma que el proxy llegó al backend desde el contenedor frontend. Evidencia de configuración: `frontend/vite.config.ts:12`, `frontend/vite.config.ts:13`; líneas observadas: Logs del backend (b) y Logs del frontend.

## Build anterior

✅ Salida de `docker images` reportada por el usuario:

```text
REPOSITORY                                                      CREATED
hnandrade_ai-eng-financial-dashboard-context-project-frontend   27 minutes ago
hnandrade_ai-eng-financial-dashboard-context-project-backend    27 minutes ago
```

✅ Salida de `date -u` reportada por el usuario:

```text
Sat Oct 31 05:11:41 UTC 2026
```

✅ Timestamps de imágenes y contenedores reportados por el usuario:

```text
[hnandrade_ai-eng-financial-dashboard-context-project-backend:latest] imagen creada: 2026-10-31T04:42:19.75480613Z
[hnandrade_ai-eng-financial-dashboard-context-project-frontend:latest] imagen creada: 2026-10-31T04:42:19.929870385Z
/hnandrade_ai-eng-financial-dashboard-context-project-backend-1 contenedor creado: 2026-10-31T04:42:21.014858305Z
/hnandrade_ai-eng-financial-dashboard-context-project-frontend-1 contenedor creado: 2026-10-31T04:42:22.226753048Z
```

✅ Salida de `docker history` reportada por el usuario. Las celdas de CREATED BY ya venían truncadas en la salida proporcionada; se conserva el texto tal como fue reportado:

```text
IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
af8d10b3791f   29 minutes ago   CMD ["python" "-m" "debugpy" "--listen" "0.0…   0B        buildkit.dockerfile.v0
<missing>      29 minutes ago   EXPOSE [5678/tcp 8000/tcp]                      0B        buildkit.dockerfile.v0
<missing>      29 minutes ago   COPY . . # buildkit                             90.1kB    buildkit.dockerfile.v0
<missing>      39 minutes ago   RUN /bin/sh -c pip install --no-cache-dir -r…   96.1MB    buildkit.dockerfile.v0
<missing>      39 minutes ago   COPY requirements.txt ./ # buildkit             12.3kB    buildkit.dockerfile.v0
<missing>      39 minutes ago   WORKDIR /app                                    8.19kB    buildkit.dockerfile.v0
<missing>      3 days ago       CMD ["python3"]                                 0B        buildkit.dockerfile.v0
```

✅ Las horas relativas de las capas de dependencias (aproximadamente 04:32 UTC según la observación) preceden en unos diez minutos a las imágenes finales creadas alrededor de 04:42 UTC. Esto prueba que hubo un build anterior; los tiempos relativos de `docker history` son aproximados.

❓ No está determinado por qué se reconstruyó la capa `COPY . .` de `backend/Dockerfile:8`.

## Salidas crudas

### docker compose ps del agente

❓ El encabezado se recibió envuelto por la interfaz de terminal; el espaciado es aproximado. No se conserva una reproducción fiable del espaciado original de Docker.

```text
NAME                                                              IMAGE
                                                  COMMAND                  SERVI
CE    CREATED          STATUS          PORTS
hnandrade_ai-eng-financial-dashboard-context-project-backend-1    hnandrade_ai-e
ng-financial-dashboard-context-project-backend    "python -m debugpy -…"   backe
nd    16 minutes ago   Up 15 minutes   0.0.0.0:5678->5678/tcp, [::]:5678->5678/t
cp, 0.0.0.0:8000->8000/tcp, [::]:8000->8000/t
cp
hnandrade_ai-eng-financial-dashboard-context-project-frontend-1   hnandrade_ai-e
ng-financial-dashboard-context-project-frontend   "docker-entrypoint.s…"   front
end   16 minutes ago   Up 15 minutes   0.0.0.0:5173->5173/tcp, [::]:5173->5173/t
cp
```

### Cabeceras y cuerpo completos de /health, agente

```text
HTTP/1.1 200 OK
date: Sat, 31 Oct 2026 04:58:27 GMT
server: uvicorn
content-length: 15
content-type: application/json
vary: Origin

{"status":"ok"}
```

### Logs de arranque

✅ Las líneas de arranque de `docker compose up --build` y las salidas de `docker compose logs --tail 20 backend` y `docker compose logs --tail 20 frontend` están reproducidas en las secciones «Arranque (salida de docker compose up --build)», «Logs de arranque» y «Logs del frontend».

## Verificación del usuario

✅ El usuario reportó `docker --version` como `Docker version 29.9.2-2` y `docker compose version` como `Docker Compose version v5.6.1`.

✅ El usuario reportó que `docker compose ps` mostró ambos servicios Up y los puertos 5173, 8000 y 5678 publicados; configuración: `docker-compose.yml:7`, `docker-compose.yml:19`, `docker-compose.yml:20`.

✅ El usuario reportó `/health` con `200`, cuerpo `{"status":"ok"}` y fecha HTTP `Sat, 31 Oct 2026 04:48:18 GMT`; ruta: `backend/app/routes.py:243`.

✅ El usuario reportó `/docs` con `200 text/html`; URL documentada: `README.md:50`.

✅ El usuario reportó frontend con `200 text/html`; URL documentada: `README.md:48`.

✅ El usuario reportó que `http://localhost:5173/api/metrics` devolvió JSON; el frontend consulta esa ruta en `frontend/src/App.tsx:16`.

✅ El usuario reportó `git status --short` vacío antes de crear este documento.

✅ El usuario reportó que `git status --short --ignored` mostró solo estas rutas ignoradas y ningún otro cambio:

```text
!! .vscode/
!! backend/app/__pycache__/
```

✅ El usuario reportó la salida de `docker images`, `date -u`, timestamps de imágenes y contenedores y `docker history` reproducida en «Build anterior».

✅ El usuario reportó las salidas de `docker compose ps -a` y `docker inspect` reproducidas en «Estado de los servicios al cerrar el Paso 0».

## Estado de los servicios al cerrar el Paso 0

✅ La salida final de la terminal del agente mostró estas líneas de cierre, en este orden:

```text
frontend-1 exited with code 143
backend-1   | INFO:     Shutting down
backend-1   | INFO:     Waiting for application shutdown.
backend-1   | INFO:     Application shutdown complete.
backend-1   | INFO:     Finished server process [20]
backend-1   | INFO:     Stopping reloader process [1]
backend-1 exited with code 0
```

✅ Salida de `docker compose ps -a` reportada por el usuario después del cierre:

```text
NAME                                                              IMAGE                                      COMMAND                  SERVICE    CREATED          STATUS                       PORTS
hnandrade_ai-eng-financial-dashboard-context-project-backend-1    hnandrade_ai-eng-financial-dashboard-context-project-backend    "python -m debugpy -…"   backend    32 minutes ago   Exited (0) 5 minutes ago
hnandrade_ai-eng-financial-dashboard-context-project-frontend-1   hnandrade_ai-eng-financial-dashboard-context-project-frontend   "docker-entrypoint.s…"   frontend   32 minutes ago   Exited (143) 5 minutes ago
```

✅ Salida de `docker inspect` reportada por el usuario:

```text
/hnandrade_ai-eng-financial-dashboard-context-project-backend-1 estado=exited exit=0 inicio=2026-10-31T04:42:22.588388338Z fin=2026-10-31T05:09:33.693484818Z
/hnandrade_ai-eng-financial-dashboard-context-project-frontend-1 estado=exited exit=143 inicio=2026-10-31T04:42:22.84445187Z fin=2026-10-31T05:09:32.625053923Z
```

✅ Ambos contenedores terminaron: frontend con código 143 y backend con código 0, según `docker inspect` reportado arriba.

✅ Los contenedores estuvieron ejecutándose unos 27 minutos, desde aproximadamente 04:42:22 hasta 05:09:33 UTC.

✅ El frontend terminó aproximadamente 1,07 segundos antes que el backend.

✅ Las comprobaciones del usuario (04:48:18 GMT) y del agente (04:58:27 GMT) ocurrieron dentro de ese intervalo.

✅ `143 = 128 + 15` corresponde a la convención Unix para `SIGTERM`; esta explicación es una convención del sistema, no evidencia del repo.

❓ Las salidas no determinan quién o qué detuvo los servicios.

✅ La salida de `git status --short --ignored` reportó solo `.vscode/` y `backend/app/__pycache__/` como ignorados y ningún otro cambio.

❓ Que `backend/app/__pycache__/` fuera escrito por el contenedor mediante el montaje `./backend:/app` es una hipótesis; el montaje está configurado en `docker-compose.yml:22`.

❓ Que ese directorio causara la reconstrucción de `COPY . .` en `backend/Dockerfile:8` es otra hipótesis.

## Errores y advertencias

✅ No se observó un error de las comprobaciones HTTP.

✅ debugpy advirtió sobre frozen modules y posibles breakpoints, y su salida indicó `Debugging will proceed`. El comando configurado está en `backend/Dockerfile:12`.

## Capturas

✅ `docs/evidence/backend.png` existe (507575 bytes, 05:39) y `docs/evidence/frontend.png` existe (437370 bytes, 05:39); la salida está en «Estado a las 05:47 UTC y capturas».

❓ El usuario declara que `docs/evidence/backend.png` muestra `/docs` en el puerto 8000 y que `docs/evidence/frontend.png` muestra la página frontend en el puerto 5173. No abrí las imágenes.

❓ El usuario declara que ambas capturas se tomaron con los servicios en ejecución; no se ha registrado cómo ni cuándo se reiniciaron.

## Nota para Codespaces

❓ Los puertos se abren desde la pestaña Ports de Codespaces; no se verificó la interfaz.

✅ `docker-compose.yml:20` publica el puerto 5678 y `backend/Dockerfile:12` ejecuta debugpy escuchando en `0.0.0.0:5678`, sin opción de autenticación en ese comando. El puerto 5678 debe permanecer privado.

## Detener los servicios

✅ El usuario reportó ejecutar `docker compose ps -a`, `docker compose down` y `docker compose ps -a`, en ese orden, después de las comprobaciones de las 05:47:00 UTC por el orden de su terminal. La salida de esa secuencia está en esta sección.

✅ Salida literal U1: el usuario ejecutó `docker compose down` y después `docker compose ps -a`.

```text
[+] down 3/3
 ✔ Container hnandrade_ai-eng-financial-dashboard-context-project-frontend-1 Removed    0.2s
 ✔ Container hnandrade_ai-eng-financial-dashboard-context-project-backend-1  Removed    1.1s
 ✔ Network hnandrade_ai-eng-financial-dashboard-context-project_default      Removed    0.1s
NAME      IMAGE     COMMAND   SERVICE   CREATED   STATUS    PORTS
```

✅ Salida literal de la secuencia posterior a las comprobaciones de las 05:47:00 UTC:

```text
NAME      IMAGE     COMMAND   SERVICE   CREATED   STATUS    PORTS
NAME      IMAGE     COMMAND   SERVICE   CREATED   STATUS    PORTS
```

Las dos líneas son los dos `docker compose ps -a`; `docker compose down` no imprimió nada entre ellas.

✅ (de U1) `docker compose down` imprimió `Removed` para los dos contenedores y la red; el `docker compose ps -a` siguiente no listó contenedores.

✅ (por el orden de la terminal) U1 ocurrió antes de las comprobaciones de las 05:47:00 UTC.

❓ La hora exacta de U1 y si ocurrió después de las capturas (05:39) no está registrado.

❓ La salida de U1 no tiene líneas `Stopped`; si los contenedores estaban en ejecución cuando se ejecutó no queda determinado.

✅ En la secuencia posterior, las dos salidas de `docker compose ps -a` solo contienen el encabezado y `docker compose down` no imprimió ninguna línea. Es coherente con que no hubiera contenedores del proyecto que eliminar.

❓ El efecto de `docker compose down` sobre contenedores en ejecución no se probó.

❓ Instrucción de limpieza: desde la raíz del repo, en cualquier terminal, ejecutar:

```bash
docker compose down
```

## Estado a las 05:47 UTC y capturas

✅ Salida reportada de `date -u`:

```text
Sat Oct 31 05:47:00 UTC 2026
```

✅ Salida literal reportada de `ls -la docs/evidence`:

```text
total 932
drwxrwxrwx+ 2 codespace codespace   4096 Oct 31 05:44 .
drwxrwxrwx+ 3 codespace codespace   4096 Oct 31 05:44 ..
-rw-rw-rw-  1 codespace codespace 507575 Oct 31 05:39 backend.png
-rw-rw-rw-  1 codespace codespace 437370 Oct 31 05:39 frontend.png
```

✅ Salida reportada de `docker compose ps` a las 05:47 UTC:

```text
NAME      IMAGE     COMMAND   SERVICE   CREATED   STATUS    PORTS
```

✅ Salidas reportadas por el usuario:

```text
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/ -> 000
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/docs -> 000
```

❓ No está registrado cómo ni cuándo se reiniciaron los servicios para tomar las capturas.

❓ Declaración del usuario: `docs/evidence/backend.png` muestra la documentación de la API (`/docs`, puerto 8000) y `docs/evidence/frontend.png` muestra la página frontend (puerto 5173), ambas tomadas con los servicios en ejecución. No abrí las imágenes.

## Estado al cerrar el Paso 0

✅ Este archivo y las dos capturas existen; la salida de `ls -la docs/evidence` está en «Estado a las 05:47 UTC y capturas».

✅ A las 05:47:00 UTC, `docker compose ps` no listó contenedores y ambas comprobaciones HTTP devolvieron `000`; salidas en «Estado a las 05:47 UTC y capturas».

✅ Los contenedores y la red del proyecto fueron eliminados por un `docker compose down` del usuario (U1; salida en «Detener los servicios»).

❓ Quién ejecutó el build anterior no se verificó independientemente; la declaración del usuario está en «Responsable y estado».

❓ El motivo de la detención original no está determinado por las salidas disponibles.

❓ Cuándo exactamente se ejecutó U1 y si los contenedores estaban en ejecución.

❓ Cómo y cuándo se reiniciaron los servicios para las capturas no está registrado; ver «Estado a las 05:47 UTC y capturas».

❓ El efecto de `docker compose down` sobre contenedores en ejecución no se probó; ver «Detener los servicios».

❓ El contenido de las capturas no se verificó abriendo las imágenes; declaración del usuario en «Capturas».
