# Regla: documentar el contexto de validación

## Regla propuesta
Toda instrucción de validación debe indicar el directorio desde el que se ejecuta, las dependencias previas requeridas, si corre en el host o dentro de Docker Compose y si el comando fue ejecutado con éxito o solo inferido de la configuración.

## Evidencia del repositorio

- `frontend/package.json` define `npm run lint`, `npm run build` y `npm test`.
- `backend/requirements.txt` declara `pytest` y `pytest-cov`.
- `backend/tests/test_routes.py` contiene las pruebas backend.
- `frontend/Dockerfile` y `backend/Dockerfile` instalan dependencias dentro de contenedores.
- `docker-compose.yml` no define comandos específicos para lint, build o pytest.

## Aplicación

- Especificar `frontend/` para los scripts npm y `backend/` para `pytest` cuando se use el flujo local respaldado por la estructura del proyecto.
- No presentar una inferencia como validación ejecutada.
- No convertir automáticamente un comando local en un comando `docker compose exec` sin evidencia de que el procedimiento está soportado.
- Si README.md y README.es.md tienen secciones equivalentes, indicar si se actualiza una sola versión o ambas.
