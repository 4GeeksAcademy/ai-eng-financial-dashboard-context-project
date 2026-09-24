# Estado actual

## Implementado en backend

`backend/app/routes.py` define estas rutas:

- `GET /health`
- `GET /api/metrics`
- `GET /api/metrics/facets`
- `GET /api/metrics/summary`
- `GET /api/metrics/categories/top`
- `GET /api/metrics/comparison`
- `GET /api/metrics/alerts`
- `GET /api/metrics/b2b`
- `GET /api/metrics/b2c`

Las rutas soportan, según corresponda, filtros por fecha, categoría, tipo de operación, tipo de negocio, agrupación por día/semana/mes, límite de categorías y umbral de alertas.

## Implementado en frontend

`frontend/src/App.tsx`:

- consulta la API de métricas;
- muestra carga y error de consulta;
- calcula KPI en cliente;
- calcula datos mensuales en cliente;
- muestra componentes de KPI y gráficos;
- deriva el período desde las fechas recibidas.

## Pruebas presentes

- Backend: `backend/tests/test_routes.py` contiene pruebas básicas para generación de datos, salud, filtros, segmentos B2B/B2C, facetas, resumen, categorías, comparación y alertas; esto no implica cobertura exhaustiva de todos los parámetros o casos límite.
- Frontend: `frontend/src/lib/financial-utils.test.ts` cubre KPI, porcentaje de beneficio, agrupación mensual y formateadores.

## Estado de validación

No hay resultados registrados en este memory-bank para `npm run lint`, `npm run build`, `npm test`, `pytest` ni `docker compose up --build`; por tanto, su estado documentado es **no verificado**. Los comandos están disponibles según la configuración del repositorio y se pueden validar así:

- Desde `frontend/`, con dependencias npm instaladas: `npm run lint`, `npm run build`, `npm test`.
- Desde `backend/`, con las dependencias de `backend/requirements.txt` instaladas: `pytest`.
- Desde la raíz, con Docker Engine disponible: `docker compose up --build`.

El estado de ejecución debe actualizarse con comando, directorio y resultado cuando se realice una validación.

## Decisiones y pendientes de stewardship

- **Decisión mantenida:** el dashboard calcula KPI y agregados mensuales en frontend; cualquier cambio de contrato debe revisar `frontend/src/lib/financial-utils.ts` y sus pruebas.
- **Decisión mantenida:** el backend sigue siendo mock e in-memory; no introducir persistencia implícita bajo una tarea de UI.
- **Pendiente de validación:** ejecutar las pruebas backend y una validación de Compose en un entorno con Docker Engine disponible.
- **Configuración existente:** `frontend/.env.example` documenta `VITE_API_BASE_URL` como override opcional; no debe tratarse como requisito del flujo Compose.

## No evidenciado actualmente

En los archivos revisados no hay evidencia de:

- base de datos o persistencia;
- autenticación o autorización;
- ingestión de datos financieros reales;
- despliegue productivo;
- pruebas end-to-end;
- observabilidad;
- pipeline CI/CD.

Estas son ausencias de evidencia, no afirmaciones sobre requisitos futuros.

## Fuentes de evidencia

- `backend/app/routes.py`
- `backend/tests/test_routes.py`
- `frontend/src/App.tsx`
- `frontend/src/lib/financial-utils.ts`
- `frontend/src/lib/financial-utils.test.ts`
- `frontend/package.json`
- `backend/requirements.txt`
- `docker-compose.yml`
- `.agents/rules/03-mock-data-boundary.md`
- `.agents/rules/05-validation-and-commits.md`
- `.agents/rules/06-validation-context.md`
