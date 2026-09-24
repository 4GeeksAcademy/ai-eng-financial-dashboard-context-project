# Regla: respetar los servicios y puertos declarados

## Regla propuesta
El agent solo debe arrancar, documentar o añadir servicios que estén respaldados por `docker-compose.yml`, Dockerfiles, scripts o README. No debe asumir una base de datos, Redis, colas u otro servicio que no esté declarado.

## Evidencia del repositorio

`docker-compose.yml` declara únicamente:

- `frontend`, con `5173:5173`.
- `backend`, con `8000:8000` y `5678:5678`.

`frontend/Dockerfile` ejecuta Vite en el puerto `5173`.

`backend/Dockerfile` ejecuta Uvicorn en el puerto `8000` y `debugpy` en `5678`.

## Aplicación

- Usar `docker compose up --build` como flujo documentado.
- Confirmar puertos desde Compose antes de proporcionar URLs.
- Tratar `5678` como puerto de depuración, no como endpoint HTTP.
- No crear archivos de infraestructura para servicios no solicitados y no respaldados.
