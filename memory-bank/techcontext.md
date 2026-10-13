# Contexto técnico

## Stack

- **Front-end:** React, TypeScript y Vite; Recharts para los gráficos. Dependencias y scripts: [frontend/package.json](../frontend/package.json). Configuración de Vite: [frontend/vite.config.ts](../frontend/vite.config.ts).
- **Back-end:** Python y FastAPI; los endpoints usan modelos Pydantic. Uvicorn está incluido entre las dependencias. Referencias: [backend/requirements.txt](../backend/requirements.txt), [backend/app/main.py](../backend/app/main.py), [backend/app/routes.py](../backend/app/routes.py).
- **Entorno de desarrollo:** Docker Compose configura los servicios `frontend` y `backend`. Referencia: [docker-compose.yml](../docker-compose.yml).

## Estructura relevante

- `frontend/src/App.tsx`: pantalla principal, solicitud de datos y estados de carga y error.
- `frontend/src/components/dashboard/`: componentes de KPI y gráficos.
- `frontend/src/lib/`: tipos y cálculos financieros. Referencias: [frontend/src/lib/financial-types.ts](../frontend/src/lib/financial-types.ts), [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts).
- `backend/app/main.py`: crea la aplicación FastAPI e incluye el router.
- `backend/app/routes.py`: modelos, generación de datos de ejemplo y endpoints.
- Pruebas: [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts) y [backend/tests/test_routes.py](../backend/tests/test_routes.py).

## Comunicación entre front-end y back-end

La pantalla solicita `GET /api/metrics` y calcula los KPI y los datos mensuales en el front-end. Anteponer un origen explícito requiere definir `VITE_API_BASE_URL` en `frontend/.env` con la URL del backend accesible desde el navegador, sin `/api` ni barra final. En Codespaces, usa la URL pública del puerto 8000. Vite necesita reiniciarse tras cambiar el archivo; una compilación necesita regenerarse. Las variables `VITE_*` son públicas y no deben contener secretos.

Si la variable está vacía o ausente, la solicitud es relativa. En el modo predeterminado de Compose, Vite reenvía las solicitudes que empiezan por `/api` a `http://backend:8000`, sin exigir una URL explícita. El hostname `backend` corresponde a la red interna de Compose; no es la URL que debe usar directamente el navegador. Antes de verificar la conexión, confirma el modo de ejecución y la configuración necesaria según [AGENTS.md](../AGENTS.md).

El modelo de movimiento incluye fecha, importe, tipo de operación, categoría y tipo de negocio. Referencias: [frontend/src/App.tsx](../frontend/src/App.tsx), [frontend/vite.config.ts](../frontend/vite.config.ts), [backend/app/routes.py](../backend/app/routes.py).

## Puertos y comandos

Compose publica el front-end en `5173`, la API en `8000` y el puerto de depuración del backend en `5678`.

Desde la raíz del repositorio, iniciar los servicios:

```bash
docker compose up --build
```

Con los servicios en marcha, las verificaciones documentadas son:

```bash
docker compose exec backend pytest -q
docker compose exec frontend npm test
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
```

Las verificaciones y los puertos están documentados en [AGENTS.md](../AGENTS.md); los scripts de front-end se definen en [frontend/package.json](../frontend/package.json).