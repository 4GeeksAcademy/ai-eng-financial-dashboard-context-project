# Reglas de backend

## Objetivo

Mantener consistente el contrato de la API, reutilizar la lógica común de movimientos y proteger los cálculos con pruebas de comportamiento.

## Justificación

`routes.py` declara modelos Pydantic, genera movimientos simulados y comparte helpers de filtrado, orden y agregación entre endpoints. Las pruebas de `tests/test_routes.py` cubren el contrato y varios filtros; los tipos de frontend reflejan los mismos campos. Ver [routes.py](../../backend/app/routes.py), [test_routes.py](../../backend/tests/test_routes.py) y [financial-types.ts](../../frontend/src/lib/financial-types.ts).

## Reglas

- Mantén los campos, categorías y valores `Literal` de los modelos Pydantic alineados con los tipos TypeScript. Si cambia el contrato, actualiza backend, frontend y sus pruebas en conjunto.
- Reutiliza `filter_movements`, `filter_movements_by_date`, `ensure_chronological_order` y las funciones de agregación en lugar de reimplementar reglas por endpoint.
- Devuelve movimientos en orden cronológico cuando la ruta entrega movimientos.
- Recuerda que `generate_mock_movements(seed=42)` fija la aleatoriedad, pero los años dependen de `date.today()`. Si necesitas resultados idénticos entre fechas distintas, controla también la fecha de referencia.
- Mantén los movimientos identificados como simulados; no presentes estos endpoints como conectados a datos financieros persistentes.
- En pruebas de comparación y alertas, comprueba valores numéricos y casos límite además de la forma de la respuesta.

## Ejemplos

### Correcto

El endpoint principal filtra con el helper compartido y conserva el orden, como en [routes.py](../../backend/app/routes.py):

```python
filtered = filter_movements(
    movements, start_date, end_date, category, operation_type
)
return ensure_chronological_order(filtered)
```

### Incorrecto

No reemplaces el helper por un filtro parcial que omita otros criterios de la ruta:

```python
return [movement for movement in movements if movement.category == category]
```