# Investigación del proyecto: Financial Metrics Dashboard

> Documento descriptivo basado en el código del repositorio. No propone cambios. Las observaciones de riesgos describen comportamientos posibles del código, no afirman que se hayan reproducido en ejecución.

## Alcance y referencias

El proyecto consta de una API en `backend/` y una aplicación web en `frontend/`, conectadas en desarrollo mediante Docker Compose y el proxy de Vite. Las fuentes principales revisadas son:

- Ejecución y configuración: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/vite.config.ts`, `README.md` y `README.es.md`.
- Backend: `backend/app/main.py`, `backend/app/routes.py`, `backend/requirements.txt`, `backend/tests/`.
- Frontend: `frontend/package.json`, `frontend/src/App.tsx`, `frontend/src/main.tsx`, `frontend/src/lib/` y `frontend/src/components/`.

## 1. Arquitectura y flujo principal

### Backend

`backend/app/main.py` crea una aplicación FastAPI titulada `Financial Metrics API`, añade middleware CORS y registra el router importado desde `app.routes`. `backend/app/routes.py` contiene modelos Pydantic, tipos admitidos, generación de datos de muestra, filtros, cálculos y endpoints.

No se observa una base de datos ni una integración externa de datos en estas rutas: cada endpoint de métricas invoca `generate_mock_movements(seed=42)` y trabaja con la lista resultante en memoria. La ruta `/health` es una excepción: solo devuelve `{"status":"ok"}`.

### Frontend

1. `frontend/index.html` proporciona el elemento `#root` y carga `/src/main.tsx`.
2. `frontend/src/main.tsx` renderiza `App` con React `StrictMode`.
3. `frontend/src/App.tsx` lanza una petición HTTP al montar: `GET /api/metrics` (o `VITE_API_BASE_URL + /api/metrics` si esa variable existe).
4. Si la respuesta no es exitosa, la función de carga lanza un error. Si tiene éxito, interpreta el cuerpo como JSON.
5. `computeKPIs` y `computeMonthlyData` en `frontend/src/lib/financial-utils.ts` calculan los datos que se muestran.
6. `KPIRow` presenta cuatro indicadores; `IncomeOutcomeChart` y `ProfitPercentChart` muestran gráficos mensuales. Mientras carga se muestran `Skeleton`; si falla la petición aparece un mensaje de error.

En el modo Docker Compose documentado, [frontend/vite.config.ts](frontend/vite.config.ts) reenvía las peticiones que empiezan por `/api` a `http://host.docker.internal:8000`. [docker-compose.yml](docker-compose.yml) configura ese alias mediante `host-gateway`; el proxy accede al puerto `8000` del backend publicado en el host. El servicio frontend depende de backend y ambos tienen sus puertos publicados.

Esta ruta se adoptó como alternativa al fallo observado de comunicación directa entre contenedores, no como requisito general de Docker. Fuera de Docker, no se garantiza que el alias resuelva; las opciones de configuración se explican en el [README en español](README.es.md).

## 2. Entradas y salidas

### Modelo de movimiento

`FinancialMovement` (backend) y su interfaz equivalente de TypeScript describen estos campos:

```json
{
  "create_date": "YYYY-MM-DD",
  "amount": 123.45,
  "operation_type": "income",
  "category": "sales",
  "business_type": "B2B"
}
```

`amount` es `float` en Python y `number` en TypeScript. El resto de los valores se restringe a:

- `operation_type`: `income` o `outcome`.
- `category`: `suppliers`, `sales`, `operational`, `administrative` o `others`.
- `business_type`: `B2B` o `B2C`.
- `group_by`, donde se utiliza: `day`, `week` o `month`.

Las rutas de métricas son GET y reciben filtros como parámetros de query. No declaran cuerpo de petición. La llamada `fetch` del frontend tampoco configura headers, credenciales ni body. FastAPI/Pydantic validan fechas y valores restringidos; una entrada que no se pueda validar puede dar una respuesta `422`. No hay autenticación declarada en las rutas examinadas.

### Endpoints

| Método y ruta | Parámetros de query | Salida declarada |
|---|---|---|
| `GET /health` | Ninguno | Objeto `{"status":"ok"}`. |
| `GET /api/metrics` | `start_date`, `end_date`, `category`, `operation_type`, todos opcionales | Lista cronológica de `FinancialMovement`. |
| `GET /api/metrics/facets` | Ninguno | `operation_types`, `business_types`, `categories`, `min_date`, `max_date`. |
| `GET /api/metrics/summary` | `group_by` (predeterminado `month`), fechas, categoría, operación, `business_type` (opcionales) | Lista de `{period, income, outcome, net}`. |
| `GET /api/metrics/categories/top` | `operation_type` (predeterminado `outcome`), `limit` (predeterminado 5, restringido a 1–20), fechas y `business_type` | Lista de `{category, operation_type, total_amount}`. |
| `GET /api/metrics/comparison` | `start_date` y `end_date` obligatorias; `business_type` opcional | `{current_period, previous_period, delta_abs, delta_pct}`; `delta_pct` admite `null`. |
| `GET /api/metrics/alerts` | `threshold` (predeterminado 0.3, mínimo 0), `group_by` (predeterminado `month`), fechas y `business_type` | Lista de `{period, outcome_total, baseline_average, increase_ratio}`. |
| `GET /api/metrics/b2b` | Fechas, categoría y operación opcionales | Lista cronológica de movimientos solo B2B. |
| `GET /api/metrics/b2c` | Fechas, categoría y operación opcionales | Lista cronológica de movimientos solo B2C. |

FastAPI utiliza `response_model` en las rutas de métricas, que define y valida la forma de la salida. El código no declara códigos de estado alternativos para estas rutas; las respuestas correctas siguen el comportamiento normal de FastAPI (200), y los errores de validación de parámetros se reportan como 422.

### Generación, filtros y cálculos

`generate_mock_movements(seed=42)` genera 360 movimientos: 30 para cada número de mes del 1 al 12. El día se elige entre 1 y 28, el importe es positivo y se redondea a dos decimales. Las probabilidades y rangos están en `_build_movement`. La lista se ordena por fecha.

`filter_movements_by_date` incluye los extremos del intervalo (`>= start_date`, `<= end_date`). `filter_movements` agrega filtros opcionales de categoría y operación. En algunas rutas se filtra `business_type` por separado.

`summary` agrupa por día ISO, semana ISO (`YYYY-Wnn`) o mes (`YYYY-MM`) y calcula neto como ingresos menos egresos. `comparison` calcula el neto del intervalo solicitado y lo compara con el intervalo anterior de igual duración inclusiva. `alerts` compara el egreso de cada periodo con la media de egresos de los periodos previos de la lista.

## 3. Frontend: presentación y datos

- `frontend/src/lib/financial-types.ts`: uniones e interfaces compartidas por la aplicación.
- `frontend/src/lib/financial-utils.ts`: agregación de KPIs y meses, y formato de dólares/porcentajes.
- `frontend/src/components/dashboard/dashboard-header.tsx`: encabezado del dashboard y etiqueta del periodo.
- `kpi-row.tsx` y `kpi-card.tsx`: indicadores de ingresos, egresos, beneficio y margen.
- `income-outcome-chart.tsx` y `profit-percent-chart.tsx`: gráficos Recharts y tooltips.
- `frontend/src/components/ui/card.tsx`, `skeleton.tsx` y `frontend/src/lib/utils.ts`: primitivas visuales y combinación de clases.
- `frontend/src/index.css`: tema claro/oscuro mediante variables CSS y estilos Tailwind.

`frontend/src/lib/mock-data.ts` contiene movimientos estáticos fechados en 2024, pero `App.tsx` no lo importa: la pantalla principal usa la respuesta de la API. El título del periodo también está fijado en `App.tsx` como `2024 - Full Year`.

El frontend calcula los datos del dashboard a partir de `/api/metrics`; en el `App.tsx` revisado no hay llamadas a los endpoints de resumen, comparación, alertas, facets o categorías top.

## 4. Dependencias y stack tecnológico

### Backend

- Python `3.13-slim` como imagen indicada en `backend/Dockerfile`.
- FastAPI para endpoints, validación y modelos de respuesta.
- Uvicorn con extras estándar como servidor ASGI.
- Debugpy para depuración remota desde el comando del contenedor.
- Pytest, pytest-cov y httpx aparecen en `backend/requirements.txt` para pruebas.
- Pydantic se importa directamente en `routes.py`, pero no figura directamente en `requirements.txt`; en este proyecto se incorpora a través de FastAPI.

`backend/requirements.txt` no fija números de versión, así que no permite conocer la versión exacta instalada de esos paquetes.

### Frontend

- React y React DOM: `^19.2.4` en `frontend/package.json`.
- TypeScript: `~6.0.2`; Vite: `^8.0.4`; Vitest: `^4.1.4`.
- Recharts para los gráficos; `lucide-react` para iconos.
- Tailwind CSS `^4.2.2` con `@tailwindcss/vite`.
- `clsx` y `tailwind-merge` para combinar clases.
- ESLint y TypeScript ESLint para linting.

Los rangos declarados no representan necesariamente el número exacto instalado. El repositorio contiene `frontend/package-lock.json`, que registra la resolución de npm.

### Dependencias internas y servicios

El frontend importa componentes y utilidades de `frontend/src/`. El backend importa el router de `app.routes`. Docker Compose orquesta los dos contenedores. No se observan otros servicios declarados en `docker-compose.yml`.

## 5. Stack y comandos de ejecución

El README español y el inglés documentan el arranque local:

```bash
docker compose up --build
```

Puertos publicados por `docker-compose.yml`:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Puerto de Debugpy del backend: `5678`
- El README indica la documentación de API en `http://localhost:8000/docs`.

Comandos del contenedor:

- Backend: `python -m debugpy ... -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`.
- Frontend: `npm run dev -- --host 0.0.0.0 --port 5173`.

Scripts declarados en `frontend/package.json`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
npm run test
npm run test:watch
npm run test:coverage
```

Las pruebas backend están en `backend/tests/test_routes.py`; las pruebas de utilidades frontend están en `frontend/src/lib/financial-utils.test.ts`. Este documento se basa en inspección del código y no afirma que se hayan ejecutado esas pruebas.

## 6. Posibles bugs y casos límite observables

1. **Año de los datos y etiqueta del dashboard no coinciden necesariamente.** `_year_for_month` asigna los meses anteriores al mes actual al año actual, y el mes actual y posteriores al año anterior. Por tanto, la generación representa meses de dos años. El encabezado del frontend siempre afirma `2024 - Full Year`. La fecha concreta depende del día en que se llame a `date.today()`.
2. **Uso del generador aleatorio global.** Si se pasa `seed`, `generate_mock_movements` invoca `random.seed(seed)`, modificando el estado global del módulo `random`. Cada ruta lo hace con 42. Si hay ejecuciones concurrentes que consumen ese estado, las secuencias pueden interferir.
3. **Rangos de fechas invertidos.** No hay validación explícita que exija `start_date <= end_date`. Los filtros inclusivos suelen dar una lista vacía si el intervalo está invertido; en comparison el rango y el intervalo previo resultan igualmente poco intuitivos.
4. **Porcentaje de comparación cuando el neto previo es negativo.** El denominador usa `abs(previous_net)`. Si el neto anterior es cero, el porcentaje se devuelve como `null`. El cálculo puede no corresponder a la interpretación financiera que el cliente espere, aunque es exactamente la fórmula implementada.
5. **Alertas dependientes del rango filtrado.** El promedio histórico solo usa periodos incluidos en `summary`; al acotar fechas también se recorta la línea base. No se consulta el historial previo fuera de ese rango. El primer periodo nunca puede activar alerta porque aún no hay línea base; una base igual a cero también evita el cálculo.
6. **`build_metrics_facets` presupone una lista no vacía.** Ordena los movimientos y lee el primero y el último para construir fechas mínimas y máximas. Una entrada vacía produciría error. Las rutas actuales llaman al generador con 360 elementos, pero el helper no maneja listas vacías.
7. **Coherencia entre categoría y tipo de operación.** El generador asigna categorías distintas según ingreso/egreso, pero el modelo solo limita cada campo por separado. No prohíbe combinaciones como un ingreso con categoría `suppliers`.
8. **Parseo de fechas y zona horaria en el navegador.** `computeMonthlyData` construye `Date` desde `YYYY-MM-DD` y luego usa getters locales. Según la zona horaria del navegador, el instante resultante puede caer en el día local anterior y, cerca de un cambio de mes, alterar la agrupación.
9. **No se cancela ni reintenta la petición.** El `useEffect` inicia un fetch al montar y no configura `AbortController` ni lógica de reintento. El error se convierte en un mensaje genérico; no se muestra el detalle del error.
10. **JSON sin validación de esquema en runtime.** `fetchFinancialData` tipa el resultado de `response.json()` como `FinancialMovement[]`, pero ese tipo de TypeScript no comprueba que el servidor haya enviado esos campos o valores.
11. **Formato y agrupación de frontend.** El formato de fechas del gráfico usa `en-US`, al igual que el formato monetario `USD`. Los meses sin movimientos no se crean en el mapa mensual, por lo que el gráfico solo presenta meses presentes en los datos.
12. **Lógica duplicada de negocio.** Backend y frontend calculan agregaciones; la pantalla usa las funciones del frontend, mientras hay rutas de agregación disponibles en el backend. Mantener ambas implementaciones puede producir diferencias si una cambia de forma independiente.
13. **Configuración CORS amplia.** `main.py` configura `allow_origins`, `allow_methods` y `allow_headers` como `"*"`, y también `allow_credentials=True`. Es una configuración amplia y el comportamiento efectivo depende de la política CORS de Starlette/FastAPI; no hay lista de orígenes específicos en este archivo.

## 7. Pruebas existentes

`backend/tests/test_routes.py` verifica la cantidad y orden de los datos generados, límites de fechas, salud, filtros, facets, resúmenes, categorías top, comparación y estructura de alertas. `backend/tests/conftest.py` añade la raíz de backend a `sys.path`.

`frontend/src/lib/financial-utils.test.ts` cubre totales KPI, el caso sin ingresos, agregación mensual cronológica con cruce de año y formatos de moneda/porcentaje. No cubre la capa React ni la comunicación HTTP de `App.tsx`.
