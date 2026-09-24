# Regla: validar y separar fases

## Regla propuesta
Cada cambio funcional debe validarse con los comandos disponibles para la parte afectada y registrarse en un commit pequeño por fase. No se deben mezclar correcciones de código, auditorías de dependencias, documentación e infraestructura en un mega-commit.

## Evidencia del repositorio

- `frontend/package.json` define `npm run build`, `npm run lint` y `npm test`.
- `backend/tests/test_routes.py` y `backend/requirements.txt` soportan validación con `pytest`.
- El historial reciente usa mensajes como `feat:` y `fix:`.
- El commit `06b55d1` contiene únicamente la corrección del período dinámico en dos archivos frontend.

## Aplicación

- Ejecutar las validaciones relevantes antes del commit.
- Revisar `git diff --stat` y `git status` para evitar archivos no relacionados.
- Usar mensajes claros, preferiblemente con prefijos `feat:`, `fix:`, `test:`, `docs:` o `security:`.
- Hacer auditorías o actualizaciones de dependencias en commits separados.
