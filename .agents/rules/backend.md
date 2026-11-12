# Reglas del backend financiero

## Propósito
Preservar la reproducibilidad de datos simulados y los contratos validados por FastAPI.

## Ámbito
Cambios en `backend/app/routes.py`, especialmente generación aleatoria, modelos y endpoints.

## Evidencia del repositorio
- La implementación actual de `generate_mock_movements` llama a `random.seed(seed)` cuando se proporciona una semilla y usa el generador aleatorio global, modificando su estado.
- `routes.py` declara modelos Pydantic, dominios `Literal` y `response_model` para endpoints.
- La generación se hace bajo demanda y usa `date.today()`; no se observó persistencia en este flujo.

## Instrucciones para el agente
- En cambios futuros a `generate_mock_movements`, conserva su reproducibilidad y evita efectos secundarios sobre el estado aleatorio global compartido.
- Al cambiar parámetros o respuestas, actualiza los modelos/tipos de dominio y el `response_model` correspondiente.
- Trata estos movimientos como datos simulados generados por petición; no supongas que están almacenados o que su rango anual es fijo.

## Comprobaciones antes de finalizar
- Comprueba que dos generaciones con la misma semilla producen los mismos movimientos y que la función no altera una secuencia aleatoria independiente.
- Ejecuta `pytest tests/test_routes.py` desde `backend/` para cambios de lógica o rutas.
- Si cambia el rango de fechas, comprueba los datos devueltos frente a la fecha/rango esperado.