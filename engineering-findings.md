# Hallazgos de ingeniería

## Alcance

El proyecto es un dashboard de ejemplo: el backend genera movimientos financieros simulados y expone endpoints FastAPI; el frontend solicita `/api/metrics` y calcula los KPI y las series mensuales en el cliente. No se observó una conexión a una fuente financiera externa.

Este documento distingue **convenciones existentes** (patrones comprobados en el código) de **recomendaciones** (reglas propuestas para futuras contribuciones). No implementa esas reglas.

## Arquitectura y contratos

### ENG-ARCH-01 — Contrato API duplicado entre backend y frontend

- **Tipo:** Convención existente y recomendación.
- **Evidencia:** El backend valida `FinancialMovement` con Pydantic y tipos `Literal` en [backend/app/routes.py](backend/app/routes.py#L11) y [backend/app/routes.py](backend/app/routes.py#L22). El frontend representa ese payload en [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts#L1) y [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts#L5). Los campos recibidos conservan `snake_case`; los KPI calculados usan nombres como `totalIncome` en [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts#L13).
- **Observación:** Hay dos declaraciones del mismo contrato, una por lenguaje; actualmente comparten los nombres y tipos relevantes.
- **Consecuencia práctica:** Cambiar un campo en un solo lado puede dejar al dashboard leyendo una forma de respuesta distinta de la que entrega la API.
- **Regla propuesta:** Al cambiar el esquema JSON, actualizar el modelo Pydantic, el tipo TypeScript y una prueba del endpoint que compruebe los campos. Mantener `snake_case` para el payload API y reservar `camelCase` para valores derivados del frontend.

### ENG-ARCH-02 — El periodo mostrado no representa el periodo generado

- **Tipo:** Riesgo confirmado por el código.
- **Evidencia:** El dashboard pasa el texto fijo `2024 - Full Year` en [frontend/src/App.tsx](frontend/src/App.tsx#L49). El generador toma `date.today()` y asigna los meses a años en [backend/app/routes.py](backend/app/routes.py#L65), [backend/app/routes.py](backend/app/routes.py#L67) y [backend/app/routes.py](backend/app/routes.py#L97); recorre los doce meses en [backend/app/routes.py](backend/app/routes.py#L99). La prueba llamada “full year” solo comprueba 360 registros y orden cronológico en [backend/tests/test_routes.py](backend/tests/test_routes.py#L12) y [backend/tests/test_routes.py](backend/tests/test_routes.py#L15).
- **Observación:** El rótulo está fijado en 2024, pero el año del conjunto generado depende de la fecha en que se ejecuta. La prueba no verifica que los datos correspondan a un único año ni que coincidan con el rótulo.
- **Consecuencia práctica:** La interfaz puede presentar datos de un periodo distinto del que anuncia; el test actual no detectaría esa discrepancia.
- **Regla propuesta:** Elegir una sola fuente de verdad para el periodo: o fijar el año del dataset y del rótulo, o derivar el rótulo de las fechas efectivamente recibidas. Probar explícitamente los límites de fecha y el periodo anunciado.

## Datos y formatos

### ENG-DATA-01 — Parseo de fechas ISO dependiente de la zona horaria

- **Tipo:** Riesgo confirmado por el código y comprobado localmente.
- **Evidencia:** [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L42) crea un `Date` desde `create_date`, que el backend serializa como fecha en [backend/app/routes.py](backend/app/routes.py#L22). La agregación lee año y mes locales en [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts#L7). Las fechas de prueba actuales no incluyen el primer día del mes: [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L67) y [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L74).
- **Observación:** JavaScript interpreta una cadena `YYYY-MM-DD` como medianoche UTC; leer luego el mes local puede moverla al día anterior en zonas horarias al oeste de UTC. Se reprodujo con `TZ=America/Los_Angeles`: `2025-03-01` produjo `2025-02-28` y la clave `2025-02`.
- **Consecuencia práctica:** Un movimiento del primer día puede sumarse al mes anterior en los gráficos, según la zona horaria del navegador.
- **Regla propuesta:** Tratar las fechas sin hora como fechas calendario, con una única estrategia de parseo independiente de la zona local, y añadir un caso del primer día de mes que se ejecute bajo una zona horaria UTC negativa.

## Pruebas

### ENG-TEST-01 — La lógica pura está probada; el flujo de pantalla/API no

- **Tipo:** Convención existente y recomendación.
- **Evidencia:** La suite backend usa `TestClient` y prueba salud, filtros y endpoints, por ejemplo [backend/tests/test_routes.py](backend/tests/test_routes.py#L29), [backend/tests/test_routes.py](backend/tests/test_routes.py#L36) y [backend/tests/test_routes.py](backend/tests/test_routes.py#L104). La suite frontend encontrada está en [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L35), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L63) y [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts#L106); prueba cálculos y formateadores. La carga, el estado de error y la transformación se conectan en [frontend/src/App.tsx](frontend/src/App.tsx#L15) y [frontend/src/App.tsx](frontend/src/App.tsx#L29).
- **Observación:** La lógica financiera tiene pruebas unitarias y la API tiene pruebas de endpoints, pero no se identificaron pruebas que monten el dashboard o verifiquen el fetch y sus estados de éxito/error.
- **Consecuencia práctica:** Un fallo en la ruta efectiva, el proxy o el manejo de respuesta del dashboard puede escapar a las suites actuales aunque las funciones matemáticas sigan pasando.
- **Regla propuesta:** Para cambios en carga de datos o presentación, añadir una prueba de componente/integración que compruebe la petición, los datos mostrados y el estado de error; conservar las pruebas unitarias actuales para cálculos aislados.

### ENG-TEST-02 — Comandos de prueba definidos, pero no ejecutables en este entorno

- **Tipo:** Resultado de verificación de esta revisión, no defecto atribuido al código.
- **Evidencia:** El backend declara `pytest` y `httpx` en [backend/requirements.txt](backend/requirements.txt#L4). El frontend declara `test`, `test:watch` y `test:coverage` en [frontend/package.json](frontend/package.json#L11).
- **Observación:** `cd backend && pytest -q` terminó durante la colección con `ModuleNotFoundError: No module named 'fastapi'`. La ejecución de Vitest desde `frontend` terminó con `vitest: not found`.
- **Consecuencia práctica:** No se pudo confirmar el resultado de ninguna suite en este entorno; estos resultados no significan que las pruebas fallen una vez instaladas las dependencias.
- **Regla propuesta:** Antes de usar el resultado de una suite como criterio de aceptación, instalar las dependencias declaradas y registrar el comando y resultado. Documentar también los comandos de backend y frontend para que todos ejecuten la misma verificación.

## Entorno de desarrollo

### ENG-ENV-01 — Compose ordena el arranque, pero no espera a que la API esté lista

- **Tipo:** Riesgo basado en configuración y flujo confirmado.
- **Evidencia:** El servicio frontend declara `depends_on: backend` en [docker-compose.yml](docker-compose.yml#L11), sin configuración `healthcheck`. El dashboard hace una sola petición al montar en [frontend/src/App.tsx](frontend/src/App.tsx#L29); ante error establece un aviso y termina la carga en [frontend/src/App.tsx](frontend/src/App.tsx#L35) y [frontend/src/App.tsx](frontend/src/App.tsx#L40).
- **Observación:** La dependencia de Compose expresa el orden de inicio, pero no la disponibilidad HTTP del backend. La aplicación no reintenta la petición inicial.
- **Consecuencia práctica:** Si Vite inicia antes de que FastAPI acepte conexiones, el usuario puede ver un error aunque el backend termine iniciando después; la pantalla no vuelve a consultar por sí sola.
- **Regla propuesta:** Si el flujo depende de que API esté lista al arrancar, declarar un healthcheck y condicionar el frontend a su estado saludable, o añadir una estrategia de reintento visible y limitada en el cliente.

### ENG-ENV-02 — Dependencias Python sin versiones fijadas

- **Tipo:** Riesgo confirmado por configuración.
- **Evidencia:** [backend/requirements.txt](backend/requirements.txt#L1) a [backend/requirements.txt](backend/requirements.txt#L6) declara paquetes sin límites de versión, y [backend/Dockerfile](backend/Dockerfile#L6) los instala durante el build.
- **Observación:** Dos builds realizados en fechas distintas pueden resolver versiones diferentes de FastAPI, Uvicorn, Pytest u otras dependencias.
- **Consecuencia práctica:** Una actualización transitiva puede cambiar el comportamiento o hacer que una instalación anterior deje de ser reproducible sin que cambie el código del proyecto.
- **Regla propuesta:** Fijar versiones o rangos compatibles mediante un archivo de constraints/lock para Python y actualizarlo deliberadamente junto con las pruebas pertinentes.

## Documentación

### ENG-DOC-01 — Los README explican cómo iniciar, pero no cómo validar

- **Tipo:** Convención existente y recomendación.
- **Evidencia:** Ambos README indican `docker compose up --build` en [README.md](README.md#L42) y [README.es.md](README.es.md#L42). Los scripts de prueba del frontend están en [frontend/package.json](frontend/package.json#L11); las dependencias de prueba backend, en [backend/requirements.txt](backend/requirements.txt#L4).
- **Observación:** La documentación cubre el arranque y las URLs, pero no proporciona una secuencia para ejecutar las pruebas backend y frontend.
- **Consecuencia práctica:** Un colaborador puede iniciar la interfaz sin saber cómo validar cambios o puede asumir que Docker ejecuta pruebas automáticamente; el compose no declara un servicio de tests.
- **Regla propuesta:** Mantener en ambos README una sección breve de verificación con instalación/requisitos y comandos backend y frontend; actualizarla cuando cambien los scripts o el entorno.

## Comprobaciones realizadas

- `git status --short --branch`: árbol limpio en `main` antes de crear este documento.
- `git log -5 --oneline`: el historial incluye `954f812` (merge) y `eeece05` (proxy de Vite y documentación del entorno frontend).
- `cd backend && pytest -q`: no se recolectaron tests; falta `fastapi` en el Python del entorno.
- `npm test -- --reporter=dot` en `frontend`: Vitest no está instalado en el entorno (`vitest: not found`).
- `TZ=America/Los_Angeles node -e 'const d = new Date("2025-03-01"); console.log(d.toString()); console.log(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`)'`: imprimió `Fri Feb 28 2025 16:00:00 GMT-0800` y `2025-02`.
- `frontend/.env.example`: está versionado. No se considera hallazgo su existencia; el archivo contiene una asignación vacía que el README indica completar al necesitar un origen alternativo.

No se instalaron dependencias ni se inició/reinició Compose durante esta fase. No se verificó visualmente la interfaz. Los hallazgos describen evidencia estática del repositorio y las comprobaciones automáticas enumeradas; no sustituyen la revisión visual personal.