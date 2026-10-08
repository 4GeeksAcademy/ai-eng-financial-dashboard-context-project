# Reglas propuestas

Estas reglas se basan en una revisión estática del código; los comportamientos señalados no se validaron en ejecución.

## Frontend

- **Conservar el mes de las fechas:** interpreta las fechas `YYYY-MM-DD` como fechas de calendario y evita que la zona horaria del navegador las desplace al mes anterior. Incluye una prueba para el primer día del mes. Justifican esta regla `frontend/src/lib/financial-utils.ts` y `frontend/src/lib/financial-utils.test.ts`.
- **Mostrar el periodo real:** deriva el periodo del encabezado de los datos presentados; no lo fijes en el código. Así se evita etiquetar datos con un año incorrecto. Justifican esta regla `frontend/src/App.tsx` y `backend/app/routes.py`.
- **Tratar fallos temporales de la API:** conserva los estados de carga y error, y permite reintentar si el backend aún no responde. Justifican esta regla `frontend/src/App.tsx` y `docker-compose.yml`.

## Backend

- **Usar aleatoriedad local:** para generar datos reproducibles, crea un generador aleatorio local con semilla; evita cambiar el estado aleatorio global con `random.seed()`. Justifican esta regla `backend/app/routes.py` y `backend/tests/test_routes.py`.
- **Preservar y probar el contrato de la API:** conserva modelos, valores permitidos y forma de las respuestas; al cambiar filtros o rutas, actualiza las pruebas correspondientes. Justifican esta regla `backend/app/routes.py` y `backend/tests/test_routes.py`.

## Integración

- **Mantener alineado el contrato entre frontend y backend:** coordina nombres de campos, valores y rutas; el frontend solicita `/api/metrics` y Vite lo reenvía al servicio backend. Justifican esta regla `frontend/src/App.tsx`, `frontend/src/lib/financial-types.ts`, `frontend/vite.config.ts` y `backend/app/routes.py`.
- **No asumir que el backend está listo por el orden de inicio:** `depends_on` ordena los contenedores, pero no garantiza que la API responda. Añade una comprobación de disponibilidad o conserva reintentos en el frontend. Justifican esta regla `docker-compose.yml` y `frontend/src/App.tsx`.
- **Mantener sincronizada la guía de ejecución:** al cambiar puertos, proxy o variables de entorno, actualiza la documentación correspondiente. Justifican esta regla `README.es.md`, `docker-compose.yml` y `frontend/vite.config.ts`.
