# Reglas propuestas para contribuir

## Rastro de verificación — Fase 1: Explorar la API (2026-10-10)

- Iniciado el backend con `docker compose up --build -d backend`; se consultaron `/docs` y `/openapi.json` en `http://localhost:8000`.
- Se exploraron `GET /api/metrics/categories/top`, `GET /api/metrics/comparison` y `GET /api/metrics/alerts`, incluyendo respuestas reales y filtros representativos. Se contrastaron parámetros y modelos de respuesta con OpenAPI.
- Se documentaron los contratos y desajustes de terminología PM/API en `frontend/specs/top-categories.md`, `frontend/specs/period-comparison.md` y `frontend/specs/outcome-alerts.md`; no se modificó la implementación.
- No se ejecutaron suites de pruebas: el cambio es documentación/specs solamente.

Estas reglas son propuestas para futuros cambios. Cada una se basa en un hecho observable del repositorio.

## Arquitectura y responsabilidades

### Regla A1 — Mantener el montaje del frontend en sus entry points existentes

**Propuesta:** al cambiar el arranque de la UI, conservar `frontend/index.html` → `frontend/src/main.tsx` → `frontend/src/App.tsx`, o actualizar de forma coordinada los puntos de entrada y la configuración afectada.

**Hecho del repo:** `index.html` carga `src/main.tsx` y `main.tsx` monta `App`.

### Regla A2 — Mantener la composición visual y los cálculos separados

**Propuesta:** ubicar los cálculos financieros en `frontend/src/lib/financial-utils.ts` y pasar sus resultados a los componentes de `frontend/src/components/dashboard/` mediante props, en lugar de duplicar fórmulas en componentes de presentación.

**Hecho del repo:** `frontend/src/App.tsx` calcula KPI y datos mensuales con `financial-utils.ts` y se los entrega a los componentes del dashboard.

### Regla A3 — Registrar las rutas nuevas en el router existente

**Propuesta:** implementar endpoints en `backend/app/routes.py` y conservar su registro desde `backend/app/main.py`; actualizar también el consumidor frontend cuando la funcionalidad deba aparecer en la UI.

**Hecho del repo:** `main.py` incluye el router de `routes.py`; la API tiene varios endpoints, pero `App.tsx` actualmente solo consume `/api/metrics`.

## API y datos

### Regla D1 — Definir y mantener modelos tipados para los contratos de API

**Propuesta:** al agregar o cambiar una respuesta de API, actualizar los modelos Pydantic y los tipos frontend correspondientes, además de sus pruebas.

**Hecho del repo:** `backend/app/routes.py` declara modelos Pydantic para movimientos, facets, resúmenes, comparaciones y alertas; `frontend/src/lib/financial-types.ts` declara los tipos consumidos por el cliente.

### Regla D2 — Evitar que la generación de datos altere el estado global de azar

**Propuesta:** al modificar `generate_mock_movements`, usar un generador aleatorio local si se necesita una semilla reproducible, en vez de cambiar el estado global con `random.seed`.

**Hecho del repo:** `generate_mock_movements(seed=...)` llama a `random.seed(seed)` y se invoca con `seed=42` desde los endpoints.

### Regla D3 — Mantener la etiqueta temporal alineada con el rango de datos

**Propuesta:** si cambia el rango/año producido por el backend, actualizar también la etiqueta de `DashboardHeader` o derivarla del rango real recibido.

**Hecho del repo:** `backend/app/routes.py` asigna los años con `_year_for_month` relativo a la fecha actual, mientras `frontend/src/App.tsx` fija el periodo como `2024 - Full Year`.

## Configuración y seguridad

### Regla C1 — Mantener coordinados el proxy de Vite y el servicio backend

**Propuesta:** al renombrar el servicio o cambiar su puerto en Docker Compose, actualizar `frontend/vite.config.ts` y comprobar el flujo `/api` de extremo a extremo.

**Hecho del repo:** el proxy apunta a `http://backend:8000` y `docker-compose.yml` define un servicio llamado `backend`.

### Regla C2 — Restringir CORS para despliegues no locales

**Propuesta:** antes de desplegar con otros orígenes, reemplazar los comodines de CORS por una lista explícita de orígenes y métodos requeridos; revisar en especial la combinación con credenciales.

**Hecho del repo:** `backend/app/main.py` configura `allow_origins`, `allow_methods` y `allow_headers` con `"*"`, junto con `allow_credentials=True`.

## Testing

### Regla T1 — Añadir o actualizar pruebas junto con los cambios de comportamiento

**Propuesta:** cubrir cambios en filtros, agregaciones o respuestas en las pruebas existentes de cada capa.

**Hecho del repo:** `backend/tests/test_routes.py` prueba filtros y endpoints; `frontend/src/lib/financial-utils.test.ts` prueba cálculos y formato.

### Regla T2 — Ejecutar las pruebas de la capa modificada antes de entregar

**Propuesta:** ejecutar `pytest` desde `backend/` para cambios backend y `npm test` desde `frontend/` para cambios frontend; ejecutar ambas suites si el cambio cruza la API y el cliente.

**Hecho del repo:** `backend/requirements.txt` incluye pytest y `frontend/package.json` define el script `test` como `vitest run`.
