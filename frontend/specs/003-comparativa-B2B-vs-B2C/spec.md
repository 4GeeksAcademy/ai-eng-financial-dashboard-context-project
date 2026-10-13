# Comparativa B2B vs B2C

## Objetivo
Comparar el rendimiento de ingresos de las líneas de negocio B2B y B2C.

## Usuario
Equipo de Finanzas.

## Historia de usuario
Como integrante del equipo de Finanzas, quiero comparar los ingresos de B2B y B2C por categorías y período para analizar el rendimiento de ambas líneas de negocio.

## Requisitos funcionales
- Disponer de una nueva página del dashboard con dos secciones en paralelo: B2B y B2C.
- Mostrar en cada sección una tabla con las cinco categorías de ingreso principales del grupo, indicando nombre de categoría, total de ingresos y porcentaje sobre el total de ingresos de ese grupo.
- Mostrar bajo ambas secciones un único gráfico que compare el total de ingresos de B2B frente a B2C.
- Permitir filtrar las tablas y el gráfico por un rango de fechas en formato `YYYY-MM-DD`.
- Obtener las categorías disponibles para cada grupo del endpoint de facetas.

## Criterios de aceptación
1. La comparativa está disponible en una nueva página del dashboard.
2. Las secciones B2B y B2C se muestran en paralelo.
3. Cada tabla muestra las cinco categorías de ingreso principales de su línea de negocio.
4. Cada categoría muestra su nombre, total de ingresos y porcentaje sobre el total de ingresos del grupo, no solo sobre las categorías mostradas.
5. Un único gráfico bajo ambas secciones compara los ingresos totales de B2B y B2C.
6. El usuario puede seleccionar un rango de fechas en formato `YYYY-MM-DD`, y las tablas y el gráfico reflejan ese período.
7. Las categorías disponibles para cada grupo se obtienen del endpoint de facetas.

## Fuera de alcance
No especificado en el requisito.