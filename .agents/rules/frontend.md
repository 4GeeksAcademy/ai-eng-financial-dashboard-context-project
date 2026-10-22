# Reglas de frontend

## Objetivo
Mantener el dashboard coherente con el contrato de la API, aislar los cálculos financieros y preservar el comportamiento de carga, fechas y visualización.

## Justificación
- `frontend/src/App.tsx` carga `/api/metrics`, mantiene estados de carga/error y fija actualmente el título `2024 - Full Year`.
- `frontend/src/lib/financial-types.ts` replica los campos y valores permitidos por el backend.
- `frontend/src/lib/financial-utils.ts` calcula KPI y agregados mensuales; `financial-utils.test.ts` cubre esos cálculos.
- `frontend/src/components/dashboard/kpi-row.tsx` y los componentes de gráficos reciben datos por props y muestran esqueletos durante la carga.
- `frontend/vite.config.ts` enruta `/api` a `backend:8000`; `docker-compose.yml` define el servicio `backend`.

## Reglas
1. Centraliza la petición principal en `App.tsx` y conserva `/api/metrics` como ruta. Usa `VITE_API_BASE_URL` solo como prefijo opcional; evita URL de backend codificadas en componentes visuales.
2. Mantén tipos, campos y valores de TypeScript alineados con el JSON definido por el backend. TypeScript no valida automáticamente el JSON recibido en ejecución.
3. Implementa KPI y agregaciones en `financial-utils.ts`, no dupliques su lógica en los componentes. El comportamiento actual es beneficio = ingresos - egresos y margen = beneficio / ingresos, o `0` si los ingresos son cero. Cambia estas fórmulas solo con requisitos de negocio que lo justifiquen.
4. Al agrupar fechas ISO `YYYY-MM-DD`, evita que el parseo como fecha/hora local cambie el año o mes. La implementación actual usa `new Date(m.create_date)` y getters locales; una alternativa es extraer año y mes directamente del string o usar UTC de forma consistente.
5. No presentes un período fijo como si describiera los datos dinámicos. El encabezado actual dice `2024 - Full Year`, mientras el backend genera fechas según la fecha actual; sincroniza el título con el rango real o indícalo como fijo.
6. Conserva los estados de carga y error de `App.tsx` y las props tipadas de los componentes del dashboard. Actualiza las pruebas de utilidades cuando cambies cálculos o agregaciones.
7. Al tocar la integración, conserva el proxy `/api` hacia `http://backend:8000` para Compose. Fuera de Compose, no presupongas que el nombre DNS `backend` se resuelve.

## Ejemplos correctos e incorrectos

### Correcto: ruta centralizada y prefijo configurable
Código actual de `frontend/src/App.tsx`:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const response = await fetch(`${API_BASE_URL}/api/metrics`);
```

### Incorrecto: acoplar un componente a localhost
Anti-ejemplo: añadir `fetch("http://localhost:8000/api/metrics")` dentro de un gráfico. Evita el proxy configurado en `frontend/vite.config.ts` y falla en entornos donde `localhost` no es el backend.

### Correcto: usar el cálculo compartido
Código actual de `frontend/src/lib/financial-utils.ts`:

```ts
const profit = totalIncome - totalOutcome;
const profitPercent = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
```

### Incorrecto: desplazar una fecha ISO usando getters locales
Patrón actual que debe revisarse en `frontend/src/lib/financial-utils.ts`:

```ts
const yearMonthKey = toYearMonthKey(new Date(m.create_date));
```

En zonas horarias al oeste de UTC, una fecha del primer día del mes puede caer en el mes anterior al leerse con getters locales. Agrupa por los componentes de fecha ISO o usa exclusivamente getters UTC.

### Incorrecto: afirmar un período que no se deriva de los datos
Código actual de `frontend/src/App.tsx`:

```tsx
<DashboardHeader period="2024 - Full Year" />
```

No reutilices ese título como rango real cuando las fechas provienen del generador dinámico del backend.
