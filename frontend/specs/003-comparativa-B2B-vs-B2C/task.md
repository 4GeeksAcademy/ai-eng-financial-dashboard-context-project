# Tareas: comparativa B2B vs B2C

## Backend

- [ ] Confirmar los contratos de ranking, resumen y facetas en `/docs`; resolver la expectativa de cinco categorías sin inventar categorías que no devuelve la API.
- [ ] Ampliar las facetas para filtrar categorías por `business_type` y `operation_type=income`, conservando la respuesta global y contemplando grupos sin resultados.
- [ ] Añadir pruebas de ruta para facetas por grupo y verificar ranking de ingresos, orden, límite de cinco y filtros de fecha.

## Frontend

- [ ] Añadir tipos para ranking, resumen y facetas, y cálculos de total de ingresos por grupo y porcentaje sobre el total completo; cubrir los cálculos con las pruebas existentes.
- [ ] Crear la página comparativa y su acceso desde el dashboard, con tablas B2B y B2C en paralelo y un único gráfico de totales bajo ambas.
- [ ] Conectar las consultas de ranking, resumen y facetas para ambos grupos usando el mismo rango `YYYY-MM-DD`; actualizar tablas y gráfico al cambiar las fechas.

## Verificación

- [ ] Ejecutar `pytest -q` y comprobar ranking, fechas y categorías de facetas por grupo; ejecutar `npm test`, `npm run build` y `npm run lint`, y revisar navegación, tablas, porcentajes y gráfico en el navegador.
- [ ] Verificar que la implementación cumple todos los criterios de aceptación de [spec.md](spec.md).