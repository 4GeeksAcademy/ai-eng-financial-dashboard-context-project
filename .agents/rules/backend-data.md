# Regla: backend-data

**Alcance:** `generate_mock_movements`, `_build_movement` y `_year_for_month` en `backend/app/routes.py`, y cualquier función que reciba listas de movimientos.
**Justificación:** F3, F4 y F5. No hay base de datos; los 360 movimientos salen de `generate_mock_movements(seed=42)` en cada petición y sus fechas dependen de hoy.

## Qué hacer

- Los datos salen únicamente de `generate_mock_movements(seed=42)`. No crees otra fuente ni llames a `random` desde otros sitios.
- La ventana de fechas son los 12 meses anteriores al mes actual (`routes.py:65-68,97`). Nunca escribas en código, tests o textos un año o mes concreto (como `2024` o `2025-03`).
- Toda función nueva que reciba una lista filtrada debe aceptar una lista vacía. `build_metrics_facets` no lo hace (usa `ordered[0]`; con una lista vacía lanza `IndexError`, comprobado ejecutándolo).
- Si necesitas aleatoriedad nueva, usa `random.Random(semilla)`: `random.seed()` reinicia el generador global (`routes.py:96`).

## Qué no hacer

- No cambies la generación (importes, categorías, 30 movimientos por mes) sin avisar: `test_routes.py:15` exige 360 filas y el frontend calcula todo con esos datos.
- No des por hecho que las fechas son estables entre días.

## Cómo comprobarlo

`grep -rn "2024\|2025\|2026" backend/app backend/tests` no debe mostrar fechas fijas de datos.
