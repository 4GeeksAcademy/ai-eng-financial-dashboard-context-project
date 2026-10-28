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

## Entradas, salidas y generación

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
| ✅ | `build_metrics_facets` falla ante lista vacía por indexar primer/último elemento. | `build_metrics_facets` accede a `ordered[0]` y `ordered[-1]` en `backend/app/routes.py`. |

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
| ✅ | No hay abort/reintento ni validación runtime del esquema JSON en la carga del dashboard. | `fetchFinancialData` y `useEffect` en `frontend/src/App.tsx`. |
| ✅ | Meses ausentes no se rellenan en la agregación mensual. | `computeMonthlyData` itera movimientos y devuelve solo claves existentes en `monthlyMap`, en `frontend/src/lib/financial-utils.ts`. |
| ✅ | CORS usa comodines y `allow_credentials=True`. | `backend/app/main.py`. El resumen correctamente limita la conclusión a la configuración declarada, sin afirmar un comportamiento de navegador probado. |

## Elementos no verificados

| Marca | Elemento | Motivo |
|---|---|---|
| ? | Versiones exactas instaladas en ejecución, en especial paquetes backend. | `backend/requirements.txt` no fija versiones. `package.json` especifica rangos, aunque hay un `package-lock.json`; no se consultó el entorno instalado. |
| ? | Comportamiento runtime del navegador, CORS en despliegue o errores concurrentes del generador. | Esta auditoría contrastó código fuente; no realizó pruebas de navegador, de despliegue ni de concurrencia. |

## Resultado

Se encontró un desajuste de alcance en una frase: `resume.md` decía que cada endpoint generaba movimientos, aunque `/health` solo devuelve un estado. Se corrigió para decir que cada **endpoint de métricas** genera los movimientos y señalar la excepción `/health`. Las demás afirmaciones inspeccionadas concuerdan con el código; las consecuencias dependientes del entorno están señaladas como riesgos o no verificadas.

## Validación práctica de reglas del repositorio (retrospectiva, 2026-10-28)

Esta sección registra trabajo realizado después de la retroalimentación de Fase 3. No afirma que estas tareas se hayan ejecutado durante la fase original. Las reglas se aplicaron a cambios reales del repositorio y se refinaron cuando el caso de trabajo mostró una precisión útil.

| Regla | Tarea y decisión guiada | Evidencia de cambio | Verificación observada |
|---|---|---|---|
| `architecture.instructions.md` | Rechazar `start_date > end_date` en la frontera de cada endpoint de métricas que acepta ambos límites, manteniendo el contrato HTTP `422` con detalle consistente. | `backend/app/routes.py`: helper `validate_date_range` invocado en los siete endpoints aplicables. | `cd backend && pytest -q tests/test_routes.py -k 'date_ranges'`: 14 pasaron (7 rangos invertidos rechazados y 7 rangos válidos aceptados). |
| `testing.instructions.md` | Probar el contrato para los siete endpoints de forma determinista con `TestClient` y parametrización; probar la agrupación mensual con una fecha del primer día del mes. | `backend/tests/test_routes.py`; `frontend/src/lib/financial-utils.test.ts`. | Backend: 14 pasaron, 15 deseleccionados. Frontend: `cd frontend && npm test -- --run src/lib/financial-utils.test.ts`: 1 archivo y 6 pruebas pasaron. |
| `frontend.instructions.md` | Interpretar `YYYY-MM-DD` como fecha de calendario local al agrupar, evitando que el parseo UTC la mueva al mes anterior en zonas horarias occidentales. | `frontend/src/lib/financial-utils.ts` construye la fecha a partir de año, mes y día; se agregó caso `2025-03-01` en `financial-utils.test.ts`. | La prueba de utilidades Vitest pasó junto con los demás casos del archivo: 6/6. `cd frontend && npm run lint` terminó con código 0 y sin errores. |
| `naming.instructions.md` | Nombrar el helper Python `validate_date_range` en `snake_case`, mantener tipos explícitos y usar nombres de prueba descriptivos; el cambio TS siguió el estilo del archivo objetivo sin reformatear archivos no relacionados. | `backend/app/routes.py`, `backend/tests/test_routes.py`, `frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts`. | Revisado en el diff. ESLint pasó, pero no se interpreta como validador de todas las convenciones de nombres o formato que no tenga configuradas. |
| `dx-operations.instructions.md` | Conservar instalaciones frontend reproducibles mediante `npm ci` y validar Compose sin levantar servicios ni confundir `depends_on` con disponibilidad del backend. | No hubo cambios de infraestructura; se instalaron dependencias siguiendo `backend/requirements.txt` y el lockfile npm. | `python -m pip install -r backend/requirements.txt` y `cd frontend && npm ci` finalizaron correctamente; `docker compose config --quiet` finalizó con código 0 y sin diagnóstico. npm reportó 14 vulnerabilidades en dependencias instaladas (1 baja, 5 moderadas, 8 altas); no se ejecutó `npm audit fix`. |

### Refinamientos guiados por la evidencia

- `architecture.instructions.md` ahora especifica que la validación del rango se aplica a **cada endpoint** que acepte ambos límites, para que un contrato compartido no quede aplicado solo a la ruta principal.
- `frontend.instructions.md` convierte la decisión de calendario en una instrucción implementable: construir la fecha desde sus componentes locales y probar un límite de mes.
- `testing.instructions.md` pide cubrir todos los endpoints relevantes con pruebas parametrizadas y exige reportar la falta de dependencias como bloqueo, no como prueba aprobada.

### Estado de la evidencia

La validación focalizada de los contratos backend y del cálculo frontend pasó. ESLint y la validación de Compose también terminaron correctamente. Durante la preparación del entorno se registró el resultado de auditoría de npm indicado arriba; no se cambió el lockfile ni se actualizaron dependencias como parte de esta tarea.
