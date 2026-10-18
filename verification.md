# Verificacion

Fecha: 2026-10-16

## Cambio verificado

El periodo del encabezado del dashboard se calcula a partir del primer y ultimo mes disponible en los movimientos; durante la carga muestra `Loading...` y, sin datos, `Period unavailable`.

## Comprobaciones

- `docker compose ps`: frontend y backend activos.
- `docker compose exec frontend npm test`: 7 pruebas aprobadas.
- `docker compose exec frontend npm run build`: compilacion y TypeScript aprobados.
- `docker compose exec backend pytest`: 15 pruebas aprobadas.
- `git diff --check`: sin errores de formato.

## Avisos no bloqueantes

- Vite advierte que el bundle JavaScript supera 500 kB.
- Starlette muestra una advertencia de obsolescencia relacionada con `httpx` en las pruebas.

## Fase 3: reglas y tareas reales

Fecha: 2026-10-16. Esta seccion registra una ejecucion nueva; los resultados anteriores se conservan como historial.

Se redactaron y consultaron seis reglas con Nombre, Alcance, Justificacion, Guia del proyecto y Verificacion. Una comprobacion Node de secciones y enlaces verifico los seis documentos y sus 25 referencias locales. La lectura explicita y su aplicacion en estas tareas no demuestra auto-carga por parte del editor.

### Arquitectura y contratos

- Regla: [architecture-contracts.md](.agents/rules/architecture-contracts.md).
- Instruccion aplicada: revisar ambos contratos y preservar los campos publicos; no editar consumidores que no cambian.
- Tarea: agregar `test_metrics_endpoint_preserves_financial_movement_contract` en [test_routes.py](backend/tests/test_routes.py), contrastando con [financial-types.ts](frontend/src/lib/financial-types.ts).
- Comando: `docker compose exec -T backend pytest tests/test_routes.py -k contract`.
- Resultado: 1 aprobada, 15 deseleccionadas en ese momento. Se comprobaron campos, fecha ISO, importe numerico y valores de operacion, categoria y negocio. No cambio el contrato ni se editaron tipos innecesariamente.
- Limite: es una regresion del contrato actual, no generacion automatica ni sincronizacion de tipos entre lenguajes.

### Fechas de calendario

- Regla: [calendar-dates.md](.agents/rules/calendar-dates.md).
- Instruccion aplicada: conservar el mes de `YYYY-MM-DD` independientemente de la zona horaria y probar limites de mes/ano y datos vacios.
- Tarea: agregar regresiones en [financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts) y usar getters UTC en [financial-utils.ts](frontend/src/lib/financial-utils.ts).
- Antes de corregir: en Buenos Aires fallaron 2 de 9 pruebas, incluida la del periodo ya existente; los movimientos del primer dia se agrupaban en el mes anterior.
- Comandos finales: `docker compose exec -T -e TZ=UTC frontend npm test -- src/lib/financial-utils.test.ts` y `docker compose exec -T -e TZ=America/Argentina/Buenos_Aires frontend npm test -- src/lib/financial-utils.test.ts`.
- Resultado final: 10/10 aprobadas en cada zona, una vez incluido tambien el caso de KPI vacios. El contrato de fecha no cambio.

### Fiabilidad de API

- Regla: [api-reliability.md](.agents/rules/api-reliability.md).
- Instruccion aplicada: no modificar estado aleatorio global desde logica por solicitud.
- Tarea: usar `random.Random(seed)` local, pasado a `_build_movement`, en [routes.py](backend/app/routes.py). Agregar pruebas de conservacion de estado y repeticion de semilla en [test_routes.py](backend/tests/test_routes.py).
- Comando: `docker compose exec -T backend pytest tests/test_routes.py -k 'random or seed'`.
- Antes: 1 fallo (estado global) y 1 aprobada. Despues: 2 aprobadas, 16 deseleccionadas.
- Regresion compartida: `docker compose exec -T backend pytest`: 18/18 aprobadas.
- Limite: se valido el aislamiento del generador; no se implementaron reintentos ni healthchecks y no se ejecuto una prueba de carga concurrente.

### Pruebas enfocadas

- Regla: [testing-verification.md](.agents/rules/testing-verification.md).
- Instruccion aplicada: reutilizar suites y ejecutar primero la prueba de la parte modificada.
- Tarea: agregar `computeKPIs([])` en [financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts), esperando cuatro indicadores en cero.
- Comando: `docker compose exec -T frontend npm test -- src/lib/financial-utils.test.ts -t computeKPIs`.
- Resultado: 3 aprobadas y 7 omitidas por el filtro, no 10 ejecutadas. No se agregaron frameworks ni archivos de tests.
- Validacion adicional por cambio TypeScript: `docker compose exec -T frontend npm run lint` y `docker compose exec -T frontend npm run build`, ambos aprobados.

### Entorno y seguridad

- Regla: [environment-security.md](.agents/rules/environment-security.md).
- Instruccion aplicada: distinguir desarrollo de produccion y DNS interno de URLs del navegador.
- Tarea: agregar advertencias equivalentes en [README.md](README.md) y [README.es.md](README.es.md).
- Comprobacion: revision y aserciones Node contra ambos Dockerfiles, `vite.config.ts` y `docker-compose.yml`; se confirmaron Vite dev, Uvicorn con recarga, debugpy/5678 y `backend:8000` interno.
- Resultado: ambas guias son coherentes con la configuracion. No se cambiaron dependencias, CORS ni el despliegue.
- Limite: esta tarea valida las clausulas documentales de entorno, no politicas CORS ni reproducibilidad de instalaciones.

### Trabajo de agentes

- Regla: [agent-workflow.md](.agents/rules/agent-workflow.md).
- Instruccion aplicada: preservar historial y trabajo existente, y diferenciar evidencia ejecutada de comprobaciones pendientes.
- Tarea: ampliar este archivo sin reemplazar los resultados de Fase 1. Estado inicial limpio; cambios finales limitados a reglas y tareas acordadas. No se hizo staging, commit ni push.
- Comprobaciones: `git status --short`, `git diff --check` y validacion de secciones/enlaces de documentos nuevos, incluidos los no rastreados.
- Limite: `.agents/skills` y `memory-bank` no existen. La lectura de la skill global de personalizacion fue bloqueada por el editor; no se eludio la restriccion. Se usa el descubrimiento por lectura que indica `AGENTS.md`, sin atribuir soporte automatico a `applyTo`.

### Integracion HTTP y pendientes

- Se levanto el entorno con `docker compose up --build -d`.
- `curl --fail http://localhost:8000/health`: `{"status":"ok"}`.
- Acceso directo a `http://localhost:8000/api/metrics`: HTTP 200; pagina `http://localhost:5173/`: HTTP 200.
- Acceso via `http://localhost:5173/api/metrics`: HTTP 502. Logs de Vite: `connect ETIMEDOUT` a la IP interna del backend. Desde el contenedor frontend, `fetch` a `backend:8000/health` y `/api/metrics` termina en `UND_ERR_CONNECT_TIMEOUT`.
- Pendiente: diagnosticar la conectividad TCP entre contenedores. El nombre del servicio resuelve, pero no se establecio conexion; no se ha demostrado una causa ni se modifico la red fuera del alcance. La integracion completa del dashboard queda pendiente; HTTP 200 de la pagina no demuestra renderizado ni carga de datos.
- Persisten los avisos no bloqueantes de bundle Vite superior a 500 kB y deprecacion Starlette/httpx.