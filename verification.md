# Verificación de afirmaciones

Este documento recoge únicamente las cinco afirmaciones revisadas contra el código en el análisis anterior.

## 1. El frontend carga los movimientos desde `/api/metrics`

- **Afirmación principal:** La pantalla principal solicita los movimientos financieros desde `/api/metrics`.
- **Archivos revisados:** [frontend/src/App.tsx](frontend/src/App.tsx).
- **Resultado / confirmación:** **Confirmado.** `fetchFinancialData` hace `fetch` a `${API_BASE_URL}/api/metrics`; `API_BASE_URL` usa `VITE_API_BASE_URL` si está definido y, de lo contrario, queda vacío.
- **Corrección:** No es necesaria para esta afirmación.

## 2. El backend genera 360 movimientos de ejemplo

- **Afirmación principal:** Las rutas generan 360 movimientos con semilla `42` y fechas relativas a la fecha actual.
- **Archivos revisados:** [backend/app/routes.py](backend/app/routes.py).
- **Resultado / confirmación:** **Confirmado.** `generate_mock_movements(seed=42)` se invoca desde las rutas. La función crea 30 movimientos por cada uno de los 12 meses, usa `date.today()` para determinar el año, asigna días del 1 al 28 y ordena los resultados por fecha.
- **Corrección:** No es necesaria para el comportamiento de generación. Esta comprobación no pretende afirmar que ninguna otra parte del proyecto use persistencia.

## 3. El año del encabezado no está sincronizado con las fechas generadas

- **Afirmación principal:** El encabezado muestra `2024 - Full Year`, mientras que las fechas de los movimientos se calculan según la fecha actual.
- **Archivos revisados:** [frontend/src/App.tsx](frontend/src/App.tsx), [backend/app/routes.py](backend/app/routes.py).
- **Resultado / confirmación:** **Confirmado.** El título se pasa como texto fijo en `App.tsx`. El backend asigna los movimientos al año actual o al anterior según el mes y la fecha actual. Con fecha del sistema en octubre de 2026, el rango generado abarca octubre de 2025 a septiembre de 2026.
- **Corrección:** Sustituir la afirmación anterior de que el título y los datos coinciden por esta regla: el título es fijo en 2024 y el período de los datos depende de la fecha actual; no se garantiza que coincidan.

## 4. El proxy `/api` apunta al servicio backend de Compose

- **Afirmación principal:** Vite reenvía `/api` a `backend:8000`, y Compose define un servicio llamado `backend`.
- **Archivos revisados:** [frontend/vite.config.ts](frontend/vite.config.ts), [docker-compose.yml](docker-compose.yml).
- **Resultado / confirmación:** **Parcialmente correcto.** La configuración del proxy apunta a `http://backend:8000` y Compose declara el servicio con ese nombre. El código confirma la configuración, pero no demuestra que el nombre `backend` se resuelva al ejecutar Vite fuera de la red de Compose.
- **Corrección:** Precisar la afirmación: el proxy está configurado para llegar al servicio `backend` en el entorno Compose; fuera de Compose, la resolución de ese nombre no queda garantizada por estos archivos.

## 5. El frontend calcula beneficio y margen

- **Afirmación principal:** El frontend calcula el beneficio como ingresos menos egresos y el margen como beneficio dividido por ingresos.
- **Archivos revisados:** [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts).
- **Resultado / confirmación:** **Parcialmente correcto.** `computeKPIs` suma los importes de movimientos `income` y `outcome`, calcula `profit = totalIncome - totalOutcome` y `profitPercent = (profit / totalIncome) * 100`. Si no hay ingresos, asigna `0` al porcentaje. El código confirma estas fórmulas, pero no permite verificar si corresponden a las reglas de negocio esperadas.
- **Corrección:** La afirmación verificable es que el frontend implementa esas fórmulas. Para confirmar que son correctas según el negocio hace falta una especificación de requisitos.
