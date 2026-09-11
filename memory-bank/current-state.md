# Estado actual y flujo

## Arquitectura y entry points

El repositorio tiene dos aplicaciones coordinadas por Docker Compose:

- `frontend/`: aplicación React/TypeScript. El HTML de entrada es [frontend/index.html](../frontend/index.html), que carga `/src/main.tsx`. El entry point React es [frontend/src/main.tsx](../frontend/src/main.tsx), que monta `App`.
- `backend/`: aplicación FastAPI. El proceso de servidor usa `app.main:app`, definido en [backend/Dockerfile](../backend/Dockerfile). La instancia FastAPI se crea en [backend/app/main.py](../backend/app/main.py), que incluye el router de [backend/app/routes.py](../backend/app/routes.py).

Los dos servicios están definidos en [docker-compose.yml](../docker-compose.yml). No se observa un tercer servicio ni una base de datos declarada en esa configuración.

## Servicios y ejecución

El servicio `frontend` construye `./frontend`, monta el código en `/app`, conserva `/app/node_modules`, depende de `backend` y publica `5173:5173`. Su Dockerfile ejecuta `npm run dev -- --host 0.0.0.0 --port 5173`. Evidencia: [docker-compose.yml](../docker-compose.yml) y [frontend/Dockerfile](../frontend/Dockerfile).

El servicio `backend` construye `./backend`, monta el código en `/app` y publica `8000:8000` y `5678:5678`. Su Dockerfile ejecuta `debugpy` en `5678` y Uvicorn en `0.0.0.0:8000` con `--reload`. Evidencia: [docker-compose.yml](../docker-compose.yml) y [backend/Dockerfile](../backend/Dockerfile).

El README documenta `docker compose up --build` y las URLs `http://localhost:5173`, `http://localhost:8000` y `http://localhost:8000/docs`. Evidencia: [README.es.md](../README.es.md) y [README.md](../README.md).

## Comunicación

 `App.tsx` calcula `API_BASE_URL` desde `import.meta.env.VITE_API_BASE_URL` o usa una cadena vacía, y solicita `${API_BASE_URL}/api/metrics` con `AbortController`. La petición recibe la señal del controlador y el cleanup del efecto la cancela al desmontar; los aborts no se muestran como errores normales ni actualizan el estado después del desmontaje. Evidencia: [frontend/src/App.tsx](../frontend/src/App.tsx).

Vite redirige las rutas `/api` a `http://backend:8000`; `backend` coincide con el nombre del servicio de Compose. Evidencia: [frontend/vite.config.ts](../frontend/vite.config.ts) y [docker-compose.yml](../docker-compose.yml).

El flujo actual es: navegador -> `index.html` -> `main.tsx` -> `App.tsx` -> proxy `/api` de Vite -> ruta FastAPI -> movimientos mock -> respuesta JSON -> cálculos del frontend -> tarjetas y gráficos. Evidencia: [frontend/index.html](../frontend/index.html), [frontend/src/main.tsx](../frontend/src/main.tsx), [frontend/src/App.tsx](../frontend/src/App.tsx), [frontend/vite.config.ts](../frontend/vite.config.ts), [backend/app/main.py](../backend/app/main.py), [backend/app/routes.py](../backend/app/routes.py) y [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts).

## API implementada

Las rutas `GET` implementadas en [backend/app/routes.py](../backend/app/routes.py) son:

- `/health`: estado `ok`.
- `/api/metrics`: movimientos, con filtros de fecha, categoría y operación.
- `/api/metrics/facets`: opciones de filtros y rango de fechas.
- `/api/metrics/summary`: resumen por día, semana o mes, con filtros.
- `/api/metrics/categories/top`: categorías principales, con operación, límite, fechas y negocio.
- `/api/metrics/comparison`: comparación de neto entre periodos; requiere fechas.
- `/api/metrics/alerts`: alertas de aumentos de gastos.
- `/api/metrics/b2b` y `/api/metrics/b2c`: movimientos filtrados por tipo de negocio.

Los tests de [backend/tests/test_routes.py](../backend/tests/test_routes.py) cubren estas rutas y los filtros principales. Los parámetros y sus restricciones están declarados mediante `Query` en [backend/app/routes.py](../backend/app/routes.py).

## Datos y estado conocido

 El backend genera 30 movimientos por cada uno de 12 meses mediante `generate_mock_movements`; los endpoints lo invocan con `seed=42`. Las fechas se calculan usando `date.today()` y `_year_for_month()`, por lo que el conjunto puede abarcar dos años. `App.tsx` deriva el período mostrado a partir de las fechas mínima y máxima recibidas en `/api/metrics`; mientras no haya datos usa el texto neutral `Period unavailable`. Evidencia: [backend/app/routes.py](../backend/app/routes.py) y [frontend/src/App.tsx](../frontend/src/App.tsx).

## Accesibilidad implementada

La notificación de error en `App.tsx` usa `role="alert"`, `aria-live="assertive"` y `aria-atomic="true"`. El dashboard conserva un único `h1`, añade headings `h2` para las secciones de KPIs y gráficos, y usa `h3` para los KPI y títulos de gráficos; las secciones se asocian mediante `aria-labelledby`. El icono de cada KPI es decorativo y usa `aria-hidden="true"`. Evidencia: [frontend/src/App.tsx](../frontend/src/App.tsx), [frontend/src/components/dashboard/kpi-card.tsx](../frontend/src/components/dashboard/kpi-card.tsx) y [frontend/src/components/ui/card.tsx](../frontend/src/components/ui/card.tsx).

Los gráficos usan `accessibilityLayer`, relacionan cada título y descripción mediante `aria-labelledby` y `aria-describedby`, y exponen un resumen textual mensual derivado de sus datos. `IncomeOutcomeChart` diferencia `income` y `outcome` mediante color y patrón de línea; los indicadores circulares de los tooltips están marcados como decorativos con `aria-hidden="true"`. Evidencia: [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx) y [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx).
Existe un dataset fijo adicional en [frontend/src/lib/mock-data.ts](../frontend/src/lib/mock-data.ts), pero no aparece importado por [frontend/src/App.tsx](../frontend/src/App.tsx). La fuente actualmente usada por el dashboard es la API.

No hay persistencia declarada en Compose ni una dependencia de base de datos en [backend/requirements.txt](../backend/requirements.txt). Esto permite decir que no se observa persistencia configurada en el repositorio revisado, pero no permite descartar infraestructura externa no declarada.

## Tests

El repositorio contiene tests backend en [backend/tests/test_routes.py](../backend/tests/test_routes.py) y tests de utilidades frontend en [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts). Los scripts frontend están definidos en [frontend/package.json](../frontend/package.json): `dev`, `build`, `lint`, `preview`, `test`, `test:watch` y `test:coverage`.

La última ejecución conocida de la suite de rutas backend en el contenedor fue `16 passed, 1 warning`; la advertencia era de deprecación de `httpx`/Starlette. Este dato es un registro de ejecución, no una garantía de CI ni un estado automático del proyecto.
