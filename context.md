# Stack técnico y arranque

## Stack técnico

### Backend
- **Lenguaje:** Python; la imagen Docker usa `python:3.13-slim` ([`backend/Dockerfile`](backend/Dockerfile)).
- **Framework API:** FastAPI (declarado en [`backend/requirements.txt`](backend/requirements.txt) y usado en [`backend/app/main.py`](backend/app/main.py)).
- **Servidor ASGI:** Uvicorn (`uvicorn[standard]`, declarado en [`backend/requirements.txt`](backend/requirements.txt) y ejecutado en [`backend/Dockerfile`](backend/Dockerfile)).
- **Depuración:** Debugpy, expuesto en el puerto `5678` y configurado en [`backend/Dockerfile`](backend/Dockerfile).
- **Dependencias declaradas:** `fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov` y `httpx` ([`backend/requirements.txt`](backend/requirements.txt)). No se fijan versiones en ese archivo.

### Frontend
- **Lenguajes:** TypeScript y JavaScript, con JSX/TSX (archivos de aplicación en [`frontend/src/`](frontend/src/) y configuración TypeScript en [`frontend/tsconfig.app.json`](frontend/tsconfig.app.json)).
- **Framework UI:** React y React DOM `^19.2.4` ([`frontend/package.json`](frontend/package.json), utilizados desde [`frontend/src/main.tsx`](frontend/src/main.tsx)).
- **Herramienta de desarrollo y build:** Vite `^8.0.4` ([`frontend/package.json`](frontend/package.json), configuración en [`frontend/vite.config.ts`](frontend/vite.config.ts)).
- **Pruebas:** Vitest `^4.1.4` ([`frontend/package.json`](frontend/package.json), pruebas en [`frontend/src/lib/financial-utils.test.ts`](frontend/src/lib/financial-utils.test.ts)).
- **Gráficos e iconos:** Recharts y `lucide-react` ([`frontend/package.json`](frontend/package.json); ejemplos de uso en [`frontend/src/components/dashboard/income-outcome-chart.tsx`](frontend/src/components/dashboard/income-outcome-chart.tsx) y [`frontend/src/components/dashboard/dashboard-header.tsx`](frontend/src/components/dashboard/dashboard-header.tsx)).
- **Estilos:** Tailwind CSS `^4.2.2` y `@tailwindcss/vite` ([`frontend/package.json`](frontend/package.json), configuración de Vite en [`frontend/vite.config.ts`](frontend/vite.config.ts), estilos en [`frontend/src/index.css`](frontend/src/index.css)).
- **Otras dependencias declaradas:** TypeScript `~6.0.2`, ESLint, `clsx` y `tailwind-merge` ([`frontend/package.json`](frontend/package.json)).

### Contenedores y conexión local
- Docker Compose orquesta `frontend` y `backend` ([`docker-compose.yml`](docker-compose.yml)).
- El frontend publica el puerto `5173`; el backend publica `8000` y `5678`.
- Vite reenvía las solicitudes `/api` a `http://host.docker.internal:8000`, accediendo al puerto `8000` publicado por el backend. Compose configura el alias mediante `extra_hosts: host.docker.internal:host-gateway` ([`frontend/vite.config.ts`](frontend/vite.config.ts), [`docker-compose.yml`](docker-compose.yml)).
- Esta ruta es una alternativa al fallo observado de comunicación directa entre contenedores, no un requisito general de Docker. Para ejecutar Vite fuera de Docker, consulta las opciones de proxy y `VITE_API_BASE_URL` en el [README en español](README.es.md).

## Scripts para arrancar y ejecutar

### Arranque local recomendado

El README documenta este comando desde la raíz del repositorio:

```bash
docker compose up --build
```

Una vez iniciado:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Documentación de la API: `http://localhost:8000/docs`

### Comandos configurados en los contenedores

- **Backend** (`backend/Dockerfile`):

  ```bash
  python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  ```

- **Frontend** (`frontend/Dockerfile`):

  ```bash
  npm run dev -- --host 0.0.0.0 --port 5173
  ```

### Scripts npm disponibles

Declarados en `frontend/package.json`:

```bash
npm run dev          # servidor de desarrollo
npm run build        # comprobación TypeScript y build de Vite
npm run preview      # previsualización del build
npm run lint         # ESLint
npm run test         # pruebas Vitest
npm run test:watch   # Vitest en modo interactivo
npm run test:coverage # pruebas con cobertura
```
