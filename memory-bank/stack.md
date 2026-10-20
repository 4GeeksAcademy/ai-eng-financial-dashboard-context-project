# Stack

- Frontend: React `^19.2.4`, React DOM `^19.2.4`, TypeScript `~6.0.2` y Vite `^8.0.4`. Fuente: `frontend/package.json`.
- Interfaz y gráficos: Tailwind CSS `^4.2.2`, plugin Vite de Tailwind `^4.2.2` y Recharts `^3.8.1`. Fuente: `frontend/package.json`.
- Pruebas y calidad del frontend: Vitest `^4.1.4` y ESLint `^9.39.4`; los scripts disponibles son `test`, `test:watch`, `test:coverage`, `lint` y `build`. Fuente: `frontend/package.json`.
- Backend: las dependencias declaradas son FastAPI, Uvicorn con extras `standard`, debugpy, pytest, pytest-cov y httpx; `requirements.txt` no fija versiones. Fuente: `backend/requirements.txt`.
- Imagen del backend: `python:3.13-slim`; instala `backend/requirements.txt` y arranca Uvicorn mediante debugpy en el puerto 8000. Fuente: `backend/Dockerfile`.
- Imagen del frontend: `node:24-alpine`; instala dependencias npm y ejecuta Vite en el puerto 5173. Fuente: `frontend/Dockerfile`.
- Compose publica los puertos 5173 para frontend y 8000 y 5678 para backend. Fuente: `docker-compose.yml`.