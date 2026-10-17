# Regla de frontend: datos financieros y fechas

## Nombre

Frontend: contratos, cálculos y fechas

## Objetivo

Mantener los datos, las métricas y su presentación coherentes, comprobables y resistentes a diferencias de zona horaria.

## Alcance

Aplica a `frontend/src/**`, especialmente a `App.tsx`, `lib/financial-types.ts`, `lib/financial-utils.ts`, `lib/financial-utils.test.ts` y los componentes del dashboard.

## Justificación

- `App.tsx` obtiene `FinancialMovement[]` desde `/api/metrics`, calcula KPI y datos mensuales con utilidades y controla estados de carga y error.
- `financial-utils.ts` contiene funciones de cálculo puras; `financial-utils.test.ts` verifica totales, porcentajes y agregaciones mensuales.
- `FinancialMovement.create_date` se declara como fecha ISO sin hora. `computeMonthlyData` la parsea con `new Date(...)` y getters locales, lo que puede cambiar el mes en zonas horarias al oeste de UTC.
- `App.tsx` fija el período `2024 - Full Year`, mientras el backend genera datos relativos a la fecha actual. `lib/mock-data.ts` contiene datos estáticos que no usa el flujo actual del dashboard.

## Reglas

1. Mantén los tipos TypeScript compatibles con los modelos y respuestas de la API. Al cambiar un campo o valor permitido, actualiza ambos lados.
2. Implementa los cálculos y formateadores financieros en `src/lib` como funciones puras. No traslades lógica de dominio a componentes de presentación.
3. Trata `create_date` como fecha de calendario. Evita agrupar fechas sin hora mediante conversiones a tiempo local; incluye pruebas para el primer día del mes y límites de año.
4. Mantén el período presentado en pantalla derivado de los datos o del filtro activo; no fijes un período que contradiga las fechas cargadas.
5. Mantén explícitos los estados de carga y error al consultar la API, siguiendo el patrón de `App.tsx`.
6. No asumas que `src/lib/mock-data.ts` alimenta el dashboard. Si se conserva como fixture, deja claro su propósito y evita mantener fuentes mock ambiguas.
7. Al modificar cálculos o agregaciones, amplía las pruebas existentes de Vitest.

## Ejemplos

### Correcto: cálculo reutilizable y comprobado

Este patrón existe en `src/lib/financial-utils.test.ts`: se llama a la utilidad y se verifica el resultado financiero.

```ts
const metrics = computeKPIs(sampleMovements);

expect(metrics).toEqual({
  totalIncome: 1500,
  totalOutcome: 250,
  profit: 1250,
  profitPercent: (1250 / 1500) * 100,
});
```

### Incorrecto: agrupar una fecha de calendario con getters locales

Este patrón está actualmente en `src/lib/financial-utils.ts`; se documenta como riesgo, no como ejemplo a copiar.

```ts
const yearMonthKey = toYearMonthKey(new Date(m.create_date));
return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
```

## Guía específica del proyecto

- Los contratos del cliente están en `src/lib/financial-types.ts`; los cálculos y formatos, en `src/lib/financial-utils.ts`.
- Los tests de esas utilidades están en `src/lib/financial-utils.test.ts`. Los scripts comprobados son `npm test`, `npm run lint` y `npm run build`, ejecutados desde `frontend`.
- La pantalla consulta `/api/metrics` en `src/App.tsx`. Comprueba que el período que muestra coincida con la ventana de datos que genera el backend.
- Los README mencionan `frontend/.env.example`, pero ese archivo no está presente en el repositorio; no lo presentes como disponible sin añadirlo.