# Reglas de frontend

## Objetivo
Mantener correctos los valores y periodos que la interfaz calcula y presenta, incluidos los casos de error al consultar la API.

## Justificación
`frontend/src/lib/financial-utils.ts` convierte fechas recibidas como `YYYY-MM-DD` a `Date` local para agruparlas por mes. En algunas zonas horarias esto puede mover el primer día del mes al mes anterior. Sus pruebas actuales en `frontend/src/lib/financial-utils.test.ts` no cubren esa zona horaria ni ese límite. Además, `frontend/src/App.tsx` fija el encabezado en `2024 - Full Year` aunque el backend genera fechas según el año actual, y muestra un error pero no reintenta la petición si la API aún no está disponible.

## Reglas
- Trata `YYYY-MM-DD` como fecha de calendario; no permitas que la zona horaria del navegador cambie el día o el mes al agrupar.
- Obtén el periodo mostrado de los datos o filtros activos; no lo fijes como texto estático.
- Conserva los estados de carga y error. Si el backend aún no está listo, permite reintentar o recuperarse sin recargar manualmente la página.
- Añade pruebas para el primer día del mes y para errores o reintentos de la carga de datos.
- Mantén los cálculos financieros reutilizables en `frontend/src/lib/` y la presentación en componentes.

## Ejemplo correcto
Agrupa una fecha ISO usando su parte de año y mes, sin convertirla a la zona horaria local:

```ts
const yearMonthKey = movement.create_date.slice(0, 7);
```

## Ejemplo incorrecto
Esta conversión existente puede interpretar una fecha sin hora como UTC y desplazarla al día anterior en algunas zonas horarias:

```ts
const yearMonthKey = toYearMonthKey(new Date(m.create_date));
```
