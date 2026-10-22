# Reglas de backend

## Objetivo
Preservar contratos estables de API, mantener los filtros y cálculos reutilizables y hacer explícitos los límites de los datos de ejemplo.

## Justificación
- `backend/app/routes.py` contiene modelos Pydantic, rutas, generación de movimientos, filtros, orden y resúmenes.
- `backend/tests/test_routes.py` verifica salud, filtros, orden y respuestas de métricas.
- Las rutas declaran `response_model`; el frontend replica esos contratos en `frontend/src/lib/financial-types.ts`.

## Reglas
1. Declara y conserva el modelo Pydantic de cada respuesta con `response_model`. Al cambiar nombres, tipos o valores admitidos, coordina el cambio con los tipos TypeScript y las pruebas de rutas.
2. Reutiliza `filter_movements`, `filter_movements_by_date` y `ensure_chronological_order` en lugar de crear filtros u órdenes divergentes.
3. Trata los movimientos como datos de ejemplo: las rutas usan `generate_mock_movements(seed=42)`, que crea 30 registros por cada uno de 12 meses. Las fechas dependen de `date.today()`; no afirmes que los registros persisten ni que siempre pertenecen a 2024.
4. Evita alterar el generador aleatorio global al crear los datos. La implementación actual llama `random.seed(seed)` y después usa funciones globales de `random`; prefiere una instancia local `random.Random(seed)` y sus métodos para no modificar estado compartido del proceso.
5. Antes de indexar listas derivadas de movimientos, define y maneja el caso vacío. `build_metrics_facets` accede a `ordered[0]` y `ordered[-1]`; si el origen pudiera estar vacío, acuerda el comportamiento de respuesta y cúbrelo con una prueba antes de acceder a esos índices.
6. Actualiza `backend/tests/test_routes.py` cuando cambien parámetros, filtros, orden o forma de las respuestas. No declares pruebas exitosas sin ejecutarlas.

## Ejemplos correctos e incorrectos

### Correcto: validar la respuesta con un modelo
Patrón actual de `backend/app/routes.py`:

```py
@router.get("/api/metrics", response_model=list[FinancialMovement])
def get_metrics(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    category: Category | None = Query(default=None),
    operation_type: OperationType | None = Query(default=None),
) -> list[FinancialMovement]:
    movements = generate_mock_movements(seed=42)
    filtered = filter_movements(
        movements, start_date, end_date, category, operation_type
    )
    return ensure_chronological_order(filtered)
```

Mantén el `response_model` y devuelve elementos que cumplan `FinancialMovement`.

### Correcto: reutilizar filtrado y orden comunes
Patrón actual de `backend/app/routes.py`:

```py
filtered = filter_movements(
    movements, start_date, end_date, category, operation_type
)
return ensure_chronological_order(filtered)
```

### Incorrecto: filtrar una ruta aparte con lógica divergente
No vuelvas a implementar en cada endpoint comparaciones de fechas/categorías y ordenamientos distintos; usa los helpers compartidos cuando aplique.

### Incorrecto: asumir que facets siempre recibe movimientos
Patrón actual que requiere protección si se permite una lista vacía, en `backend/app/routes.py`:

```py
min_date=ordered[0].create_date,
max_date=ordered[-1].create_date,
```

Comprueba la lista antes de indexarla y aplica el comportamiento vacío que establezca el contrato de API.

### Incorrecto: reseedear el generador aleatorio global
Patrón actual de `backend/app/routes.py`:

```py
if seed is not None:
    random.seed(seed)
```

Para aislar la semilla, usa una instancia local `rng = random.Random(seed)` y `rng.random()`, `rng.randint()`, `rng.uniform()` o `rng.choice()` dentro de la generación.
