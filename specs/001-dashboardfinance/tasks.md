# Tareas de implementación

- [x] T1. Validar en `/api/metrics` que `start_date` no sea posterior a `end_date` y comprobar el rechazo HTTP 422 con pruebas backend.
- [x] T2. Ajustar `/api/metrics/alerts` para validar `threshold` entre `0.01` y `1.0`, calcular la media de los tres meses completos anteriores y devolver alertas solo dentro del rango; añadir pruebas backend.
- [x] T3. Extender `MetricsFacets` con categorías por `business_type`, conservar la lista global y probar la respuesta de facetas.
- [x] T4. Actualizar tipos y utilidades del frontend para tratar fechas ISO sin desplazamiento de mes y calcular porcentajes de categoría sobre los ingresos completos del grupo; añadir pruebas de utilidad.
- [x] T5. Añadir el filtro de fechas al dashboard, mostrar `min_date`/`max_date`, compartir el rango con las consultas y actualizar el período del encabezado.
- [x] T6. Añadir el control de umbral y la tabla de alertas debajo de los gráficos; conectar rango y umbral, y mostrar estados de carga, error y vacío.
- [x] T7. Añadir la vista comparativa B2B/B2C con las dos tablas de top categorías y el gráfico de ingresos totales para el mismo rango.
- [ ] T8. Verificar todos los criterios de aceptación del spec con `docker compose exec backend pytest`, `npm test`, `npm run lint`, `npm run build` y los casos manuales de fechas, alertas, grupos vacíos y comparación.
