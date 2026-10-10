# Regla: Arquitectura y responsabilidades

## Alcance

Aplica a cambios en el flujo de entrada y composición del frontend, cálculos financieros, componentes del dashboard y registro de rutas FastAPI.

## Justificación basada en el repositorio

- `frontend/index.html` carga `frontend/src/main.tsx`; este monta `frontend/src/App.tsx`.
- `frontend/src/App.tsx` obtiene movimientos, calcula los datos con `frontend/src/lib/financial-utils.ts` y pasa resultados a componentes de `frontend/src/components/dashboard/`.
- `backend/app/main.py` registra el router de `backend/app/routes.py`.

## Guía específica del proyecto

1. Al cambiar el arranque del frontend, conserva el flujo `index.html` → `src/main.tsx` → `src/App.tsx`, o actualiza coordinadamente los puntos afectados.
2. Mantén cálculos y formateo financieros en `frontend/src/lib/financial-utils.ts`; evita duplicar fórmulas en componentes visuales.
3. Conserva los tipos compartidos del cliente en `frontend/src/lib/financial-types.ts` y la presentación en componentes bajo `frontend/src/components/`.
4. Añade endpoints en `backend/app/routes.py` y comprueba que el router siga incluido por `backend/app/main.py`.
5. Si se agrega una capacidad API para la UI, implementa también su consumo en el frontend: actualmente `frontend/src/App.tsx` solo solicita `/api/metrics`.
