# Regla: Frontend del dashboard (React + Vite)

**Alcance:** `frontend/src/**`, `frontend/.env.example`.
**Origen:** R-5, R-6, R-7, R-10 · hallazgos H-4, H-10, H-11, H-12, H-13, H-16.

## Por qué
La única lógica con tests es `frontend/src/lib/financial-utils.ts`. Los componentes no tienen tests, así
que cualquier cálculo que viva en un `.tsx` queda sin red. Las fechas y periodos ya causaron dos bugs (H-10, H-11).

## Qué hacer
1. **Cálculos en `lib/`:** agregaciones, derivaciones y formateo van como funciones puras exportadas en
   `frontend/src/lib/financial-utils.ts`, con test en `financial-utils.test.ts`. Los componentes de
   `components/dashboard/` reciben datos ya calculados por props.
2. **Fechas de la API (`"YYYY-MM-DD"`) son fechas de calendario:**
   - ✅ Extraer año/mes del string: `isoDate.slice(0, 7)` → `"2026-01"`.
   - ❌ `new Date(isoDate).getMonth()` — se interpreta como UTC y cambia de mes en zonas UTC−.
   - Para mostrar, construir con componentes locales: `new Date(year, month - 1, 1)`.
   - Todo test de fechas incluye un caso con día `01`.
3. **Nada hardcodeado que dependa de los datos:** periodos, años o rangos se derivan de los movimientos
   (o de `/api/metrics/facets`). El mock del backend se desplaza con `date.today()`.
4. **Estados:** todo bloque que dependa de la API maneja `loading`, `error` (`role="alert"`) y vacío,
   como hace `App.tsx`. Mantener los atributos ARIA existentes (ver skill `accessibility`).
5. **API base URL:** en local usar rutas relativas `/api/...` (proxy de Vite). `VITE_API_BASE_URL` solo con
   origen completo (`http://host:8000`), nunca `backend:`.
6. **No importar** `frontend/src/lib/mock-data.ts` en código de producción (no se usa; es fixture).

## Comprobar
```bash
docker compose exec frontend npm test
docker compose exec frontend npm run build
docker compose exec -e TZ=America/Bogota frontend npm test   # obligatorio si tocas fechas
```

## Ejemplos
- ✅ `computeMonthlyData` agrupa con `m.create_date.slice(0, 7)`; test con `"2026-01-01"`.
- ✅ `<DashboardHeader period={formatPeriodRange(movements)} />`.
- ❌ `<DashboardHeader period="2024 - Full Year" />`.
- ❌ Calcular `profitPercent` dentro de `kpi-row.tsx`.
