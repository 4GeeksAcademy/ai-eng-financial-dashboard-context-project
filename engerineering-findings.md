# Hallazgos de ingenieria y reglas propuestas

## Alcance

Revision estatica de frontend, backend e integracion. Este documento recoge los
hallazgos y las reglas propuestas revisados en la conversacion; no implica que
las correcciones esten implementadas ni que se hayan ejecutado pruebas.

Las categorias son Arquitectura, Naming, Testing, Documentacion y Otra.
Se distingue entre fallos observados, riesgos condicionales, brechas de pruebas
y patrones existentes que conviene preservar.

## Frontend

### F01. Separar calculo y presentacion

- **Categoria:** Arquitectura.
- **Hallazgo:** Los KPIs y agregados mensuales se calculan en funciones puras, fuera de los componentes. Es un patron que conviene preservar.
- **Regla propuesta:** Mantener las formulas en `financial-utils` y pasar resultados a los componentes. No duplicar calculos financieros entre vistas.
- **Archivos que la justifican:** [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts), [frontend/src/components/dashboard/kpi-row.tsx](frontend/src/components/dashboard/kpi-row.tsx).

### F02. Validar los datos recibidos

- **Categoria:** Arquitectura.
- **Hallazgo:** La peticion devuelve directamente `response.json()`. El tipo TypeScript no valida campos ni valores en tiempo de ejecucion; una respuesta incompatible puede producir calculos incorrectos.
- **Regla propuesta:** Validar el JSON antes de calcular metricas y enviar las respuestas incompatibles al estado de error, sin tratarlas como datos financieros validos.
- **Archivos que la justifican:** [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts).

### F03. Reutilizar componentes y tokens compartidos

- **Categoria:** Arquitectura.
- **Hallazgo:** La UI utiliza `Card`, `Skeleton`, `cn` y variables CSS compartidas. Cambiarlos puede afectar a varias vistas.
- **Regla propuesta:** Reutilizar estas abstracciones en lugar de duplicar estilos. Al modificarlas, revisar sus consumidores y preservar los contenedores responsivos y las alturas estables de los graficos.
- **Archivos que la justifican:** [frontend/src/components/ui/card.tsx](frontend/src/components/ui/card.tsx), [frontend/src/components/ui/skeleton.tsx](frontend/src/components/ui/skeleton.tsx), [frontend/src/lib/utils.ts](frontend/src/lib/utils.ts), [frontend/src/index.css](frontend/src/index.css), [frontend/src/components/dashboard/income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx).

### F04. Agrupar fechas sin depender de la zona horaria

- **Categoria:** Testing.
- **Hallazgo:** La agrupacion interpreta fechas ISO con `new Date(...)` y obtiene el mes mediante getters locales. En zonas al oeste de UTC, el primer dia de un mes puede agruparse en el anterior.
- **Regla propuesta:** Tratar `create_date` como fecha de calendario. Probar primeros de mes en distintas zonas horarias, entradas desordenadas y cambios de ano; mantener claves que incluyan ano y mes.
- **Archivos que la justifican:** [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts).

### F05. Distinguir cero, ausencia, carga y error

- **Categoria:** Testing.
- **Hallazgo:** El grafico de margen muestra ausencia de datos cuando todos los margenes son cero, aunque los registros sean validos. Las pruebas actuales de utilidades no cubren los estados de los componentes.
- **Regla propuesta:** Probar carga, error, lista vacia y una serie con margen de 0 %. Determinar la existencia de datos por los registros, no por un margen distinto de cero.
- **Archivos que la justifican:** [frontend/src/components/dashboard/profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx), [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts).

### F06. Explicitar las convenciones financieras

- **Categoria:** Documentacion.
- **Hallazgo:** El beneficio es ingresos menos gastos; el margen se calcula sobre ingresos y vale cero si no hay ingresos. La presentacion actual usa USD sin decimales.
- **Regla propuesta:** Documentar estas convenciones como comportamiento actual. Cualquier cambio debe actualizar calculos, pruebas y documentacion; no sustituir silenciosamente la base del porcentaje ni el formato monetario.
- **Archivos que la justifican:** [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts).

### F07. Mostrar el periodo real

- **Categoria:** Otra.
- **Hallazgo:** La app fija la etiqueta `2024 - Full Year`, mientras la API genera fechas relativas al dia actual. La etiqueta no corresponde al conjunto servido.
- **Regla propuesta:** Derivar el periodo del rango real de datos o de los filtros aplicados. No corregir el problema sustituyendo un ano fijo por otro.
- **Archivos que la justifican:** [frontend/src/App.tsx](frontend/src/App.tsx), [backend/app/routes.py](backend/app/routes.py).

## Backend

### B01. Mantener la separacion entre configuracion, rutas y logica

- **Categoria:** Arquitectura.
- **Hallazgo:** La configuracion de FastAPI vive en `main` y los endpoints y helpers en el router. Los endpoints reutilizan funciones de filtrado, ordenacion y calculo.
- **Regla propuesta:** Mantener esta separacion y reutilizar los helpers en cada endpoint. No duplicar filtros o formulas para cada variante B2B/B2C.
- **Archivos que la justifican:** [backend/app/main.py](backend/app/main.py), [backend/app/routes.py](backend/app/routes.py).

### B02. Probar filtros y orden con resultados exactos

- **Categoria:** Testing.
- **Hallazgo:** Existen pruebas de filtros y extremos inclusivos, pero la prueba del resumen semanal B2C solo comprueba que la respuesta no este vacia y no demuestra que se aplique ese filtro.
- **Regla propuesta:** Usar datos controlados para verificar filtros combinados, ambos extremos del intervalo y orden cronologico. Comprobar registros y valores esperados, no solo el estado HTTP o una respuesta no vacia.
- **Archivos que la justifican:** [backend/tests/test_routes.py](backend/tests/test_routes.py), [backend/app/routes.py](backend/app/routes.py).

### B03. Probar formulas, no solo estructuras

- **Categoria:** Testing.
- **Hallazgo:** Las pruebas de comparacion verifican claves, no calculos. Las de alertas permiten una lista vacia sin demostrar la deteccion de una anomalia.
- **Regla propuesta:** Comprobar resultados numericos de resumen, comparacion y alertas con datos conocidos. Incluir saldo anterior cero, saldo negativo y umbral exacto; preservar `delta_pct = None` cuando el saldo anterior sea cero y el criterio estricto `increase_ratio > threshold` salvo cambio explicito del contrato.
- **Archivos que la justifican:** [backend/tests/test_routes.py](backend/tests/test_routes.py), [backend/app/routes.py](backend/app/routes.py).

### B04. Controlar fecha y aleatoriedad en pruebas

- **Categoria:** Testing.
- **Hallazgo:** Los mocks dependen de `date.today()` y del generador aleatorio global. Una semilla fija no garantiza datos independientes del calendario ni de peticiones concurrentes.
- **Regla propuesta:** Hacer controlables la fecha y el generador en las pruebas. Verificar que los endpoints operan sobre el mismo conjunto base bajo esas condiciones, incluidas solicitudes concurrentes.
- **Archivos que la justifican:** [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py).

### B05. Documentar el alcance temporal y de despliegue

- **Categoria:** Documentacion.
- **Hallazgo:** Los mocks cubren los doce meses completos anteriores al mes actual. La configuracion Docker arranca con depurador y recarga automatica y corresponde a desarrollo.
- **Regla propuesta:** Documentar ese rango temporal y el caracter de desarrollo de Docker. No describir los mocks como un ano fijo ni esta configuracion como un despliegue productivo.
- **Archivos que la justifican:** [backend/app/routes.py](backend/app/routes.py), [backend/Dockerfile](backend/Dockerfile), [README.es.md](README.es.md).

### B06. Rechazar rangos invertidos

- **Categoria:** Otra.
- **Hallazgo:** No se valida `start_date <= end_date`. Un rango invertido devuelve filtros vacios y permite calcular una comparacion con duracion negativa.
- **Regla propuesta:** Rechazar `start_date > end_date` con un error de cliente antes de filtrar o comparar. Preservar la inclusion de ambos extremos en los rangos validos.
- **Archivos que la justifican:** [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py).

### B07. Evitar estado aleatorio global por peticion

- **Categoria:** Otra.
- **Hallazgo:** Cada generacion ejecuta `random.seed(42)` sobre el generador global. Las peticiones concurrentes pueden intercalar llamadas y producir conjuntos distintos entre endpoints.
- **Regla propuesta:** Usar un generador aleatorio local por generacion y no reinicializar el estado global durante las solicitudes.
- **Archivos que la justifican:** [backend/app/routes.py](backend/app/routes.py).

### B08. Separar desarrollo y produccion

- **Categoria:** Otra.
- **Hallazgo:** Docker escucha con `debugpy` en `0.0.0.0:5678`, publica ese puerto y activa `--reload`. Es un riesgo alto si se reutiliza esta configuracion en produccion. CORS permite todos los origenes y habilita credenciales.
- **Regla propuesta:** Reservar el depurador, el puerto `5678` y la recarga para desarrollo. Antes de desplegar en produccion, retirar esa exposicion y definir origenes CORS explicitos si se usan credenciales.
- **Archivos que la justifican:** [backend/Dockerfile](backend/Dockerfile), [docker-compose.yml](docker-compose.yml), [backend/app/main.py](backend/app/main.py).

## Integracion

### I01. Preservar los nombres del contrato HTTP

- **Categoria:** Naming.
- **Hallazgo:** Backend y frontend coinciden en campos y enumeraciones. Renombrar solo un lado rompe los consumidores, aunque cada proyecto compile por separado.
- **Regla propuesta:** Conservar `create_date`, `amount`, `operation_type`, `category` y `business_type`, junto con sus enumeraciones. No sustituir `outcome` ni cambiar las mayusculas de `B2B`/`B2C` unilateralmente. Coordinar cualquier cambio en modelos, tipos, endpoints, consumidores y pruebas.
- **Archivos que la justifican:** [backend/app/routes.py](backend/app/routes.py), [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts).

### I02. Mantener un contrato explicito y validado

- **Categoria:** Arquitectura.
- **Hallazgo:** La API declara modelos Pydantic de respuesta y enumeraciones para parametros cerrados. El frontend consume movimientos y calcula sus propios KPIs; los endpoints de resumen y comparacion tienen contratos distintos.
- **Regla propuesta:** Mantener modelos de respuesta y parametros tipados. Actualizar los tipos y la validacion del frontend cuando cambie el esquema; no sustituir movimientos por resumenes sin adaptar explicitamente los consumidores y las pruebas.
- **Archivos que la justifican:** [backend/app/routes.py](backend/app/routes.py), [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts), [frontend/src/App.tsx](frontend/src/App.tsx).

### I03. Coordinar conexion y resolucion de imports

- **Categoria:** Otra.
- **Hallazgo:** La app usa `/api` y admite `VITE_API_BASE_URL`. El proxy apunta a `backend:8000`, un nombre dependiente de la red de Compose. El alias `@` se configura tanto en Vite como en TypeScript.
- **Regla propuesta:** Mantener estos mecanismos y no introducir URLs locales en componentes. Coordinar cambios del proxy, nombre del servicio y puertos; fuera de Compose, proporcionar un destino alcanzable. Mantener alineado el alias `@` entre Vite y TypeScript y documentar los cambios de conexion.
- **Archivos que la justifican:** [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/vite.config.ts](frontend/vite.config.ts), [frontend/tsconfig.app.json](frontend/tsconfig.app.json), [docker-compose.yml](docker-compose.yml), [README.es.md](README.es.md).

## Limitaciones de la revision

- No se ejecutaron pruebas funcionales durante la revision original.
- Las reglas propuestas no corrigen por si mismas los fallos descritos.
- Las carpetas `.agents/rules`, `.agents/skills` y `memory-bank` indicadas por [AGENTS.md](AGENTS.md) no estaban presentes al crear este documento.
- La instruccion global del entorno estaba bloqueada para lectura.