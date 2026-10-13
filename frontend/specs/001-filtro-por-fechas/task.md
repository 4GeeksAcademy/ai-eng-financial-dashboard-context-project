# Tareas: filtro por fechas

## Frontend

- [ ] Añadir el tipo de respuesta de facetas y consultar `/api/metrics/facets` para obtener el rango global disponible.
- [ ] Añadir los campos de inicio y fin en la parte superior del dashboard y mostrar el rango global recibido.
- [ ] Enviar a `/api/metrics` las fechas no vacías en formato `YYYY-MM-DD`; omitir los límites vacíos y ambos parámetros si no hay selección, y no consultar si el rango está invertido.
- [ ] Actualizar KPI y gráficos con los movimientos filtrados; mostrar los estados de rango inválido, período sin datos y error de API sin bloquear la interfaz, y evitar que el período del encabezado contradiga la selección.

## Verificación

- [ ] Comprobar que `/api/metrics/facets` devuelve `min_date` y `max_date`, y que `/api/metrics` filtra al enviar `start_date`, `end_date` o ambos.
- [ ] Probar en la interfaz ambas fechas, cada límite por separado, campos vacíos, rango invertido, período sin resultados y error de API; ejecutar `npm test` y `npm run build` del frontend.
- [ ] Verificar que la implementación cumple todos los criterios de aceptación de [spec.md](spec.md).