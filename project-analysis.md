# Análisis del proyecto — Fase 1

## Alcance del producto

Este repositorio implementa un dashboard de ejemplo para métricas financieras, no un sistema conectado a cuentas bancarias. El backend genera movimientos simulados con semilla `42`; `generate_mock_movements` crea 30 movimientos por cada uno de doce meses y asigna años según `date.today()` en [backend/app/routes.py](backend/app/routes.py). El modelo `FinancialMovement` contiene fecha, importe, tipo de operación, categoría y tipo de negocio en el mismo archivo.

## Organización y entradas

- **Frontend:** [frontend/src/main.tsx](frontend/src/main.tsx) monta React y carga `App`. [frontend/src/App.tsx](frontend/src/App.tsx) solicita el endpoint, gestiona carga/error y distribuye los resultados a KPI y gráficos.
- **Cálculos y presentación:** [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts) calcula ingreso, egreso, ganancia, margen y agregados mensuales. Los componentes están bajo [frontend/src/components/dashboard](frontend/src/components/dashboard).
- **Backend:** [backend/app/main.py](backend/app/main.py) crea la aplicación FastAPI e incluye el router. [backend/app/routes.py](backend/app/routes.py) define modelos, generación de datos y rutas; `/health` responde el estado y `/api/metrics` devuelve movimientos con filtros opcionales.
- **Entorno:** [docker-compose.yml](docker-compose.yml) define `frontend` y `backend`; el Dockerfile del backend ejecuta Uvicorn y el del frontend Vite.

## Recorrido de datos

Al montar, `App` hace `fetch` a `/api/metrics`. El backend serializa sus objetos Pydantic como JSON; el frontend los tipa como `FinancialMovement`, calcula KPI y agrupación por mes en `financial-utils.ts`, y entrega esos valores a `KPIRow`, `IncomeOutcomeChart` y `ProfitPercentChart`. Los gráficos consumen `MonthlyDataPoint`; la pantalla no usa los otros endpoints de agregación del backend en este recorrido principal.

## Ejecución y verificación

La forma documentada de iniciar el entorno es `docker compose up --build`; Compose publica el frontend en 5173 y el backend en 8000. El proxy `/api` de Vite actualmente usa `host.docker.internal:8000`, con el alias `host-gateway` declarado en Compose; se adoptó tras observar que la conexión directa entre IPs de los contenedores agotaba el tiempo.

Los resultados comprobados están en [verification.md](verification.md): Vitest pasó 8 tests, Pytest 16, y build y lint del frontend pasaron. La ruta `/api/metrics` a través del puerto 5173 respondió HTTP 200 con 360 movimientos y los campos esperados. Esos resultados no eliminan las advertencias registradas allí sobre tamaño del bundle y deprecación Starlette/httpx. La usuaria confirmó por separado que ve importes y gráficos sin el error de carga; esa es una comprobación visual manual, no automatizada.

## Límites conocidos

`npm ci` desde el workspace local no puede escribir en `frontend/node_modules`, que es propiedad de `root:root` con modo `755`; no se ampliaron permisos. Las pruebas se ejecutaron con dependencias de los contenedores existentes. El diagnóstico inicial de red y la corrección por gateway también están documentados en [verification.md](verification.md).