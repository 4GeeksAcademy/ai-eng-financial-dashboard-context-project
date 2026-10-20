# D1: Unificar período del encabezado y de los datos

**Alcance:** Selección o presentación del período financiero en `frontend/src/App.tsx` y generación/consulta de fechas en `backend/app/routes.py`.

**Justificación:** El dashboard fija `2024 - Full Year`, mientras `generate_mock_movements` calcula los años con `date.today()`.

**Guía accionable:**
- Obtén el período mostrado desde el mismo filtro/configuración que determina los movimientos.
- No dejes un año literal en el encabezado si el endpoint genera un período dinámico.
- Añade una prueba que compare los límites de fecha seleccionados con el período que la interfaz anuncia.