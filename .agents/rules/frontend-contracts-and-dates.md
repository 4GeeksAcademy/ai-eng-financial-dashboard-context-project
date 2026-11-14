# Contratos y fechas del frontend

**Nombre:** Contratos y fechas del frontend  
**Alcance:** Cambios en `frontend/src/` que consuman datos financieros, transformen métricas o muestren su período.

**Justificación:** `App.tsx` carga `GET /api/metrics` y calcula KPI y series mensuales en el cliente. También existe `mock-data.ts` con movimientos fijos de 2024, mientras la API genera datos dinámicos. Los modelos TypeScript y Pydantic representan el mismo contrato en dos lenguajes.

## Guía específica del proyecto

- Usa la API como fuente de datos de la pantalla. Si introduces un fallback o fixture, deja claro cuándo se usa y evita que contradiga los datos generados por `backend/app/routes.py`.
- Al cambiar campos o valores de `FinancialMovement`, alinea `frontend/src/lib/financial-types.ts` con los modelos y valores admitidos en `backend/app/routes.py`.
- Antes de calcular un indicador en frontend y backend, define cuál lado es autoritativo. Si ambos lo calculan, añade una prueba de equivalencia.
- No presentes un período fijo si los datos son dinámicos. La cabecera está en `frontend/src/components/dashboard/dashboard-header.tsx`; el generador del backend usa `date.today()`.
- Trata `create_date` como fecha de calendario. Agrupa el contrato ISO `YYYY-MM-DD` por su parte `YYYY-MM`, sin convertirlo a una fecha local; cubre el primer día del mes en `frontend/src/lib/financial-utils.test.ts`.

## Validación práctica

- `computeMonthlyData` tiene una prueba para `2026-03-01`; ejecuta `TZ=America/Los_Angeles npm test` desde `frontend/` para verificar el caso en una zona horaria UTC-negativa.

**Evidencia del repositorio:** `frontend/src/App.tsx`, `frontend/src/lib/mock-data.ts`, `frontend/src/lib/financial-types.ts`, `frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts`, `frontend/src/components/dashboard/dashboard-header.tsx` y `backend/app/routes.py`.