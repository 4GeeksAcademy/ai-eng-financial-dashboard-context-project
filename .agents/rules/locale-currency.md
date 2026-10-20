# N2: Mantener coherentes idioma, locale y moneda

**Alcance:** Formateo de importes, porcentajes, fechas y etiquetas en `frontend/src/lib/financial-utils.ts` y componentes del dashboard.

**Justificación:** Los formateadores fijan `en-US` y `USD`, mientras el README principal para contribuidores está en español.

**Guía accionable:**
- No infieras moneda o locale a partir del idioma de la documentación; define explícitamente la configuración de presentación.
- Si se añade soporte regional, pasa locale y moneda desde una configuración común en vez de introducir literales distintos por componente.
- Prueba al menos un importe y una fecha con cada configuración admitida.