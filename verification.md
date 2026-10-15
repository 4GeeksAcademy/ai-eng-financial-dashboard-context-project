# Verificación de reglas — Fase 3

## Lectura de reglas

`AGENTS.md` instruye a los agentes del proyecto a revisar `./.agents/rules` antes de trabajar. En esta sesión leí explícitamente los tres archivos con la herramienta de lectura del workspace. Esto confirma que el agente pudo acceder a su contenido por esa vía; no confirma que VS Code u otros agentes los carguen automáticamente. No se encontró configuración `applyTo` ni otra declaración que permita afirmar carga automática.

## Resultados por regla

### `calendar-date-handling.md`

- **Tarea:** Tratar `create_date` como fecha calendario en el agrupamiento mensual y añadir regresión para `2025-03-01`.
- **Archivos modificados:** `.agents/rules/calendar-date-handling.md`, `frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts`.
- **Verificación:** Desde `frontend`, se ejecutó:

	```sh
	TZ=America/Los_Angeles npx --yes tsx -e 'import assert from "node:assert/strict"; import { computeMonthlyData } from "./src/lib/financial-utils.ts"; const result = computeMonthlyData([{ create_date: "2025-03-01", amount: 123, operation_type: "income", category: "sales", business_type: "B2B" }]); assert.equal(result[0].month, "Mar 2025"); console.log(result[0]);'
	```
- **Resultado:** Pasó; la función real retornó `{ month: 'Mar 2025', income: 123, outcome: 0, profitPercent: 100 }`.
- **Limitación:** La suite Vitest no se ejecutó; el test de regresión está añadido a ella, pero las dependencias del proyecto no estaban instaladas.

### `dashboard-period-source.md`

- **Tarea:** Sustituir el año fijo por una etiqueta derivada de los años del payload y usar una etiqueta neutral si el payload está vacío. Añadir pruebas de cruce de año y lista vacía.
- **Archivos modificados:** `.agents/rules/dashboard-period-source.md`, `frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts`, `frontend/src/App.tsx`, `frontend/src/components/dashboard/dashboard-header.tsx`.
- **Verificación:** Desde `frontend`, se ejecutó:

	```sh
	npx --yes tsx -e 'import assert from "node:assert/strict"; import { formatPeriodLabel } from "./src/lib/financial-utils.ts"; const movement = (create_date: string) => ({ create_date, amount: 1, operation_type: "income" as const, category: "sales" as const, business_type: "B2B" as const }); assert.equal(formatPeriodLabel([movement("2026-01-01"), movement("2025-12-31")]), "2025 - 2026"); assert.equal(formatPeriodLabel([]), "No period available"); console.log("period label: cross-year and empty payload passed");'
	```
- **Resultado:** Pasó: `2025 - 2026` para el rango y `No period available` para la lista vacía.
- **Limitación:** No se montó el dashboard en navegador; la verificación ejercitó la función real de formato, no el renderizado visual.

### `metrics-api-contract.md`

- **Tarea:** Añadir una prueba que comprueba las cinco claves JSON y los tipos/valores básicos de un movimiento devuelto por `/api/metrics`.
- **Archivos modificados:** `.agents/rules/metrics-api-contract.md`, `backend/tests/test_routes.py`.
- **Verificación focalizada:** `PYTHONPATH=/tmp/financial-dashboard-phase3-pydeps python -m pytest -q backend/tests/test_routes.py -k metrics_endpoint_returns_financial_movement_contract`.
- **Resultado focalizado:** Pasó: `1 passed, 15 deselected`.
- **Verificación completa:** `PYTHONPATH=/tmp/financial-dashboard-phase3-pydeps python -m pytest -q backend/tests/test_routes.py`.
- **Resultado completo:** Pasó: `16 passed`. Ambas ejecuciones mostraron una advertencia de deprecación de Starlette/httpx; no afectó a los resultados.

## Limitaciones generales

- `npm ci` no pudo escribir en `frontend/node_modules` y terminó con `EACCES`. `stat` y `namei -l` mostraron que ese directorio es `root:root`, modo `755`, mientras el proceso corre como `codespace` (UID 1000); el directorio padre `frontend` es escribible. El fallo al crear `node_modules/@babel` se explica por el propietario y permisos del directorio, no por el lockfile. No se modificaron permisos ni se borró el volumen.
- La suite frontend se ejecutó en el contenedor existente con `docker compose exec -T frontend npm test -- --reporter=dot`: `1` archivo y `8` tests pasaron.
- `docker compose exec -T frontend npm run build` pasó (`tsc -b` y `vite build`); Vite advirtió que un chunk minificado supera 500 kB.
- `docker compose exec -T frontend npm run lint` pasó sin errores.
- La suite backend se ejecutó en el contenedor existente con `docker compose exec -T backend pytest -q`: `16 passed`, con una advertencia de deprecación de Starlette/httpx.
- `curl -sS -o /dev/null -w 'frontend_root_http=%{http_code}\n' http://localhost:5173/` devolvió `200`.
- `curl -sS -w '\\nhttp_status=%{http_code}\\n' http://localhost:8000/health` devolvió `{"status":"ok"}` y HTTP `200`.
- Una validación JSON directa de `http://localhost:8000/api/metrics` devolvió HTTP `200`, `360` registros y esas cinco claves; comprobó fecha ISO, `amount` numérico y valores permitidos de `operation_type` y `business_type`.
- La solicitud `curl -sv --max-time 10 -D - http://localhost:5173/api/metrics -o /tmp/frontend-proxy-metrics.json` agotó 10 segundos con `0 bytes received`; la salida de Vite registra `connect ETIMEDOUT 172.18.0.2:8000`.
- Desde el contenedor frontend, DNS resolvió `backend` a `172.18.0.2`, ambos contenedores constan en la misma red bridge `172.18.0.0/16` y FastAPI escucha en `0.0.0.0:8000`; sin embargo, un socket TCP de frontend a `172.18.0.2:8000` agotó el tiempo. Esto localiza el fallo en la conectividad entre endpoints del bridge Docker, no en el listener HTTP ni en el esquema API.
- Como diagnóstico, desde frontend `http://172.18.0.1:8000/health` respondió `200`, y la misma ruta gateway para `/api/metrics` devolvió HTTP `200`, `360` registros, las cinco claves esperadas, fechas ISO y montos numéricos. Esta ruta de gateway no es el proxy `/api` de Vite y no cuenta como validación exitosa de ese proxy.
- Los contenedores estaban detenidos (`Exited (255)`); se iniciaron los contenedores e imágenes existentes con `docker compose start backend frontend` y quedaron en ejecución al terminar. No se reconstruyeron imágenes, no se recrearon contenedores y no se eliminó ni alteró el volumen existente.
- El intento de ejecutar el módulo TypeScript directamente con `node --experimental-strip-types` no resolvió el import sin extensión `./financial-types`; la comprobación de comportamiento se ejecutó luego con `tsx`.
- La suite Vitest no pudo ejecutarse en el workspace local porque faltan allí `vite` y sus plugins. `npm ci` está bloqueado por el directorio `node_modules` root-owned descrito arriba; las pruebas se ejecutaron con los paquetes instalados en el volumen del contenedor.
- No se pudo validar visualmente el dashboard en un navegador desde esta sesión. Después de la corrección de red, `/api/metrics` a través de Vite responde y entrega el payload esperado.

## Corrección del proxy Vite

- **Causa observada:** La conexión TCP directa desde frontend a `backend` (`172.18.0.2:8000`) agotaba el tiempo, aunque DNS, la red bridge compartida y el listener FastAPI estaban presentes. El gateway del host (`172.18.0.1:8000`) sí respondía desde frontend y reenviaba al backend publicado.
- **Cambio mínimo:** `frontend/vite.config.ts` ahora apunta a `http://host.docker.internal:8000`; `docker-compose.yml` declara `host.docker.internal:host-gateway` en frontend. Esto usa el camino gateway que ya se había observado funcional sin fijar su IP.
- **Aplicación:** `docker compose up -d --no-deps frontend` aplicó el alias al contenedor frontend existente. No se reconstruyó la imagen ni se borró ningún volumen.
- **Verificación:** `curl -sS --max-time 15 -w '\\n%{http_code}' http://localhost:5173/api/metrics` canalizado a Node para parsear y comprobar HTTP, cantidad, claves, fecha ISO, importes numéricos y valores permitidos.
- **Resultado real:** HTTP `200`, `360` movimientos, claves `amount`, `business_type`, `category`, `create_date`, `operation_type` y `valid: true`.

## Revisión visual manual

- **Confirmada por la usuaria:** el dashboard muestra importes y gráficos sin el error de carga.
- Esta comprobación fue una revisión visual realizada por la usuaria; no es un resultado de una prueba automatizada.