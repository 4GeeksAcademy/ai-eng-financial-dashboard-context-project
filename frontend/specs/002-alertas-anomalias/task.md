# Tareas: alertas de anomalías

## Backend

- [ ] Calcular cada alerta con la media de los tres períodos anteriores, conservando el contexto previo al rango seleccionado y devolviendo alertas solo dentro de ese rango.
- [ ] Restringir `threshold` al intervalo `0.01–1.0` y establecer `0.3` como valor predeterminado.
- [ ] Añadir pruebas de ruta para la media de tres períodos, el valor predeterminado y los límites del umbral, y el respeto del rango de fechas.

## Frontend

- [ ] Añadir el tipo de alerta y conectar `App.tsx` con `GET /api/metrics/alerts`, enviando el umbral y las fechas activas.
- [ ] Añadir el control de umbral y una tabla bajo los gráficos con período, gasto registrado, media previa e incremento porcentual; mostrar un mensaje explícito cuando no haya alertas.

## Verificación

- [ ] Ejecutar `pytest -q` y comprobar la media de tres períodos, el valor predeterminado y los límites del umbral, y el filtro de fechas.
- [ ] Ejecutar `npm test` y `npm run build`; comprobar en la interfaz el umbral, las fechas activas, el porcentaje y el estado vacío.
- [ ] Verificar que la implementación cumple todos los criterios de aceptación de [spec.md](spec.md).