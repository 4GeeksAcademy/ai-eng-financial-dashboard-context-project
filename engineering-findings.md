# Hallazgos y reglas propuestas

Reglas derivadas de la revisión del código existente. Las referencias muestran qué comportamiento sustenta cada regla; no sustituyen requisitos de negocio que aún no estén documentados.

## Frontend

### FE-1. Centralizar la carga principal de movimientos

- **Regla:** La pantalla debe obtener los movimientos mediante `/api/metrics` y usar `VITE_API_BASE_URL` solo como prefijo configurable, en lugar de dispersar URLs de API por los componentes.
- **Hallazgo:** `fetchFinancialData` construye esa URL y `App` coordina la carga y el estado de la pantalla.
- **Archivos que la justifican:** [frontend/src/App.tsx](frontend/src/App.tsx).

### FE-2. Mantener los cálculos financieros en utilidades compartidas

- **Regla:** Calcular KPI y agregados mediante las funciones de `financial-utils.ts`; no replicar sus fórmulas dentro de componentes visuales. Cambiar la semántica financiera solo con un requisito de negocio que lo respalde.
- **Hallazgo:** `computeKPIs` calcula beneficio como ingresos menos egresos; el margen es beneficio dividido por ingresos, o cero si los ingresos son cero. `computeMonthlyData` realiza la agregación mensual.
- **Archivos que la justifican:** [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts), [frontend/src/components/dashboard/kpi-row.tsx](frontend/src/components/dashboard/kpi-row.tsx).

### FE-3. Probar cambios en los cálculos

- **Regla:** Al modificar KPI o agregaciones mensuales, actualizar las pruebas unitarias de esas funciones y cubrir sus casos límite relevantes.
- **Hallazgo:** Ya hay pruebas para los totales, el caso sin ingresos y la agregación cronológica por mes.
- **Archivos que la justifican:** [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts), [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts).

### FE-4. No presentar un período fijo como período real de los datos

- **Regla:** El título del dashboard debe corresponder al intervalo mostrado o identificarse claramente como texto fijo; si cambia la generación de fechas, revisar también el período presentado.
- **Hallazgo:** El encabezado está fijado en `2024 - Full Year`, mientras las fechas del backend dependen de la fecha actual.
- **Archivos que la justifican:** [frontend/src/App.tsx](frontend/src/App.tsx), [backend/app/routes.py](backend/app/routes.py).

## Backend

### BE-1. Preservar el contrato de cada respuesta

- **Regla:** Definir y mantener modelos de respuesta para las rutas y conservar los nombres y tipos de campos publicados por la API.
- **Hallazgo:** Las rutas usan modelos Pydantic, como `FinancialMovement`, mediante `response_model`.
- **Archivos que la justifican:** [backend/app/routes.py](backend/app/routes.py).

### BE-2. Tratar los movimientos generados como datos de ejemplo dinámicos

- **Regla:** No describir los datos como persistidos ni como pertenecientes siempre a un año fijo. Si cambia el generador o su semilla, actualizar las pruebas y la descripción del período.
- **Hallazgo:** Las rutas llaman al generador con semilla `42`; se crean 30 movimientos por mes durante 12 meses y el año asignado depende de `date.today()`.
- **Archivos que la justifican:** [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py).

### BE-3. Reutilizar las operaciones comunes de filtrado y orden

- **Regla:** Las rutas de métricas deben reutilizar los helpers compartidos de filtrado y orden cronológico cuando aplique, en vez de implementar variantes incompatibles.
- **Hallazgo:** `filter_movements` y `ensure_chronological_order` centralizan ese comportamiento y son usados por varias rutas.
- **Archivos que la justifican:** [backend/app/routes.py](backend/app/routes.py).

### BE-4. Mantener las pruebas de rutas junto a los cambios de API

- **Regla:** Al cambiar parámetros, filtros o forma de las respuestas, actualizar las pruebas de rutas correspondientes.
- **Hallazgo:** Las pruebas existentes comprueban salud, filtros, tipos B2B/B2C y resúmenes.
- **Archivos que la justifican:** [backend/tests/test_routes.py](backend/tests/test_routes.py), [backend/app/routes.py](backend/app/routes.py).

## Integración

### INT-1. Sincronizar los tipos del frontend con los modelos del backend

- **Regla:** Cualquier cambio a nombres de campos o valores admitidos por la API debe actualizarse en backend y frontend en el mismo cambio.
- **Hallazgo:** El backend define campos como `create_date`, `operation_type` y `business_type`; los tipos TypeScript los representan con esos mismos nombres y valores.
- **Archivos que la justifican:** [backend/app/routes.py](backend/app/routes.py), [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts).

### INT-2. Mantener alineados el proxy de Vite y el servicio de Compose

- **Regla:** El destino `/api` configurado por Vite debe coincidir con el nombre y puerto del servicio backend en Compose. Documentar cualquier modo de ejecución que use otra resolución de host.
- **Hallazgo:** El proxy apunta a `http://backend:8000` y Compose declara el servicio `backend`; fuera de Compose, el código no garantiza que ese nombre se resuelva.
- **Archivos que la justifican:** [frontend/vite.config.ts](frontend/vite.config.ts), [docker-compose.yml](docker-compose.yml), [README.es.md](README.es.md).

### INT-3. Alinear el período de presentación con el período de datos

- **Regla:** Si cambia cómo el backend asigna fechas, comprobar y actualizar cualquier etiqueta de período fija en el frontend para que no contradiga los datos.
- **Hallazgo:** El frontend presenta un título fijo de 2024, pero el backend genera fechas según la fecha actual.
- **Archivos que la justifican:** [frontend/src/App.tsx](frontend/src/App.tsx), [backend/app/routes.py](backend/app/routes.py).
