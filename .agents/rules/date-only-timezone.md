# D2: Interpretar fechas ISO como fechas de calendario

**Alcance:** Conversión de `create_date` y agrupación mensual en `frontend/src/lib/financial-utils.ts`.

**Justificación:** `computeMonthlyData` crea `Date` desde una cadena `YYYY-MM-DD` y usa getters locales para obtener año y mes; en zonas horarias al oeste de UTC, el instante UTC puede caer en el día local anterior.

**Guía accionable:**
- Para fechas sin hora, extrae año y mes de forma independiente de la zona horaria, o usa una conversión UTC explícita y consistente.
- No mezcles getters locales con fechas que representan solo un día de calendario.
- Añade casos de prueba para fechas al inicio/final de mes y año, y ejecútalos con una zona horaria al oeste de UTC.