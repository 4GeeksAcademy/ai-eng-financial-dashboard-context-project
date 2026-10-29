# Verificación de `resume.md` contra el repositorio

La verificación se hizo contrastando cada bloque del resumen con los archivos fuente citados. Las marcas indican: ✅ concordancia comprobada; ❌ discrepancia encontrada y corregida en `resume.md`; ? no se encontró evidencia suficiente en el código inspeccionado.

## Alcance y arquitectura

| Marca | Afirmación de `resume.md` | Evidencia en el repositorio |
|---|---|---|
| ✅ | El proyecto tiene API backend y aplicación web frontend. | `backend/app/main.py`, `frontend/src/main.tsx`, `docker-compose.yml`. |
| ✅ | FastAPI registra el router en `app.main`, con middleware CORS. | `backend/app/main.py`: crea `FastAPI`, agrega `CORSMiddleware` e incluye `router`. |
| ✅ | Las rutas de métricas generan datos simulados en memoria. | `backend/app/routes.py`: los endpoints de métricas llaman a `generate_mock_movements(seed=42)`. |
| ❌ → ✅ | Antes se generalizaba que cada endpoint generaba movimientos. La ruta health no los genera. | `backend/app/routes.py`: `health()` devuelve `{"status":"ok"}` sin llamar al generador. Esta precisión ya se corrigió en `resume.md`. |
| ✅ | Flujo del frontend: montar React, hacer fetch, calcular KPIs/meses y representar tarjetas y gráficos. | `frontend/index.html`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts`, `frontend/src/components/dashboard/`. |
| ✅ | Vite proxifica `/api` hacia `http://host.docker.internal:8000`; Compose configura el alias mediante `host-gateway`, los puertos publicados y la dependencia frontend→backend. | [frontend/vite.config.ts](frontend/vite.config.ts), [docker-compose.yml](docker-compose.yml). |

### Comprobación operativa del proxy (2026-10-26)

Tras ajustar el proxy y recrear el contenedor frontend, `GET http://localhost:5173/api/metrics` respondió HTTP 200 con un array JSON de 360 movimientos; la página principal del frontend también respondió HTTP 200. Esto verifica la entrega de datos a través de Vite, no el renderizado visual del dashboard ni toda la suite de pruebas. La ruta por el host se adoptó como alternativa a un timeout observado en la comunicación directa entre contenedores.

## Entradas, salidas y generación (auditoría inicial)

| Marca | Afirmación de `resume.md` | Evidencia en el repositorio |
|---|---|---|
| ✅ | Tipos de movimiento: fecha, importe, tipo de operación, categoría y tipo de negocio; Literals limitados. | `backend/app/routes.py`: `FinancialMovement`, `OperationType`, `Category`, `BusinessType`; correspondencia TS en `frontend/src/lib/financial-types.ts`. |
| ✅ | Rutas GET y parámetros en query; campos de comparación obligatorios y límites de `limit`/`threshold`. | Decoradores y firmas de endpoints en `backend/app/routes.py`; `Query(..., ge=..., le=...)`. |
| ✅ | Respuestas modeladas con `response_model` en endpoints de métricas. | Decoradores `@router.get(..., response_model=...)` en `backend/app/routes.py`. `/health` no tiene `response_model`. |
| ✅ | Generación de 360 movimientos, 30 por mes, días 1–28, importes positivos y redondeados a 2 decimales. | `generate_mock_movements` y `_build_movement` en `backend/app/routes.py`; test de cantidad en `backend/tests/test_routes.py`. |
| ✅ | Filtros de fechas inclusivos, agregación diaria/semanal/mensual y neto ingresos menos egresos. | `filter_movements_by_date`, `summarize_movements` en `backend/app/routes.py`. |
| ✅ | Comparación con intervalo previo de igual duración; porcentaje nulo si anterior neto es 0. | `get_metrics_comparison` en `backend/app/routes.py`: duración `end_date - start_date`, límites previos y condición `previous_net != 0`. |
| ✅ | Alertas comparan egresos de un periodo con la media de periodos anteriores del resumen. | `detect_outcome_alerts` en `backend/app/routes.py`. |
| ✅ | No hay validación explícita de orden start/end ni reglas de coherencia entre categoría y operación. | Funciones de filtrado y modelo `FinancialMovement` en `backend/app/routes.py`; validan campos individualmente y no comprueban estas relaciones. |
| ✅ (hallazgo inicial, resuelto abajo) | En la auditoría inicial, `build_metrics_facets` fallaba ante lista vacía por indexar primer/último elemento. | Estado previo al cambio: el helper accedía a `ordered[0]` y `ordered[-1]`. La validación de Fase 3, documentada abajo, añadió manejo explícito y prueba. |

## Frontend, dependencias y ejecución

| Marca | Afirmación de `resume.md` | Evidencia en el repositorio |
|---|---|---|
| ✅ | `App.tsx` llama a `/api/metrics`, utiliza `VITE_API_BASE_URL` si está configurada y maneja error/carga. | `frontend/src/App.tsx`. |
| ✅ | La etiqueta “2024 - Full Year” está fija y no se deriva de los datos. | `frontend/src/App.tsx`: `<DashboardHeader period="2024 - Full Year" />`. |
| ✅ | `mock-data.ts` no se importa en el flujo principal descrito. | `frontend/src/App.tsx` solo importa los tipos, utilidades y componentes indicados; `frontend/src/lib/mock-data.ts` es un archivo separado. |
| ✅ | Las versiones/rangos frontend corresponden a package.json; backend requirements no fija versiones. | `frontend/package.json`, `backend/requirements.txt`. |
| ✅ | Dockerfiles arrancan Uvicorn con Debugpy y Vite; puertos publicados según el resumen. | `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`. |
| ✅ | Scripts npm enumerados y ubicaciones de tests descritas. | Scripts en `frontend/package.json`; pruebas en `backend/tests/test_routes.py` y `frontend/src/lib/financial-utils.test.ts`. |

## Riesgos y casos límite

| Marca | Observación de `resume.md` | Evidencia en el repositorio |
|---|---|---|
| ✅ | El generador modifica el estado aleatorio global mediante `random.seed`. | `generate_mock_movements` en `backend/app/routes.py`. La interferencia concurrente es una consecuencia posible, no una prueba reproducida. |
| ✅ | El año asignado depende del mes actual y el encabezado muestra 2024. | `_year_for_month` en `backend/app/routes.py`; `DashboardHeader` fijado en `frontend/src/App.tsx`. |
| ✅ | Comparación divide por `abs(previous_net)`. | `get_metrics_comparison` en `backend/app/routes.py`. |
| ✅ | El cálculo de alertas usa únicamente elementos presentes en summary y exige baseline > 0. | `detect_outcome_alerts` en `backend/app/routes.py`; la lista se construye después de filtrar en `get_metrics_alerts`. |
| ✅ | El frontend crea `Date` desde la fecha, usa getters locales y formatea meses/moneda con `en-US`. | `frontend/src/lib/financial-utils.ts`. La variación por zona horaria se identifica como riesgo deducido, no como fallo ejecutado. |
| ✅ (parcialmente resuelto abajo) | En la auditoría inicial, la carga no tenía abort/reintento ni validación runtime del esquema JSON. | La validación de esquema se añadió en Fase 3; la carga todavía no implementa abort ni reintento. |
| ✅ | Meses ausentes no se rellenan en la agregación mensual. | `computeMonthlyData` itera movimientos y devuelve solo claves existentes en `monthlyMap`, en `frontend/src/lib/financial-utils.ts`. |
| ✅ | CORS usa comodines y `allow_credentials=True`. | `backend/app/main.py`. El resumen correctamente limita la conclusión a la configuración declarada, sin afirmar un comportamiento de navegador probado. |

## Elementos no verificados

| Marca | Elemento | Motivo |
|---|---|---|
| ? | Versiones exactas instaladas en ejecución, en especial paquetes backend. | `backend/requirements.txt` no fija versiones. `package.json` especifica rangos, aunque hay un `package-lock.json`; no se consultó el entorno instalado. |
| ? | Comportamiento runtime del navegador, CORS en despliegue o errores concurrentes del generador. | Esta auditoría contrastó código fuente; no realizó pruebas de navegador, de despliegue ni de concurrencia. |

## Resultado

La auditoría inicial encontró un desajuste de alcance en una frase: `resume.md` decía que cada endpoint generaba movimientos, aunque `/health` solo devuelve un estado. Se corrigió para decir que cada **endpoint de métricas** genera los movimientos y señalar la excepción `/health`. Los hallazgos iniciales sobre facets vacíos y validación runtime también se resolvieron en la validación de Fase 3 que sigue; los otros riesgos dependientes del entorno permanecen señalados como no verificados.

## Validación práctica de reglas — Fase 3 (2026-10-29)

Se probaron las reglas mediante tareas pequeñas en el repositorio. La evidencia describe lo ejecutado en esta sesión; no implica que cada indicación de cada archivo se haya probado exhaustivamente.

| Archivo de reglas | Tarea real y aplicación | Evidencia observada | Evaluación/refinamiento |
|---|---|---|---|
| [`architecture.instructions.md`](.agents/rules/architecture.instructions.md) | Manejar explícitamente la colección vacía de `build_metrics_facets` y reflejar que los extremos de fecha pueden faltar en el modelo de respuesta. | `docker compose exec backend pytest -q /app/tests/test_routes.py -k 'metrics_facets or build_metrics_facets'` — **2 passed, 14 deselected**. | La recomendación de definir el comportamiento para colecciones vacías resultó aplicable. El modelo ahora declara `min_date` y `max_date` como opcionales; la lista vacía produce facets vacíos y fechas `null`. |
| [`testing.instructions.md`](.agents/rules/testing.instructions.md) | Añadir cobertura enfocada para el caso vacío de facets y para datos JSON válidos e inválidos en la validación de movimientos del frontend. | Comando backend anterior — **2 passed**. `docker compose exec frontend npm test -- src/lib/financial-validation.test.ts` — **1 archivo y 2 tests pasaron**. | La guía de casos límite y pruebas deterministas fue concreta y ejecutable. |
| [`frontend.instructions.md`](.agents/rules/frontend.instructions.md) | Validar en runtime el JSON recibido por `App.tsx` antes de pasarlo a cálculos/UI, conservando el manejo de errores existente. | Prueba Vitest de `financial-validation.test.ts` — **2 tests pasaron**; `docker compose exec frontend npm run build` — **build completado**. | La recomendación de tratar el JSON como entrada no confiable es útil; la validación se aisló en `frontend/src/lib/financial-validation.ts`. El build emitió la advertencia de Vite de que un chunk supera 500 kB. |
| [`naming.instructions.md`](.agents/rules/naming.instructions.md) | Nombrar el módulo `financial-validation.ts`, la función `validateFinancialMovements` y el predicado `isFinancialMovement` siguiendo kebab-case, camelCase y tipos PascalCase existentes. | `docker compose exec frontend npm run lint` — terminó sin errores. El build TypeScript también completó. | Las convenciones fueron claras para nombrar el código añadido; no se modificaron archivos no relacionados ni se cambió el estilo del archivo objetivo. |
| [`dx-operations.instructions.md`](.agents/rules/dx-operations.instructions.md) | Verificar la configuración local de Compose y usar los contenedores existentes para ejecutar dependencias declaradas, sin instalar paquetes en el host. | `docker compose config --quiet` — terminó sin errores. Los tests backend y frontend ejecutados con `docker compose exec` pasaron según los resultados anteriores. | La guía de operación local fue coherente con este entorno. No se añadieron dependencias ni se modificó Compose. |

### Archivos de implementación de esta validación

- `backend/app/routes.py`: el modelo de facets permite fechas mínimas/máximas nulas y el helper ya no indexa una lista vacía.
- `backend/tests/test_routes.py`: prueba del helper con una lista vacía.
- `frontend/src/lib/financial-validation.ts`: validación runtime de forma, fecha ISO real, importe finito y valores de dominio.
- `frontend/src/lib/financial-validation.test.ts`: casos válidos e inválidos.
- `frontend/src/App.tsx`: la respuesta JSON se trata como `unknown` y se valida antes de devolverla como movimientos.

### Limitaciones y resultados de entorno

Se intentó ejecutar `pytest` y `npm test` directamente en el host, pero allí no están instaladas las dependencias (`ModuleNotFoundError: No module named 'fastapi'`; `vitest: not found`). Para obtener evidencia se ejecutaron las pruebas dentro de los contenedores. No se ejecutó la suite completa. No se cambiaron los archivos de reglas: las tareas no aportaron evidencia suficiente para justificar alterar sus instrucciones; se documentan aquí su aplicación y las limitaciones observadas.
