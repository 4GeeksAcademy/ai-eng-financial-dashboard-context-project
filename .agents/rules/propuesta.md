# Propuesta de regla

**Estado:** propuesta pendiente de adopción.

## Objetivo

Evitar que el dashboard o su documentación anuncien un período distinto del que representan los movimientos devueltos por la API.

## Regla propuesta

El período mostrado debe derivarse del rango real de los datos o de metadatos de la API. Cuando cambie la generación o el filtrado temporal, actualizar también la etiqueta visible y la documentación, e indicar si los datos son simulados.

## Componentes

- [Nombre](nombre.md)
- [Alcance](alcance.md)
- [Justificación](justificacion.md)
- [Guía específica del proyecto](guia-especifica-del-proyecto.md)

## Criterio de adopción

Adoptar esta regla cuando el equipo confirme que el dashboard debe mostrar el período dinámico generado por la API. Al implementarla, verificar que las fechas de la etiqueta coinciden con `min_date` y `max_date` de la respuesta o con el rango de movimientos efectivamente mostrado.