# Convenciones existentes del repositorio

> Documenta únicamente convenciones que ya existen en el código, verificadas por lectura directa de archivos y `git log`. No incluye recomendaciones ni prácticas genéricas de React/Docker/FastAPI que no estén evidenciadas aquí.
> Complementa a `memory-bank/project-summary.md` (qué es y cómo se ejecuta el proyecto). Este archivo responde a "cómo está escrito" y "qué patrones sigue".
> Fecha de generación: 2026-09-04.

---

## Estructura de carpetas

### 1. Separación `dashboard/` (dominio) vs `ui/` (primitivos) vs `lib/` (lógica) en el frontend
- **Evidencia**: `frontend/src/components/dashboard/` contiene componentes específicos del negocio (headers, gráficas, KPIs); `frontend/src/components/ui/` contiene primitivos de estilo shadcn/ui reutilizables sin lógica de negocio; `frontend/src/lib/` contiene tipos, utilidades puras y datos.
- **Archivos**: `frontend/src/components/dashboard/*.tsx`, `frontend/src/components/ui/card.tsx`, `frontend/src/components/ui/skeleton.tsx`, `frontend/src/lib/*.ts`; alias `ui`/`components`/`lib` declarados en `frontend/components.json:13-18`.
- **Qué podría romper un agente**: colocar un componente de negocio nuevo dentro de `components/ui/` (o un primitivo genérico dentro de `dashboard/`) rompe la separación categórica que el alias `ui` de `components.json` da por sentada para futuras generaciones de componentes shadcn.

### 2. Backend como un único paquete `app/` sin capas (`models.py`, `services.py`, etc.)
- **Evidencia**: `backend/app/` solo contiene `__init__.py`, `main.py` (instancia de `FastAPI` + middleware) y `routes.py` (rutas, modelos Pydantic y lógica de negocio, 392 líneas, todo junto).
- **Archivos**: `backend/app/__init__.py`, `backend/app/main.py`, `backend/app/routes.py`.
- **Qué podría romper un agente**: crear `backend/app/models.py` o `backend/app/services.py` asumiendo una arquitectura por capas típica de FastAPI introduce una estructura sin precedente y duplica tipos que ya existen en `routes.py`, sin que nada los reexporte automáticamente.

### 3. Tests con convención distinta por lenguaje: carpeta dedicada (backend) vs coubicados (frontend)
- **Evidencia**: `backend/tests/` es una carpeta separada de `backend/app/`. `frontend/src/lib/financial-utils.test.ts` vive junto a `frontend/src/lib/financial-utils.ts`, sin carpeta `__tests__`.
- **Archivos**: `backend/tests/test_routes.py`, `backend/tests/conftest.py`, `frontend/src/lib/financial-utils.test.ts`.
- **Qué podría romper un agente**: mover los tests del backend dentro de `app/`, o crear `frontend/src/__tests__/`, rompe el patrón que ambos stacks siguen hoy (aunque Vitest seguiría encontrando el archivo por glob, la convención quedaría inconsistente).

---

## Nombres de archivos

### 4. kebab-case para todo archivo de componente/librería del frontend, salvo los puntos de entrada de Vite
- **Evidencia**: `dashboard-header.tsx`, `income-outcome-chart.tsx`, `kpi-card.tsx`, `kpi-row.tsx`, `profit-percent-chart.tsx`, `financial-types.ts`, `financial-utils.ts`, `mock-data.ts` — todos kebab-case. `App.tsx` y `main.tsx` son la excepción (nombres de scaffold por defecto de Vite/React).
- **Archivos**: listado completo de `frontend/src/` (`git ls-files`).
- **Qué podría romper un agente**: nombrar un archivo nuevo en PascalCase (`KpiCard.tsx`) no rompe el build pero rompe la consistencia visible en todo el árbol existente.

### 5. snake_case en Python siguiendo PEP8
- **Evidencia**: nombres de función y variable del backend (`generate_mock_movements`, `filter_movements_by_date`, `_year_for_month`, `_build_movement`) — todos snake_case; el prefijo `_` marca funciones privadas del módulo.
- **Archivos**: `backend/app/routes.py:65,71,94,107`.
- **Qué podría romper un agente**: introducir camelCase en nombres Python (`generateMockMovements`) rompe la consistencia con el resto del archivo y con PEP8, que el resto del código respeta estrictamente.

---

## Nombres de componentes

### 6. Export nombrado (no `default`) en todos los componentes excepto `App`
- **Evidencia**: `export function DashboardHeader(...)`, `export function KPIRow(...)`, `export function KPICard(...)`, `export function IncomeOutcomeChart(...)`, `export function ProfitPercentChart(...)`, `export { Card, CardHeader, ... }`, `export { Skeleton }`. Único `export default App` en `App.tsx:74`, consumido como default import en `main.tsx:4`.
- **Archivos**: `frontend/src/components/dashboard/*.tsx`, `frontend/src/components/ui/card.tsx:84-92`, `frontend/src/components/ui/skeleton.tsx:13`, `frontend/src/App.tsx:74`.
- **Qué podría romper un agente**: añadir `export default` a un componente de `dashboard/` o `ui/` rompe la convención de imports nombrados (`import { KPIRow } from ...`) usada en todo el resto del árbol y obligaría a reescribir cada import existente de ese componente.

### 7. Props tipadas con `interface <ComponentName>Props`
- **Evidencia**: `interface DashboardHeaderProps`, `interface KPIRowProps`, `interface KPICardProps`, `interface IncomeOutcomeChartProps`, `interface ProfitPercentChartProps`.
- **Archivos**: `frontend/src/components/dashboard/dashboard-header.tsx:3`, `kpi-row.tsx:6`, `kpi-card.tsx:6`, `income-outcome-chart.tsx:16`, `profit-percent-chart.tsx:15`.
- **Qué podría romper un agente**: usar `type Props = {...}` sin el sufijo `Props` con el nombre del componente, o props inline sin tipo nombrado, no rompe el build pero se desvía del único patrón presente en los 5 componentes de dashboard.

### 8. Todo componente que muestra datos acepta `loading?: boolean` y renderiza su propio `<Skeleton>`
- **Evidencia**: `KPICard`, `IncomeOutcomeChart` y `ProfitPercentChart` implementan el mismo bloque `if (loading) { return <Card>...<Skeleton/>...</Card> }` antes de renderizar el contenido real.
- **Archivos**: `frontend/src/components/dashboard/kpi-card.tsx:37-50`, `income-outcome-chart.tsx:50-62`, `profit-percent-chart.tsx:51-63`.
- **Qué podría romper un agente**: añadir un widget nuevo al dashboard sin manejar su propio estado `loading` con `<Skeleton>` interno rompe la experiencia de carga consistente que ya tienen los tres widgets existentes.

---

## Imports

### 9. Alias `@/` para imports fuera del directorio actual; relativos (`./`) solo dentro del mismo directorio
- **Evidencia**: `kpi-row.tsx` importa `./kpi-card` (mismo directorio, relativo) pero `@/lib/financial-types` (otro directorio, alias). `financial-utils.ts` importa `./financial-types` (mismo directorio `lib/`, relativo). `income-outcome-chart.tsx` importa `@/components/ui/card`, `@/lib/financial-types` (otros directorios, alias).
- **Archivos**: `frontend/src/components/dashboard/kpi-row.tsx:1-3`, `frontend/src/lib/financial-utils.ts:1-5`, `frontend/src/components/dashboard/income-outcome-chart.tsx:1-4`. Configuración del alias: `frontend/vite.config.ts:18-21`, `frontend/tsconfig.app.json:12-13`.
- **Qué podría romper un agente**: usar rutas relativas profundas (`../../lib/financial-types`) en vez de `@/lib/financial-types` compila igual pero rompe la convención y dificulta mover archivos sin actualizar imports.

### 10. Imports de tipo marcados inline con `type`, nunca `import type {...}` para todo el import
- **Evidencia**: `import { type FinancialMovement, type KPIMetrics, type MonthlyDataPoint } from "@/lib/financial-types"`; `import { type FinancialMovement } from './financial-types'`. Impuesto por `verbatimModuleSyntax: true`.
- **Archivos**: `frontend/src/App.tsx:6-10`, `frontend/src/lib/mock-data.ts:1`, `frontend/src/components/dashboard/income-outcome-chart.tsx:3`, config en `frontend/tsconfig.app.json:16`.
- **Qué podría romper un agente**: importar un tipo sin el modificador `type` bajo `verbatimModuleSyntax: true` puede romper `npm run build` (`tsc -b`), porque TypeScript intentará emitirlo como import de valor real.

### 11. Sin regla de ESLint que ordene imports (no hay `eslint-plugin-import` ni `simple-import-sort`)
- **Evidencia**: `frontend/eslint.config.js` solo carga `js.configs.recommended`, `tseslint.configs.recommended`, `reactHooks` y `reactRefresh` — ningún plugin de orden de imports.
- **Archivos**: `frontend/eslint.config.js:12-17`.
- **Qué podría romper un agente**: no hay un orden de imports "correcto" que un agente deba imponer o corregir; el orden observado varía entre archivos (a veces `react`/paquetes externos primero, a veces al final) sin que exista una regla real que lo exija.

---

## Scripts

### 12. Solo el frontend tiene scripts npm; el backend no tiene wrapper para `pytest`
- **Evidencia**: `frontend/package.json` define `dev`, `build`, `lint`, `preview`, `test`, `test:watch`, `test:coverage`. No existe `Makefile`, `backend/pyproject.toml` ni `backend/pytest.ini` en el repo.
- **Archivos**: `frontend/package.json:6-14`; ausencia confirmada en el listado de archivos del backend.
- **Qué podría romper un agente**: asumir que `npm test` ejecuta también los tests del backend, o buscar un script `test:backend`, no encontrará nada — hoy no existe ninguna integración entre ambos test runners.

---

## Configuración

### 13. Sin formateador de código (no hay Prettier); el estilo de comillas es inconsistente entre archivos
- **Evidencia**: comillas simples en `dashboard-header.tsx`, `kpi-row.tsx`, `card.tsx`, `skeleton.tsx`, `financial-types.ts`, `mock-data.ts`; comillas dobles en `App.tsx`, `financial-utils.ts`, `financial-utils.test.ts`, `vite.config.ts`, `eslint.config.js`. `prettier` no aparece en `frontend/package.json` devDependencies, y no hay archivo `.prettierrc`.
- **Archivos**: comparación directa de los archivos citados; `frontend/package.json:24-43`.
- **Qué podría romper un agente**: "corregir" las comillas a un único estilo en un PR no solicitado generaría un diff masivo y no solicitado — no existe una convención estricta que respetar, sino inconsistencia real y aceptada.

### 14. TypeScript con reglas de "linting extra" activas en `tsconfig.app.json`
- **Evidencia**: `noUnusedLocals: true`, `noUnusedParameters: true`, `noFallthroughCasesInSwitch: true`, `erasableSyntaxOnly: true`.
- **Archivos**: `frontend/tsconfig.app.json:22-25`.
- **Qué podría romper un agente**: dejar una variable, import o parámetro sin usar rompe `npm run build` (`tsc -b`) aunque `npm run dev` (Vite, sin type-check) siga funcionando sin avisar del error.

### 15. Tailwind v4 vía plugin de Vite y config CSS-first (`@theme inline`), sin `tailwind.config.js`
- **Evidencia**: no existe `tailwind.config.js`/`.ts` en el repo; el theme se define enteramente en `frontend/src/index.css` con `@import "tailwindcss"`, `@theme inline {...}` y variables `oklch()` duplicadas para `:root` (claro) y `.dark` (oscuro).
- **Archivos**: `frontend/src/index.css:1,5-40,42-76,78-109`; `frontend/vite.config.ts:3,8` (`@tailwindcss/vite`).
- **Qué podría romper un agente**: crear un `tailwind.config.js` tradicional (estilo v3) no tiene efecto real con el plugin v4 activo y puede confundir a otro agente que lo lea creyendo que ahí vive la configuración real; un color nuevo debe añadirse como variable CSS en `index.css`, no en un archivo de config JS.

---

## Tests

### 16. Backend: tests de integración reales contra `TestClient`, sin mockear la generación de datos
- **Evidencia**: `client = TestClient(app)` a nivel de módulo; cada test hace una petición HTTP real (`client.get(...)`) y verifica el JSON de respuesta contra el comportamiento real de `generate_mock_movements`, sin mocks.
- **Archivos**: `backend/tests/test_routes.py:9` y las 15 funciones `test_*` del archivo.
- **Qué podría romper un agente**: mockear `generate_mock_movements` o el cliente HTTP en un test nuevo rompe el patrón de "test de integración real contra la app completa" que siguen los 15 tests existentes.

### 17. `conftest.py` inserta manualmente la raíz del proyecto en `sys.path`, en vez de instalar el paquete
- **Evidencia**: `ROOT_DIR = Path(__file__).resolve().parents[1]; sys.path.insert(0, str(ROOT_DIR))`. No hay `pyproject.toml` ni `pip install -e .` en el repo.
- **Archivos**: `backend/tests/conftest.py:5-7`.
- **Qué podría romper un agente**: eliminar o modificar `conftest.py` asumiendo que el paquete `app` está instalado rompe los imports `from app.main import app` / `from app.routes import ...` en todos los tests.

### 18. Frontend: fixtures de datos inline en el propio archivo de test, sin factories externas
- **Evidencia**: `const sampleMovements: FinancialMovement[] = [...]` definido directamente arriba de los bloques `describe`, sin librería de generación de datos de prueba.
- **Archivos**: `frontend/src/lib/financial-utils.test.ts:11-33`.
- **Qué podría romper un agente**: introducir una librería de fixtures/factories (`faker`, etc.) para un test nuevo no seguiría el patrón existente de datos literales inline, y añadiría una dependencia sin precedente.

---

## Docker

### 19. Mismo patrón de cacheo de capas en ambos Dockerfiles: manifiesto → instalar → copiar el resto
- **Evidencia**: frontend: `COPY package*.json ./` → `RUN npm install` → `COPY . .`. backend: `COPY requirements.txt ./` → `RUN pip install --no-cache-dir -r requirements.txt` → `COPY . .`.
- **Archivos**: `frontend/Dockerfile:5-8`, `backend/Dockerfile:5-8`.
- **Qué podría romper un agente**: reordenar a `COPY . .` antes de instalar dependencias invalida el cacheo de capas de Docker en cada build (no rompe la app, pero ralentiza notablemente el ciclo de desarrollo que hoy aprovecha la caché).

### 20. `CMD` siempre en forma exec (array JSON), nunca forma shell
- **Evidencia**: `CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]`; `CMD ["python", "-m", "debugpy", ...]`.
- **Archivos**: `frontend/Dockerfile:12`, `backend/Dockerfile:12`.
- **Qué podría romper un agente**: cambiar a forma shell (`CMD npm run dev`) altera cómo se propagan las señales del proceso (p. ej. `SIGTERM` al detener el contenedor), un comportamiento distinto al actual.

### 21. Imágenes de un solo stage, sin `USER` no-root ni `HEALTHCHECK`
- **Evidencia**: ambos Dockerfiles completos no declaran `USER` ni `HEALTHCHECK`, ni usan `FROM ... AS build` multi-stage.
- **Archivos**: `frontend/Dockerfile` (13 líneas), `backend/Dockerfile` (13 líneas), contenido completo.
- **Qué podría romper un agente**: no debe asumirse que existe una comprobación de salud de contenedor a nivel de Docker/Compose para lógica de orquestación (`depends_on: condition: service_healthy`) — `docker-compose.yml` tampoco la define; cualquier "esperar a que esté listo" debe implementarse aparte.

---

## Manejo de variables de entorno

### 22. Único patrón de acceso: `import.meta.env.VITE_X ?? "<fallback>"`, nunca sin fallback
- **Evidencia**: `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";` — único acceso a `import.meta.env` en todo el repo.
- **Archivos**: `frontend/src/App.tsx:13`.
- **Qué podría romper un agente**: añadir una variable de entorno nueva accedida sin `?? "valor_por_defecto"` puede introducir `undefined` concatenado en URLs u otras cadenas en runtime, algo que el único ejemplo existente evita explícitamente.

### 23. Toda variable de entorno de frontend documentada en `.env.example` con comentario explicativo antes del `NOMBRE=`
- **Evidencia**: dos líneas de comentario (`# Optional override...`, `# In local development...`) preceden a `VITE_API_BASE_URL=` sin valor.
- **Archivos**: `frontend/.env.example:1-4`.
- **Qué podría romper un agente**: añadir una variable nueva a `.env.example` sin comentario explicativo, o sin el prefijo `VITE_` (requerido por Vite para exponerla al cliente), rompe tanto la documentación como la exposición real de la variable en `import.meta.env`.

---

## Llamadas API

### 24. `fetch` nativo, nunca una librería HTTP externa
- **Evidencia**: `fetch(`${API_BASE_URL}/api/metrics`)` es la única llamada de red del frontend; `axios` (ni ninguna otra librería HTTP) aparece en `frontend/package.json`.
- **Archivos**: `frontend/src/App.tsx:15-21`; ausencia confirmada en `frontend/package.json` dependencies.
- **Qué podría romper un agente**: añadir `axios` (o cualquier cliente HTTP) para una llamada nueva introduce una dependencia y un patrón sin precedente frente al único ejemplo existente basado en `fetch`.

### 25. Todas las rutas de negocio bajo `/api/metrics...`; `/health` es la única excepción sin prefijo `/api`
- **Evidencia**: 8 rutas comparten el prefijo `/api/metrics` (`/api/metrics`, `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b`, `/api/metrics/b2c`); `/health` no lleva prefijo.
- **Archivos**: `backend/app/routes.py:243,248,262,268,287,305,342,362,378`.
- **Qué podría romper un agente**: un endpoint de negocio nuevo sin el prefijo `/api/metrics` rompe el espacio de nombres consistente; poner `/api/health` en vez de `/health` no coincidiría con el único endpoint de salud existente y con lo documentado en `README.md`.

### 26. `response_model=` explícito y `Query(default=...)` explícito en cada ruta
- **Evidencia**: los 9 decoradores `@router.get(...)` declaran `response_model` sin excepción; todos los parámetros opcionales usan `Query(default=...)` en vez de solo `= None`.
- **Archivos**: `backend/app/routes.py` — cada decorador `@router.get(...)`.
- **Qué podría romper un agente**: omitir `response_model` en una ruta nueva rompe la consistencia de la documentación automática (`/docs`), que hoy funciona igual para las 9 rutas existentes.

---

## Manejo de estado

### 27. Estado 100% local en `App.tsx` (`useState`/`useEffect`), sin librería de estado global
- **Evidencia**: `const [metrics, setMetrics] = useState<KPIMetrics | null>(null)` y similares; ninguna librería de estado (Redux, Zustand, Jotai, Context API para datos) aparece en `frontend/package.json` ni se usa en el código.
- **Archivos**: `frontend/src/App.tsx:24-27,29-43`; `frontend/package.json` dependencies (sin librería de estado).
- **Qué podría romper un agente**: introducir Redux/Zustand/Context para una feature nueva rompe la arquitectura "todo el estado vive en `App.tsx` y se pasa por props" que siguen hoy los 4 componentes hijos (`KPIRow`, `IncomeOutcomeChart`, `ProfitPercentChart`, `DashboardHeader`).

### 28. Transformación de datos en funciones puras separadas del componente (`lib/financial-utils.ts`)
- **Evidencia**: `computeKPIs`, `computeMonthlyData`, `formatCurrency`, `formatPercent` viven en `lib/financial-utils.ts` y se importan en `App.tsx`, no se calculan inline dentro del componente.
- **Archivos**: `frontend/src/lib/financial-utils.ts`, uso en `frontend/src/App.tsx:11`.
- **Qué podría romper un agente**: añadir lógica de transformación de datos directamente dentro de un componente (en vez de como función pura en `lib/`) rompe la separación entre lógica de negocio (testeable, ver `financial-utils.test.ts`) y presentación que sigue todo el resto del código.

---

## Estilos

### 29. Solo clases utilitarias de Tailwind en `className`, combinadas con el helper `cn()` para clases condicionales
- **Evidencia**: `cn(...)` (clsx + tailwind-merge) se usa en cada componente de `components/ui/` y en `kpi-card.tsx` para fusionar clases base con `className` recibido por props. No hay archivos `.module.css` ni `styled-components` en el repo.
- **Archivos**: `frontend/src/lib/utils.ts`, uso en `frontend/src/components/ui/card.tsx:9`, `skeleton.tsx:7`, `frontend/src/components/dashboard/kpi-card.tsx:59`.
- **Qué podría romper un agente**: introducir CSS Modules o `styled-components` para un componente nuevo añade un segundo sistema de estilos sin precedente en el repo.

### 30. Colores referenciados como variables CSS (`var(--chart-income)`, etc.), nunca valores hex/rgb hardcodeados
- **Evidencia**: `stroke="var(--chart-income)"`, `stroke="var(--chart-outcome)"`, `bg-[var(--income-badge)]` — todos los colores semánticos se referencian por variable, definida en `:root` y `.dark` dentro de `index.css`.
- **Archivos**: `frontend/src/components/dashboard/income-outcome-chart.tsx:104,113`, `frontend/src/components/dashboard/kpi-card.tsx:17-31`, definiciones en `frontend/src/index.css:5-40,42-76`.
- **Qué podría romper un agente**: hardcodear un color (`stroke="#3b82f6"`) rompe el soporte de tema claro/oscuro, que hoy funciona automáticamente gracias a que cada variable tiene una definición distinta en `:root` y en `.dark`.

---

## Errores

### 31. Backend: cero manejo de errores explícito
- **Evidencia**: búsqueda de `HTTPException|raise |except |try:` en todo `backend/` → 0 coincidencias. Toda la validación (tipos de query params, campos requeridos) se delega a FastAPI/Pydantic.
- **Archivos**: `backend/app/routes.py`, `backend/app/main.py` (verificado por ausencia).
- **Qué podría romper un agente**: añadir un `try/except` genérico que capture y silencie errores en una ruta nueva rompe el comportamiento actual, donde los errores de validación de Pydantic devuelven automáticamente `422` con detalle — silenciarlos ocultaría bugs reales.

### 32. Frontend: un único `.catch()` en toda la app, que descarta el error real y no loguea a consola
- **Evidencia**: `.catch(() => { setError("No se pudo cargar..."); })` — el parámetro del error ni siquiera se captura. Búsqueda de `console.(log|error|warn)` en `frontend/src` → 0 coincidencias.
- **Archivos**: `frontend/src/App.tsx:35-39`.
- **Qué podría romper un agente**: depender de ver el error real en la consola del navegador para depurar no funcionará — hoy no existe ningún logging de errores en el cliente; el mensaje mostrado al usuario es siempre el mismo texto fijo en español, independientemente de la causa real del fallo.

---

## Documentación

### 33. README bilingüe espejado línea a línea, con marcadores de plantilla de 4Geeks
- **Evidencia**: `README.md` y `README.es.md` comparten estructura idéntica sección por sección, incluyendo los marcadores `<!-- hide -->` / `<!-- endhide -->`.
- **Archivos**: `README.md:3,14,39-50`, `README.es.md:3,14,39-50`.
- **Qué podría romper un agente**: actualizar solo `README.md` (o solo `README.es.md`) sin replicar el cambio en el otro rompe la paridad bilingüe que el repo mantiene hoy en cada sección.

### 34. Cero docstrings o comentarios de bloque en el backend
- **Evidencia**: `backend/app/routes.py` (392 líneas) no contiene ningún docstring de función ni comentario explicativo; el único comentario de todo `backend/` es una línea en `__init__.py`.
- **Archivos**: `backend/app/routes.py` (completo), `backend/app/__init__.py:1`.
- **Qué podría romper un agente**: añadir docstrings extensos a cada función nueva no rompe nada funcionalmente, pero se desvía del estilo minimalista (nombres descriptivos + type hints en vez de comentarios) que sigue el 100% del código backend existente.

---

## Git / configuración

### 35. Mensajes de commit mayormente imperativos, sin prefijo de tipo obligatorio, con excepciones sueltas tipo Conventional Commits
- **Evidencia**: mezcla real en `git log --oneline`: `Add top categories endpoint for ranked financial drivers`, `Fix config issues` (sin prefijo) junto a `feat: use Vite API proxy and document frontend env setup`, `docs: clarify project objectives and setup steps`, `chore: Ensure dates are generated in the correct order` (con prefijo Conventional Commits).
- **Archivos**: historial de `git log` completo del repositorio.
- **Qué podría romper un agente**: no hay una convención estricta que imponer; forzar Conventional Commits en todo commit futuro no reflejaría el patrón mixto real del historial (no rompe nada técnicamente, pero es una suposición no respaldada por la evidencia).

### 36. Doble `.gitignore` (raíz con reglas prefijadas por carpeta + uno adicional dentro de `frontend/`)
- **Evidencia**: `.gitignore` raíz ignora explícitamente con prefijo (`frontend/node_modules/`, `backend/__pycache__/`); `frontend/.gitignore` ignora las mismas rutas de forma relativa y estándar del scaffold de Vite (`node_modules`, `dist`), solapándose con el primero.
- **Archivos**: `.gitignore:16-38`, `frontend/.gitignore`.
- **Qué podría romper un agente**: añadir una regla nueva de ignorado solo en uno de los dos archivos sin saber que el otro también existe puede generar reglas duplicadas o inconsistentes entre ambos `.gitignore`.
