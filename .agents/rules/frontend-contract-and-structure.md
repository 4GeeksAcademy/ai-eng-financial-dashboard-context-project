# Frontend: estructura y contrato con la API

## Alcance

Aplica al cambiar la carga de datos, tipos financieros, cálculos, componentes del dashboard, proxy de Vite o configuración de origen de API.

## Justificación con evidencia del repositorio

- `frontend/src/App.tsx` hace `fetch` a `${VITE_API_BASE_URL}/api/metrics` y usa `computeKPIs` y `computeMonthlyData`.
- `frontend/src/lib/financial-types.ts` refleja los nombres y literales de `FinancialMovement` definidos en `backend/app/routes.py`.
- `frontend/src/lib/financial-utils.ts` centraliza cálculos; `src/components/dashboard/` contiene componentes de presentación separados.
- `frontend/vite.config.ts` proxifica `/api` a `http://backend:8000`; `frontend/.env.example` y los README describen `VITE_API_BASE_URL` como alternativa.

## Guía específica del proyecto

1. **Conserva alineados los tipos del contrato.** Si se modifica un nombre de campo o valor de operación/categoría/segmento, actualiza `frontend/src/lib/financial-types.ts`, el modelo/tipos backend y las pruebas relacionadas en el mismo cambio.
2. **Respeta la separación actual.** Mantén `App.tsx` para coordinación de carga/estado, `financial-utils.ts` para cálculo de movimientos y `components/dashboard/` para presentación. Si una operación no encaja, justifica la frontera con un ejemplo de datos o comportamiento.
3. **No des por supuesto el entorno del proxy.** El destino `backend` es el servicio Docker Compose. Si cambias el modo de ejecución, alinea proxy, `VITE_API_BASE_URL` y documentación para que la URL elegida sea alcanzable en ese entorno.
4. **Prueba transformaciones en la capa existente.** Añade casos de fórmulas/agrupación en `frontend/src/lib/financial-utils.test.ts`; para nuevos componentes o carga API, cubre el comportamiento añadido con pruebas apropiadas en vez de considerar las pruebas de utilidades suficientes.

## Ejemplo del código real

`App.tsx` solicita `/api/metrics` y pasa la respuesta a `computeKPIs`/`computeMonthlyData`; `kpi-row.tsx` presenta los KPI, mientras `financial-utils.test.ts` prueba totales y agregación mensual.