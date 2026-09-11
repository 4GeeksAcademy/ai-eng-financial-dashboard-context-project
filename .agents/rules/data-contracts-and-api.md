# Contratos de datos y API

## Reglas

- Mantén coordinados los modelos Pydantic de `backend/app/routes.py` y los tipos TypeScript de `frontend/src/lib/financial-types.ts`.
- Conserva los nombres de campos del contrato, incluidos `create_date`, `amount`, `operation_type`, `category` y `business_type`, salvo que actualices de forma explícita todos sus consumidores y tests.
- Respeta los valores cerrados del dominio (`income`/`outcome`, las categorías existentes y `B2B`/`B2C`). No introduzcas valores nuevos sin revisar validación, cálculos y UI.
- Conserva los `response_model` de los endpoints y sus modelos de respuesta. Si cambia un campo, tipo o forma de respuesta, revisa el frontend y los tests afectados en la misma edición.
- Mantén los parámetros `Query`, sus nombres, valores por defecto y restricciones. En particular, no cambies silenciosamente `group_by`, `limit`, `threshold`, `start_date`, `end_date`, `category`, `operation_type` o `business_type`.
- Al modificar una ruta o sus parámetros, actualiza o añade la cobertura correspondiente en `backend/tests/test_routes.py`.

## Evidencia y riesgo

- El backend define `FinancialMovement`, `MetricsFacets`, `MetricsSummaryItem`, `TopCategoryItem`, `MetricsComparison` y `MetricsAlert` en `backend/app/routes.py`.
- El frontend refleja el movimiento financiero y sus tipos de dominio en `frontend/src/lib/financial-types.ts`.
- Las rutas declaran `response_model` y `Query` en `backend/app/routes.py`.
- Los tests cubren health, métricas, filtros, B2B/B2C, facets, summary, categorías, comparación y alertas en `backend/tests/test_routes.py`.

Ignorar estas reglas puede provocar errores de validación de FastAPI, datos `undefined` en el frontend, cálculos financieros incorrectos o tests desactualizados que oculten una regresión.
