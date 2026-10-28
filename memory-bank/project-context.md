# Memoria del proyecto: Financial Metrics Dashboard

> Contexto operativo para agentes, basado en archivos versionados del repositorio. Describe el estado comprobable en el código consultado; no es una especificación de producto independiente ni un roadmap.

## Política de evidencia y claims

- Trata el código y la configuración actuales como evidencia primaria. Las fuentes se enlazan abajo mediante rutas relativas.
- Distingue hechos de código, comportamiento efectivamente probado y deducciones. Un riesgo inferido no equivale a un incidente reproducido.
- No inventes clientes, usuarios, objetivos de negocio, capacidades de producción, integraciones, persistencia, seguridad, SLA, despliegues ni planes futuros.
- No conviertas una idea o recomendación en compromiso del producto. No declares un roadmap si no existe una fuente explícita y verificable en el repositorio o una instrucción directa del usuario.
- Si una afirmación no tiene soporte, omítela o márcala como «no documentada/no verificada» y especifica qué evidencia falta. No rellenes huecos con suposiciones.
- Para afirmar que una funcionalidad funciona, indica la prueba o verificación concreta; la presencia de código por sí sola solo demuestra implementación observable.
- Al actualizar esta memoria, vuelve a comprobar los archivos citados y ajusta las afirmaciones obsoletas.

## Overview del producto (evidencia en código)

El repositorio implementa un dashboard de métricas financieras con una interfaz web React que solicita movimientos financieros a una API FastAPI y presenta indicadores y gráficos mensuales. La descripción breve coincide con el README: [README.md](../README.md). El flujo puede verificarse en [App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts) y [componentes del dashboard](../frontend/src/components/dashboard/).

La API genera datos de muestra en memoria de forma determinista cuando sus endpoints de métricas llaman a `generate_mock_movements(seed=42)`. El modelo contiene fecha, importe, tipo de operación, categoría y tipo de negocio. Evidencia: [routes.py](../backend/app/routes.py). `/health` solo devuelve `{"status":"ok"}` y no genera movimientos. El código inspeccionado no muestra base de datos ni integración externa de datos; no afirmar que el dashboard representa datos reales de una organización.

La pantalla principal solicita `GET /api/metrics`, calcula KPIs y serie mensual en el frontend, y expone estados de carga/error. Su título de periodo está fijado en `2024 - Full Year`; no es evidencia de que los datos generados pertenezcan a 2024 ([App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py)).

## Stack y dependencias clave

| Área | Tecnología/infraestructura | Evidencia y hotspot |
|---|---|---|
| Backend | Python, FastAPI, Pydantic, Uvicorn | [requirements.txt](../backend/requirements.txt), [main.py](../backend/app/main.py), [routes.py](../backend/app/routes.py). Rutas, modelos, generación, filtros y agregaciones están concentrados en `routes.py`. |
| Tests backend | pytest, pytest-cov, httpx / FastAPI `TestClient` | [requirements.txt](../backend/requirements.txt), [test_routes.py](../backend/tests/test_routes.py). |
| Frontend | TypeScript/TSX, React, Vite | [package.json](../frontend/package.json), [main.tsx](../frontend/src/main.tsx), [vite.config.ts](../frontend/vite.config.ts). `App.tsx` concentra la carga inicial del dashboard. |
| UI y visualización | Recharts, lucide-react, Tailwind CSS | [package.json](../frontend/package.json), [componentes dashboard](../frontend/src/components/dashboard/), [index.css](../frontend/src/index.css). |
| Tests/lint frontend | Vitest, ESLint, TypeScript | scripts/declarados en [package.json](../frontend/package.json); prueba existente [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts). |
| Infra local | Docker Compose; contenedores frontend/backend | [docker-compose.yml](../docker-compose.yml), [README.md](../README.md). Puertos publicados: 5173, 8000 y 5678. |
| Enlace frontend-API | Proxy Vite `/api` → `http://host.docker.internal:8000` → puerto publicado del backend; alias configurado con `host-gateway` | [vite.config.ts](../frontend/vite.config.ts), [docker-compose.yml](../docker-compose.yml). |

Los valores de `package.json` son rangos semver, no necesariamente versiones instaladas; `backend/requirements.txt` no fija versiones. No afirmar versiones efectivas sin inspeccionar un entorno identificado.

## Estado actual comprobable

### Implementado en el código

- API con `/health` y endpoints de métricas: movimientos, facets, summary, top categories, comparison, alerts y variantes B2B/B2C ([routes.py](../backend/app/routes.py)).
- Dataset mock generado al solicitar rutas de métricas; filtros por fecha/categoría/operación y agregaciones implementadas en backend ([routes.py](../backend/app/routes.py)).
- Dashboard React que carga `/api/metrics`, calcula cuatro KPIs y datos mensuales, y representa dos gráficos ([App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx)).
- Pruebas de rutas backend y pruebas unitarias de utilidades frontend presentes ([test_routes.py](../backend/tests/test_routes.py), [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts)).
- Arranque local documentado con `docker compose up --build` ([README.md](../README.md)).
- La ruta del proxy por el host se adoptó como alternativa a un fallo observado de comunicación directa entre contenedores, no como requisito general de Docker. Depende del alias `extra_hosts` del frontend y del puerto `8000` publicado por el backend. Fuera de Docker, el hostname no está garantizado; consulta las opciones en [README.es.md](../README.es.md).

### Gaps observables (no son roadmap)

- La carga del dashboard usa solo `/api/metrics`; `App.tsx` no consume los endpoints de summary/comparison/alerts/facets/top categories.
- No se observa persistencia ni fuente externa de datos en las rutas revisadas; la API trabaja con datos generados en memoria.
- Las pruebas frontend disponibles cubren utilidades, no el componente `App.tsx` ni su fetch/estados HTTP ([financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts), [App.tsx](../frontend/src/App.tsx)).
- La etiqueta de periodo de la interfaz está fijada a 2024, mientras el generador asigna fechas de acuerdo con `date.today()` ([App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py)).

### Siguientes prioridades

No hay prioridades futuras ni roadmap confirmados en las fuentes citadas. No inventarlos. Si el usuario solicita priorización, proponer opciones como recomendaciones explícitamente etiquetadas, explicar su evidencia/impacto y pedir confirmación antes de presentarlas como plan acordado.

## Verificación conocida

En una sesión previa se reportó que pasaron dos pruebas backend focalizadas, cinco pruebas frontend, ESLint y `docker compose config --quiet` después de resolver el directorio de ejecución. Esto es un resultado histórico de esa sesión, no una garantía del estado actual ni evidencia de que toda la suite haya pasado. Para resultados actuales, volver a ejecutar solo las verificaciones pertinentes y registrar comando/fecha/resultado.

El 2026-10-26, tras cambiar el proxy a `host.docker.internal:8000` y recrear el frontend, `docker compose config --quiet` pasó y `GET http://localhost:5173/api/metrics` respondió HTTP 200 con 360 movimientos. La página principal del frontend respondió HTTP 200. Esta comprobación acredita la entrega de datos a través de Vite, no el renderizado visual del dashboard ni la ejecución de toda la suite.

## Fuentes de contexto relacionadas

- [README del proyecto](../README.md) — objetivo breve y arranque documentado.
- [context.md](../context.md) — detalle del stack y comandos.
- [resume.md](../resume.md) y [verification.md](../verification.md) — análisis y cotejo previo con código; revalidar antes de tratarlos como estado vigente.
