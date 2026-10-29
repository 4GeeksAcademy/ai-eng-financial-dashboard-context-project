# Tech Context

## Backend

- Lenguaje/runtime: Python 3.13 (`backend/Dockerfile`).
- Framework y servidor: FastAPI y Uvicorn (`backend/requirements.txt`, `backend/Dockerfile`).
- Validación de datos: Pydantic, modelos y tipos `Literal` (`backend/app/routes.py`).
- Dependencias de desarrollo/pruebas: debugpy, pytest, pytest-cov y httpx (`backend/requirements.txt`).

## Frontend

- Lenguajes/frameworks: TypeScript, React 19 y Vite 8 (`frontend/package.json`).
- UI/gráficos: Tailwind CSS, Recharts y lucide-react (`frontend/package.json`).
- Calidad/pruebas: ESLint y Vitest (`frontend/package.json`).

## Ejecución local

- Docker Compose define frontend en el puerto 5173 y backend en 8000; también expone debugpy en 5678 (`docker-compose.yml`).
- Vite reenvía `/api` a `http://backend:8000` (`frontend/vite.config.ts`).
- El README documenta `docker compose up --build` y las URLs de desarrollo (`README.es.md`).
