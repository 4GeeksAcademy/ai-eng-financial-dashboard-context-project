---
applyTo:
	- "backend/app/**/*.py"
	- "frontend/src/App.tsx"
	- "frontend/src/lib/**/*.ts"
	- "frontend/src/lib/**/*.tsx"
---

# Regla: límites de arquitectura y contratos

**Alcance:** Cambios en rutas, modelos, cálculos de negocio y flujo de datos entre FastAPI y React.

**Justificación basada en el repositorio:** `backend/app/routes.py` concentra modelos Pydantic, generación de datos, filtros, agregaciones y endpoints. El backend ya expone agregaciones (`summarize_movements`, `calculate_net_value`) mientras `frontend/src/lib/financial-utils.ts` calcula KPIs y agrupaciones mensuales. Además, `frontend/src/App.tsx` fija el periodo mostrado y consume JSON como `FinancialMovement[]` sin validación runtime.

**Guía específica del proyecto:**
- Mantén los contratos de API explícitos: declara el `response_model` de cada endpoint de métricas, tipa parámetros y reutiliza los modelos/`Literal` del dominio en `backend/app/routes.py`.
- Mantén los handlers enfocados en coordinar entrada, filtros y salida. Si la lógica crece, separa modelos, servicios y rutas siguiendo una decisión de arquitectura coherente; no añadas más responsabilidades al módulo de rutas por conveniencia.
- Antes de agregar o cambiar una agregación, decide si la fuente de verdad será backend o frontend. Si ambos lados deben calcularla, conserva la misma definición y añade cobertura de contrato en las pruebas pertinentes.
- Valida la forma de JSON recibido en `frontend/src/App.tsx` antes de confiar en el tipo TypeScript, que por sí solo no valida datos en runtime.
- No fijes etiquetas de periodo que puedan contradecir las fechas recibidas; calcula el periodo a partir de datos/filtros o explica explícitamente la limitación.
- Valida que `start_date <= end_date` en la frontera de API y decide de forma explícita cómo responden los helpers a colecciones vacías. `build_metrics_facets` actualmente indexa el primer y último elemento.
- No inicialices el RNG global en nuevos generadores compartidos: `generate_mock_movements` usa `random.seed(seed)`. Prefiere un generador local para que llamadas concurrentes no compartan estado.
