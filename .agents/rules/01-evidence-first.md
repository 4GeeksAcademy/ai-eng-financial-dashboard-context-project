# Regla: evidencia antes de afirmar o editar

## Regla propuesta
Antes de describir una capacidad, modificarla o añadir una configuración, el agent debe localizar evidencia concreta en el repositorio. Si no existe evidencia suficiente, debe marcar la afirmación como no verificada y no inventar archivos, servicios o flujos.

## Evidencia del repositorio

- `AGENTS.md` exige revisar reglas, skills y memoria del proyecto antes de actuar.
- `README.md` y `README.es.md` documentan la ejecución mediante `docker compose up --build`.
- La estructura actual contiene `docker-compose.yml`, `frontend/` y `backend/`, pero no contiene `.agents/` ni `memory-bank/` antes de crear estas reglas.

## Aplicación

- Verificar rutas y nombres antes de referenciarlos.
- Distinguir entre documentación, configuración y comportamiento probado.
- Marcar como `❓` cualquier hecho que no pueda comprobarse en código, configuración, pruebas o ejecución.
