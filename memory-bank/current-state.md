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

La validación registrada en esta revisión distingue host y Compose:

- Desde `frontend/`, con dependencias npm instaladas: `npm run lint`, `npm run build`, `npm test`.
- En el host, desde `backend/`, `pytest` no estuvo disponible (`CommandNotFoundException`).
- Desde la raíz, con Docker Engine disponible, `docker compose up --build` construyó las imágenes y arrancó frontend y backend; se detuvo después de confirmar ambos servicios activos.
- Desde la raíz, `docker compose run --rm backend pytest` ejecutó 15 pruebas: **15 passed**, con 1 warning de deprecación de Starlette/httpx.
- Con Compose activo, un smoke test HTTP devolvió `200` para `http://localhost:8000/health`, `200` y 360 registros para `http://localhost:8000/api/metrics`, y `200` para `http://localhost:5173/`.

El estado de ejecución debe actualizarse con comando, directorio, contexto host/Compose y resultado cuando se realice una validación. El frontend quedó validado con `npm run lint`, `npm run build` y `npm test`: lint correcto, build correcto y 5 tests pasaron; el build emitió solo el warning de chunk mayor a 500 kB.

## Decisiones y pendientes de stewardship

- **Decisión mantenida:** el dashboard calcula KPI y agregados mensuales en frontend; cualquier cambio de contrato debe revisar `frontend/src/lib/financial-utils.ts` y sus pruebas.
- **Decisión mantenida:** el backend sigue siendo mock e in-memory; no introducir persistencia implícita bajo una tarea de UI.
- **Pendiente de validación:** no hay una validación E2E registrada que compruebe navegador → proxy → API; la validación actual cubre build, tests unitarios/backend y arranque de Compose.
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
