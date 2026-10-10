# Product Overview — Financial Metrics Dashboard

**Alcance de esta nota:** snapshot del repositorio revisado el 2026-10-08, después del commit `8813c3b` (`Fase 3 — Implementar y probar reglas del repositorio`). Los hechos de implementación se vinculan a rutas del repo; las prioridades son recomendaciones, no un roadmap aprobado.

## Producto

Dashboard web para consultar un resumen ejecutivo de métricas financieras: ingresos, gastos (denominados `outcome` en el código), beneficio, margen de beneficio y tendencias mensuales. El flujo de pantalla está compuesto en `frontend/src/App.tsx`, con tarjetas y gráficas en `frontend/src/components/dashboard/`.

La UI obtiene movimientos desde `GET /api/metrics`, calcula KPI y agregaciones mensuales en el cliente (`frontend/src/lib/financial-utils.ts`) y presenta los resultados. El backend genera movimientos sintéticos con `generate_mock_movements(seed=42)` en `backend/app/routes.py`; el código revisado no muestra persistencia ni integración con una fuente financiera externa.

## Stack tecnológico

### Frontend

- **Lenguajes:** TypeScript y TSX (configuración en `frontend/tsconfig*.json`).
- **Framework/UI:** React 19 (`frontend/package.json`); Vite 8 para desarrollo y build.
- **Estilos:** Tailwind CSS 4 mediante `@tailwindcss/vite`; utilidades de clases `clsx` y `tailwind-merge`; componentes con variantes mediante `class-variance-authority`.
- **Visualización:** Recharts; iconografía con Lucide React.
- **Calidad:** Vitest para pruebas y ESLint para lint.
- **Puntos de entrada:** `frontend/index.html` → `frontend/src/main.tsx` → `frontend/src/App.tsx`.

### Backend

- **Lenguaje:** Python (imagen `python:3.13-slim` en `backend/Dockerfile`).
- **Framework/API:** FastAPI con Uvicorn; modelos de respuesta/request con Pydantic.
- **Pruebas:** pytest, `fastapi.testclient.TestClient` y httpx.
- **Herramienta de depuración:** debugpy, configurado en el comando del `backend/Dockerfile`.
- **Entry point:** `app.main:app`; `backend/app/main.py` registra el router de `backend/app/routes.py`.

### Ejecución e integración

- Docker Compose define los servicios `frontend` y `backend` (`docker-compose.yml`).
- Vite reenvía `/api` al servicio `http://backend:8000` (`frontend/vite.config.ts`).
- En la configuración local documentada, `docker compose up --build` expone frontend en `localhost:5173`, API en `localhost:8000` y documentación OpenAPI en `/docs`.

## Estado actual

### Funciona según el código y las validaciones recientes

- Dashboard con tarjetas de ingresos, gastos, beneficio y margen, y dos gráficas mensuales (`frontend/src/components/dashboard/`).
- Carga de movimientos desde `/api/metrics`, estados de carga/error y cálculo de métricas en frontend (`frontend/src/App.tsx`).
- API con health check, movimientos y endpoints para facets, summary, top categories, comparison, alerts y segmentos B2B/B2C (`backend/app/routes.py`).
- `/api/metrics` admite filtros por fechas, categoría, tipo de operación y `business_type`; se añadió prueba del filtro B2C y del rechazo de un valor de negocio inválido (`backend/tests/test_routes.py`).
- La etiqueta temporal del dashboard deriva del primer y último mes agregado recibido (`frontend/src/App.tsx`).
- Validaciones ejecutadas durante la Fase 3: backend **17 pruebas pasadas**; frontend **5 pruebas pasadas**, `npm run build` y `npm run lint` completados. El build informó que un chunk minificado supera 500 kB. Estas cifras reflejan esa ejecución, no garantizan el estado de futuras modificaciones.

### Gaps y riesgos observados

- **Datos de demostración:** los movimientos se generan en memoria por petición, no se encontró persistencia o integración con datos reales en el código revisado (`backend/app/routes.py`).
- **Integración incompleta de API:** el dashboard consume `/api/metrics`; los demás endpoints existen, pero no están conectados a controles o vistas del frontend (`frontend/src/App.tsx`).
- **Filtros sin UI:** la API acepta filtros, pero la pantalla actual no ofrece controles para seleccionarlos (`frontend/src/App.tsx`).
- **CORS amplio:** `backend/app/main.py` configura comodines para orígenes, métodos y headers junto con credenciales; antes de un despliegue público hace falta limitarlo por entorno.
- **Aleatoriedad global:** `generate_mock_movements(seed=42)` invoca `random.seed`, que muta el estado global del módulo `random` (`backend/app/routes.py`).
- **Bundle frontend:** el build pasó con una advertencia de tamaño de chunk superior a 500 kB; conviene revisar división de código si el tamaño afecta carga o rendimiento.
- **Dependencias frontend:** durante `npm ci` la auditoría automática reportó 13 vulnerabilidades (1 low, 5 moderate y 7 high). Revisar con `npm audit` antes de actualizar, confirmar alcance y compatibilidad.
- **Fuera de Docker:** el proxy apunta al hostname `backend`; para ejecución del frontend directamente en el host hay que configurar `VITE_API_BASE_URL` o ajustar el proxy (`frontend/.env.example`, `frontend/vite.config.ts`).

## Prioridades sugeridas

1. **Definir la fuente y ciclo de vida de los datos:** decidir si el producto debe seguir como demo sintética o requiere persistencia/conexión real; documentar contrato y configuración antes de implementar.
2. **Conectar las capacidades API a la UI:** priorizar filtros de periodo, categoría, operación y segmento, y decidir qué vistas usarán summary, comparación, categorías y alertas.
3. **Asegurar configuración por entorno:** restringir CORS para despliegues, documentar URLs frontend/backend y validar el flujo de proxy en local y Compose.
4. **Mejorar robustez de datos:** cambiar generación aleatoria global por un generador local y cubrir semántica de fechas/rangos, manteniendo la etiqueta del periodo derivada de los datos.
5. **Revisar rendimiento y cadena de dependencias:** analizar el chunk grande y evaluar los hallazgos de `npm audit` con una actualización controlada.
6. **Mantener validación transversal:** para cambios API/UI ejecutar backend (`cd backend && pytest`) y frontend (`cd frontend && npm test`, `npm run build`, `npm run lint`); revisar `git status`, `git diff` y staging antes de confirmar.

## Fuentes principales

- `README.md`, `README.es.md`
- `docker-compose.yml`
- `frontend/package.json`, `frontend/vite.config.ts`, `frontend/src/App.tsx`
- `frontend/src/lib/financial-types.ts`, `frontend/src/lib/financial-utils.ts`
- `frontend/src/components/dashboard/`
- `backend/requirements.txt`, `backend/Dockerfile`, `backend/app/main.py`, `backend/app/routes.py`
- `backend/tests/test_routes.py`, `frontend/src/lib/financial-utils.test.ts`
- `.agents/rules/`
