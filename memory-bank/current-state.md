# Estado actual

Este documento separa lo que muestran los archivos de lo que se ha ejecutado. Las observaciones de esta memoria proceden de inspección estática; no se ejecutaron las suites de prueba ni los servicios al redactarla.

## Funcionalidades observadas

- El backend genera datos sintéticos de movimientos, ordenados por fecha; el test correspondiente espera 360 elementos cuando se usa una semilla (`../backend/app/routes.py`, `../backend/tests/test_routes.py`).
- `/api/metrics` acepta filtros de fecha, categoría y tipo de operación. También hay rutas declaradas para salud, facetas, resúmenes, categorías principales, comparación, alertas y segmentos B2B/B2C (`../backend/app/routes.py`).
- El frontend consume `/api/metrics`, calcula ingresos, gastos, beneficio, porcentaje de beneficio y agregados mensuales, y presenta cuatro KPIs y dos gráficos (`../frontend/src/App.tsx`, `../frontend/src/lib/financial-utils.ts`, `../frontend/src/components/dashboard/kpi-row.tsx`, `../frontend/src/components/dashboard/income-outcome-chart.tsx`, `../frontend/src/components/dashboard/profit-percent-chart.tsx`).
- La interfaz modela carga y error al solicitar datos (`../frontend/src/App.tsx`).

## Limitaciones y riesgos conocidos

- El encabezado usa la etiqueta fija `2024 - Full Year`, mientras las fechas del generador dependen de `date.today()` (`../frontend/src/App.tsx`, `../backend/app/routes.py`). La discrepancia estática también está registrada en `../verification.md`.
- **Resuelto con TDD:** `toYearMonthKey` ahora agrupa las fechas ISO con getters UTC, evitando que `2026-03-01` caiga en febrero en `America/Los_Angeles` (`../frontend/src/lib/financial-utils.ts`). Se aplicó `test-driven-development` porque el defecto podía reproducirse con una prueba Vitest pequeña: el caso falló primero con `Feb 2026` y pasó tras el cambio. La prueba focalizada en `TZ=America/Los_Angeles` y la suite completa `npm test` pasaron (6 pruebas); la skill se eligió porque permite demostrar el fallo y la corrección usando Vitest ya disponible, sin instalar dependencias.
- `generate_mock_movements` llama a `random.seed(seed)`, lo que modifica el estado aleatorio global del proceso (`../backend/app/routes.py`).
- `build_metrics_facets` indexa el primer y último elemento de la lista ordenada; no define un resultado para una lista vacía (`../backend/app/routes.py`).
- La prueba de comparación usa fechas fijas de marzo de 2025 y verifica las claves de la respuesta, no los valores calculados (`../backend/tests/test_routes.py`).
- `CORSMiddleware` permite cualquier origen, método y encabezado junto con credenciales (`../backend/app/main.py`). Compose declara `depends_on` para el backend, pero no un healthcheck (`../docker-compose.yml`); el backend sí declara `/health` (`../backend/app/routes.py`).
- El frontend revisado solo consume `/api/metrics`; las demás rutas backend no se observaron conectadas a esta pantalla (`../frontend/src/App.tsx`, `../backend/app/routes.py`).

## Pruebas declaradas y verificaciones

- Vitest contiene pruebas de valores de KPIs, porcentaje sin ingresos, agregación cronológica cruzando años y formatos (`../frontend/src/lib/financial-utils.test.ts`).
- Pytest con `TestClient` contiene pruebas de endpoints, filtros y algunos valores/ordenamientos; la prueba de comparación mencionada arriba comprueba solo el conjunto de claves (`../backend/tests/test_routes.py`).
- Los manifiestos declaran `npm test` para Vitest y las dependencias de pytest (`../frontend/package.json`, `../backend/requirements.txt`). No se ejecutaron esos comandos ni Docker Compose al crear esta memoria; por tanto, no se reportan resultados de ejecución.

## Prioridades derivadas de la evidencia

Estas prioridades describen riesgos observados, no un roadmap aprobado:

1. Corregir la etiqueta del período para que no contradiga las fechas generadas (`../frontend/src/App.tsx`, `../backend/app/routes.py`).
2. Aislar la aleatoriedad del generador y definir/probar el comportamiento de facetas vacías (`../backend/app/routes.py`, `../backend/tests/test_routes.py`).
3. Fortalecer la prueba de comparación con entradas controladas y aserciones numéricas (`../backend/tests/test_routes.py`).
4. Antes de desplegar con una configuración de producción, revisar CORS y readiness de los servicios (`../backend/app/main.py`, `../docker-compose.yml`).

## Paso 6 — Skills, verificación y trazabilidad

Esta sección registra las evidencias del ejercicio y distingue los cambios observables de las verificaciones manuales o históricas no corroboradas.

### Skills

- **test-driven-development — CONFIRMADO.** Fue la skill comunitaria adicional elegida y aplicada en el paso 4. Mediante Vitest permitió reproducir y corregir el error real por el que `2026-03-01` se agrupaba en febrero en la zona horaria `America/Los_Angeles`. `toYearMonthKey` usa getters UTC y `financial-utils.test.ts` comprueba que esa fecha produzca `Mar 2026` (`../frontend/src/lib/financial-utils.ts`, `../frontend/src/lib/financial-utils.test.ts`).
- **Resultados de Vitest — PARCIALMENTE CONFIRMADO.** El registro anterior de este documento indica que la prueba focalizada falló antes de la corrección y pasó después, y que `npm test` pasó con 6 pruebas. `verification.md` indica que no se aportaron resultados automatizados; por eso, esos resultados quedan documentados, pero no corroborados con una salida de ejecución adjunta.
- **webapp-testing — PENDIENTE.** La skill está instalada, pero no se aplicó porque faltaban Playwright y Chromium. No se afirma que se hayan ejecutado pruebas de navegador.
- **accessibility — PARCIALMENTE CONFIRMADO.** El código contiene `role="status"`, `aria-busy`, `role="alert"`, nombres de sección y encabezados de gráficas asociados con `aria-labelledby` (`../frontend/src/App.tsx`, `../frontend/src/components/dashboard/income-outcome-chart.tsx`, `../frontend/src/components/dashboard/profit-percent-chart.tsx`). No se completaron pruebas manuales de teclado, lector de pantalla ni contraste.
- **vercel-react-best-practices — PARCIALMENTE CONFIRMADO.** `App.tsx` usa `AbortController`, pasa la señal a `fetch` y cancela la petición en el cleanup de `useEffect` (`../frontend/src/App.tsx`). La atribución a un commit concreto está pendiente de verificar.
- **financial-api-contract-audit — CONFIRMADO para carga manual y auditoría estática.** La skill está en `../.skills/financial-api-contract-audit/SKILL.md`; se cargó leyéndola explícitamente y se aplicó a `GET /api/metrics`. La auditoría observó coincidencia estática en los campos y literales del movimiento, filtros opcionales en FastAPI que el consumidor no envía y el proxy de Vite hacia `http://backend:8000` (`../backend/app/routes.py`, `../frontend/src/lib/financial-types.ts`, `../frontend/src/App.tsx`, `../frontend/vite.config.ts`). No se verificó descubrimiento automático desde `.skills/` ni comportamiento en ejecución.

### Evaluación 4Geeks

- **ARIA — PARCIALMENTE CONFIRMADO.** Los atributos se observan en el código; su funcionamiento con tecnologías de asistencia no se verificó manualmente.
- **Teclado — PENDIENTE.** No hay evidencia documentada de navegación manual por teclado ni de orden de foco.
- **Imágenes y `alt` — PENDIENTE.** No se encontraron elementos `<img>` en el código revisado; existe `frontend/src/assets/hero.png`, pero no se verificó que se renderice en la interfaz ni si requiere texto alternativo.
- **Contraste — PENDIENTE.** Hay tokens de color en `frontend/src/index.css`, pero no se midieron ratios WCAG.
- **Build frontend — CONFIRMADO.** `cd frontend && npm run build` terminó con código 0: TypeScript compiló correctamente y Vite generó el build tras transformar 2290 módulos. Vite emitió una advertencia por un chunk JavaScript de 584,64 kB; no impidió el build. La antigüedad de esta advertencia es **NO VERIFICADA**.
- **Trazabilidad — PARCIALMENTE CONFIRMADO.** Código, pruebas y skills instaladas permiten relacionar comportamientos con instrucciones. No se verificó el historial de commits que atribuiría cada cambio.
- **Dependencias — PARCIALMENTE CONFIRMADO.** No se instalaron dependencias para este paso de documentación. `webapp-testing` no se pudo aplicar porque faltaban Playwright y Chromium; la comparación histórica para descartar dependencias añadidas injustificadamente queda pendiente.
- **No reescritura del proyecto — CONFIRMADO para este paso.** Esta actualización solo documenta evidencias y no reescribe el dashboard.

### Pendientes de verificación

Obtener evidencia confiable del historial y adjuntar o reconciliar los resultados Vitest; determinar si la advertencia del chunk de 584,64 kB del build es nueva o preexistente (antigüedad **NO VERIFICADA**); verificar teclado, lector de pantalla y contraste; determinar si `hero.png` aparece en la interfaz y comprobar sus alternativas si corresponde. No se reportan estas verificaciones como realizadas.