# Contexto del producto

## Resumen
Este repositorio contiene un **dashboard de métricas financieras** compuesto por un backend en FastAPI (Python) y un frontend en React + TypeScript (Vite, Tailwind, Recharts). Verificado en código:

- El backend ([backend/app/routes.py](backend/app/routes.py)) genera **datos financieros simulados** (`generate_mock_movements`, semilla fija `42`) de 360 movimientos anuales (30/mes), cada uno con fecha, monto, tipo de operación (`income`/`outcome`), categoría (`suppliers`, `sales`, `operational`, `administrative`, `others`) y tipo de negocio (`B2B`/`B2C`). No hay conexión a una base de datos real ni persistencia: todo se recalcula en memoria en cada request.
- Expone endpoints REST: `/health`, `/api/metrics`, `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b` y `/api/metrics/b2c`.
- El frontend ([frontend/src/App.tsx](frontend/src/App.tsx)) actualmente **solo consume `/api/metrics`** (el endpoint más básico) y calcula en el cliente ([frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts)) los KPIs (ingresos, egresos, utilidad neta, margen %) y la serie mensual. El resto de endpoints avanzados (facets, summary, top categorías, comparación, alertas, segmentación B2B/B2C) **existen en el backend pero no están conectados a ninguna interfaz** todavía.
- La UI renderiza: un encabezado ([dashboard-header.tsx](frontend/src/components/dashboard/dashboard-header.tsx)), 4 tarjetas KPI ([kpi-row.tsx](frontend/src/components/dashboard/kpi-row.tsx), [kpi-card.tsx](frontend/src/components/dashboard/kpi-card.tsx)) y dos gráficos de línea: ingresos vs. egresos ([income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx)) y margen de utilidad porcentual ([profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx)), con estados de carga (skeleton) y error.
- El proyecto forma parte de un **ejercicio de bootcamp de 4Geeks Academy** ([README.md](README.md), [AGENTS.md](AGENTS.md)): su propósito explícito, documentado en el propio README, es que estudiantes usen un agente de IA para inspeccionar el código, documentar reglas (`.agents/rules`) y un "memory bank", y practicar ingeniería de contexto para agentes — no es (por ahora) un producto financiero terminado para usuarios finales de negocio.
- Existen pruebas automatizadas en ambos lados: backend ([backend/tests/test_routes.py](backend/tests/test_routes.py), vía `pytest`/`TestClient`) cubriendo generación de datos, filtros y contratos de endpoints; frontend ([frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts)) cubriendo cálculo de KPIs, agregación mensual y formateo.

## Características Clave
Basadas en funcionalidad verificada en código:

- **Generación de datos financieros simulados** deterministas (semilla fija), con 360 movimientos/año, filtrables por fecha, categoría, tipo de operación y tipo de negocio (`filter_movements` en [routes.py](backend/app/routes.py)).
- **Dashboard visual de KPIs**: ingresos, egresos, utilidad neta y margen de utilidad (%), con formateo de moneda (USD) y porcentaje ([financial-utils.ts](frontend/src/lib/financial-utils.ts)).
- **Gráficos de series temporales**: ingresos vs. egresos mensuales y evolución del margen de utilidad, con tooltips personalizados y línea de referencia en 0%.
- **API de analítica avanzada (backend, no consumida aún por la UI)**: resumen agregado por día/semana/mes (`/summary`), top categorías por monto (`/categories/top`), comparación entre periodos (`/comparison`), detección de alertas por incremento de gastos sobre una línea base histórica (`/alerts`), y segmentación por tipo de negocio B2B/B2C (`/b2b`, `/b2c`).
- **Endpoint de descubrimiento de filtros** (`/api/metrics/facets`) que devuelve los valores posibles (tipos, categorías, rango de fechas) para construir filtros dinámicos, aunque no se usa en la UI actual.
- **Manejo de estados de UI**: loading (skeletons) y error (mensaje visible si falla la carga desde la API).
- **CORS abierto** (`allow_origins=["*"]`) en el backend, apto para desarrollo pero no para producción.
- **Documentación automática de API** vía Swagger/OpenAPI en `/docs` (FastAPI), confirmada en [README.md](README.md).
- **Entorno reproducible con Docker Compose** (`docker compose up --build`), con frontend en `5173` y backend en `8000`.
- **Cobertura de pruebas** en backend (pytest) y frontend (test de utilidades) verificable en el repositorio.

## Personas de Usuario
Con evidencia directa del código y la documentación (no se listan personas de negocio hipotéticas sin respaldo):

- **Estudiantes de bootcamp de 4Geeks Academy**: el README.md/README.es.md indica explícitamente que el flujo recomendado es hacer fork del repo, ejecutarlo y usarlo como base para practicar con agentes de IA. Es el único "usuario" documentado de forma explícita.
- **Agentes de IA / asistentes de código**: AGENTS.md instruye a los agentes a revisar `.agents/rules`, `.agents/skills` y `memory-bank` antes de actuar sobre el repo. El propio `memory-bank` (archivo, no carpeta) contiene un reconocimiento estructurado del código pensado para ser consumido por un agente.
- **Desarrolladores que consumen la API vía `/docs`**: el endpoint Swagger UI de FastAPI está expuesto y documentado como forma de explorar la API, lo que indica un consumidor técnico que interactúa directamente con los endpoints en lugar del dashboard visual.

No hay en el código evidencia de usuarios finales de negocio reales (p. ej. contadores, CFOs, dueños de PyMEs) usando datos reales; todos los datos son sintéticos y el propio README encuadra el proyecto como ejercicio educativo.

## Métricas de Éxito
No existen métricas de producto instrumentadas en el código (no hay analytics, telemetría ni tracking de uso). Las siguientes métricas se infieren directamente de los mecanismos de verificación presentes en el repositorio:

- **Cobertura y resultado de pruebas automatizadas**: los tests en [backend/tests/test_routes.py](backend/tests/test_routes.py) y [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts) pasando en CI/local es la señal de calidad objetiva disponible hoy.
- **Disponibilidad de los endpoints documentados**: `/health` responde `{"status": "ok"}`, usado como chequeo básico de que el backend está operativo.
- **Consistencia de contratos de datos**: los modelos `pydantic` (`FinancialMovement`, `MetricsSummaryItem`, `MetricsComparison`, `MetricsAlert`, etc.) actúan como contrato validable entre backend y frontend.
- **Determinismo de los datos mock** (semilla fija `42`): permite comparar resultados esperados en pruebas sin variabilidad, una métrica de fiabilidad para el propio ejercicio de desarrollo.

Como objetivo de mejora del proyecto (no como métrica ya alcanzada): conectar los endpoints avanzados ya implementados en el backend (`/summary`, `/categories/top`, `/comparison`, `/alerts`, `/b2b`, `/b2c`) a la interfaz, hoy sin consumidores en el frontend.
