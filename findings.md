# Hallazgos de ingeniería aceptados

Reglas propuestas para revisión; **no implementadas**. Se incluyen solo hallazgos respaldados por código, configuración, tests o documentación existente. Líneas referidas a la versión inspeccionada.

## Arquitectura y contratos de API

| Identificador | Hecho del repo | Evidencia | Riesgo | Instrucción propuesta | Comprobación |
|---|---|---|---|---|---|
| ARC-01 | La API usa `FinancialMovement` y tipos enumerados que corresponden a los campos del tipo frontend. | `backend/app/routes.py:11-26`; `frontend/src/lib/financial-types.ts:1-11` | Un cambio solo en backend o frontend rompe el contrato sin correspondencia entre capas. | Al cambiar campos o valores, actualizar modelo, tipo frontend y pruebas del endpoint/consumidor juntos. | Comparar claves y literales en ambos tipos; ejecutar pruebas backend y frontend pertinentes. |
| ARC-02 | `routes.py` contiene modelos, generación, filtros, cálculos y endpoints; B2B/B2C filtran de forma similar por separado. | `backend/app/routes.py:22-40,94-145,211-246,268-380` | Nuevos filtros o cambios de cálculo pueden aplicarse solo a algunas rutas, o duplicar lógica con divergencias. | Reutilizar las funciones de filtro/cálculo existentes y cubrir cada endpoint afectado; extraer lógica repetida solo si su semántica es idéntica. | Añadir/verificar pruebas con filtros combinados en cada ruta que deba aplicarlos. |
| API-01 | Rutas de métricas declaran `response_model`; parámetros usan tipos `Literal` y restricciones `Query` (por ejemplo `limit` 1–20). | `backend/app/routes.py:11-14,254-303` | Parámetros sin validar o respuestas sin contrato explícito pueden cambiar el comportamiento esperado de clientes. | Mantener tipos/modelos de respuesta y validar parámetros acotados en las rutas nuevas o modificadas. | Revisar firma y decorador; probar respuesta y valores de parámetro válidos/no válidos con `TestClient`. |
| API-02 | CORS admite `allow_origins=["*"]` y `allow_credentials=True`. | `backend/app/main.py:7-13` | Si la API se expone fuera del entorno local, la política es más amplia de lo que requiere un frontend de origen concreto. | Antes de desplegar públicamente, definir orígenes permitidos según el entorno y verificar el uso de credenciales. | Revisar configuración efectiva del despliegue y probar orígenes permitido/no permitido. |

## Datos y cálculos

| Identificador | Hecho del repo | Evidencia | Riesgo | Instrucción propuesta | Comprobación |
|---|---|---|---|---|---|
| DAT-01 | La pantalla obtiene `/api/metrics`; `mock-data.ts` existe, pero no aparece importado por `App.tsx`. | `frontend/src/App.tsx:13-20`; `frontend/src/lib/mock-data.ts` | Editar el mock inactivo puede no cambiar la UI; la fuente visible es el generador backend. | Antes de cambiar datos mostrados, confirmar la fuente usada por `App`; distinguir mock local de datos servidos por API. | Buscar imports/usos de `mock-data.ts` y comprobar la petición de `App.tsx`. |
| DAT-02 | El generador usa `date.today()` y la cabecera presenta un periodo fijo «2024 - Full Year». | `backend/app/routes.py:65-67,94-105`; `frontend/src/App.tsx:49` | El texto del periodo puede no corresponder a las fechas devueltas. | Mantener etiqueta y rango de datos sincronizados; si el periodo es estático de demostración, indicarlo como tal. | Comparar periodo visible con fechas de `/api/metrics` en prueba o revisión de UI. |
| DAT-03 | `generate_mock_movements(seed)` llama a `random.seed(seed)` sobre el módulo global. | `backend/app/routes.py:94-101` | Cambia el estado aleatorio compartido del proceso y puede acoplar resultados a orden de llamadas. | Al ampliar el generador, preservar repetibilidad con estado aleatorio local en vez de modificar el global. | Probar igualdad con la misma semilla y que el generador no altera una secuencia aleatoria independiente. |
| DAT-04 | Margen/neto se calculan en backend y también se calculan KPI/margen mensual en frontend. | `backend/app/routes.py:161-181,211-216`; `frontend/src/lib/financial-utils.ts:21-33,36-66` | Si ambas capas suministran el mismo indicador, redondeo o semántica pueden divergir. | Al trasladar o duplicar un cálculo, declarar su fuente de verdad y fijar fórmula, precisión y casos límite en pruebas. | Comparar resultados con movimientos controlados, incluidos decimales e ingresos cero. |

## Testing

| Identificador | Hecho del repo | Evidencia | Riesgo | Instrucción propuesta | Comprobación |
|---|---|---|---|---|---|
| TST-01 | Tests frontend comprueban fórmulas y agregaciones; algunas pruebas API de resumen/alertas solo comprueban forma o propiedades generales. | `frontend/src/lib/financial-utils.test.ts:35-110`; `backend/tests/test_routes.py:121-153,173-188` | Errores numéricos en resumen o alertas pueden pasar las aserciones actuales. | Al modificar esas fórmulas, añadir entradas pequeñas con resultados numéricos esperados y cubrir límites relevantes. | Ejecutar `pytest` y `npm test`; verificar que cada prueba afirma valores, no solo claves/tipos. |

## Documentación y experiencia de desarrollo

| Identificador | Hecho del repo | Evidencia | Riesgo | Instrucción propuesta | Comprobación |
|---|---|---|---|---|---|
| DX-01 | README inglés y español duplican los pasos de arranque, proxy y URLs. | `README.md:39-50`; `README.es.md:39-50` | Cambios en puertos o configuración pueden quedar documentados en un solo idioma. | Actualizar ambas secciones equivalentes cuando cambien los comandos, URLs o variables. | Comparar las dos secciones tras cualquier edición de instrucciones de ejecución. |
| DX-02 | El frontend ofrece scripts de test/build; backend incluye pytest y tests, pero Compose no define una tarea de validación conjunta. | `frontend/package.json:6-13`; `backend/requirements.txt:4-6`; `docker-compose.yml:1-22` | Se puede ejecutar la validación de una capa y omitir la otra. | En instrucciones de validación, indicar por separado cómo ejecutar tests frontend y backend; no presentar un comando como suite conjunta si no existe. | Seguir los comandos documentados en cada directorio y confirmar ejecución de ambas suites. |
| DX-03 | Vite proxifica `/api` a `http://backend:8000`; README documenta `VITE_API_BASE_URL` para otro origen. | `frontend/vite.config.ts:9-16`; `frontend/src/App.tsx:13-16`; `README.es.md:45-46` | El hostname de servicio `backend` depende del entorno Compose y no necesariamente resuelve al ejecutar Vite fuera de esa red. | Al cambiar el entorno de ejecución, mantener alineados el proxy, la variable base y las instrucciones para el entorno correspondiente. | Verificar `/api/metrics` con proxy Compose y, si se soporta, con `VITE_API_BASE_URL` alternativo. |
