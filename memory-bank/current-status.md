# Estado actual

## Implementado

- Las reglas locales del proyecto están en `.agents/rules/`; `AGENTS.md` pide revisarlas. En las sesiones de trabajo se leyeron explícitamente; no se verificó carga automática.
- Los cálculos mensuales tratan `create_date` como fecha calendario y el rótulo del periodo deriva de los datos recibidos. El contrato del endpoint tiene una prueba de forma JSON.
- El proxy de Vite apunta a `host.docker.internal:8000`; Compose asigna el alias `host-gateway`. La corrección evita el enlace TCP directo a `backend` que agotaba el tiempo en el bridge observado.

## Verificación registrada

- Referencia actual: frontend **9 tests**, backend **28 tests**, con cero fallos. Build frontend correcto y sin aviso de chunk >500 kB tras carga diferida: chunk principal de 585 kB a 188 kB. Evidencia: commits `05a1cd3`, `77dc756` y `287a060`; resumen en [progress.md](progress.md). El aviso `StarletteDeprecationWarning` de httpx ya existía. Actualizar esta referencia al añadir tests.
- `/api/metrics` a través del puerto 5173 respondió HTTP 200 y devolvió 360 movimientos con las cinco claves esperadas y comprobaciones de datos válidas. Los detalles y comandos están en [verification.md](../verification.md).
- **Revisión visual manual de la usuaria:** confirmó que el dashboard muestra importes y gráficos sin el error de carga. No es una comprobación automatizada.

## Límites y pendientes

- En este workspace, `npm ci` no puede escribir en `frontend/node_modules`: el directorio es propiedad de `root:root` con modo `755`. No se ampliaron permisos; las pruebas se ejecutaron usando las dependencias del contenedor frontend.
- La validación funcional solicitada está completada, incluida la revisión visual confirmada por la usuaria; no queda una comprobación de fase 3 pendiente en `verification.md`.
- El trabajo de skills está registrado en los commits de `feature/agent-skills`; [progress.md](progress.md) detalla cambios, decisiones y prueba real del checklist. Esto no certifica que el árbol de trabajo esté limpio ni que la rama esté lista para merge.