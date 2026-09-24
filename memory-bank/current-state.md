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

Los comandos disponibles están declarados, pero este memory-bank no afirma que hayan pasado en cada entorno. Para validarlos:

- Desde `frontend/`: `npm run lint`, `npm run build`, `npm test`.
- Desde `backend/`: `pytest`.
- Desde la raíz: `docker compose up --build`.

El estado de ejecución debe actualizarse con comando, directorio y resultado cuando se realice una validación.

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
