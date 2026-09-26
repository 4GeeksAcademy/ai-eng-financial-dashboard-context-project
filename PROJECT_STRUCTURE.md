# Estructura del proyecto

## Propósito

Este proyecto es un panel de métricas financieras. El frontend presenta ingresos, egresos, beneficio y gráficas mensuales; el backend ofrece una API para consultar movimientos y agregados. Actualmente, la API genera datos de ejemplo a partir de una semilla fija: los importes y tipos son reproducibles, pero los años de las fechas dependen de la fecha actual. No hay conexión a una fuente financiera ni persistencia en base de datos.

## Mapa del repositorio

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py          # Configuración de FastAPI y registro de rutas
│   │   └── routes.py        # Modelos, datos de ejemplo, cálculos y endpoints
│   ├── tests/               # Pruebas de la API y sus funciones
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Carga de datos y composición del dashboard
│   │   ├── components/
│   │   │   ├── dashboard/   # Encabezado, KPI y gráficas
│   │   │   └── ui/           # Componentes de interfaz compartidos
│   │   ├── lib/              # Tipos, cálculos, formato y datos auxiliares
│   │   ├── index.css
│   │   └── main.tsx          # Entrada de React
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── README.es.md
```

## Cómo se conectan las partes

1. `frontend/src/App.tsx` solicita `GET /api/metrics` al iniciar. Si la respuesta falla, muestra un mensaje de error; durante la carga, los componentes KPI reciben el estado de carga.
2. `backend/app/main.py` crea la aplicación FastAPI, habilita CORS e incluye el router definido en `backend/app/routes.py`.
3. `routes.py` genera 360 movimientos de ejemplo usando la semilla `42`, asignados al periodo de 12 meses relativo a la fecha actual; aplica filtros y devuelve movimientos ordenados por fecha.
4. El frontend tipa los movimientos con `frontend/src/lib/financial-types.ts`. `financial-utils.ts` calcula totales, beneficio, porcentaje de beneficio y agregados mensuales.
5. `KPIRow`, `IncomeOutcomeChart` y `ProfitPercentChart` muestran los resultados usando los componentes ubicados en `frontend/src/components/dashboard/`.

Vite configura el alias `@` para `frontend/src` y reenvía las solicitudes `/api` a `http://backend:8000`. En Docker Compose, el frontend está disponible en el puerto `5173` y el backend en `8000`.

**Inconsistencia conocida:** `App.tsx` muestra en el encabezado el periodo fijo `2024 - Full Year`, pero el backend genera movimientos para los últimos 12 meses relativos a la fecha actual. El rótulo no se deriva de las fechas recibidas y puede no describir los datos visibles.

## Backend y API

Los modelos de respuesta describen movimientos (`create_date`, `amount`, `operation_type`, `category` y `business_type`), facetas, resúmenes, categorías principales, comparaciones y alertas. Los filtros admiten fechas, categoría, tipo de operación y, según el endpoint, tipo de negocio. El agrupamiento de resúmenes puede ser diario, semanal o mensual.

Rutas implementadas en `backend/app/routes.py`:

- `GET /health`: estado del servicio.
- `GET /api/metrics`: movimientos con filtros de fecha, categoría y operación.
- `GET /api/metrics/facets`: valores disponibles para filtros y rango de fechas.
- `GET /api/metrics/summary`: agregados de ingresos, egresos y neto por periodo.
- `GET /api/metrics/categories/top`: categorías con mayor importe por tipo de operación.
- `GET /api/metrics/comparison`: comparación del neto entre dos periodos consecutivos.
- `GET /api/metrics/alerts`: periodos con aumentos de egresos sobre el promedio previo.
- `GET /api/metrics/b2b` y `GET /api/metrics/b2c`: movimientos filtrados por tipo de negocio.

La interfaz actual consume `/api/metrics`; las demás rutas están disponibles en el backend, pero no forman parte del flujo de `App.tsx` por ahora. FastAPI publica la documentación interactiva en `/docs`.

## Pruebas y trabajo local

Las pruebas de frontend están junto a las utilidades en `frontend/src/lib/financial-utils.test.ts`. Las pruebas del backend están en `backend/tests/test_routes.py` y cubren generación y filtrado de movimientos, endpoints, resúmenes y otros resultados de la API.

Para iniciar ambos servicios con Docker:

```bash
docker compose up --build
```

- Dashboard: http://localhost:5173
- API: http://localhost:8000
- Documentación interactiva: http://localhost:8000/docs

Para trabajar o ejecutar pruebas por separado:

```bash
cd frontend
npm install
npm run dev
npm test
npm run lint
npm run build
```

```bash
cd backend
pip install -r requirements.txt
pytest
```

Los scripts de frontend están definidos en `frontend/package.json`. El backend usa FastAPI, Uvicorn y pytest; en Docker se inicia Uvicorn con recarga habilitada.