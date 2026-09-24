# Regla: no confundir datos mock con persistencia real

## Regla propuesta
El agent debe describir y tratar los datos financieros como mock mientras las rutas sigan generándolos en memoria. No debe afirmar que existe una base de datos ni introducir persistencia como parte de una corrección no solicitada.

## Evidencia del repositorio

- `backend/app/routes.py` llama a `generate_mock_movements(seed=42)` en las rutas de métricas.
- `generate_mock_movements()` crea movimientos en memoria y devuelve 360 registros.
- `backend/requirements.txt` no declara un driver ni un ORM de base de datos.
- `docker-compose.yml` no declara un servicio de base de datos.
- `backend/tests/test_routes.py` verifica `len(movements) == 360`.

## Aplicación

- Explicar explícitamente cuándo una funcionalidad usa datos mock.
- Mantener el seed `42` si la determinación de las pruebas depende de él.
- Si se añade persistencia, tratarla como una fase separada con diseño, migraciones, pruebas y commit propio.
