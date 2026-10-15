# Periodo mostrado desde los datos

## Propósito
Hacer que el periodo anunciado por el dashboard corresponda al payload que realmente recibió.

## Alcance
Aplicar al periodo que `frontend/src/App.tsx` pasa a `DashboardHeader` y a cualquier transformación que derive ese rótulo desde movimientos.

## Evidencia y hallazgo
`App.tsx` fija `2024 - Full Year`, mientras `generate_mock_movements` en `backend/app/routes.py` calcula las fechas a partir de `date.today()`. La discrepancia está registrada como ENG-ARCH-02 en `engineering-findings.md`.

## Instrucciones
- No codificar un año o rango que contradiga las fechas recibidas.
- Derivar el rótulo de los años mínimo y máximo presentes en `create_date`.
- Si no hay movimientos, mostrar un valor neutral; no afirmar que se trata de un año completo.
- Probar un conjunto que cruce de año y uno vacío.

## Validación
Para movimientos de diciembre de 2025 y enero de 2026, el rótulo debe identificar `2025 - 2026`; para una lista vacía no debe afirmar un año concreto.