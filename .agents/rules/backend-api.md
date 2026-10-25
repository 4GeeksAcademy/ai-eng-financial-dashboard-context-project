# Backend: contratos y rutas de API

## Alcance

Aplica al crear o modificar modelos, endpoints, parámetros, filtros o configuración CORS en `backend/app/`.

## Justificación con evidencia del repositorio

- `backend/app/routes.py` define los literales del dominio (`OperationType`, `Category`, `BusinessType`) y el modelo `FinancialMovement`, y declara rutas con `response_model`.
- Los parámetros de consulta están tipados; por ejemplo `limit` restringe valores entre 1 y 20. Las funciones de filtro existentes se reutilizan en varias rutas.
- `backend/app/main.py` configura CORS con `allow_origins=["*"]` y `allow_credentials=True`.
- `backend/tests/test_routes.py` verifica endpoints, filtros y parte de sus contratos.

## Guía específica del proyecto

1. **Mantén el contrato explícito.** Declara modelos de respuesta con Pydantic y tipos de dominio para parámetros, siguiendo `FinancialMovement` y los `Literal` de `backend/app/routes.py`. Si un parámetro tiene rango válido, exprésalo en `Query`, como `limit`.
2. **Reutiliza filtros con semántica compartida.** `filter_movements` ya aplica fechas, categoría y tipo de operación. Antes de añadir un filtro, determina y prueba qué endpoints deben respetarlo; evita que rutas parecidas como `/api/metrics/b2b` y `/api/metrics/b2c` diverjan accidentalmente.
3. **Prueba contrato y combinaciones.** Amplía `backend/tests/test_routes.py` con status, forma de respuesta, valores permitidos y filtros combinados relevantes. Para resumen y alertas, añade expectativas numéricas cuando se modifique la fórmula, no solo comprobaciones de claves.
4. **Revisa CORS antes de despliegues externos.** La configuración actual permite cualquier origen y credenciales. Si el backend se expone públicamente, define orígenes por el entorno de despliegue y prueba orígenes permitidos y rechazados; no copies la política amplia sin evaluar el contexto.

## Ejemplo del código real

`GET /api/metrics/categories/top` declara `response_model=list[TopCategoryItem]`; `limit` usa `Query(default=5, ge=1, le=20)`. El patrón de pruebas de filtros combinados aparece en `test_b2b_endpoint_combines_new_filters` de `backend/tests/test_routes.py`.