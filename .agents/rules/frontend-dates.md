# Regla: frontend-dates

**Alcance:** `frontend/src/lib/financial-utils.ts`, `frontend/src/App.tsx` y todo código que lea `create_date`.
**Justificación:** F7, F14 y F15. `create_date` llega como `YYYY-MM-DD` (`financial-types.ts:6`), pero `new Date("YYYY-MM-DD")` lo interpreta en UTC y `getMonth()` lo lee en hora local: en zonas de América los movimientos del día 1 caen en el mes anterior.

## Qué hacer

- Saca el año y el mes del texto: `create_date.slice(0, 7)` da `YYYY-MM`. No uses `new Date(create_date)` para agrupar ni comparar días.
- Para mostrar un mes, construye la fecha con componentes locales, como hace `formatMonthYearLabel` (`new Date(year, month, 1)`).
- No escribas años en textos de la interfaz: el periodo real es la ventana móvil de 12 meses de los datos (`backend-data.md`).
- La agregación mensual vive en `financial-utils.ts`. No crees una tercera versión; si hace falta otra agregación, valora llamar a `/api/metrics/summary`.

## Qué no hacer

- No uses `toISOString()` ni `Date.UTC` para construir claves de mes.
- No dejes `2024 - Full Year` en `App.tsx:49` ni en `dashboard-header.tsx:7` al tocar la cabecera.

## Cómo comprobarlo

Al tocar fechas ejecuta `npm test` normal y también `TZ=America/New_York npm test`. Con `UTC` o `Europe/Madrid` el fallo antiguo no se ve (el test del día 1 pasaba con el código defectuoso); solo se ve en una zona de América.

`grep -rn "new Date(" frontend/src` solo debe mostrar la construcción con componentes locales de `formatMonthYearLabel` y archivos de test.
