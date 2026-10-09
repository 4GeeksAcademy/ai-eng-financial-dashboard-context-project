# Regla: docker-env

**Alcance:** `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/vite.config.ts`, `frontend/.env.example`.
**Justificación:** F22-F26. El entorno de desarrollo se levanta con Docker Compose y tiene varios ajustes solo válidos en desarrollo.

## Qué hacer

- Arranque: `docker compose up --build`. Frontend en `http://localhost:5173`, backend en `http://localhost:8000`, documentación en `/docs`, comprobación en `/health`.
- El código se recarga solo (volúmenes `./backend:/app` y `./frontend:/app`). Un cambio en `backend/requirements.txt` o `frontend/package.json` exige `docker compose up --build`, porque las dependencias se instalan al construir la imagen (`backend/Dockerfile`, `frontend/Dockerfile:6`). Si las dependencias nuevas del frontend no aparecen, añade `-V` para renovar el volumen anónimo de `/app/node_modules` (`docker-compose.yml:10`).
- El frontend llega al backend por el proxy de Vite hacia `http://backend:8000` (`vite.config.ts:13`): solo funciona dentro de Compose. Para apuntar a otro backend, define `VITE_API_BASE_URL` en `frontend/.env`.
- Al cambiar `package.json`, sube también `frontend/package-lock.json`.

## Qué no hacer

- No copies a producción `debugpy` en `0.0.0.0:5678`, `--reload` ni el CORS con `*` (`backend/Dockerfile:12`, `docker-compose.yml:20`, `main.py:9-10`): son solo para desarrollo.
- No subas archivos `.env`: el `.gitignore` de la raíz los excluye (`.gitignore:11`, comprobado con `git check-ignore -v frontend/.env`), salvo `.env.example`.

## Cómo comprobarlo

`curl http://localhost:8000/health` debe responder `{"status":"ok"}`.

## No verificado en este entorno

No había Docker ni red para ejecutarlo. Sin ejecutar: `docker compose up --build`, `docker compose exec backend pytest` y el uso de `-V` para renovar `node_modules`. Verifícalo la primera vez que lo uses y corrige esta regla si algo difiere.
