# Estado actual

**Revisado:** 2026-11-12. Evidencia principal: código del repositorio, [Verification.md](../Verification.md) y [.agents/rules/agente-reglas.md](../.agents/rules/agente-reglas.md). Las reglas describen convenciones deseadas; no se toman como evidencia de funcionalidad.

## Qué funciona según el código

- La aplicación React solicita `GET /api/metrics`, calcula KPI y agregados mensuales, y muestra tarjetas y gráficos. `App` controla carga y error; los gráficos muestran un placeholder si no hay datos. Fuentes: [frontend/src/App.tsx](../frontend/src/App.tsx), [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts), [frontend/src/components/dashboard/](../frontend/src/components/dashboard/).
- El backend define `/health` y ocho rutas bajo `/api/metrics` para movimientos, facetas, resúmenes, categorías principales, comparaciones, alertas y conjuntos B2B/B2C. Usa modelos Pydantic y genera datos simulados. Fuente: [backend/app/routes.py](../backend/app/routes.py).
- Hay pruebas de utilidades frontend con Vitest y pruebas backend con pytest/TestClient. Cubren cálculos/formateo y, entre otros casos, salud, filtros, facetas, resumen, categorías, comparación y alertas. Fuentes: [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts), [backend/tests/test_routes.py](../backend/tests/test_routes.py).
- El repositorio documenta ejecución local con Docker Compose, Vite y FastAPI: [README.md](../README.md).

Esta memoria verifica la presencia del código y de las pruebas, pero **no ejecutó** los tests ni inició los servicios.

## Componentes existentes

- **Frontend:** `App`, encabezado del dashboard, fila/tarjetas KPI, gráficos de ingresos/gastos y margen, componentes UI `Card` y `Skeleton`; tipos y funciones de cómputo/formateo en `src/lib/`.
- **Backend:** aplicación FastAPI, router, modelos para movimientos, facetas, resúmenes, categorías, comparaciones y alertas; generador de datos simulados y funciones de filtrado/agregación.
- **Desarrollo:** Docker Compose con frontend y backend, proxy Vite y `debugpy`.

## Qué falta o no está conectado

- Las rutas de resumen, facetas, top categorías, comparación, alertas y B2B/B2C existen en el backend, pero la interfaz actual solo solicita `/api/metrics`; no hay integración de esas rutas en [frontend/src/App.tsx](../frontend/src/App.tsx).
- No se encontró persistencia ni una fuente de datos reales: las rutas crean datos simulados mediante `generate_mock_movements()` en [backend/app/routes.py](../backend/app/routes.py).
- Los modelos, lógica y endpoints siguen juntos en `backend/app/routes.py`, a diferencia de la separación recomendada por [.agents/rules/agente-reglas.md](../.agents/rules/agente-reglas.md).

Esto describe brechas observables; las fuentes revisadas no declaran que sean compromisos o prioridades futuras.

## Limitaciones verificadas y discrepancias

- El generador usa `seed=42`, pero también `date.today()` para asignar los años. Los movimientos se reproducen con la misma fecha de ejecución, pero no representan de forma fija el año 2024: [backend/app/routes.py](../backend/app/routes.py).
- El encabezado del frontend muestra literalmente `2024 - Full Year`, mientras que el backend genera fechas relativas a la fecha actual: [frontend/src/App.tsx](../frontend/src/App.tsx), [backend/app/routes.py](../backend/app/routes.py).
- FastAPI configura `allow_origins=["*"]` en [backend/app/main.py](../backend/app/main.py). Las reglas del proyecto indican restringir los orígenes en producción; no se encontró configuración separada por entorno.
- El backend no tiene versiones fijadas en `requirements.txt`: [backend/requirements.txt](../backend/requirements.txt).
- `class-variance-authority` está declarada, pero [Verification.md](../Verification.md) señala que no encontró importaciones/uso en `frontend/src/`.
- La documentación menciona `frontend/.env.example`, pero no se pudo verificar su existencia o contenido: la consulta del listado fue afectada por una exclusión de contenido. No se intentó acceder por vías alternativas.

## Prioridades y desconocidos

- No se encontró una roadmap ni una prioridad de implementación explícita en las fuentes revisadas. No se inventan tareas futuras.
- README describe como pasos recomendados inspeccionar frontend y backend, documentar reglas y memoria del proyecto y ajustarlas al flujo real: [README.md](../README.md).
- No se conoce el estado de despliegue en producción, la existencia de sistemas externos no declarados en este repositorio ni las prioridades del equipo.
