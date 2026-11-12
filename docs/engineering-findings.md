# Hallazgos y reglas propuestas de ingeniería

Este documento es una propuesta para revisar antes de crear archivos definitivos en `.agents/rules`. No se modificaron reglas del agente ni se ejecutaron pruebas como parte de esta fase.

## Hallazgos observados

- **Contrato duplicado:** `FinancialMovement`, sus campos y valores permitidos se describen por separado en [`backend/app/routes.py`](../backend/app/routes.py) y [`frontend/src/lib/financial-types.ts`](../frontend/src/lib/financial-types.ts). No se observó generación automática de tipos compartidos.
- **Período no sincronizado:** [`frontend/src/App.tsx`](../frontend/src/App.tsx) fija la etiqueta `2024 - Full Year`, mientras `generate_mock_movements` en [`backend/app/routes.py`](../backend/app/routes.py) construye fechas a partir de la fecha actual. En la ejecución previa se recibieron datos entre 2025-11-01 y 2026-10-28.
- **Fechas locales en el agrupamiento:** `computeMonthlyData` convierte fechas ISO con `new Date(...)` y extrae año y mes locales en [`frontend/src/lib/financial-utils.ts`](../frontend/src/lib/financial-utils.ts). La prueba existente cubre un cambio de año, no el día primero bajo distintas zonas horarias: [`frontend/src/lib/financial-utils.test.ts`](../frontend/src/lib/financial-utils.test.ts).
- **Semilla aleatoria global:** `generate_mock_movements` llama a `random.seed(seed)` y luego usa funciones del módulo `random` en [`backend/app/routes.py`](../backend/app/routes.py). Esto modifica el generador aleatorio global del proceso; no se observó una prueba que cubra su interacción con otros consumidores de aleatoriedad.
- **Error de UI genérico:** `fetchFinancialData` detecta respuestas HTTP no exitosas, pero el `catch` de `App` oculta el detalle y muestra un mensaje general: [`frontend/src/App.tsx`](../frontend/src/App.tsx). No se observó una prueba del estado de error de la interfaz.
- **Comprobación de comparación limitada:** `test_metrics_comparison_returns_delta_fields` en [`backend/tests/test_routes.py`](../backend/tests/test_routes.py) usa fechas fijas de marzo de 2025 y solo comprueba las claves de respuesta. No verifica el significado de los importes ni que las fechas pertenezcan al rango generado dinámicamente.
- **Documentación duplicada por idioma:** [`README.md`](../README.md) y [`README.es.md`](../README.es.md) documentan el arranque y URLs locales en inglés y español.

## Reglas propuestas

### Arquitectura

#### Mantener explícita la ruta real de consumo

- **Situación:** Al cambiar endpoints, cálculos o vistas del dashboard.
- **Evidencia:** [`frontend/src/App.tsx`](../frontend/src/App.tsx) consume `/api/metrics`; [`backend/app/routes.py`](../backend/app/routes.py) también define facetas, resúmenes, comparación, alertas y rutas B2B/B2C que esta pantalla no solicita.
- **Instrucción:** Antes de modificar una ruta o una transformación, identifica su consumidor real y conserva separadas la composición de pantalla, los cálculos financieros y la lógica/endpoints del backend según el patrón actual.
- **Riesgo que evita:** Cambiar una ruta que no está conectada a la pantalla suponiendo que la modifica, o duplicar cálculos divergentes en componentes.
- **Verificación:** Busca la ruta en `App.tsx` y sus componentes; compara los parámetros, respuesta y tipo de dato con la función correspondiente en `routes.py`.

### Frontend

#### Tratar los movimientos como fechas de calendario

- **Situación:** Al parsear, agrupar o formatear `create_date`.
- **Evidencia:** `FinancialMovement.create_date` es un texto de fecha ISO en [`frontend/src/lib/financial-types.ts`](../frontend/src/lib/financial-types.ts); `computeMonthlyData` usa `new Date(m.create_date)` y getters locales en [`frontend/src/lib/financial-utils.ts`](../frontend/src/lib/financial-utils.ts).
- **Instrucción:** No cambies la estrategia de fechas sin comprobar explícitamente fechas del día 1 y zonas horarias negativas; mantén consistentes la fecha de calendario y el mes de agrupación.
- **Riesgo que evita:** Que un movimiento del primer día del mes se agrupe en el mes anterior por interpretación UTC/local.
- **Verificación:** Ejecuta las pruebas existentes de `financial-utils` y comprueba, con una zona horaria negativa, que una fecha como `2025-11-01` no cambia de mes. La prueba actual no cubre esa condición.

#### No presentar como fijo un período generado dinámicamente

- **Situación:** Al cambiar la etiqueta del período, la fuente de movimientos o el generador del backend.
- **Evidencia:** La etiqueta está fijada en [`frontend/src/App.tsx`](../frontend/src/App.tsx); las fechas de los datos se calculan con `date.today()` en `generate_mock_movements` de [`backend/app/routes.py`](../backend/app/routes.py). La ejecución previa mostró un rango distinto de 2024.
- **Instrucción:** Mantén el período visible coherente con el rango realmente consultado; si es deliberadamente fijo, documenta y valida esa correspondencia en vez de asumirla.
- **Riesgo que evita:** Mostrar un año que contradice los datos de tarjetas y gráficos.
- **Verificación:** Compara la etiqueta visible con `min_date`/`max_date` de la respuesta o con la política de período explícita; inspecciona el cambio en `App.tsx`.

#### Conservar los estados actuales de carga y error

- **Situación:** Al modificar `fetchFinancialData` o el flujo de carga de `App`.
- **Evidencia:** [`frontend/src/App.tsx`](../frontend/src/App.tsx) gestiona `loading`, `error`, valida `response.ok` y finaliza la carga en `finally`; [`kpi-card.tsx`](../frontend/src/components/dashboard/kpi-card.tsx) y los gráficos muestran esqueletos durante la carga.
- **Instrucción:** Asegura que las respuestas HTTP fallidas y los errores de red terminen la carga y mantengan un estado visible; no elimines la validación `response.ok` sin sustituirla por manejo equivalente.
- **Riesgo que evita:** Una carga que queda indefinida, datos incompletos sin aviso o errores del servidor tratados como datos válidos.
- **Verificación:** Prueba o inspecciona el flujo para respuesta no exitosa y rechazo de red; confirma que `finally` libera `loading` y que `error` se representa.

### Backend

#### Evitar alterar el generador aleatorio global

- **Situación:** Al cambiar `generate_mock_movements` o añadir generación aleatoria en el proceso.
- **Evidencia:** [`backend/app/routes.py`](../backend/app/routes.py) llama a `random.seed(seed)` y usa `random.uniform`, `random.randint` y `random.choice` a nivel de módulo.
- **Instrucción:** Conserva la reproducibilidad de la semilla sin depender de cambiar el estado aleatorio global compartido con otras funciones.
- **Riesgo que evita:** Que una llamada de generación altere resultados aleatorios no relacionados o vuelva frágil una prueba por orden de ejecución.
- **Verificación:** Comprueba que dos generaciones con la misma semilla son iguales y que llamar al generador no modifica la secuencia de un generador aleatorio independiente.

#### Preservar la validación y respuesta declaradas por FastAPI

- **Situación:** Al modificar parámetros, tipos de dominio o respuestas de endpoints.
- **Evidencia:** [`backend/app/routes.py`](../backend/app/routes.py) declara dominios `Literal`, modelos Pydantic y `response_model` en las rutas.
- **Instrucción:** Actualiza conjuntamente los tipos/modelos y el `response_model` aplicable; no reemplaces estos contratos por respuestas sin validar sin una razón explícita.
- **Riesgo que evita:** Aceptar valores que el dominio no contempla o devolver estructuras incompatibles con consumidores existentes.
- **Verificación:** Ejecuta las pruebas relevantes de `backend/tests/test_routes.py` y comprueba casos válidos, filtros inválidos y la forma de la respuesta modificada.

### Comunicación con la API

#### Mantener sincronizados los dos lados del contrato

- **Situación:** Al agregar o renombrar campos, categorías o tipos de operación.
- **Evidencia:** Los modelos de [`backend/app/routes.py`](../backend/app/routes.py) y los tipos de [`frontend/src/lib/financial-types.ts`](../frontend/src/lib/financial-types.ts) están definidos separadamente; [`App.tsx`](../frontend/src/App.tsx) consume directamente el JSON como `FinancialMovement[]`.
- **Instrucción:** Si cambia el esquema de respuesta, actualiza el modelo Pydantic y el tipo TypeScript en el mismo cambio y revisa todos los consumidores de ese tipo.
- **Riesgo que evita:** Desajustes silenciosos entre JSON, cálculos y componentes.
- **Verificación:** Compara campo por campo tipos, valores literales y nulabilidad en ambos lados; ejecuta el build de TypeScript y las pruebas de la ruta afectada.

#### Respetar la base de API y el proxy de desarrollo

- **Situación:** Al cambiar cómo el frontend dirige solicitudes o configurar otro backend.
- **Evidencia:** [`frontend/src/App.tsx`](../frontend/src/App.tsx) antepone `VITE_API_BASE_URL`; [`frontend/vite.config.ts`](../frontend/vite.config.ts) reenvía `/api` a `http://backend:8000`.
- **Instrucción:** Conserva el uso de `/api` relativo con el proxy por defecto; si cambias la base, mantén compatible `VITE_API_BASE_URL` y actualiza la configuración/documentación correspondiente.
- **Riesgo que evita:** Solicitudes al host equivocado o dependencia accidental de `localhost` dentro del entorno de contenedores.
- **Verificación:** Comprueba la petición a `/api/metrics` a través de Vite y su respuesta, además del destino configurado en `vite.config.ts`.

### Testing

#### No confundir forma de respuesta con corrección de cálculo

- **Situación:** Al modificar comparación de períodos o datos que dependen del calendario actual.
- **Evidencia:** `test_metrics_comparison_returns_delta_fields` en [`backend/tests/test_routes.py`](../backend/tests/test_routes.py) comprueba claves con fechas fijas; `generate_mock_movements` en [`backend/app/routes.py`](../backend/app/routes.py) produce un rango móvil.
- **Instrucción:** Al tocar esta lógica, revisa si los datos de prueba pertenecen al rango generado y si las aserciones verifican valores/semántica además de estructura; no interpretes una prueba de forma como validación del cálculo.
- **Riesgo que evita:** Que una comparación devuelva importes vacíos o incorrectos y la prueba pase porque el JSON conserva sus claves.
- **Verificación:** Ejecuta la prueba específica y comprueba que las fechas seleccionadas intersectan los datos; contrasta los importes esperados con movimientos conocidos.

#### Usar los comandos de validación propios de cada lado

- **Situación:** Tras modificar frontend, backend o ambos.
- **Evidencia:** [`frontend/package.json`](../frontend/package.json) declara `test`, `lint` y `build`; [`backend/requirements.txt`](../backend/requirements.txt) incluye `pytest`, y [`backend/tests`](../backend/tests) contiene pruebas con `TestClient`.
- **Instrucción:** Ejecuta validaciones específicas del código cambiado con las herramientas del lado correspondiente; informa cuáles corriste y no declares una prueba superada si no se ejecutó.
- **Riesgo que evita:** Confundir comandos disponibles con resultados comprobados, o validar un cambio de Python solo con el build TypeScript y viceversa.
- **Verificación:** Registra el comando exacto y el resultado real; para frontend usa los scripts definidos en `package.json`, para backend el test específico de pytest.

### Documentación

#### Mantener coherentes las guías en ambos idiomas

- **Situación:** Al cambiar el arranque, los puertos o la configuración documentada.
- **Evidencia:** [`README.md`](../README.md) y [`README.es.md`](../README.es.md) contienen instrucciones paralelas para ejecutar el proyecto y URLs locales.
- **Instrucción:** Actualiza ambas guías cuando una modificación cambie esos pasos o sus valores; distingue instrucciones documentadas de verificaciones realmente ejecutadas.
- **Riesgo que evita:** Que las guías en inglés y español indiquen procedimientos o puertos distintos, o que se presente un procedimiento no probado como validado.
- **Verificación:** Compara las secciones de ejecución en los dos README y contrasta comandos/puertos con `docker-compose.yml` y los Dockerfiles.