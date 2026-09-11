# Arquitectura verificada del proyecto

Este documento registra la estructura y el flujo comprobados directamente en los archivos del repositorio. No describe componentes o conexiones que no estén presentes en la configuración o el código revisado.

## Estructura

El repositorio está organizado en dos aplicaciones y una configuración de orquestación:

- `backend/` contiene la aplicación FastAPI, sus dependencias, el Dockerfile y los tests. Evidencia: [backend/app/main.py](backend/app/main.py), [backend/app/routes.py](backend/app/routes.py), [backend/requirements.txt](backend/requirements.txt), [backend/Dockerfile](backend/Dockerfile) y [backend/tests/test_routes.py](backend/tests/test_routes.py).
- `frontend/` contiene la aplicación React/TypeScript, la configuración de Vite, el Dockerfile, los componentes del dashboard y las utilidades de datos. Evidencia: [frontend/package.json](frontend/package.json), [frontend/vite.config.ts](frontend/vite.config.ts), [frontend/Dockerfile](frontend/Dockerfile), [frontend/src/main.tsx](frontend/src/main.tsx) y [frontend/src/App.tsx](frontend/src/App.tsx).
- [docker-compose.yml](docker-compose.yml) declara los servicios `frontend` y `backend`, sus builds, volúmenes, puertos y dependencia de Compose.

El README describe el proyecto como un dashboard financiero con frontend React + TypeScript y backend FastAPI. Evidencia: [README.es.md](README.es.md) y [README.md](README.md).

No se observa una base de datos, un volumen de datos o una dependencia de persistencia declarados en los archivos de configuración revisados. El backend genera movimientos mock en memoria en [backend/app/routes.py](backend/app/routes.py); esto no permite afirmar que no pueda existir una dependencia externa fuera de estos archivos.

## Servicios

### Frontend

El servicio `frontend` está declarado en [docker-compose.yml](docker-compose.yml):

- Construye desde `./frontend` usando `Dockerfile`.
- Monta `./frontend` en `/app`.
- Mantiene un volumen anónimo en `/app/node_modules`.
- Declara `depends_on: backend`.
- Publica `5173:5173`.

Su imagen usa Node 24 Alpine, establece `/app` como directorio de trabajo, instala las dependencias de `package.json` y ejecuta `npm run dev -- --host 0.0.0.0 --port 5173`. Evidencia: [frontend/Dockerfile](frontend/Dockerfile) y [frontend/package.json](frontend/package.json).

La dependencia `depends_on` demuestra la relación declarada por Compose, pero no contiene un healthcheck ni demuestra que el backend esté listo para aceptar peticiones cuando se inicia el frontend. Evidencia: [docker-compose.yml](docker-compose.yml).

### Backend

El servicio `backend` está declarado en [docker-compose.yml](docker-compose.yml):

- Construye desde `./backend` usando `Dockerfile`.
- Monta `./backend` en `/app`.
- Publica `8000:8000` y `5678:5678`.

Su imagen usa Python 3.13 slim, instala [backend/requirements.txt](backend/requirements.txt), expone ambos puertos y ejecuta `debugpy` junto con Uvicorn. Evidencia: [backend/Dockerfile](backend/Dockerfile).

## Entry points

### Backend

El proceso de servidor usa `app.main:app` como aplicación ASGI. El comando está definido en [backend/Dockerfile](backend/Dockerfile). El objeto `app` se crea en [backend/app/main.py](backend/app/main.py), donde también se configura FastAPI, CORS y el router de [backend/app/routes.py](backend/app/routes.py).

El comando completo del contenedor es:

```text
python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Por tanto, `5678` está configurado para la escucha de `debugpy` y `8000` para Uvicorn. La publicación de esos puertos también está en [docker-compose.yml](docker-compose.yml).

### Frontend

El entry point HTML es [frontend/index.html](frontend/index.html). Define el elemento `root` y carga `/src/main.tsx`.

El entry point React es [frontend/src/main.tsx](frontend/src/main.tsx). Importa `App`, importa el CSS global y monta `App` con `createRoot` dentro de `StrictMode`.

El contenedor frontend ejecuta el script `dev` de [frontend/package.json](frontend/package.json) mediante el comando de [frontend/Dockerfile](frontend/Dockerfile). El script `dev` es `vite`.

## Endpoints del backend

Las rutas están registradas mediante el router incluido en [backend/app/main.py](backend/app/main.py) y se implementan en [backend/app/routes.py](backend/app/routes.py):

| Método | Ruta | Función observada |
| --- | --- | --- |
| `GET` | `/health` | Devuelve `{"status": "ok"}`. |
| `GET` | `/api/metrics` | Devuelve movimientos y permite filtrar por fechas, categoría y tipo de operación. |
| `GET` | `/api/metrics/facets` | Devuelve opciones de filtros y rango de fechas. |
| `GET` | `/api/metrics/summary` | Agrupa ingresos, gastos y neto por día, semana o mes, con filtros disponibles. |
| `GET` | `/api/metrics/categories/top` | Devuelve categorías principales según tipo de operación y límite. |
| `GET` | `/api/metrics/comparison` | Compara el valor neto de un periodo con el periodo anterior equivalente. Requiere `start_date` y `end_date`. |
| `GET` | `/api/metrics/alerts` | Detecta aumentos de gastos respecto al promedio histórico agrupado. |
| `GET` | `/api/metrics/b2b` | Devuelve movimientos filtrados para `business_type == "B2B"`. |
| `GET` | `/api/metrics/b2c` | Devuelve movimientos filtrados para `business_type == "B2C"`. |

La existencia y el comportamiento básico de estas rutas también están cubiertos por [backend/tests/test_routes.py](backend/tests/test_routes.py).

## Comunicación frontend-backend

En [frontend/src/App.tsx](frontend/src/App.tsx), la aplicación solicita únicamente `${API_BASE_URL}/api/metrics`, donde `API_BASE_URL` toma `import.meta.env.VITE_API_BASE_URL` o una cadena vacía.

En [frontend/vite.config.ts](frontend/vite.config.ts), Vite configura un proxy para las rutas que comienzan por `/api` hacia `http://backend:8000`. El nombre `backend` coincide con el nombre del servicio definido en [docker-compose.yml](docker-compose.yml).

El flujo efectivo es:

1. [frontend/index.html](frontend/index.html) carga `/src/main.tsx`.
2. [frontend/src/main.tsx](frontend/src/main.tsx) monta [frontend/src/App.tsx](frontend/src/App.tsx).
3. `App` solicita `/api/metrics` mediante `fetch`.
4. Vite reenvía esa ruta a `http://backend:8000` según [frontend/vite.config.ts](frontend/vite.config.ts).
5. FastAPI recibe la solicitud en la ruta correspondiente de [backend/app/routes.py](backend/app/routes.py).
6. El backend crea movimientos mock con `generate_mock_movements(seed=42)`, los filtra y devuelve la respuesta.
7. El frontend calcula los KPIs y los datos mensuales mediante [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts).
8. `App` pasa los resultados a los componentes del dashboard: [frontend/src/components/dashboard/kpi-row.tsx](frontend/src/components/dashboard/kpi-row.tsx), [frontend/src/components/dashboard/income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx) y [frontend/src/components/dashboard/profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx).

Las rutas avanzadas del backend existen, pero el código actual de `App` no demuestra que el frontend consuma `/api/metrics/facets`, `/summary`, `/categories/top`, `/comparison`, `/alerts`, `/b2b` o `/b2c`.

## Ejecución documentada

El README documenta `docker compose up --build` como forma de ejecución local. Evidencia: [README.es.md](README.es.md) y [README.md](README.md).

El README documenta las URLs `http://localhost:5173` para el frontend, `http://localhost:8000` para el backend y `http://localhost:8000/docs` para la documentación de FastAPI. Los mapeos de puertos `5173:5173`, `8000:8000` y `5678:5678` están definidos en [docker-compose.yml](docker-compose.yml); los puertos internos de los procesos están definidos en [frontend/Dockerfile](frontend/Dockerfile) y [backend/Dockerfile](backend/Dockerfile). La aplicación FastAPI que proporciona `/docs` se crea en [backend/app/main.py](backend/app/main.py). Evidencia documental: [README.es.md](README.es.md) y [README.md](README.md).

El texto visible `2024 - Full Year` en [frontend/src/App.tsx](frontend/src/App.tsx) es un valor fijo de la interfaz. No demuestra que los datos correspondan al año 2024: las fechas de los movimientos dependen de `date.today()` y de `_year_for_month()` en [backend/app/routes.py](backend/app/routes.py).