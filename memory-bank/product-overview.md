# Producto: dashboard financiero
**Última verificación:** 2026-10-31, sobre el commit 295fd8c (rama `agent-ready-context`).

## Qué es
- Dashboard web que muestra ingresos, egresos y beneficio a partir de movimientos financieros simulados. Es un proyecto de práctica de 4Geeks Academy.
- No hay base de datos ni datos reales: el backend genera los movimientos con `generate_mock_movements(seed=42)`, y esa llamada devuelve 360 (`backend/tests/test_routes.py:15`).

## Qué ve el usuario
- Una sola pantalla (`frontend/src/App.tsx`): encabezado, fila de KPIs, gráfico de ingresos y egresos, gráfico de beneficio porcentual y un aviso si falla la carga.
- El encabezado dice siempre «2024 - Full Year» (`frontend/src/App.tsx:49`), aunque el backend calcula los años desde la fecha de hoy.

## Qué consume de la API
- El frontend llama solo a `GET /api/metrics` (`frontend/src/App.tsx:16`). Las otras 7 rutas `/api/metrics/*` existen, pero ninguna pantalla las usa.
- Nadie importa `frontend/src/lib/mock-data.ts`: editarlo no cambia la UI.
