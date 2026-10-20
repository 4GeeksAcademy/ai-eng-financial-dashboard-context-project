# A3: Conectar capacidades de API con la interfaz

**Alcance:** Nuevos endpoints en `backend/app/routes.py` y funcionalidades del dashboard en `frontend/src/`.

**Justificación:** El backend ofrece facets, resumen, categorías principales, comparación, alertas y consultas B2B/B2C, mientras `frontend/src/App.tsx` solo solicita `/api/metrics`.

**Guía accionable:**
- No describas una ruta como funcionalidad visible del dashboard hasta que exista un consumidor frontend para ella.
- Para cada nueva capacidad de usuario, implementa el estado de carga, error y datos en la interfaz además del endpoint.
- Comprueba el recorrido desde solicitud frontend hasta representación de datos; si el endpoint es solo backend, documenta explícitamente que aún no está integrado en el dashboard.