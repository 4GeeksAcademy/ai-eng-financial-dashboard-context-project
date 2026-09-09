# Contrato de la API del backend

Reglas derivadas de convenciones ya presentes en el repositorio. Cada una está respaldada por evidencia concreta — ver `memory-bank/conventions.md` para el análisis completo.

## Reglas

1. **Toda ruta de negocio nueva va bajo el prefijo `/api/metrics...`. Solo `/health` no lleva prefijo `/api`.**
   - Evidencia: `backend/app/routes.py:243` (`/health`) vs. las otras 8 rutas (`:248,262,268,287,305,342,362,378`).
   - Riesgo que evita: romper el espacio de nombres consistente de la API.

2. **Declara `response_model=` explícito (o, como mínimo, la anotación de retorno `-> Tipo` de la función) y usa `Query(default=...)` para parámetros opcionales, no `= None` a secas.**
   - Evidencia: los 9 decoradores `@router.get(...)` en `backend/app/routes.py`, todos con `response_model=` y anotación de retorno a la vez.
   - Riesgo que evita: validado en esta sesión quitando `response_model=` de `/api/metrics/facets` — el schema en `/openapi.json` **no cambió**, porque FastAPI lo infiere igualmente de la anotación de retorno (`-> MetricsFacets`). El schema solo desaparece (`"schema": {}`) si se quitan **ambas cosas** a la vez. Es decir: el riesgo real no es omitir `response_model=` aislado (hoy es redundante gracias a la anotación de tipo), sino dejar una ruta nueva sin anotación de retorno Y sin `response_model=` — eso sí rompe la documentación automática en `/docs`.

3. **Usa `Literal[...]` para enums cerrados (como `OperationType`, `Category`), no `enum.Enum`.**
   - Evidencia: `backend/app/routes.py:11-15` (`OperationType`, `Category`, `BusinessType`, `GroupBy`).
   - Riesgo que evita: introducir `Enum` mezclaría dos formas de modelar el mismo concepto en el mismo archivo.

4. **No dividas `backend/app/routes.py` en `models.py`/`services.py` sin que te lo pidan explícitamente — hoy toda la lógica vive en un único archivo.**
   - Evidencia: `backend/app/` solo contiene `__init__.py`, `main.py`, `routes.py`.
   - Riesgo que evita: crear una arquitectura por capas no solicitada que nadie más sigue en el repo.

5. **`generate_mock_movements` llama a `random.seed(42)`, que muta el estado global del módulo `random` de Python. No asumas que es seguro cachear resultados entre requests o paralelizar sin tener esto en cuenta.**
   - Evidencia: `backend/app/routes.py:94-97` (`random.seed(seed)` dentro de la función, invocada en cada endpoint).
   - Riesgo que evita: introducir concurrencia/caché que interactúe mal con el estado global del RNG compartido entre requests.
