# Alertas de anomalías

## Objetivo
Destacar en el dashboard los períodos en los que el gasto subió de forma inesperada.

## Usuario
Equipo de Finanzas.

## Historia de usuario
Como integrante del equipo de Finanzas, quiero identificar en una tabla los períodos con incrementos inesperados del gasto.

## Requisitos funcionales
- Mostrar una tabla de alertas bajo los gráficos existentes.
- Incluir las columnas período, gasto registrado, media móvil de los tres períodos anteriores e incremento porcentual.
- Permitir configurar el umbral de alerta con un valor entre `0.01` y `1.0`; su valor predeterminado es `0.3`.
- Respetar el rango de fechas establecido en la Funcionalidad 1, si está activo.
- Mostrar un mensaje explícito cuando no haya anomalías para el umbral actual.

## Criterios de aceptación
1. La tabla aparece bajo los gráficos del dashboard.
2. La tabla muestra período, gasto registrado, media de los tres períodos anteriores e incremento porcentual.
3. El usuario puede configurar un umbral entre `0.01` y `1.0`.
4. El umbral predeterminado es `0.3`.
5. Las alertas mostradas respetan el rango de fechas activo de la Funcionalidad 1.
6. Si no hay anomalías para el umbral actual, la tabla muestra un mensaje explícito de estado vacío.

## Fuera de alcance
No especificado en el requisito.
