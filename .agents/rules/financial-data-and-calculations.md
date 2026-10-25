# Datos financieros y cálculos

## Alcance

Aplica al cambiar la generación/origen de movimientos, filtros de periodo, indicadores financieros o agregaciones en backend y frontend.

## Justificación con evidencia del repositorio

- Los endpoints de `backend/app/routes.py` generan movimientos mediante `generate_mock_movements(seed=42)`; el generador usa `date.today()` y llama a `random.seed(seed)` del módulo global.
- `frontend/src/App.tsx` consume `/api/metrics`; `frontend/src/lib/mock-data.ts` existe, pero no es importado por `App.tsx`.
- `frontend/src/lib/financial-utils.ts` calcula KPI y agrega datos por mes; `backend/app/routes.py` también contiene cálculos de neto, resumen y alertas.
- `frontend/src/App.tsx` muestra el periodo fijo `2024 - Full Year`, mientras el generador backend calcula las fechas con relación al día actual.

## Guía específica del proyecto

1. **Confirma la fuente activa antes de cambiar datos.** Para la pantalla principal, sigue el `fetch` de `App.tsx` hasta `/api/metrics`; no asumas que editar `mock-data.ts` cambia la respuesta visible.
2. **Sincroniza periodo mostrado y datos.** Si cambia el rango del backend, deriva el texto de cabecera del periodo mostrado o identifica claramente que es una etiqueta estática de demostración. No presentes una etiqueta fija como rango calculado.
3. **Preserva la reproducibilidad sin efectos globales.** Si extiendes `generate_mock_movements`, conserva la semilla controlable y evita depender del estado aleatorio global compartido; prueba repetibilidad con la misma semilla y aislamiento de otras fuentes aleatorias.
4. **Define una fuente de verdad para indicadores duplicados.** Antes de trasladar o duplicar KPI/neto/margen entre `backend/app/routes.py` y `frontend/src/lib/financial-utils.ts`, fija fórmula, precisión y casos límite. Mantén pruebas con importes conocidos, decimales e ingresos cero.

## Ejemplo del código real

`computeKPIs` calcula `profit = totalIncome - totalOutcome` y solo divide por ingresos cuando son mayores que cero. `computeMonthlyData` agrupa por año-mes. En backend, `generate_mock_movements` recibe semilla y determina año usando `date.today()`.