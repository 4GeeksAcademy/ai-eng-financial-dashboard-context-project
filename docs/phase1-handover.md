# Fase 1 — Traspaso del proyecto

## Convenciones de evidencia

- ✅ **Verificado en código:** respaldado por los archivos indicados.
- ❌ **Incorrecto:** afirmación contrastada y corregida. No se detectaron afirmaciones incorrectas en esta revisión.
- ❓ **No verificado:** no se puede concluir solo con los archivos inspeccionados o requiere comprobación en ejecución.

## Producto y funcionalidades

- ✅ Es un dashboard de métricas financieras. La pantalla solicita movimientos financieros y calcula ingresos, gastos, beneficio y margen; muestra indicadores y gráficos mensuales de ingresos/gastos y margen. [`frontend/src/App.tsx`](../frontend/src/App.tsx), [`frontend/src/lib/financial-utils.ts`](../frontend/src/lib/financial-utils.ts), [`frontend/src/components/dashboard/kpi-row.tsx`](../frontend/src/components/dashboard/kpi-row.tsx), [`frontend/src/components/dashboard/income-outcome-chart.tsx`](../frontend/src/components/dashboard/income-outcome-chart.tsx), [`frontend/src/components/dashboard/profit-percent-chart.tsx`](../frontend/src/components/dashboard/profit-percent-chart.tsx)
- ✅ El backend ofrece endpoints para movimientos, facetas, resúmenes por día/semana/mes, categorías principales, comparaciones de periodos, alertas y conjuntos B2B/B2C. [`backend/app/routes.py`](../backend/app/routes.py)
- ✅ Los movimientos que devuelve actualmente la API se generan como datos simulados con semilla fija; no se encontró acceso a almacenamiento persistente en las rutas. [`backend/app/routes.py`](../backend/app/routes.py)
- ❓ No está verificado que las funcionalidades adicionales de la API estén integradas en la pantalla actual: el componente principal consulta `/api/metrics`. [`frontend/src/App.tsx`](../frontend/src/App.tsx)

## Arquitectura y flujo de datos

- ✅ Docker Compose define dos servicios: `frontend` y `backend`; publica los puertos 5173, 8000 y 5678. El puerto 5678 es de depuración del backend, no un servicio separado. [`docker-compose.yml`](../docker-compose.yml), [`backend/Dockerfile`](../backend/Dockerfile)
- ✅ El frontend es una SPA React servida en desarrollo por Vite. `App` obtiene `/api/metrics`, calcula los KPI y los datos mensuales en el cliente, y los pasa a los componentes de dashboard. [`frontend/Dockerfile`](../frontend/Dockerfile), [`frontend/vite.config.ts`](../frontend/vite.config.ts), [`frontend/src/App.tsx`](../frontend/src/App.tsx), [`frontend/src/lib/financial-utils.ts`](../frontend/src/lib/financial-utils.ts)
- ✅ Por defecto, Vite reenvía `/api` a `http://backend:8000` dentro de Compose. La variable `VITE_API_BASE_URL` permite configurar otro origen. [`frontend/vite.config.ts`](../frontend/vite.config.ts), [`frontend/.env.example`](../frontend/.env.example)
- ✅ FastAPI registra las rutas definidas en `backend/app/routes.py`; incluye `/health` y `/api/metrics` además de los endpoints analíticos descritos arriba. [`backend/app/main.py`](../backend/app/main.py), [`backend/app/routes.py`](../backend/app/routes.py)
- ❓ En los archivos revisados no se encontró configuración de base de datos, autenticación ni despliegue de producción. Esto no demuestra que no existan fuera del repositorio inspeccionado.

## Tecnologías y dependencias

- ✅ **Frontend:** React y React DOM 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React y Vitest; los scripts de calidad incluyen ESLint y compilación TypeScript/Vite. [`frontend/package.json`](../frontend/package.json), [`frontend/vite.config.ts`](../frontend/vite.config.ts), [`frontend/src/index.css`](../frontend/src/index.css)
- ✅ **Backend:** imagen Python 3.13, FastAPI, Uvicorn y debugpy; pytest y HTTPX aparecen en las dependencias de Python. [`backend/Dockerfile`](../backend/Dockerfile), [`backend/requirements.txt`](../backend/requirements.txt)
- ❓ `backend/requirements.txt` no fija versiones; por tanto, no se puede afirmar qué versiones concretas de esas dependencias se instalaron. [`backend/requirements.txt`](../backend/requirements.txt)

## Cómo levantar y verificar

- ✅ Inicio documentado, desde la raíz: `docker compose up --build`. [`README.es.md`](../README.es.md), [`docker-compose.yml`](../docker-compose.yml)
- ✅ El README indica frontend en `http://localhost:5173`, backend en `http://localhost:8000` y documentación de la API en `http://localhost:8000/docs`. [`README.es.md`](../README.es.md)
- ✅ La ruta `/health` devuelve `{"status":"ok"}` según la implementación y la prueba correspondiente. [`backend/app/routes.py`](../backend/app/routes.py), [`backend/tests/test_routes.py`](../backend/tests/test_routes.py)
- ✅ Los scripts disponibles son `npm test`, `npm run build` y `npm run lint` en el frontend; pytest es la herramienta declarada para las pruebas del backend. [`frontend/package.json`](../frontend/package.json), [`backend/requirements.txt`](../backend/requirements.txt), [`backend/tests/test_routes.py`](../backend/tests/test_routes.py)
- ❓ Esta revisión no ejecutó Compose, endpoints ni pruebas. Los resultados comunicados por el operador se registran por separado en [`verification.md`](../verification.md).

## Archivos importantes y responsabilidades

| Archivo | Responsabilidad |
| --- | --- |
| `AGENTS.md` | Instrucciones para agentes: buscar reglas en `.agents/rules`, skills en `.agents/skills` y memoria en `memory-bank`. No configura ni ejecuta la aplicación. |
| `docker-compose.yml` | Define los servicios, puertos, montajes y dependencia frontend/backend. |
| `README.es.md` | Instrucciones documentadas para levantar el proyecto y URLs locales. |
| `frontend/Dockerfile` | Imagen y comando de desarrollo del frontend. |
| `frontend/package.json` | Dependencias, scripts de desarrollo, pruebas, build y lint. |
| `frontend/vite.config.ts` | Plugins, host, alias y proxy `/api`. |
| `frontend/src/App.tsx` | Carga de datos, estados de carga/error y composición del dashboard. |
| `frontend/src/lib/financial-utils.ts` | Cálculo de KPI, agregados mensuales y formato de valores. |
| `frontend/src/components/dashboard/` | Encabezado, tarjetas KPI y gráficos. |
| `backend/Dockerfile` | Imagen y comando de arranque del backend con Uvicorn/debugpy. |
| `backend/requirements.txt` | Dependencias Python declaradas. |
| `backend/app/main.py` | Creación de FastAPI, middleware CORS y registro del router. |
| `backend/app/routes.py` | Modelos, generación de datos simulados, cálculos y endpoints. |
| `backend/tests/test_routes.py` | Pruebas de rutas y lógica del backend. |
| `frontend/src/lib/financial-utils.test.ts` | Pruebas de cálculos, agregación mensual y formato del frontend. |

Las rutas de esta tabla son relativas a la raíz del repositorio. En la inspección no se encontraron archivos en `.agents/rules`, `.agents/skills` ni `memory-bank`.

## Pendientes / aspectos desconocidos

- ❓ Verificar en ejecución que las respuestas de la API coincidan con el dashboard en el entorno de destino; los resultados reportados por el operador están en [`verification.md`](../verification.md).
- ✅ **Hallazgo técnico — periodo mostrado distinto del periodo de datos:** el encabezado fija `2024 - Full Year` en [`frontend/src/App.tsx`, línea 49](../frontend/src/App.tsx#L49). El backend genera movimientos para cada mes del año y decide el año con `date.today()`; para meses anteriores al mes actual usa el año actual y para el mes actual y los posteriores usa el anterior. La fecha del movimiento se construye con esa regla en [`backend/app/routes.py`, líneas 65–75](../backend/app/routes.py#L65-L75), y el generador usa la fecha actual y recorre los 12 meses en [`backend/app/routes.py`, líneas 94–102](../backend/app/routes.py#L94-L102). Por tanto, a fecha de esta revisión (2026-11-14), los datos generados cubren noviembre de 2025 a octubre de 2026, no 2024. Hay una inconsistencia entre la etiqueta de periodo y el intervalo generado. No consulté la API en ejecución: el código del endpoint `/api/metrics` llama a este generador, por lo que la discrepancia se determina directamente en código. [`backend/app/routes.py`, líneas 248–258](../backend/app/routes.py#L248-L258)
- ❓ No se encontró un `healthcheck` de Docker Compose, ni configuración de base de datos, autenticación o proceso de despliegue productivo en los archivos revisados. [`docker-compose.yml`](../docker-compose.yml)
- ❓ No se conoce el origen o significado de negocio de los datos simulados ni si deben sustituirse por datos reales.
