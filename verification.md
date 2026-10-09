# Rastro de verificación

Leyenda: ✅ verificada en código o ejecutada · ❌ incorrecta (se corrige) · ❓ sin verificar.
Las rutas llevan `archivo:línea`. Estado del repo al hacer la verificación: commit `954f812`.

## Fase 1 — Comprender el handover

### Cómo se verificó

- **Lectura completa** de los 41 archivos del repo (backend, frontend, Docker, README, AGENTS.md).
- **Ejecución real de las funciones del backend** (`backend/app/routes.py`) con `pydantic` real y un stub mínimo de `fastapi` (solo `APIRouter` y `Query`). La capa HTTP no se ejecutó.
- **Ejecución real de `financial-utils.ts`** con Node 22 sobre los datos que genera el backend, en 4 zonas horarias.
- **No se pudo ejecutar** `docker compose up`, `pytest`, `vitest`, `npm run lint` ni `npm run build`: el entorno del agente no tiene acceso a PyPI ni a npm y su demonio de Docker no está activo. Por eso lo que depende de eso queda en ❓ (ver el final).

### Cómo arrancar (según la evidencia del repo)

| Qué | Evidencia |
|---|---|
| `docker compose up --build` | `README.md:42` |
| Frontend en `http://localhost:5173` | `docker-compose.yml:7`, `frontend/Dockerfile:12` |
| Backend en `http://localhost:8000` (docs en `/docs`) | `docker-compose.yml:19`, `README.md:49-50` |
| Puerto de depuración `5678` (debugpy) | `docker-compose.yml:20`, `backend/Dockerfile:12` |
| El frontend llama a `/api` y Vite lo reenvía a `http://backend:8000` | `frontend/src/App.tsx:13,16`, `frontend/vite.config.ts:13` |

### Mapa del proyecto

- **Backend** (FastAPI, Python 3.13): entrada `backend/app/main.py` (app + CORS), rutas y lógica en `backend/app/routes.py`, tests en `backend/tests/`.
- **Frontend** (React 19 + TypeScript + Vite + Tailwind 4 + Recharts): entrada `frontend/index.html` → `src/main.tsx` → `src/App.tsx`; lógica en `src/lib/`; componentes en `src/components/dashboard/` y `src/components/ui/`.
- **Datos**: no hay base de datos. El backend genera 360 movimientos simulados en memoria en cada petición.

### Resumen verificado

**Arquitectura y datos**

- ✅ Hay 2 servicios (frontend y backend) orquestados con Docker Compose. `docker-compose.yml`
- ✅ No hay base de datos: los datos se generan con `generate_mock_movements(seed=42)`. `routes.py:94-104`, `requirements.txt`
- ✅ Hay 9 rutas: `/health` y 8 bajo `/api/metrics`. `routes.py:243-378`
- ✅ Se generan 360 movimientos (30 por mes × 12), ordenados por fecha. Ejecutado: 360 y ordenados.
- ❌ «Los datos son siempre los mismos». Los importes sí son deterministas (misma semilla), pero **las fechas dependen de hoy**: `_year_for_month` y `date.today()` (`routes.py:65-68,97`) hacen una ventana de los 12 meses anteriores al mes actual. Ejecutado con hoy = 2026-10-09: de 2025-10-02 a 2026-09-28.
- ✅ Los movimientos son de tipo ingreso o gasto, con B2B/B2C y 5 categorías. Ejecutado: 197 ingresos, 163 gastos; 203 B2B, 157 B2C.

**Frontend**

- ✅ Solo se consume `/api/metrics`: es la única aparición de `/api/` en `frontend/src`. `App.tsx:16`
- ✅ Los KPIs y las gráficas se calculan en el navegador con `computeKPIs` y `computeMonthlyData`. `App.tsx:32-33`
- ❌ «El dashboard muestra 2024» (cabecera `2024 - Full Year`, `App.tsx:49`; valor por defecto `dashboard-header.tsx:7`). **Corrección:** el periodo real es la ventana móvil de arriba; el texto está fijo y desactualizado.
- ❌ «`mock-data.ts` alimenta la interfaz» (suposición por el nombre). **Corrección:** `frontend/src/lib/mock-data.ts` (57 movimientos de 2024) no se importa en ningún sitio.
- ❌ «La agrupación por meses es correcta en cualquier zona horaria». **Corrección:** `financial-utils.ts:42` hace `new Date("YYYY-MM-DD")` (UTC) y luego usa `getMonth()` en hora local (`financial-utils.ts:8`). Ejecutado con los datos del backend: en `America/Bogota` y `America/New_York` los 16 movimientos del día 1 de cada mes (de 360) caen en el mes anterior; ingresos de «Oct 2025»: 112 375,23 frente a 106 909,67 correcto (el de `/api/metrics/summary` y el de UTC/Madrid). Los totales no cambian.
- ✅ La UI está en inglés, salvo el mensaje de error de `App.tsx:37`, que está en español y sin tilde.

**Entorno y configuración**

- ✅ README: «no hacen falta variables de entorno en local ni Codespaces» es cierto con Docker Compose: la base de la API está vacía (`App.tsx:13`) y el proxy apunta a `backend` (`vite.config.ts:13`).
- ❓ Fuera de Compose, el host `backend` no se resuelve, así que `npm run dev` suelto necesitaría `VITE_API_BASE_URL`. No ejecutado.
- ❓ `README.md:46` dice «copia `frontend/.env.example` a `.env`» sin decir dónde. Lo razonable es `frontend/.env` (raíz de Vite). No ejecutado.
- ✅ El puerto de depuración está expuesto en `0.0.0.0` y publicado (`backend/Dockerfile:12`, `docker-compose.yml:20`).
- ✅ CORS permite cualquier origen con credenciales. `main.py:9-10`
- ❌ «`depends_on` espera a que el backend esté sano». **Corrección:** `docker-compose.yml:11` solo ordena el arranque; no hay healthcheck, aunque existe `/health` (`routes.py:243`).
- ❌ «Hay integración continua». **Corrección:** no existe `.github/`.

**Tests**

- ✅ Hay 15 tests de backend (`backend/tests/test_routes.py`, `pytest` + `TestClient`) y 5 de frontend (`frontend/src/lib/financial-utils.test.ts`, `vitest`). Los de frontend solo cubren `src/lib`, no los componentes (`package.json` no incluye `jsdom` ni `@testing-library`).
- ❌ «El test de comparación comprueba la lógica». **Corrección:** `test_routes.py:157-171` usa 2025-03-01 a 2025-03-31 y solo comprueba los nombres de las claves. Ejecutado: hoy hay **0** movimientos en ese mes, así que pasa sin probar nada.

**Documentos del handover**

- ❌ «`AGENTS.md` apunta a guías existentes». **Corrección:** al recibir el repo no existían `.agents/rules`, `.agents/skills` ni `memory-bank`. Las reglas y el memory bank se crean en las fases 3 y 4; `.agents/skills` no se crea porque el ejercicio no lo pide.

### Pendiente (❓) — hay que ejecutarlo en Codespaces o en local

```bash
docker compose up --build                       # arranca los 2 servicios
curl http://localhost:8000/health               # espera {"status":"ok"}
curl -s http://localhost:8000/api/metrics | head -c 300
cd backend && pytest                            # 15 tests
cd frontend && npm test && npm run lint && npm run build
```

### Para comprobar tú mismo las rutas clave

1. Abre `frontend/src/App.tsx` y mira la línea 49: dice `2024 - Full Year`.
2. Busca `mock-data` en todo `frontend/src`: solo aparece el propio archivo.
3. Busca `/api/` en `frontend/src`: solo aparece en `App.tsx:16`.
4. Abre `backend/app/routes.py` en las líneas 65-68 y 94-104 (la fecha de hoy decide el año).
5. Abre `backend/tests/test_routes.py` en la línea 160: fechas fijas de 2025-03.

## Fase 3 — Reglas en `.agents/rules` y su validación

Cada regla se probó con una tarea pequeña y real sobre este repo. Como en el entorno del agente no hay `pytest`, `vitest` ni Docker, la comprobación se hizo ejecutando el código real con herramientas equivalentes: 569 combinaciones de llamadas a los endpoints (con `fastapi` simulado), un sustituto mínimo de `vitest` ejecutando el archivo de tests real en 4 zonas horarias, y `tsc` global sobre los archivos de `src/lib`.

| Regla | Tarea real | Comprobación | Resultado | Qué se refinó en la regla |
|---|---|---|---|---|
| `backend-api` | Sustituir el filtro de `business_type`, copiado en 4 endpoints más `/b2b` y `/b2c`, por `filter_by_business_type`. | Salida de las 569 combinaciones antes y después: idéntica byte a byte. `grep -c "if business_type is not None"` = 0. El archivo compila. | ✅ | Dónde crear un filtro nuevo y su patrón (`None` → devuelve la lista); `/b2b` y `/b2c` también lo usan. |
| `backend-tests`, `backend-data` | Rehacer `test_metrics_comparison_returns_delta_fields` sin fechas fijas y comprobando valores. | Lógica del test ejecutada con las funciones reales: pasa. Con un fallo inyectado (sumar en vez de restar) el test nuevo falla y el antiguo no lo detecta. No queda ningún año fijo en `backend/tests`. | ✅ (el test no se pudo lanzar con `pytest`) | Receta del periodo anterior de `/comparison`; romper la lógica a propósito; recalcular el valor desde otra respuesta. |
| `frontend-dates`, `frontend-tests`, `frontend-code` | Corregir `toYearMonthKey` (usa `slice(0, 7)`) y añadir un test de día 1 y día 31. | El test nuevo falla con el código antiguo en `America/Bogota` y `America/New_York` (5 pasan, 1 falla) y pasa en `UTC` y `Europe/Madrid`. Con el arreglo pasan los 6 tests en las 4 zonas. Con los datos reales del backend, el primer mes da 106 909,67 en las 4 zonas (antes 112 375,23 en América). `tsc` sin errores en `financial-utils.ts` y `financial-types.ts`. | ✅ (`vitest` real, lint y build sin ejecutar) | `UTC` y `Europe/Madrid` no detectan el fallo: hay que probar en una zona de América. |
| `docs-and-commits` | Aclarar en `README.md` y `README.es.md` que el `.env` va en `frontend/.env`. | Los dos READMEs dicen lo mismo. `git check-ignore -v frontend/.env` confirma que `.gitignore:11` lo excluye. | ✅ | Cambiar «un commit por tarea» por «un commit por unidad coherente»; no citar líneas que se desplazan. |
| `docker-env` | Solo comprobaciones por lectura: `.gitignore` y proxy `backend` (`vite.config.ts:13`). | Docker no se pudo ejecutar. | ❓ | Sección «No verificado en este entorno». |

- **Un solo commit:** las 4 tareas y las reglas van juntas porque el ejercicio pide un commit dedicado por fase.
- **Líneas desplazadas:** las líneas de `docs/engineering-findings.md` y de la Fase 1 se refieren al commit `954f812`. Tras la Fase 3, en `backend/app/routes.py` las líneas posteriores a la 145 se desplazan 11 por el nuevo helper.
- **Sigue abierto:** la cabecera fija `2024 - Full Year` (`App.tsx:49`, hallazgo F15). No se corrigió porque requiere ver la interfaz en funcionamiento.

### Pendiente de ejecutar (❓)

```bash
cd backend && pytest                      # incluye el test de comparación reescrito
cd frontend && npm test                   # 6 tests
cd frontend && TZ=America/New_York npm test
```
