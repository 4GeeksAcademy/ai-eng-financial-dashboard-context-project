# Plan de implementación

## Funcionalidad 1: filtro de fechas del dashboard

**Backend**
- Conservar los parámetros opcionales `start_date` y `end_date` de `/api/metrics` y `min_date`/`max_date` de `/api/metrics/facets`.
- Añadir validación para que el backend rechace con HTTP 422 un inicio posterior al fin, como indica el spec.

**Frontend**
- Añadir los inputs de fecha y mostrar el rango disponible obtenido de facetas.
- Mantener el rango en el nivel principal de `App.tsx` y aplicarlo a la solicitud de métricas. La misma selección alimentará las alertas de la Funcionalidad 2.
- Quitar el período fijo del encabezado y evitar desplazamientos de mes al procesar fechas ISO.

## Funcionalidad 2: alertas de anomalías

**Backend**
- Ajustar `/api/metrics/alerts` para validar `threshold` entre `0.01` y `1.0`, manteniendo el valor por defecto `0.3`.
- Calcular `baseline_average` con los tres meses completos anteriores. Obtener ese contexto aunque quede fuera del rango elegido, pero devolver solo alertas dentro del rango.

**Frontend**
- Añadir el control numérico y la tabla debajo de los gráficos, con período, gasto registrado, promedio e incremento porcentual.
- Enviar el mismo rango y el umbral a la API; mostrar `increase_ratio × 100` como porcentaje.
- Diferenciar carga, error y tabla sin resultados.

## Funcionalidad 3: comparación B2B/B2C

**Backend**
- Extender `MetricsFacets` para incluir categorías disponibles por grupo, conservando la lista global actual.
- Reutilizar `/api/metrics/categories/top` con `operation_type=income`, `limit=5`, fechas y grupo; el total de ingresos puede obtenerse con `/api/metrics/summary`.

**Frontend**
- Añadir una vista comparativa accesible desde la navegación existente, usando React y el estado de la aplicación, sin incorporar una librería de rutas.
- Mostrar las dos tablas y un gráfico común. Calcular cada porcentaje sobre el total completo de ingresos del grupo y rango, no sobre la suma de las cinco categorías.
- Usar las facetas para las categorías de cada grupo y mostrar estados para grupo sin ingresos o sin resultados.

## Archivos afectados

- Backend: `backend/app/routes.py`, `backend/tests/test_routes.py`.
- Frontend: `frontend/src/App.tsx`, `frontend/src/lib/financial-types.ts`, `frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts`.
- Componentes nuevos dentro del directorio existente `frontend/src/components/dashboard/`, sin añadir carpetas ni dependencias.

## Orden recomendado

1. Extender y validar los contratos del backend requeridos por las tres funcionalidades.
2. Añadir pruebas backend para fechas, límite del umbral, ventana móvil y facetas por grupo.
3. Añadir los tipos y lógica de consulta compartida del frontend, incluido el rango de fechas.
4. Incorporar el filtro y la tabla de alertas al dashboard actual.
5. Incorporar la vista comparativa usando consultas de top categorías, resumen y facetas.
6. Ejecutar verificaciones automatizadas y recorrer los estados límite manualmente.

## Verificación básica

- Backend: `docker compose exec backend pytest`; revisar en `/docs` la validación del rango y umbral, la respuesta de facetas y las alertas.
- Frontend: `npm test`, `npm run lint` y `npm run build` desde `frontend/`.
- Manual: fechas vacías, parciales e invertidas; rango sin resultados; umbral límite; alertas con menos de tres meses de contexto; grupo vacío; porcentajes con denominador cero; ambas líneas B2B/B2C con el mismo rango.

## Riesgo de romper funcionalidad existente

**Moderado.** Cambiar el cálculo de las alertas altera su semántica; agregar campos a facetas puede afectar consumidores existentes si se reemplaza en vez de extender el contrato. El filtro compartido también modifica los datos de KPI y gráficos. La comparación debe enviar `operation_type=income` explícitamente, porque el endpoint de categorías usa `outcome` por defecto. No se modificaría el stack ni se añadirían dependencias.
