# Stack tecnológico

## Frontend

- React y React DOM: declarados en `frontend/package.json`.
- TypeScript: declarado en `frontend/package.json`.
- Vite: servidor y build del frontend.
- Tailwind CSS: integrado mediante `@tailwindcss/vite`.
- Recharts: visualización de gráficos.
- Lucide React: iconos.
- Vitest: pruebas frontend.
- ESLint: linting frontend.

## Backend

- Python 3.13: imagen base de `backend/Dockerfile`.
- FastAPI: aplicación creada en `backend/app/main.py`.
- Uvicorn: servidor ASGI definido en `backend/Dockerfile`.
- debugpy: depuración en el puerto `5678`.
- pytest y pytest-cov: pruebas declaradas en `backend/requirements.txt`.
- HTTPX: cliente de pruebas declarado en `backend/requirements.txt`.

## Contenedores y servicios

`docker-compose.yml` declara únicamente:

- `frontend`, con `5173:5173`.
- `backend`, con `8000:8000`.
- `5678:5678` para debugpy del backend.

No hay una base de datos, Redis, cola o almacenamiento externo declarado en Compose.

## Proxy y ejecución documentada

- En Docker Compose, `frontend/vite.config.ts` redirige `/api` hacia `http://backend:8000`. Si Vite se ejecuta directamente en el host, este destino no queda verificado y puede requerir una configuración distinta.
- `frontend/src/App.tsx` consume `/api/metrics`.
- `README.md` y `README.es.md` documentan `docker compose up --build`.
- Las URLs documentadas son `http://localhost:5173`, `http://localhost:8000` y `http://localhost:8000/docs`.
- `App.tsx` admite la variable `VITE_API_BASE_URL`; no se encontró `frontend/.env.example` en el repositorio revisado.

## Fuentes de evidencia

- `frontend/package.json`
- `frontend/vite.config.ts`
- `backend/requirements.txt`
- `frontend/Dockerfile`
- `backend/Dockerfile`
- `docker-compose.yml`
- `README.md`
- `README.es.md`
- `.agents/rules/02-compose-services.md`
- `.agents/rules/04-api-proxy-contract.md`
