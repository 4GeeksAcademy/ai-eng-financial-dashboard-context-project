# System Patterns

## Patron arquitectonico general

El sistema sigue un patron cliente-servidor con SPA en frontend y API REST en backend.

- Frontend: composicion de componentes React orientados a presentacion.
- Backend: rutas FastAPI orientadas a recursos y consultas analiticas.
- Integracion: fetch HTTP desde frontend hacia /api, con proxy en Vite durante desarrollo.

## Patrones de diseño aplicados

## 1. Separation of Concerns

- Logica de negocio de calculo en utilidades puras del frontend.
- Componentes de UI enfocados en renderizado y estado de presentacion.
- Logica de agregacion/filtrado en backend separada en funciones auxiliares.

Ejemplos:
- computeKPIs y computeMonthlyData viven fuera de componentes.
- filter_movements, summarize_movements, build_top_categories se implementan como funciones de dominio reutilizables.

## 2. Typed Contracts

- Backend declara modelos de entrada/salida con Pydantic y response_model en endpoints.
- Frontend define interfaces de dominio para movimientos y estructuras de KPIs.

Efecto:
- Contratos JSON estables y mas predecibles para consumidores.

## 3. Deterministic Mock Data Pattern

- Backend usa generacion mock con seed fija por request para asegurar resultados reproducibles.
- Esto facilita testing y demos, pero no reemplaza persistencia real.

## 4. Progressive Rendering Pattern

- UI arranca en loading, luego muestra contenido o error.
- Skeletons para evitar pantalla vacia durante carga.

## Estructura de componentes (frontend)

- App orquesta fetch, estado global de pantalla y composicion del dashboard.
- Componentes dashboard:
  - DashboardHeader: encabezado del panel y periodo visible.
  - KPIRow y KPICard: tarjetas KPI con variantes visuales.
  - IncomeOutcomeChart: tendencia mensual ingresos vs egresos.
  - ProfitPercentChart: tendencia mensual de margen.
- Componentes UI base:
  - Card
  - Skeleton

## Flujo de datos

1. App ejecuta fetch al endpoint de metricas.
2. Si response ok, transforma datos a:
   - KPIMetrics
   - MonthlyDataPoint[]
3. Pasa resultados por props a KPIRow y charts.
4. Si falla la carga, renderiza mensaje de error.

Observacion importante:
- La UI no persiste ni cachea resultados entre sesiones.
- No hay state manager global externo; se usa estado local con hooks.

## Integracion backend-frontend

## Integracion actual activa

- Endpoint consumido por UI: GET /api/metrics.
- Compatibilidad de tipos entre payload backend y FinancialMovement frontend.
- Proxy Vite evita configurar CORS de navegador para desarrollo local con Docker.

## Endpoints disponibles pero no integrados en UI

- GET /api/metrics/facets
- GET /api/metrics/summary
- GET /api/metrics/categories/top
- GET /api/metrics/comparison
- GET /api/metrics/alerts
- GET /api/metrics/b2b
- GET /api/metrics/b2c

## Patrones de testing

- Backend: pruebas de endpoints y funciones auxiliares.
- Frontend: pruebas unitarias de utilidades puras de calculo y formato.

Cobertura funcional comprobada en tests:
- Orden cronologico de datos.
- Filtros por fecha, categoria, tipo de operacion y tipo de negocio.
- Estructura de respuestas analiticas.
- Casos de division por cero en profitPercent.

## Antipatrones o patrones incompletos detectados

- Duplicacion de endpoints b2b y b2c cuando el modelo por filtro ya existe.
- Manejo de error frontend sin logging del error real capturado.
- CORS muy abierto para entorno no productivo.
- Uso de float para valores de dinero en backend.
