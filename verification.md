# Verificación del proyecto

## Instrucciones de Ejecución

### Arranque con Docker Compose

Desde la raíz del repositorio, ejecutar:

```bash
docker compose up --build
```

Este comando está documentado en `README.es.md` y `README.md`. Compose construye dos servicios (`frontend` y `backend`) según `docker-compose.yml`. No se encontró configuración de base de datos en ese archivo.

### Servicios, puertos y URLs

| Servicio | Puerto publicado | URL / propósito | Evidencia |
|---|---:|---|---|
| Frontend (Vite) | `5173:5173` | `http://localhost:5173` | `docker-compose.yml`; URL documentada en `README.es.md`; el comando del contenedor fija `--host 0.0.0.0 --port 5173` en `frontend/Dockerfile`. |
| Backend (FastAPI/Uvicorn) | `8000:8000` | `http://localhost:8000` | `docker-compose.yml`; URL documentada en `README.es.md`; `backend/Dockerfile` ejecuta Uvicorn en `0.0.0.0:8000`. |
| Documentación OpenAPI | — (se sirve desde el backend) | `http://localhost:8000/docs` | URL en `README.es.md`; `backend/app/main.py` crea FastAPI sin deshabilitar la documentación. |
| Debugger Python (debugpy) | `5678:5678` | Puerto de depuración `5678`; no se documenta una URL HTTP | `docker-compose.yml`; `backend/Dockerfile` indica `--listen 0.0.0.0:5678`. |

Los lados izquierdos de las asignaciones `puerto:puerto` en Compose son los puertos publicados en el host. Si esos puertos ya están ocupados, el arranque podría fallar; no se comprobó el estado del entorno Docker.

### Verificación rápida de la API

Con los servicios levantados, el backend define `GET /health` y devuelve `{"status":"ok"}`. Se puede comprobar con:

```bash
curl http://localhost:8000/health
```

También puede abrirse `http://localhost:8000/docs`. **Evidencia:** `backend/app/routes.py` (ruta `/health`); `backend/tests/test_routes.py` (prueba de respuesta); `README.es.md` (URL de docs).

### Comandos adicionales definidos por el proyecto

Scripts declarados en `frontend/package.json` (ejecutables desde `frontend/` tras instalar dependencias):

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:watch
npm run test:coverage
npm run preview
```

El contenedor de frontend usa `npm run dev -- --host 0.0.0.0 --port 5173` (`frontend/Dockerfile`). El backend en el contenedor se ejecuta con:

```bash
python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Este es el `CMD` de `backend/Dockerfile`, no una instrucción de arranque local documentada. Para pruebas backend existen dependencias `pytest` y pruebas bajo `backend/tests/`; no se encontró un script backend ni un comando de prueba en los README. No se ejecutaron pruebas durante esta verificación.

### Requisitos que muestran los archivos

- El flujo de arranque documentado requiere Docker y Docker Compose: `README.es.md` usa `docker compose up --build`.
- Las imágenes usan Node `24-alpine` y Python `3.13-slim`: `frontend/Dockerfile` y `backend/Dockerfile`.
- Dependencias Python declaradas: `backend/requirements.txt`.
- Dependencias y scripts npm declarados: `frontend/package.json`.
- El README afirma que no se necesitan variables adicionales para el proxy predeterminado de Vite. La app consume `VITE_API_BASE_URL` opcionalmente en `frontend/src/App.tsx`. El archivo `frontend/.env.example` está mencionado por el README, pero no se pudo inspeccionar su contenido en esta revisión; por tanto, no se documentan aquí valores concretos de ejemplo.

## Resumen del Proyecto

El repositorio implementa un dashboard de métricas financieras con frontend React/TypeScript y backend FastAPI, según `README.es.md`.

### Flujo entre componentes

1. `frontend/index.html` proporciona el nodo `root`; `frontend/src/main.tsx` monta allí la aplicación React.
2. `frontend/src/App.tsx` realiza una petición `fetch` a `${VITE_API_BASE_URL}/api/metrics`. Si la variable no está definida, su valor predeterminado es la cadena vacía y la ruta es `/api/metrics`.
3. `frontend/vite.config.ts` configura un proxy para rutas `/api` con destino `http://backend:8000`. En Docker Compose, `backend` es el nombre del servicio backend (`docker-compose.yml`).
4. `backend/app/main.py` crea la aplicación FastAPI, habilita CORS e incluye el router implementado en `backend/app/routes.py`.
5. `backend/app/routes.py` define modelos y endpoints financieros. Los endpoints generan movimientos de ejemplo con `generate_mock_movements(seed=42)` en memoria; no se observa acceso a base de datos en ese módulo.
6. El frontend transforma los movimientos recibidos en KPI y agregados mensuales con `frontend/src/lib/financial-utils.ts`; los componentes visuales relevantes son `frontend/src/components/dashboard/kpi-row.tsx`, `frontend/src/components/dashboard/income-outcome-chart.tsx` y `frontend/src/components/dashboard/profit-percent-chart.tsx`.

### Servicios y alcance visible

- **Frontend:** React 19, TypeScript, Vite y Recharts aparecen en `frontend/package.json`; la interfaz muestra ingresos, gastos, beneficio y margen, además de dos gráficos (`frontend/src/App.tsx` y componentes citados arriba).
- **Backend:** FastAPI expone `/health`, `/api/metrics`, `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b` y `/api/metrics/b2c` (`backend/app/routes.py`).
- La pantalla principal inspeccionada consume `/api/metrics`; no se encontró en `frontend/src/App.tsx` consumo de los otros endpoints.
- Hay pruebas de API en `backend/tests/test_routes.py` y pruebas de utilidades frontend en `frontend/src/lib/financial-utils.test.ts`.

## Tabla/Rastro de Verificación (✅ / ❌ / ❓)

En la respuesta de inspección anterior no detecté afirmaciones incorrectas de fondo que deban rectificarse. Por transparencia, las filas ❌ de abajo recogen interpretaciones que serían incorrectas si se asumieran (y las contrastan con el código); no atribuyen esas afirmaciones a la respuesta anterior.

| Estado | Afirmación | Verificación y evidencia |
|---|---|---|
| ✅ **Verificado** | La aplicación está compuesta por frontend React/TypeScript y backend FastAPI. | `README.es.md`; `frontend/package.json`; `backend/app/main.py`. |
| ✅ **Verificado** | El arranque documentado es `docker compose up --build`. | `README.es.md`; `README.md`. |
| ✅ **Verificado** | Compose publica frontend 5173, API 8000 y debugpy 5678. | `docker-compose.yml`; los Dockerfiles configuran los listeners correspondientes. |
| ✅ **Verificado** | La interfaz solicita `/api/metrics` y Vite lo proxifica a `http://backend:8000`. | `frontend/src/App.tsx`; `frontend/vite.config.ts`; `docker-compose.yml`. |
| ✅ **Verificado** | El backend genera datos financieros de ejemplo en memoria usando semilla 42 en los endpoints inspeccionados. | `backend/app/routes.py`, funciones `generate_mock_movements` y endpoints. Las pruebas esperan 360 movimientos (`backend/tests/test_routes.py`). |
| ✅ **Verificado** | La UI calcula KPI y agregados mensuales desde los movimientos obtenidos. | `frontend/src/App.tsx`; `frontend/src/lib/financial-utils.ts`. |
| ✅ **Verificado** | Existe `/health` y la prueba espera `{"status":"ok"}`. | `backend/app/routes.py`; `backend/tests/test_routes.py`. |
| ✅ **Verificado** | Hay datos mock locales en el frontend. | `frontend/src/lib/mock-data.ts`. Esa constante no se importa en `frontend/src/App.tsx`, por lo que no es el origen de datos del flujo principal inspeccionado. |
| ❌ **Incorrecto / Corregido** | «La pantalla principal usa el mock de 2024 del frontend». | No es correcto para el flujo de `App`: este hace `fetch` a `/api/metrics`; `mock-data.ts` no está importado allí. El backend genera datos con fechas derivadas de `date.today()` en `backend/app/routes.py`. |
| ❌ **Incorrecto / Corregido** | «Los datos del backend son persistentes o provienen de una base de datos». | No hay respaldo visible para ello: los endpoints inspeccionados llaman a `generate_mock_movements(seed=42)` en `backend/app/routes.py`; `docker-compose.yml` no define un servicio de base de datos. La conclusión se limita al código inspeccionado. |
| ❌ **Incorrecto / Corregido** | «Todos los endpoints de métricas se consumen desde la página principal». | No es correcto según el código inspeccionado: `frontend/src/App.tsx` solo hace una petición a `/api/metrics`; los otros endpoints están definidos en `backend/app/routes.py`. |
| ❓ **Sin verificar** | Que Docker Compose arranca con éxito en el entorno actual y que las URLs responden realmente. | Se inspeccionaron configuración y comandos, pero no se ejecutaron contenedores ni solicitudes HTTP en esta tarea. |
| ❓ **Sin verificar** | Que los puertos 5173, 8000 y 5678 estén libres en la máquina del usuario. | Los archivos especifican esos puertos; no se inspeccionó disponibilidad del host. |
| ❓ **Sin verificar** | Que `frontend/.env.example` contenga una configuración funcional o cuál sea su contenido exacto. | El README lo menciona, pero su contenido no fue inspeccionable en esta revisión. `frontend/src/App.tsx` sí muestra el uso opcional de `VITE_API_BASE_URL`. |
| ❓ **Sin verificar** | Que el rango y la etiqueta «2024 - Full Year» de la cabecera correspondan a los movimientos entregados por la API. | `frontend/src/App.tsx` fija esa etiqueta; el backend crea fechas con respecto a la fecha actual (`backend/app/routes.py`). No hay sincronización explícita de la etiqueta con los datos en esos archivos. |
| ❓ **Sin verificar** | La precisión funcional de los cálculos y la estabilidad del comportamiento con datos reales de producción. | El repositorio inspeccionado prueba utilidades y datos de ejemplo, pero no aporta una fuente real de datos o evidencia de despliegue productivo. |
