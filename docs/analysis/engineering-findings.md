# Hallazgos de ingeniería y reglas propuestas

Repositorio: https://github.com/4GeeksAcademy/hnandrade_ai-eng-financial-dashboard-context-project  
Agente: GitHub Copilot Chat (modo Agent), verificación hecha por el usuario con comandos en la terminal del Codespace  
Fecha: 2026-10-31  
Criterio: ✅ verificada en código o en salida real; ❓ sin verificar.

## Hallazgos verificados por categoría

### Nombres y convenciones

| ID | Hallazgo | Evidencia (ruta:línea + fragmento literal) | Impacto en un agente | Marca |
|---|---|---|---|:---:|
| C1 | Las funciones Python siguen snake_case; componentes React exportados usan PascalCase y archivos kebab-case. Búsqueda: 20 `def` en un archivo y 5 `export function` en 5 archivos de componentes. | `backend/app/routes.py:249` — `def get_metrics(`; `frontend/src/components/dashboard/kpi-row.tsx:11` — `export function KPIRow({ metrics, loading }: KPIRowProps) {` | Una edición podría introducir nombres inconsistentes o referencias/imports incorrectos. | ✅ |

### Arquitectura

| ID | Hallazgo | Evidencia (ruta:línea + fragmento literal) | Impacto en un agente | Marca |
|---|---|---|---|:---:|
| C2 | `main.py` crea la app y registra el router; schemas, generación, helpers y handlers están en `routes.py`. | `backend/app/main.py:14` — `app.include_router(router)`; `backend/app/routes.py:22` — `class FinancialMovement(BaseModel):`; `backend/app/routes.py:94` — `def generate_mock_movements(seed: int | None = None) -> list[FinancialMovement]:` | Al añadir rutas puede ampliarse un módulo que ya concentra varias responsabilidades. | ✅ |
| C3 | Ocho de las nueve rutas GET usan `response_model`; `/health` es la excepción. | `backend/app/routes.py:243` — `@router.get("/health")`; `backend/app/routes.py:248` — `@router.get("/api/metrics", response_model=list[FinancialMovement])`; baseline: 9 decoradores y 8 `response_model=` en `backend/app/routes.py` | Una ruta nueva de métricas sin modelo explícito puede dejar incompleto el contrato de salida. | ✅ |

### Datos

| ID | Hallazgo | Evidencia (ruta:línea + fragmento literal) | Impacto en un agente | Marca |
|---|---|---|---|:---:|
| R1 | `routes.py` concentra schemas, generación de datos, transformaciones y las nueve rutas GET en un solo módulo. | `backend/app/routes.py:22` — `class FinancialMovement(BaseModel):`; `backend/app/routes.py:94` — `def generate_mock_movements(seed: int | None = None) -> list[FinancialMovement]:`; `backend/app/routes.py:248` — `@router.get("/api/metrics", response_model=list[FinancialMovement])` | Cambios de modelo, generación o API se pueden afectar mutuamente en el mismo archivo. | ✅ |
| R2 | El frontend tiene un solo consumo HTTP (`/api/metrics`); `mock-data.ts` solo declara `mockMovements` y no aparece importado. La búsqueda de `mock-data` fue del usuario; la búsqueda de `fetch` fue de Copilot. R6 queda fusionado aquí. | `frontend/src/App.tsx:16` — `const response = await fetch(`${API_BASE_URL}/api/metrics`);`; `frontend/src/lib/mock-data.ts:3` — `export const mockMovements: FinancialMovement[] = [`; búsqueda del usuario: solo la definición; búsqueda de Copilot: solo `frontend/src/App.tsx:16` | Editar el mock sin conectarlo al flujo puede no cambiar los datos que ve la UI; las siete rutas de métricas restantes no son consumidas por este frontend. | ✅ |
| R3 | Los ocho handlers de `/api/metrics*` regeneran datos con `seed=42`; la generación usa cuatro valores literales y llama a `random.seed(seed)`. | `backend/app/routes.py:255` — `movements = generate_mock_movements(seed=42)`; `backend/app/routes.py:264` — `movements = generate_mock_movements(seed=42)`; `backend/app/routes.py:277` — `movements = generate_mock_movements(seed=42)`; `backend/app/routes.py:295` — `movements = generate_mock_movements(seed=42)`; `backend/app/routes.py:311` — `movements = generate_mock_movements(seed=42)`; `backend/app/routes.py:350` — `movements = generate_mock_movements(seed=42)`; `backend/app/routes.py:370` — `generate_mock_movements(seed=42)`; `backend/app/routes.py:386` — `generate_mock_movements(seed=42)`; `backend/app/routes.py:74` — `movement_day = random.randint(1, 28)`; `backend/app/routes.py:80` — `amount = round(random.uniform(800, 12000), 2)`; `backend/app/routes.py:83` — `amount = round(random.uniform(500, 9000), 2)`; `backend/app/routes.py:100` — `income_probability = random.uniform(0.45, 0.7)`; `backend/app/routes.py:96` — `random.seed(seed)` | Cambiar generación o semilla puede cambiar los ocho endpoints; la semilla actúa sobre el generador aleatorio global. | ✅ |
| R4 | El periodo del header es fijo, mientras el año de los movimientos se calcula desde `date.today()`. | `frontend/src/App.tsx:49` — `<DashboardHeader period="2024 - Full Year" />`; `frontend/src/components/dashboard/dashboard-header.tsx:7` — `export function DashboardHeader({ period = '2024 — Full Year' }: DashboardHeaderProps) {`; `backend/app/routes.py:65` — `def _year_for_month(month: int, today: date) -> int:`; `backend/app/routes.py:75` — `movement_date = date(_year_for_month(month, today), month, movement_day)` | Un cambio del rango de datos sin actualizar ambos textos puede mostrar un periodo que no corresponde. | ✅ |
| R5 | El agrupamiento mensual usa getters de zona horaria local; el efecto en un navegador no se probó. | `frontend/src/lib/financial-utils.ts:8` — `return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;`; `frontend/src/lib/financial-utils.ts:42` — `const yearMonthKey = toYearMonthKey(new Date(m.create_date));`; prueba de Node: UTC `2025 10`, `America/New_York` `2025 9` | Un posible desplazamiento de mes afectaría las gráficas; el efecto real en navegador sigue sin comprobarse. | ❓ |

### Manejo de errores

| ID | Hallazgo | Evidencia (ruta:línea + fragmento literal) | Impacto en un agente | Marca |
|---|---|---|---|:---:|
| C4 | La aplicación mantiene estados de carga y error y muestra el mensaje de error cuando falla la carga. | `frontend/src/App.tsx:26` — `const [loading, setLoading] = useState(true);`; `frontend/src/App.tsx:27` — `const [error, setError] = useState<string | null>(null);`; `frontend/src/App.tsx:53` — `{error}` | Un cambio en la carga debe conservar estados y retroalimentación visible para que el usuario distinga una respuesta vacía de un fallo. | ✅ |
| R7 | El `.catch` descarta el error, aunque el fetch lanza uno que incluye el status HTTP. | `frontend/src/App.tsx:18` — ``throw new Error(`Failed to fetch financial data: ${response.status}`);``; `frontend/src/App.tsx:35` — `.catch(() => {`; `frontend/src/App.tsx:36` — `setError(` | Cambiar el error mostrado sin revisar el catch puede seguir ocultando el status HTTP. | ✅ |

### Estilos

| ID | Hallazgo | Evidencia (ruta:línea + fragmento literal) | Impacto en un agente | Marca |
|---|---|---|---|:---:|
| C5 | Los componentes usan utilidades Tailwind; CSS define tokens y `cn()` combina clases. Búsqueda: 62 `className=` en 7 archivos de componentes. | `frontend/src/index.css:1` — `@import "tailwindcss";`; `frontend/src/index.css:5` — `:root {`; `frontend/src/lib/utils.ts:4` — `export function cn(...inputs: ClassValue[]) {` | Añadir colores/clases sin revisar tokens puede duplicar o contradecir el tema presente. | ✅ |

### Pruebas

| ID | Hallazgo | Evidencia (ruta:línea + fragmento literal) | Impacto en un agente | Marca |
|---|---|---|---|:---:|
| C6 | Las pruebas backend están en `backend/tests` con funciones `test_*`; el test frontend está junto a las utilidades y usa Vitest. | `backend/tests/test_routes.py:12` — `def test_generate_mock_movements_returns_full_year_sorted_data():`; `frontend/src/lib/financial-utils.test.ts:36` — `it("calculates totals and profit values", () => {`; baseline: 15 funciones y 5 `it` | Tests nuevos fuera de estas ubicaciones o con otros patrones podrían quedar fuera del inventario y los scripts actuales. | ✅ |
| R10 | La cobertura observada es de rutas backend y utilidades financieras; no hay tests de componentes en el inventario buscado. | `backend/tests/test_routes.py:29` — `def test_health_endpoint_returns_ok():`; `frontend/src/lib/financial-utils.test.ts:35` — `describe("computeKPIs", () => {`; búsqueda de tests en `frontend/src/components/`: sin archivos | Cambios de UI no quedan cubiertos por los tests de utilidades existentes. | ✅ |

### Herramientas de desarrollo

| ID | Hallazgo | Evidencia (ruta:línea + fragmento literal) | Impacto en un agente | Marca |
|---|---|---|---|:---:|
| C7 | ESLint es el linter frontend; la configuración incluye presets TS, React Hooks y React Refresh. | `frontend/package.json:9` — `"lint": "eslint .",`; `frontend/eslint.config.js:12` — `extends: [`; `frontend/eslint.config.js:15` — `reactHooks.configs.flat.recommended,` | Un agente puede consultar el linter existente, pero no debería inventar un comando formatter. | ✅ |
| C10 | El historial mezcla estilos: 27 commits; 3 con prefijo en minúscula, 1 con `Fix:`, 22 sin prefijo y 1 merge. | Recuento de la salida del historial: 27 commits; ejemplos literales: `feat:`, `docs:`, `chore:`, `Fix:` y `Merge pull request`. | No hay un formato de mensaje único y verificable que un agente pueda inferir del historial. | ✅ |
| R11 | `backend/requirements.txt` tiene seis dependencias sin versiones fijadas; mezcla ejecución, depuración y pruebas. | `backend/requirements.txt:1-6` — `fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov`, `httpx`; `grep -c "==" backend/requirements.txt`: 0 | Una instalación puede resolver versiones distintas; el manifiesto no identifica versiones concretas. | ✅ |
| R12 | La búsqueda de archivos versionados con nombres de formatter, CI y pre-commit indicados no tuvo resultados; el frontend sí tiene ESLint. | `frontend/package.json:9` — `"lint": "eslint .",`; `git ls-files | grep -iE "prettier\|biome\|editorconfig\|ruff\|pre-commit\|^\.github\|pyproject\|pytest\.ini\|tox\.ini"`: sin salida (búsqueda del usuario) | No se debe presuponer la existencia de esos formatos o gates en el repo. | ✅ |

### Seguridad

| ID | Hallazgo | Evidencia (ruta:línea + fragmento literal) | Impacto en un agente | Marca |
|---|---|---|---|:---:|
| R8 | CORS permite cualquier origin, métodos y headers junto con credentials. | `backend/app/main.py:9` — `allow_origins=["*"],`; `backend/app/main.py:10` — `allow_credentials=True,`; `backend/app/main.py:11` — `allow_methods=["*"],`; `backend/app/main.py:12` — `allow_headers=["*"],` | Copiar o ampliar esta política puede mantener acceso de origen demasiado amplio. | ✅ |
| R9 | debugpy escucha en `0.0.0.0:5678` y Compose publica 5678. | `backend/Dockerfile:12` — `"--listen", "0.0.0.0:5678"`; `docker-compose.yml:20` — `- "5678:5678"` | Mantener el puerto accesible fuera del entorno de desarrollo expondría el servicio de depuración. | ✅ |

### Documentación

| ID | Hallazgo | Evidencia (ruta:línea + fragmento literal) | Impacto en un agente | Marca |
|---|---|---|---|:---:|
| C9 | AGENTS da cuatro instrucciones: revisar reglas, skills y memory-bank condicional, y leerlas antes de actuar; actualmente las tres rutas consultadas no existen. | `AGENTS.md:6` — ``./.agents/rules``; `AGENTS.md:9` — ``./.agents/skills``; `AGENTS.md:12` — ``./memory-bank``; `AGENTS.md:13` — `_(if the directory exists)_`; `AGENTS.md:15` — `Before taking action...`; `ls -a .agents/rules .agents/skills memory-bank`: las tres rutas no existen | El agente debe informar la falta de contexto y no inventar el contenido de directorios ausentes. | ✅ |

## Hallazgos descartados

- **C8:** era una ausencia de formatter presentada como convención; reaparece como R12 con evidencia de búsqueda versionada.
- **R6:** duplicaba que el frontend consume `/api/metrics`; quedó fusionado en R2.
- **R4, dato `2025-10-02`:** no hay un archivo que guarde esa salida; el dato queda ❓. Según la salida del usuario, no se pudo reproducir porque el Python del Codespace no tiene `fastapi` (`ModuleNotFoundError` en `backend/app/routes.py:8`). Esto no invalida el hecho de código de R4.

## Reglas propuestas

### P1. convenciones-de-codigo

**Alcance:** `backend/app/**/*.py`; `frontend/src/components/**/*.tsx`; `frontend/src/index.css`; `frontend/src/lib/utils.ts`  
**Regla:** DEBES nombrar las funciones Python en snake_case y los componentes React en PascalCase dentro de archivos en kebab-case; DEBES combinar clases con `cn()` (`frontend/src/lib/utils.ts:4`) y reutilizar los tokens de `frontend/src/index.css` (`:root` en la línea 5) en lugar de colores literales.  
**Justificación:** C1, C5; `backend/app/routes.py:249` — `def get_metrics(`; `frontend/src/components/dashboard/kpi-row.tsx:11` — `export function KPIRow({ metrics, loading }: KPIRowProps) {`; `frontend/src/index.css:5` — `:root {`; `frontend/src/lib/utils.ts:4` — `export function cn(...inputs: ClassValue[]) {`.  
**Verificación:** `grep -rnE "def [a-z_]*[A-Z]" backend/app`; `find frontend/src/components -name "*.tsx" | grep -E "[A-Z_]"`; `grep -rnE "#[0-9a-fA-F]{6}|rgb\(" frontend/src/components`.  
**Línea base:** sin salida para los tres comandos.  
**Prioridad:** media

### P2. contratos-de-rutas-backend

**Alcance:** `backend/app/main.py`; `backend/app/routes.py`  
**Regla:** DEBES registrar toda ruta nueva en el router de `backend/app/routes.py` (`backend/app/main.py` solo incluye el router, línea 14) y declarar `response_model` con un modelo Pydantic en toda ruta `/api/metrics*` nueva; NO DEBES crear rutas en `main.py`. `/health` (`backend/app/routes.py:243`) es la única excepción actual.  
**Justificación:** C2, C3, R1; `backend/app/main.py:14` — `app.include_router(router)`; `backend/app/routes.py:248` — `@router.get("/api/metrics", response_model=list[FinancialMovement])`; `backend/app/routes.py:243` — `@router.get("/health")`.  
**Verificación:** `grep -n "@router.get" backend/app/routes.py | grep -v "response_model"` (esperado: solo línea 243); `grep -c "@router.get" backend/app/routes.py` (esperado 9); `grep -c "response_model=" backend/app/routes.py` (esperado 8).  
**Línea base:** línea 243; 9; 8.  
**Prioridad:** alta

### P3. fuente-de-datos-que-consume-la-ui

**Alcance:** `frontend/src/App.tsx`; `frontend/src/lib/mock-data.ts`; `frontend/src/components/**/*.tsx`  
**Regla:** Al cambiar datos visibles, DEBES seguir el fetch de `frontend/src/App.tsx:16` (único consumo HTTP, `/api/metrics`) hasta el componente que lo muestra; NO DEBES editar `frontend/src/lib/mock-data.ts` esperando cambiar la UI mientras ningún archivo lo importe; si añades un consumidor para otra ruta `/api/metrics/*`, DEBES conectarlo en `frontend/src/App.tsx` y decirlo en la respuesta.  
**Justificación:** R2; `frontend/src/App.tsx:16` — `const response = await fetch(`${API_BASE_URL}/api/metrics`);`; `frontend/src/lib/mock-data.ts:3` — `export const mockMovements: FinancialMovement[] = [`; el fetch aparece una vez en `frontend/src/App.tsx`, mock solo en su definición.  
**Verificación:** `grep -rn "mockMovements\|mock-data" frontend/src` (esperado: solo `frontend/src/lib/mock-data.ts:3`); `grep -rn "fetch(" frontend/src` (esperado: solo `frontend/src/App.tsx:16`).  
**Línea base:** una coincidencia de mock, una coincidencia de fetch, según lo esperado.  
**Prioridad:** alta

### P4. generacion-y-periodo-de-datos

**Alcance:** `backend/app/routes.py`; `frontend/src/App.tsx`; `frontend/src/components/dashboard/dashboard-header.tsx`  
**Regla:** Si cambias la generación de datos, DEBES revisar los 8 usos de `generate_mock_movements(seed=42)` en `backend/app/routes.py` y NO DEBES llamar a `random.seed` fuera de `generate_mock_movements` (`backend/app/routes.py:96`); si cambias el rango de fechas (`_year_for_month`, `backend/app/routes.py:65`), DEBES actualizar en el mismo cambio el texto fijo `2024 - Full Year` de `frontend/src/App.tsx:49` y el valor por defecto de `frontend/src/components/dashboard/dashboard-header.tsx:7`.  
**Justificación:** R3, R4; `backend/app/routes.py:96` — `random.seed(seed)`; `frontend/src/App.tsx:49` — `<DashboardHeader period="2024 - Full Year" />`; `backend/app/routes.py:75` — `movement_date = date(_year_for_month(month, today), month, movement_day)`.  
**Verificación:** `grep -c "generate_mock_movements(seed=42)" backend/app/routes.py` (esperado 8); `grep -n "random.seed" backend/app/routes.py` (esperado solo línea 96); `grep -rn "Full Year" frontend/src` (esperado 2 líneas: `frontend/src/App.tsx:49` y `frontend/src/components/dashboard/dashboard-header.tsx:7`).  
**Línea base:** 8; `backend/app/routes.py:96`; la búsqueda literal solo encuentra `frontend/src/App.tsx:49`; no encuentra el valor por defecto de `frontend/src/components/dashboard/dashboard-header.tsx:7` porque usa una raya larga.
**Prioridad:** alta

### P5. estado-y-errores-de-carga

**Alcance:** `frontend/src/App.tsx`  
**Regla:** DEBES mantener en `frontend/src/App.tsx` los estados `loading` y `error` (líneas 26-27) y un mensaje de error visible; si modificas el `.catch` (`frontend/src/App.tsx:35`), DEBES decidir y declarar en la respuesta si el error recibido se muestra o se descarta, porque hoy se descarta aunque el fetch lanza el status HTTP (`frontend/src/App.tsx:18`).  
**Justificación:** C4, R7; `frontend/src/App.tsx:26` — `const [loading, setLoading] = useState(true);`; `frontend/src/App.tsx:27` — `const [error, setError] = useState<string | null>(null);`; `frontend/src/App.tsx:35` — `.catch(() => {`.  
**Verificación:** `grep -nE "setLoading|setError|\.catch|\.finally" frontend/src/App.tsx`; la respuesta declara qué se hace con el error.  
**Línea base:** líneas 26-27, 35-36, 40-41; `sed -n '40p' frontend/src/App.tsx` devuelve `      .finally(() => {`.  
**Prioridad:** media

### P6. pruebas-junto-al-comportamiento

**Alcance:** `backend/tests/**/*.py`; `frontend/src/**/*.test.ts`; `backend/app/routes.py`; `frontend/src/lib/*.ts`  
**Regla:** Al cambiar una ruta de `backend/app/routes.py`, DEBES añadir o actualizar una función `test_*` en `backend/tests/test_routes.py`; al cambiar una función de `frontend/src/lib/`, DEBES actualizar su archivo `.test.ts` contiguo (hoy solo existe `frontend/src/lib/financial-utils.test.ts`); NO DEBES asumir que existen tests de componentes (no hay ninguno).  
**Justificación:** C6, R10; `backend/tests/test_routes.py:12` — `def test_generate_mock_movements_returns_full_year_sorted_data():`; `frontend/src/lib/financial-utils.test.ts:36` — `it("calculates totals and profit values", () => {`.  
**Verificación:** `grep -c "^def test_" backend/tests/test_routes.py` (línea base 15); `grep -c "\bit(" frontend/src/lib/financial-utils.test.ts` (línea base 5). ❓ La ejecución de pytest y de `npm run test` no se probó: el usuario informó que el Python del Codespace carece de FastAPI (`ModuleNotFoundError`), y no se comprobó node_modules del frontend.  
**Línea base:** 15; 5; npm/pytest no ejecutados por restricción.  
**Prioridad:** alta

### P7. cors-y-puertos-publicados

**Alcance:** `backend/app/main.py`; `docker-compose.yml`; `backend/Dockerfile`  
**Regla:** NO DEBES ampliar ni copiar la política CORS de `backend/app/main.py:9-12` ni añadir puertos publicados nuevos en `docker-compose.yml` sin que la tarea lo pida; al tocar esos archivos, DEBES informar los puertos publicados (hoy 5173, 8000 y 5678; 5678 es de debugpy: `backend/Dockerfile:12` y `docker-compose.yml:20`) y la política CORS (hoy `*` con credenciales).  
**Justificación:** R8, R9; `backend/app/main.py:9` — `allow_origins=["*"],`; `backend/app/main.py:10` — `allow_credentials=True,`; `backend/Dockerfile:12` — `"--listen", "0.0.0.0:5678"`; `docker-compose.yml:20` — `- "5678:5678"`.  
**Verificación:** `grep -cE '^\s*- "[0-9]+:[0-9]+"' docker-compose.yml` (esperado 3); `grep -n "allow_" backend/app/main.py` (esperado cuatro líneas, 9-12). ❓ El efecto en el navegador no se probó.  
**Línea base:** 3 con el regex literal; cuatro líneas CORS (9-12).  
**Prioridad:** alta

### P8. lectura-de-contexto-del-agente

**Alcance:** `AGENTS.md`; `.agents/rules/**`; `.agents/skills/**`; `memory-bank/**`  
**Regla:** ANTES de editar, DEBES listar y leer los archivos de `./.agents/rules` y `./.agents/skills` y, si existe, `./memory-bank` (`AGENTS.md:6`, `AGENTS.md:9`, `AGENTS.md:12`, `AGENTS.md:13`, `AGENTS.md:15`), e indicar en tu respuesta qué archivos leíste; si una ruta no existe, DEBES decirlo y NO DEBES presuponer su contenido.  
**Justificación:** C9; `AGENTS.md:12` — ``./memory-bank``; `AGENTS.md:13` — `_(if the directory exists)_`; `AGENTS.md:15` — `Before taking action...`.  
**Verificación:** checklist: la respuesta lista los archivos leídos; `ls -a .agents/rules .agents/skills memory-bank`.  
**Línea base:** las tres rutas no existen; `ls` devolvió “No such file or directory” para cada una.  
**Prioridad:** media

### P9. calidad-del-frontend

**Alcance:** `frontend/package.json`; `frontend/eslint.config.js`; `frontend/src/**/*.{ts,tsx}`  
**Regla:** Antes de dar por terminado un cambio en `frontend/src`, DEBES ejecutar los scripts `lint` (`frontend/package.json:9`) y `test` (`frontend/package.json:11`) y NO DEBES reformatear archivos completos: el repo no versiona formatter, CI ni pre-commit con los nombres de archivo buscados (R12).  
**Justificación:** C7, R12; `frontend/package.json:9` — `"lint": "eslint .",`; `frontend/eslint.config.js:12` — `extends: [`; búsqueda versionada del usuario: sin resultados.  
**Verificación:** `git ls-files | grep -iE "prettier|biome|editorconfig|ruff|pre-commit|^\.github|pyproject|pytest\.ini|tox\.ini"` (esperado sin salida). ❓ `npm run lint` y `npm run test` desde `frontend/` no se ejecutaron por restricción.  
**Línea base:** búsqueda versionada sin salida; npm no ejecutado.  
**Prioridad:** media

### P10. dependencias-del-backend

**Alcance:** `backend/requirements.txt`  
**Regla:** Al añadir una dependencia a `backend/requirements.txt`, DEBES fijar su versión con `==` y DEBES indicar en la respuesta si es de ejecución, depuración o pruebas; NO DEBES reordenar ni cambiar las seis entradas actuales (`backend/requirements.txt:1-6`) sin que la tarea lo pida.  
**Justificación:** R11; `backend/requirements.txt:1` — `fastapi`; `backend/requirements.txt:3` — `debugpy`; `backend/requirements.txt:4` — `pytest`.  
**Verificación:** `cat -n backend/requirements.txt` (línea base: seis entradas); `grep -c "==" backend/requirements.txt` (esperado 0 antes del cambio; la salida cero-match es exit 1).  
**Línea base:** seis entradas; cero `==`.  
**Prioridad:** media

## Matriz de trazabilidad

| Hallazgo | Regla(s) |
|---|---|
| C1 | P1 |
| C2 | P2 |
| C3 | P2 |
| C4 | P5 |
| C5 | P1 |
| C6 | P6 |
| C7 | P9 |
| C9 | P8 |
| C10 | Sin regla |
| R1 | P2 |
| R2 | P3 |
| R3 | P4 |
| R4 | P4 |
| R5 | Sin regla |
| R7 | P5 |
| R8 | P7 |
| R9 | P7 |
| R10 | P6 |
| R11 | P10 |
| R12 | P9 |

## Hallazgos sin regla

- **C10:** el historial tiene estilos mezclados; no hay una convención uniforme y verificable para convertirla en regla.
- **R5:** el efecto de la zona horaria local en un navegador no está probado; se evita prescribir comportamiento a partir de Node.

## Verificación de la Fase 2

Las filas 51 a 63 de `verification.md` recogen las correcciones de esta fase. La muestra de terminal del usuario cubre C1 a C7, C9, C10, R2, R3, R4 y R7 a R12.

## Diferencias

- La verificación literal P4 `grep -rn "2024 - Full Year" frontend/src` devuelve una coincidencia (`frontend/src/App.tsx:49`), no las dos esperadas: el default usa una raya larga. La búsqueda diagnóstica `grep -rn "Full Year" frontend/src` encuentra ambas y es la que usa ahora P4.
- La primera invocación sobre-escapó `\s` para P7 y dio 0; la verificación literal con un solo escape devolvió 3, que es la línea base registrada.
- El reporte del usuario sitúa el `ModuleNotFoundError` en `backend/app/routes.py:8`; la lectura actual muestra que la importación `from fastapi import APIRouter, Query` está en `backend/app/routes.py:7`, mientras la línea 8 importa `BaseModel`. Se registra el error como salida del usuario sin atribuirlo a la línea 8.
