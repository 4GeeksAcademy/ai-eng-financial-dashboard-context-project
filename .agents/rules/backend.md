# Reglas de backend

## Convenciones existentes

- Los dominios de la API usan tipos `Literal` y modelos Pydantic; conserva esos modelos como forma de declarar y validar sus respuestas. [`backend/app/routes.py:11`](../../backend/app/routes.py#L11), [`backend/app/routes.py:22`](../../backend/app/routes.py#L22).
- Las rutas declaran `response_model` y anotaciones de tipos en sus parámetros y resultados. Mantén el contrato explícito cuando agregues o modifiques rutas. [`backend/app/routes.py:248`](../../backend/app/routes.py#L248), [`backend/app/routes.py:249`](../../backend/app/routes.py#L249).
- Las pruebas observadas usan `TestClient`, funciones `test_...` y aserciones sobre estados y cuerpos HTTP. [`backend/tests/test_routes.py:9`](../../backend/tests/test_routes.py#L9), [`backend/tests/test_routes.py:29`](../../backend/tests/test_routes.py#L29).

## Medidas preventivas propuestas

- **Al cambiar generación de datos simulados:** conserva el uso determinista esperado por las rutas, que invocan el generador con semilla `42` ([`backend/app/routes.py:94`](../../backend/app/routes.py#L94), [`backend/app/routes.py:255`](../../backend/app/routes.py#L255)). Si modificas la lógica aleatoria, prefiere un generador local en lugar de cambiar el estado global con `random.seed`; añade una prueba de reproducibilidad. No hagas un refactor aislado de la generación si no es necesario para la tarea.
- **Al cambiar filtros o semántica B2B/B2C:** revisa las dos rutas; son implementaciones separadas ([`backend/app/routes.py:363`](../../backend/app/routes.py#L363), [`backend/app/routes.py:379`](../../backend/app/routes.py#L379)). Añade cobertura equivalente para ambos segmentos si el cambio afecta filtros combinados; hoy existe un caso combinado para B2B ([`backend/tests/test_routes.py:90`](../../backend/tests/test_routes.py#L90)), mientras que el test B2C comprueba principalmente el segmento devuelto ([`backend/tests/test_routes.py:62`](../../backend/tests/test_routes.py#L62)).
- **Comprobación:** desde `backend/`, ejecuta `pytest` para cambios en rutas, modelos o generación de datos.
