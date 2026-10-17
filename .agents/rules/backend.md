# Regla de backend: contratos y procesamiento de movimientos

## Nombre

Backend: contratos, filtros y datos reproducibles

## Objetivo

Preservar contratos explícitos de API, comportamiento uniforme entre endpoints y generación de datos que no interfiera con el estado global del proceso.

## Alcance

Aplica a `backend/app/**` y `backend/tests/**`, especialmente a `app/routes.py` y `tests/test_routes.py`.

## Justificación

- `app/routes.py` declara modelos Pydantic, tipos `Literal` para valores de dominio y `response_model` en endpoints.
- Varias rutas reutilizan `filter_movements` y `ensure_chronological_order`.
- `generate_mock_movements` llama a `random.seed(seed)`, que modifica el estado aleatorio global.
- `tests/test_routes.py` comprueba generación de movimientos, orden, filtros y respuestas de los endpoints.

## Reglas

1. Mantén explícitos y validados los contratos: usa los modelos Pydantic definidos, anota las rutas con `response_model` y restringe con `Literal` los parámetros enumerados del dominio.
2. Reutiliza `filter_movements`, `filter_movements_by_date` y `ensure_chronological_order` al añadir o modificar endpoints. No dupliques la aplicación de filtros u ordenamiento.
3. Para datos deterministas, utiliza un generador aleatorio local con semilla. No reinicialices el generador global desde una función de generación.
4. Conserva las reglas de dominio verificadas: operaciones `income`/`outcome`; negocios `B2B`/`B2C`; categorías `suppliers`, `sales`, `operational`, `administrative` y `others`; agrupaciones `day`, `week` y `month`.
5. Añade o actualiza pruebas en `tests/test_routes.py` cuando cambien rutas, filtros, ordenamiento, contratos o generación.

## Ejemplos

### Correcto: reutilizar filtrado y ordenamiento comunes

Este patrón está en el endpoint `/api/metrics` de `app/routes.py`.

```py
filtered = filter_movements(
    movements, start_date, end_date, category, operation_type
)
return ensure_chronological_order(filtered)
```

### Incorrecto: reiniciar el estado aleatorio global

Este patrón está actualmente en `generate_mock_movements` de `app/routes.py`; se documenta como riesgo, no como ejemplo a copiar.

```py
if seed is not None:
    random.seed(seed)
```

## Guía específica del proyecto

- Los modelos, tipos de dominio, generador y rutas están concentrados en `backend/app/routes.py`; la aplicación se registra en `backend/app/main.py`.
- Las pruebas de API y helpers están en `backend/tests/test_routes.py`; `pytest` figura en `backend/requirements.txt`.
- Si cambia un contrato consumido por el frontend, actualiza también `frontend/src/lib/financial-types.ts` y verifica el uso en `frontend/src/App.tsx`.
- Las fechas del modelo son `date` y no `datetime`; conserva el significado de fecha de calendario al filtrar y resumir movimientos.