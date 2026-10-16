# Resumen del proyecto

## Descripción general

Este repositorio contiene un dashboard financiero compuesto por un frontend y un backend separados.

La aplicación muestra un resumen de movimientos financieros mediante indicadores y gráficos. Entre los datos visibles se encuentran los ingresos totales, los egresos totales, la ganancia y el margen de ganancia.

El frontend obtiene la información desde una API REST desarrollada en el backend.

## Estructura principal

- `frontend/`: aplicación web del dashboard.
- `backend/`: API que genera y procesa los movimientos financieros.
- `docker-compose.yml`: permite ejecutar ambos servicios con Docker.
- `AGENTS.md`: contiene información general para asistentes de IA.
- `README.md` y `README.es.md`: documentación inicial del repositorio.

## Frontend

El frontend utiliza:

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Vitest
- ESLint

El punto de entrada es `frontend/src/main.tsx`, donde se renderiza el componente principal `App`.

El archivo `frontend/src/App.tsx`:

- Solicita los movimientos financieros al endpoint `/api/metrics`.
- Calcula los indicadores mediante `computeKPIs`.
- Prepara los datos mensuales mediante `computeMonthlyData`.
- Renderiza las tarjetas de indicadores y los gráficos.
- Maneja los estados de carga y error.

Los componentes del dashboard se encuentran en:

- `frontend/src/components/dashboard`
- `frontend/src/components/ui`

## Backend

El backend utiliza:

- Python
- FastAPI
- Uvicorn
- Pydantic
- Pytest
- HTTPX

El punto de entrada es `backend/app/main.py`.

Este archivo:

- Crea la aplicación FastAPI.
- Configura CORS.
- Registra las rutas definidas en `backend/app/routes.py`.

El backend genera movimientos financieros simulados. No utiliza una base de datos.

La función `generate_mock_movements` crea datos de ingresos y egresos y utiliza una semilla fija en los endpoints para producir resultados repetibles.

## Endpoints principales

- `GET /health`: comprueba el estado de la API.
- `GET /api/metrics`: devuelve los movimientos financieros.
- `GET /api/metrics/facets`: devuelve valores disponibles para filtros.
- `GET /api/metrics/summary`: agrupa y resume movimientos.
- `GET /api/metrics/categories/top`: devuelve las categorías principales.
- `GET /api/metrics/comparison`: compara dos períodos.
- `GET /api/metrics/alerts`: detecta aumentos importantes en los egresos.
- `GET /api/metrics/b2b`: devuelve movimientos B2B.
- `GET /api/metrics/b2c`: devuelve movimientos B2C.

## Ejecución y comunicación entre servicios

El proyecto se ejecuta mediante Docker Compose.

Servicios verificados:

- Frontend: puerto `5173`.
- Backend: puerto `8000`.
- Documentación de la API: `/docs`.
- Puerto de depuración del backend: `5678`.

El frontend usa la variable `VITE_API_BASE_URL`. Cuando no está definida, realiza las solicitudes utilizando una ruta relativa.

## Estado validado

Se comprobó directamente que:

- Las imágenes de Docker se construyen correctamente.
- El frontend inicia y muestra el dashboard.
- El backend inicia correctamente con Uvicorn.
- La documentación automática de FastAPI está disponible.
- El frontend obtiene los datos desde el backend.
- Los datos actuales son simulados y no persisten en una base de datos.

## Archivos revisados

- `docker-compose.yml`
- `frontend/package.json`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `backend/requirements.txt`
- `backend/app/main.py`
- `backend/app/routes.py`
