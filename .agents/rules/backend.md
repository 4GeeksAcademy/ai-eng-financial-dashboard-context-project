# Reglas del back-end

## Objetivo

Preservar contratos de API explícitos, filtros coherentes por endpoint y pruebas que verifiquen el comportamiento real.

## Justificación

FastAPI define modelos Pydantic para sus respuestas, limita algunos parámetros con tipos `Literal` y `Query`, y genera movimientos de ejemplo con `seed=42`. Cada ruta declara los filtros que acepta. Referencias: [routes.py](../../backend/app/routes.py), [test_routes.py](../../backend/tests/test_routes.py).

## Reglas

- Define los modelos de respuesta y los tipos de parámetros de cada endpoint. Usa los tipos del dominio (`OperationType`, `Category`, `BusinessType`, `GroupBy`) y límites de `Query` cuando correspondan. Referencia: [routes.py](../../backend/app/routes.py).
- No asumas que todos los endpoints comparten filtros. Comprueba los parámetros de la ruta específica y prueba cada combinación que la ruta admita. Referencias: [routes.py](../../backend/app/routes.py), [test_routes.py](../../backend/tests/test_routes.py).
- Conserva la semilla `42` y las reglas de fechas de los datos simulados salvo que el cambio solicitado requiera otra conducta; actualiza las pruebas si cambian. `generate_mock_movements` crea 30 movimientos por mes y decide los años con `date.today()`. Referencia: [routes.py](../../backend/app/routes.py).
- Comprueba el comportamiento en las pruebas, no solo en su nombre. La prueba llamada `test_generate_mock_movements_returns_full_year_sorted_data` verifica 360 movimientos y orden cronológico, pero no verifica un año ni un intervalo específico. Referencia: [test_routes.py](../../backend/tests/test_routes.py).
- Si cambia la estructura de respuesta o los valores admitidos, actualiza también el tipo y las verificaciones correspondientes del front-end. Referencias: [routes.py](../../backend/app/routes.py), [financial-types.ts](../../frontend/src/lib/financial-types.ts).

## Ejemplos

### Correcto

Declarar el contrato y restringir filtros, como en la ruta de métricas:

```python
@router.get("/api/metrics", response_model=list[FinancialMovement])
def get_metrics(
    category: Category | None = Query(default=None),
    operation_type: OperationType | None = Query(default=None),
) -> list[FinancialMovement]:
    movements = generate_mock_movements(seed=42)
```

### Incorrecto

Quitar el modelo de respuesta y aceptar una categoría sin validar contra el dominio:

```python
@router.get("/api/metrics")
def get_metrics(category: str | None = None):
    movements = generate_mock_movements()
```
