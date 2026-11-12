# Contrato entre frontend y API

## Propósito
Mantener compatibles el JSON de FastAPI y los tipos consumidos por TypeScript.

## Ámbito
Cambios en endpoints, parámetros o campos de movimientos y métricas.

## Evidencia del repositorio
- Pydantic, `Literal` y `response_model` se declaran en `backend/app/routes.py`.
- Los tipos equivalentes están definidos por separado en `frontend/src/lib/financial-types.ts`.
- `frontend/src/App.tsx` interpreta el JSON de `/api/metrics` como `FinancialMovement[]`.
- `App.tsx` usa `VITE_API_BASE_URL`; `frontend/vite.config.ts` proxifica `/api` a `http://backend:8000`.

## Instrucciones para el agente
- Si cambia un campo, tipo, valor permitido o nulabilidad, actualiza en el mismo cambio el modelo Pydantic y el tipo TypeScript y revisa sus consumidores.
- Conserva la validación y el `response_model` de FastAPI al modificar parámetros o respuestas.
- Conserva `/api` relativo y el proxy por defecto; si cambia el destino, mantén compatible `VITE_API_BASE_URL` y actualiza la configuración/documentación afectada.
- No sustituyas el destino del proxy por `localhost` sin comprobar que funciona desde la red de contenedores.

## Comprobaciones antes de finalizar
- Compara campos, tipos, literales y nulabilidad entre backend y frontend.
- Desde `frontend/`, ejecuta `npm run build` para validar TypeScript.
- Desde `backend/`, ejecuta `pytest tests/test_routes.py` para las rutas afectadas.
- Si cambia el proxy o la base, comprueba `/api/metrics` a través de Vite y confirma el destino configurado.