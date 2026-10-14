# Current State

## Funcionalidades implementadas
1. API backend con endpoints:
- /health
- /api/metrics
- /api/metrics/facets
- /api/metrics/summary
- /api/metrics/categories/top
- /api/metrics/comparison
- /api/metrics/alerts
- /api/metrics/b2b
- /api/metrics/b2c
2. Generacion de dataset financiero mock deterministico y filtros por fecha, categoria, tipo de operacion y tipo de negocio.
3. Frontend con dashboard que:
- consume /api/metrics
- calcula KPI y serie mensual
- renderiza tarjetas KPI
- renderiza graficos de ingreso/egreso y margen
4. Pruebas existentes para backend (rutas y funciones de filtrado) y frontend (utilidades financieras).
5. Estructura de reglas de agentes creada en .agents/rules.

Evidencia:
- [backend/app/routes.py](../backend/app/routes.py)
- [backend/tests/test_routes.py](../backend/tests/test_routes.py)
- [frontend/src/App.tsx](../frontend/src/App.tsx)
- [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts)
- [frontend/src/components/dashboard/kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx)
- [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx)
- [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx)
- [.agents/rules/01-contratos-api-tipados.md](../.agents/rules/01-contratos-api-tipados.md)

## Problemas conocidos
1. CORS abierto con wildcard y credenciales habilitadas en backend.
2. Puerto de debug remoto expuesto (5678) en configuracion Docker.
3. README en espanol contiene una linea en ingles.

Evidencia:
- [backend/app/main.py](../backend/app/main.py)
- [backend/Dockerfile](../backend/Dockerfile)
- [docker-compose.yml](../docker-compose.yml)
- [README.es.md](../README.es.md)
- [frontend/index.html](../frontend/index.html)

## Riesgos
1. Riesgo de seguridad por CORS permisivo en entornos no controlados.
2. Riesgo de exposicion de depurador remoto si la configuracion se reutiliza fuera de desarrollo local.
3. Riesgo de mantenimiento por duplicacion entre endpoints B2B/B2C.
4. Riesgo de rendimiento por regenerar dataset completo en multiples endpoints por request.

Evidencia:
- [backend/app/main.py](../backend/app/main.py)
- [backend/Dockerfile](../backend/Dockerfile)
- [docker-compose.yml](../docker-compose.yml)
- [backend/app/routes.py](../backend/app/routes.py)

## Deuda tecnica
1. Dependencias de backend sin version pinneada en requirements.
2. Acoplamiento alto de logica de dominio y capa HTTP en un solo modulo backend/app/routes.py.
3. Cobertura de testing con foco principal en casos positivos.

Evidencia:
- [backend/requirements.txt](../backend/requirements.txt)
- [backend/app/routes.py](../backend/app/routes.py)
- [backend/tests/test_routes.py](../backend/tests/test_routes.py)
- [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts)

## Funcionalidades pendientes
No se encontraron funcionalidades pendientes explicitamente definidas en el repositorio (no hay backlog, roadmap ni seccion de pendientes funcionales en los archivos inspeccionados).

Incertidumbre explicita:
- La ausencia de backlog en el repositorio no prueba que no exista backlog externo.

Evidencia:
- [README.md](../README.md)
- [README.es.md](../README.es.md)
- [AGENTS.md](../AGENTS.md)

## Proximas prioridades
Prioridades de estabilizacion y calidad sobre lo ya implementado (sin agregar nuevas funcionalidades):
1. Reducir superficie de riesgo de seguridad en CORS y debug remoto.
2. Reducir deuda de mantenibilidad (duplicacion B2B/B2C y alto acoplamiento en routes.py).
3. Fortalecer reproducibilidad (versionado de dependencias backend).
4. Mejorar coherencia documental existente (README.es).

Evidencia:
- [backend/app/main.py](../backend/app/main.py)
- [backend/Dockerfile](../backend/Dockerfile)
- [docker-compose.yml](../docker-compose.yml)
- [backend/app/routes.py](../backend/app/routes.py)
- [backend/requirements.txt](../backend/requirements.txt)
- [README.es.md](../README.es.md)
- [frontend/index.html](../frontend/index.html)

## Como validar el estado
1. Inspeccion estatica de rutas backend y su cobertura en tests.
2. Verificacion de flujo frontend desde fetch en App hasta calculo y render de metricas.
3. Verificacion de configuracion de infraestructura y puertos expuestos.
4. Verificacion de scripts de desarrollo/testing declarados.

Evidencia para validacion:
- [backend/app/routes.py](../backend/app/routes.py)
- [backend/tests/test_routes.py](../backend/tests/test_routes.py)
- [frontend/src/App.tsx](../frontend/src/App.tsx)
- [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts)
- [docker-compose.yml](../docker-compose.yml)
- [frontend/package.json](../frontend/package.json)

## Incertidumbres detectadas en esta fase
1. No se ejecuto la suite de tests en esta fase; por tanto, no se valida aqui el estado runtime.
2. No fue posible inspeccionar el contenido de [frontend/.env.example](../frontend/.env.example) por restriccion de lectura del entorno.
3. No fue posible leer el archivo global de instrucciones del entorno (fuera del repositorio) por restriccion de acceso.

## Registro de correcciones de metadatos y accesibilidad
1. Se reemplazo el titulo generico del documento y se agrego una descripcion que resume el dashboard implementado; se mantuvo `lang="en"`, coherente con el texto visible de la interfaz.
2. Los titulos de las tarjetas de graficos ahora usan encabezados `h2`, subordinados al `h1` del dashboard. El cambio es global a `CardTitle`; validar otros usos de ese componente al ampliarlo.
3. Se expone el estado de carga en el landmark principal, los errores como alertas y los estados sin datos como status. Los graficos de Recharts activan explicitamente su capa de accesibilidad, que proporciona superficie SVG con `role="application"` y `tabIndex=0` en la version instalada.
4. Se agrego una regla de agentes para exigir evidencia al declarar uso de skills. En esta tarea no se encontro el directorio `.agents/skills/`, por lo que no se declara uso ni se crea una skill.

Archivos de evidencia:
- [frontend/index.html](../frontend/index.html)
- [frontend/src/App.tsx](../frontend/src/App.tsx)
- [frontend/src/components/ui/card.tsx](../frontend/src/components/ui/card.tsx)
- [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx)
- [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx)
- [11-evidencia-de-skills.md](../.agents/rules/11-evidencia-de-skills.md)

Validacion: `npm ci`, `npm run build`, `npm run lint` y `npm test` se ejecutaron en `frontend/`; build, lint y las 5 pruebas existentes pasaron. Build conserva una advertencia de chunk JavaScript >500 kB. `npm ci` informo 13 vulnerabilidades en dependencias (1 low, 5 moderate, 7 high); no se aplico `npm audit fix` para evitar cambios de dependencias fuera del alcance. `git diff --check` paso. No se realizo prueba visual/manual de contraste o lector de pantalla.
