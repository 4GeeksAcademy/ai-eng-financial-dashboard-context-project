# Plan función 3: vista comparativa B2B vs B2C

## Objetivo

Crear una nueva página del dashboard para comparar los ingresos de B2B y B2C mediante dos tablas de categorías y un único gráfico de totales. Compartir el filtro de fechas con el dashboard principal.

Este documento describe el trabajo previsto; no implica implementar la funcionalidad.

## Estado actual y dependencia

- [App.tsx](../frontend/src/App.tsx) muestra el dashboard principal y todavía no incorpora navegación a una página comparativa.
- La [API](../backend/app/routes.py) permite consultar el top de categorías y el resumen de métricas por `business_type`, con filtros opcionales de fechas.
- `/api/metrics/facets` devuelve categorías globales, pero todavía no admite filtros por negocio o tipo de operación.
- Los datos simulados actuales solo generan ingresos en `sales` y `others`; no se deben inventar categorías para completar cinco filas.
- La [Funcionalidad 1](./Plan1.md) está planificada, pero no implementada. Sus controles y estado de fechas son un requisito previo para compartir el filtro entre páginas.

## Tareas previstas

### 1. Crear la página y la navegación

- Añadir la página `#/comparativa` mediante navegación hash, sin dependencias nuevas.
- Permitir navegar entre el dashboard principal y la comparativa, conservando el comportamiento de atrás y adelante del navegador.
- Mostrar las secciones B2B y B2C en paralelo en escritorio y apiladas en móvil.
- Integrar la navegación desde [App.tsx](../frontend/src/App.tsx), manteniendo los patrones visuales existentes.

### 2. Obtener las categorías disponibles

- Ampliar `/api/metrics/facets` en [routes.py](../backend/app/routes.py) con filtros opcionales `business_type` y `operation_type`.
- Consultar las categorías de ingresos de cada grupo mediante `operation_type=income` y el negocio correspondiente.
- Obtener las categorías disponibles de esas respuestas, sin fijarlas en el frontend ni añadir un selector de categoría no solicitado.
- Preservar el comportamiento y contrato actuales cuando no se envíen filtros.
- Mantener el rango global de fechas como referencia del dataset y gestionar explícitamente categorías vacías si una combinación no contiene movimientos, evitando accesos a posiciones inexistentes.

### 3. Mostrar las dos tablas de ingresos

- Consultar `/api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B` y su equivalente para B2C, añadiendo las fechas activas.
- Mostrar exactamente tres columnas:
  - Nombre de categoría.
  - Total de ingresos.
  - Porcentaje sobre el total de ingresos del grupo.
- Ordenar de mayor a menor ingreso y mostrar hasta 5 categorías reales, sin completar filas artificialmente.
- Obtener los totales completos mediante `/api/metrics/summary` para cada negocio, con `operation_type=income` y las mismas fechas.
- Sumar los ingresos de los períodos de cada resumen y calcular `ingresos de la categoría / ingresos totales del grupo × 100`.
- No usar únicamente la suma del top 5 como denominador; evitar divisiones entre cero.
- Añadir los tipos de respuesta necesarios en [financial-types.ts](../frontend/src/lib/financial-types.ts).

### 4. Añadir el gráfico comparativo

- Situar un único gráfico de barras debajo de ambas tablas.
- Mostrar dos barras: ingresos totales de B2B e ingresos totales de B2C.
- Reutilizar los totales completos obtenidos para calcular los porcentajes.
- Mantener los formatos monetarios y componentes gráficos existentes.

### 5. Compartir el filtro de fechas

- Compartir inicio y fin con el dashboard principal y conservarlos al navegar.
- Reutilizar los controles y la lógica de la Funcionalidad 1, sin mantener filtros independientes por página.
- Enviar las fechas como `YYYY-MM-DD` y omitir los campos vacíos.
- Actualizar automáticamente ambas tablas y el gráfico con el mismo rango.
- Si inicio supera a fin, mostrar error, no consultar y mantener la validación acordada en la Funcionalidad 1.
- Cancelar o descartar respuestas obsoletas al cambiar las fechas.
- No presentar datos de distintas selecciones como una comparativa válida.

### 6. Gestionar estados, documentar y verificar

- Mostrar estados explícitos de carga, error y ausencia de ingresos para cada grupo.
- Diferenciar ingresos cero de un fallo de consulta; no representar un error como una barra de valor cero.
- Evitar que una respuesta vacía o un fallo deje datos anteriores presentados como actuales.
- Documentar la navegación, los endpoints, los porcentajes y el filtro compartido.
- Ejecutar `npm run build` desde `frontend` y lint sobre los archivos modificados con las herramientas existentes.
- Ejecutar las pruebas existentes relevantes de facetas, categorías y resumen en [test_routes.py](../backend/tests/test_routes.py).
- Verificar de forma dirigida:
  - Acceso a la comparativa y navegación de regreso, incluido atrás y adelante.
  - Persistencia del rango compartido entre páginas.
  - Separación correcta entre ingresos B2B y B2C.
  - Categorías obtenidas de facets para cada grupo y compatibilidad de la consulta global.
  - Orden descendente, máximo de 5 filas y presentación con menos categorías.
  - Porcentajes calculados sobre todos los ingresos del grupo, incluso si hay más de 5 categorías.
  - Correspondencia entre los totales de las tablas y las barras del gráfico.
  - Fechas vacías, un solo extremo, ambos extremos y rango invertido.
  - Carga, errores, ausencia de ingresos y cambios rápidos de fechas.
- No añadir tests nuevos ni dependencias. Informar qué verificaciones se ejecutaron y cuáles quedaron pendientes.

## Alcance y límites

- Cambios futuros limitados a la página comparativa, navegación, estado compartido de fechas, facetas por grupo, tipos y documentación directamente relacionados.
- No implementar la Funcionalidad 1 como parte de esta entrega; utilizarla como requisito previo.
- No modificar la generación de datos para forzar cinco categorías de ingreso.
- No añadir otros filtros, gráficos ni refactorizaciones ajenas.
- Crear este documento no autoriza a implementar código ni a crear un commit.
