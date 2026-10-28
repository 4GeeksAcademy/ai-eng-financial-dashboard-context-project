# Hallazgos y reglas propuestas

Hallazgos basados en la revisión estática del repositorio. Las reglas son propuestas; no implican que los servicios se hayan probado en ejecución.

## Frontend

- **Período mostrado:** `App.tsx` pasa la etiqueta fija `2024 - Full Year`, mientras el backend genera fechas relativas al año actual. **Regla:** derivar el período visible de las fechas de los datos. Evidencia: `frontend/src/App.tsx`, `frontend/src/components/dashboard/dashboard-header.tsx`, `backend/app/routes.py`.
- **Cálculos y presentación:** los cálculos de KPIs y agregados mensuales están en utilidades separadas de los componentes. **Regla:** mantener las fórmulas en `financial-utils.ts` y probar los cambios con Vitest. Evidencia: `frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts`, `frontend/src/components/dashboard/kpi-row.tsx`.
- **Carga de datos:** `App.tsx` consulta `/api/metrics` y gestiona carga y error. **Regla:** preservar esos estados al cambiar la petición y cubrir el comportamiento de carga en pruebas. Evidencia: `frontend/src/App.tsx`.

## Backend

- **Contrato de API:** las rutas declaran modelos Pydantic y valores permitidos mediante `Literal`. **Regla:** mantener modelos y parámetros explícitos y actualizar las pruebas al cambiar una ruta. Evidencia: `backend/app/routes.py`, `backend/tests/test_routes.py`.
- **Pruebas de fechas:** la prueba de comparación usa marzo de 2025 y verifica la forma, no los valores; el generador calcula años respecto a la fecha actual. **Regla:** usar datos/fechas controlados y comprobar los resultados numéricos. Evidencia: `backend/tests/test_routes.py`, `backend/app/routes.py`.
- **Aleatoriedad:** `generate_mock_movements` llama a `random.seed`, que modifica el estado aleatorio global. **Regla:** aislar la semilla con una instancia local de `random.Random`. Evidencia: `backend/app/routes.py`.
- **Colecciones vacías:** `build_metrics_facets` indexa el primero y último elemento de la lista. **Regla:** definir el comportamiento para entrada vacía y probarlo. Evidencia: `backend/app/routes.py`, `backend/tests/test_routes.py`.
- **CORS:** la aplicación permite cualquier origen, método y encabezado junto con credenciales. **Regla:** establecer orígenes explícitos por entorno antes de usar esta configuración en producción. Evidencia: `backend/app/main.py`.

## Integración

- **Tipos compartidos:** campos como `operation_type` y `business_type` están representados en Python y TypeScript. **Regla:** al cambiar el contrato, actualizar ambos lados y sus pruebas. Evidencia: `backend/app/routes.py`, `frontend/src/lib/financial-types.ts`.
- **Ruta y proxy:** el frontend llama `/api/metrics`; Vite reenvía `/api` a `http://backend:8000`. **Regla:** coordinar cambios de prefijo, destino o URL base entre cliente, proxy y backend. Evidencia: `frontend/src/App.tsx`, `frontend/vite.config.ts`, `backend/app/routes.py`.
- **Arranque de servicios:** Compose declara `depends_on: backend`, pero no un healthcheck; FastAPI expone `/health`. **Regla:** no asumir que `depends_on` significa que la API ya está lista; contemplar readiness o reintento. Evidencia: `docker-compose.yml`, `backend/app/main.py`, `frontend/src/App.tsx`.