# Reglas de backend

## Objetivo
Preservar la reproducibilidad de los datos de muestra y la forma validada de las respuestas de la API.

## Justificación
En `backend/app/routes.py`, `generate_mock_movements(seed=42)` llama a `random.seed(seed)` y las funciones de generación usan el generador global. Esto cambia el estado aleatorio compartido del proceso. Los modelos Pydantic, los valores `Literal`, las respuestas y los filtros también se definen en `routes.py`; `backend/tests/test_routes.py` verifica orden, filtros y campos de varias respuestas.

## Reglas
- Para resultados reproducibles, crea un generador local con `random.Random(seed)` y pásalo a las funciones que generan movimientos; no cambies la semilla aleatoria global.
- Conserva los modelos de respuesta Pydantic y los valores permitidos para tipos, categorías y agrupaciones.
- Mantén las respuestas ordenadas cronológicamente cuando el endpoint devuelve movimientos.
- Al cambiar rutas, filtros, campos o reglas de generación, añade o actualiza pruebas en `backend/tests/` para cubrir el contrato y sus límites.

## Ejemplo correcto
Usa el generador local para todos los valores aleatorios de una generación:

```python
rng = random.Random(seed)
amount = round(rng.uniform(500, 9000), 2)
```

Pasa `rng` a `_build_movement` y usa sus métodos (`random`, `randint`, `choice`, `uniform`) en lugar del módulo global.

## Ejemplo incorrecto
Este patrón existente reinicia el generador global y deja que la generación comparta ese estado con el resto del proceso:

```python
if seed is not None:
    random.seed(seed)

amount = random.uniform(500, 9000)
```
