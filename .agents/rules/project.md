# Reglas de proyecto

## Hechos verificados

- La etiqueta visible del dashboard está fijada en `2024 - Full Year` ([`frontend/src/App.tsx:49`](../../frontend/src/App.tsx#L49)). El backend calcula el año por mes usando `date.today()` ([`backend/app/routes.py:65`](../../backend/app/routes.py#L65), [`backend/app/routes.py:97`](../../backend/app/routes.py#L97)) y recorre los doce meses ([`backend/app/routes.py:99`](../../backend/app/routes.py#L99)).
- Con fecha de revisión 2026-11-14, la lógica del backend genera fechas desde noviembre de 2025 hasta octubre de 2026; por tanto, el intervalo no coincide con la etiqueta de 2024. El test de generación comprueba 360 movimientos y orden, pero no el intervalo de años ([`backend/tests/test_routes.py:12`](../../backend/tests/test_routes.py#L12), [`backend/tests/test_routes.py:15`](../../backend/tests/test_routes.py#L15), [`backend/tests/test_routes.py:16`](../../backend/tests/test_routes.py#L16)).
- El periodo pretendido por producto no está definido en los archivos revisados.

## Medidas preventivas propuestas

- **Al iniciar una tarea:** sigue la instrucción existente de [`AGENTS.md`](../../AGENTS.md) y revisa las reglas disponibles en `.agents/rules`. No infieras contenido para `.agents/skills` o `memory-bank` cuando no haya archivos allí; usa la evidencia del código y la configuración.
- **Al tocar el periodo del dashboard o las fechas del backend:** no supongas que 2024 ni el intervalo dinámico actual es el requisito correcto. Resuelve la intención de producto antes de cambiar el comportamiento; después mantén una sola definición coherente para datos y etiqueta y prueba ambos extremos del intervalo. Esta regla no exige refactor si la tarea no toca fechas.
- **Al cambiar el contrato entre frontend y backend:** coordina en el mismo cambio los tipos/modelos de ambos lados y sus pruebas. Los tipos frontend están en [`frontend/src/lib/financial-types.ts:1`](../../frontend/src/lib/financial-types.ts#L1) y el modelo backend en [`backend/app/routes.py:22`](../../backend/app/routes.py#L22). Para validar, usa pruebas relevantes: `npm test` y `npm run build` definidos en [`frontend/package.json:8`](../../frontend/package.json#L8), [`frontend/package.json:11`](../../frontend/package.json#L11), y `pytest` desde `backend/`.
- Si una tarea no afecta esos comportamientos, no cambies el periodo, la generación de datos ni extraigas lógica compartida como refactor preventivo.
