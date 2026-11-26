# Justificación

El encabezado de [frontend/src/App.tsx](../../frontend/src/App.tsx) fija el período `2024 - Full Year`. En cambio, [backend/app/routes.py](../../backend/app/routes.py) genera movimientos para los doce meses completos anteriores al mes actual: usa `date.today()` para determinar los años. La etiqueta puede, por tanto, no describir los datos que recibe la interfaz.

La generación usa una semilla fija para que los movimientos sean reproducibles para una fecha dada, pero el rango temporal cambia con la fecha de ejecución. La ruta `GET /api/metrics/facets` ya expone `min_date` y `max_date` para describir ese rango.