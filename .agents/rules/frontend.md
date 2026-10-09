# Reglas del front-end

## Objetivo

Mantener coherentes la interfaz, los cálculos financieros y la comunicación con la API.

## Justificación

La pantalla principal solicita movimientos a `/api/metrics`, calcula KPI y series mensuales mediante utilidades y entrega esos resultados a los componentes del dashboard. Vite configura el proxy hacia el backend. Referencias: [App.tsx](../../frontend/src/App.tsx), [financial-utils.ts](../../frontend/src/lib/financial-utils.ts), [vite.config.ts](../../frontend/vite.config.ts).

## Reglas

- Mantén los campos y valores de `FinancialMovement` alineados con el modelo del backend. Referencias: [financial-types.ts](../../frontend/src/lib/financial-types.ts), [routes.py](../../backend/app/routes.py).
- Solicita la API con la ruta relativa `/api`; no uses `http://backend:8000` como URL del navegador. Vite usa ese host como destino interno del proxy. Referencias: [App.tsx](../../frontend/src/App.tsx), [vite.config.ts](../../frontend/vite.config.ts).
- Mantén las fórmulas en `financial-utils.ts` y deja que los componentes presenten datos recibidos. Conserva las pruebas de las funciones al cambiar sus reglas. Referencias: [financial-utils.ts](../../frontend/src/lib/financial-utils.ts), [kpi-row.tsx](../../frontend/src/components/dashboard/kpi-row.tsx), [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts).
- Trata `create_date` como fecha de calendario al agrupar por mes. Evita depender inadvertidamente de la zona horaria local; la implementación actual convierte la fecha con `new Date()` y lee el año y mes locales. Referencia: [financial-utils.ts](../../frontend/src/lib/financial-utils.ts).
- No cambies a `mockMovements` ni mantengas un período fijo en el encabezado sin verificar que las fechas coincidan con los datos recibidos. El mock del front-end contiene fechas de 2024; el backend genera fechas relativas a la fecha actual y `App.tsx` fija el encabezado en 2024. Referencias: [mock-data.ts](../../frontend/src/lib/mock-data.ts), [App.tsx](../../frontend/src/App.tsx), [routes.py](../../backend/app/routes.py).
- Al cambiar la petición, los estados de carga/error o el proxy, verifica también el flujo de la pantalla hacia la API: las pruebas actuales del front-end cubren utilidades, no esa integración. Referencias: [App.tsx](../../frontend/src/App.tsx), [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts).

## Ejemplos

### Correcto

Usar el helper de API y los cálculos existentes, como en `App.tsx`:

```tsx
const movements = await fetchFinancialData();
const metrics = computeKPIs(movements);
const monthlyData = computeMonthlyData(movements);
```

### Incorrecto

Usar el hostname interno de Docker desde el navegador o anunciar un período fijo sin cotejarlo con los movimientos:

```tsx
const response = await fetch("http://backend:8000/api/metrics");
<DashboardHeader period="2024 - Full Year" />
```
