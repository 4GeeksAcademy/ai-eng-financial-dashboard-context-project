# M1: Separar implementación, tests y verificación en ejecución

**Alcance:** `verification.md`, README y cualquier informe de estado técnico.

**Justificación:** `verification.md` registra por separado la configuración de Compose, el estado de contenedores y las respuestas HTTP; una lectura previa confundió endpoints existentes con endpoints probados.

**Guía accionable:**
- Marca por separado: declarado en código/configuración, cubierto por tests, y comprobado ejecutando el servicio.
- Antes de afirmar que una ruta falta, revisa todas las declaraciones de rutas en `backend/app/routes.py`.
- Registra comando, resultado y limitación cuando una comprobación no pueda ejecutarse; no conviertas un test no ejecutado en un aprobado o fallo funcional.