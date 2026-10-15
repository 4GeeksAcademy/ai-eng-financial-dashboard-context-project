# Tecnologías y estructura

## Frontend

- React y React DOM 19, TypeScript y Vite 8; las versiones declaradas y scripts están en [frontend/package.json](../frontend/package.json).
- Tailwind CSS mediante `@tailwindcss/vite`; Recharts para los gráficos y Lucide React para iconos.
- Entrada de aplicación: [frontend/src/main.tsx](../frontend/src/main.tsx), que importa `App.tsx` y `index.css` y monta React.
- Datos y cálculos: [frontend/src/App.tsx](../frontend/src/App.tsx) solicita `/api/metrics`; [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts) calcula KPI, series mensuales y rótulo del periodo.
- Pruebas: Vitest. Los comandos `test`, `build` y `lint` están declarados en `frontend/package.json`.

## Backend

- Python con FastAPI y Pydantic; Uvicorn sirve la aplicación. `debugpy` se usa en el comando de desarrollo del contenedor.
- Entrada ASGI: `app.main:app` en [backend/app/main.py](../backend/app/main.py); las rutas, modelos y datos simulados están en [backend/app/routes.py](../backend/app/routes.py).
- Dependencias declaradas en [backend/requirements.txt](../backend/requirements.txt); no tienen versiones fijadas.
- Pruebas: Pytest y `TestClient` en `backend/tests`.

## Skills de agente

- [.agents/skills](../.agents/skills): comunitarias, gestionadas con `npx skills` y [skills-lock.json](../skills-lock.json); [.skills](../.skills): internas del repo, como [dashboard-pre-merge-check](../.skills/dashboard-pre-merge-check/SKILL.md). Procedencia y uso registrados en los commits de `feature/agent-skills` y [progress.md](progress.md).

## Desarrollo local

[docker-compose.yml](../docker-compose.yml) define los servicios `frontend` y `backend`. El backend publica el puerto 8000 y el frontend el 5173. El proxy Vite usa `host.docker.internal:8000`; Compose declara `host.docker.internal:host-gateway` para ese nombre. Esta ruta se añadió para resolver el timeout de conexión entre IPs de contenedores observado en este entorno.