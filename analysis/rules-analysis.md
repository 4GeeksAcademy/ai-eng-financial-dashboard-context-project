# Análisis de Convenciones, Riesgos y Reglas Propuestas

> Proyecto: **Financial Metrics Dashboard**
> Fecha: 2026-11-13

---

## 🔷 ARQUITECTURA

### Regla ARC-01: Mantener la separación estricta frontend/backend
- **Convención existente**: El proyecto divide claramente responsabilidades en `frontend/` y `backend/`, cada uno con su propio `Dockerfile`, gestor de dependencias (`requirements.txt` / `package.json`) y ciclo de vida.
- **Riesgo**: Colocar lógica de negocio del lado del frontend que ya existe en el backend (p.ej., duplicar `computeKPIs` en Python y TypeScript sin sincronización).
- **Hecho**: `backend/app/routes.py` genera y sirve datos financieros; `frontend/src/lib/financial-utils.ts` *vuelve a calcular* KPIs del lado del cliente. Cualquier discrepancia entre ambas lógicas rompe el dashboard.
- **Regla**: Cualquier nueva métrica o transformación de datos debe implementarse **primero en el backend** y reflejarse **después** en los utils del frontend. No agregues lógica de negocio nueva solo en el frontend sin su contraparte backend.

### Regla ARC-02: No romper la seed determinista del backend
- **Convención existente**: `generate_mock_movements(seed=42)` produce 360 movimientos reproducibles, usados por todos los endpoints.
- **Riesgo**: Cambiar la seed o la lógica de generación altera los resultados de todos los endpoints y tests, rompiendo la consistencia.
- **Hecho**: `/api/metrics`, `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b` y `/api/metrics/b2c` llaman todos a `generate_mock_movements(seed=42)` por separado — son 8 llamadas idénticas por request.
- **Regla**: Mantén `seed=42` fijo. Si modificas `_build_movement()` o `generate_mock_movements()`, actualiza también todos los tests que dependan de los valores generados. No elimines el parámetro `seed`.

### Regla ARC-03: No eliminar el proxy de Vite ni el modo reload
- **Convención existente**: `frontend/vite.config.ts` define un proxy de `/api` → `http://backend:8000` que evita CORS en desarrollo. El backend usa `--reload` para hot-reload.
- **Riesgo**: Eliminar el proxy obliga a configurar CORS manualmente o a usar `VITE_API_BASE_URL`, añadiendo fricción a nuevos contribuidores.
- **Hecho**: `vite.config.ts` línea 11-15 define el proxy. `backend/Dockerfile` ejecuta uvicorn con `--reload`. Y `frontend/.env.example` ya ofrece `VITE_API_BASE_URL` como *alternativa* documentada.
- **Regla**: No elimines el bloque `proxy` de `vite.config.ts`. Si necesitas apuntar a otro backend, usa `VITE_API_BASE_URL`. El `--reload` del backend debe mantenerse en desarrollo.

---

## 🔷 NAMING (Nombrado)

### Regla NAM-01: Consistencia inglés/español en mensajes de UI
- **Convención existente**: El proyecto tiene README en inglés y español, y código fuente en inglés.
- **Riesgo**: Mezclar idiomas en strings de UI dificulta el mantenimiento y la internacionalización futura.
- **Hecho**: `frontend/src/App.tsx` línea 31 contiene un mensaje de error en español: `"No se pudo cargar la informacion financiera. Revisa la API de backend."` mientras que el resto del UI (títulos de gráficos, tooltips, README principal) está en inglés.
- **Regla**: Todos los strings visibles en la UI deben estar en **inglés** (idioma base del código). Si se necesita español, debe hacerse mediante un sistema de i18n, no mezclando idiomas directamente en los componentes.

### Regla NAM-02: Seguir la convención `snake_case` del backend y `camelCase` del frontend
- **Convención existente**: Backend usa Pydantic con `snake_case` (`create_date`, `operation_type`, `business_type`). Frontend declara los mismos campos en `camelCase` en las interfaces (esperaría `createDate`), pero los tipos del frontend usan `snake_case` para coincidir con la API.
- **Riesgo**: Forzar `camelCase` en el frontend rompería el parseo directo de la respuesta JSON de la API sin transformación intermedia.
- **Hecho**: `frontend/src/lib/financial-types.ts` define campos como `create_date: string`, `operation_type: OperationType`, `business_type: BusinessType` — usando `snake_case` para alinearse con el backend.
- **Regla**: Mantén `snake_case` en los tipos que reflejan la API (`financial-types.ts`). Solo usa `camelCase` en props y estado interno de componentes que no se serialicen directamente a la API.

### Regla NAM-03: Nombrar los archivos de test con sufijo `.test.ts` o `.test.tsx`
- **Convención existente**: `frontend/src/lib/financial-utils.test.ts` y `backend/tests/test_routes.py` — ambos archivos de test junto al código que prueban o en carpeta `tests/`.
- **Riesgo**: Usar nombres como `something.spec.ts` o mezclar convenciones rompe la consistencia que Vitest y pytest esperan por defecto.
- **Hecho**: `frontend/package.json` tiene `"test": "vitest run"` (descubrimiento automático). `backend/tests/conftest.py` ya configura el `sys.path` para importar `app.main`.
- **Regla**: Los tests del frontend deben llamarse `*.test.ts` y ubicarse junto al módulo que prueban. Los tests del backend van en `backend/tests/` con prefijo `test_`. No crear `__init__.py` dentro de `tests/` (no es un paquete).

---

## 🔷 TESTING

### Regla TST-01: Todo endpoint público debe tener al menos un test
- **Convención existente**: `backend/tests/test_routes.py` tiene 12 tests que cubren `health`, `metrics`, `facets`, `summary`, `top categories`, `comparison`, `alerts`, `b2b` y `b2c`.
- **Riesgo**: Añadir un nuevo endpoint sin test permite que regresiones pasen desapercibidas.
- **Hecho**: El archivo `backend/tests/test_routes.py` usa `TestClient` de FastAPI (línea 4: `from fastapi.testclient import TestClient`). Cada endpoint documentado en `routes.py` tiene su test correspondiente.
- **Regla**: Cada nuevo endpoint decorado con `@router.get(...)` debe tener un test en `test_routes.py` que verifique status code 200 y al menos una aserción sobre la forma de la respuesta.

### Regla TST-02: Los tests del frontend deben cubrir casos borde
- **Convención existente**: `frontend/src/lib/financial-utils.test.ts` prueba `computeKPIs`, `computeMonthlyData`, `formatCurrency` y `formatPercent` con datos normales y un caso borde (`no income → profitPercent = 0`).
- **Riesgo**: No probar el componente `App.tsx` ni los gráficos deja vulnerabilidades en la capa de presentación.
- **Hecho**: `computeMonthlyData` en `financial-utils.ts` ordena cronológicamente y cruza años; el test verifica ese comportamiento con datos de Dic 2025 y Ene 2026.
- **Regla**: Crea tests para al menos los componentes `KPICard`, `IncomeOutcomeChart` y `ProfitPercentChart` usando Vitest + Testing Library para cubrir los estados `loading` y `hasData=false` (ya existen los skeletons y el mensaje "No data available to display").

---

## 🔷 DOCUMENTACIÓN

### Regla DOC-01: README bilingüe debe mantenerse sincronizado
- **Convención existente**: `README.md` (inglés) y `README.es.md` (español) existen con contenido paralelo.
- **Riesgo**: Actualizar solo un idioma confunde a contribuidores que hablen el otro idioma.
- **Hecho**: Ambos archivos en raíz del proyecto, misma estructura de secciones. `README.md` incluye un enlace al español.
- **Regla**: Cualquier cambio en las secciones de "How to run", "Expected agents directory structure" o "Recommended steps" debe aplicarse a **ambos** README en la misma pull request.

### Regla DOC-02: El `AGENTS.md` es la puerta de entrada para agentes de IA
- **Convención existente**: `AGENTS.md` en la raíz indica a los agentes que revisen `.agents/rules`, `.agents/skills` y `memory-bank/`.
- **Riesgo**: Ignorar esta guía hace que los agentes no encuentren las reglas del proyecto.
- **Hecho**: `AGENTS.md` referencia tres directorios concretos: `.agents/rules`, `.agents/skills` y `memory-bank/`.
- **Regla**: Cualquier regla nueva para agentes debe colocarse en `.agents/rules/` como un archivo Markdown. No modifiques `AGENTS.md` para incluir reglas inline; úsalo solo como índice.

### Regla DOC-03: El `index.html` debe tener un título descriptivo
- **Convención existente**: `frontend/index.html` es el entry point HTML del frontend.
- **Riesgo**: Dejar el placeholder `<title>frontend</title>` perjudica el SEO y la identificación de pestañas en el navegador.
- **Hecho**: `frontend/index.html` línea 6: `<title>frontend</title>` — es el valor por defecto de Vite.
- **Regla**: Cambia `<title>frontend</title>` por `<title>Financial Metrics Dashboard</title>` o similar descriptivo del proyecto.

---

## 🔷 DX (Developer Experience)

### Regla DX-01: No eliminar los puertos de depuración del docker-compose
- **Convención existente**: `docker-compose.yml` expone el puerto `5678` para debugpy en el backend.
- **Riesgo**: Eliminar ese puerto rompe la capacidad de depuración remota sin previo aviso.
- **Hecho**: `backend/Dockerfile` línea 9: `EXPOSE 8000 5678` y `docker-compose.yml` línea 15: `"5678:5678"`.
- **Regla**: Mantén el mapping `5678:5678` en `docker-compose.yml`. Si cambias el puerto de debugpy, actualiza ambos archivos.

### Regla DX-02: Usar el path alias `@/` del frontend para imports
- **Convención existente**: `vite.config.ts` y `tsconfig.app.json` configuran el alias `@/` → `./src/*`.
- **Riesgo**: Usar imports relativos largos (`../../../components/...`) en lugar de `@/components/...` reduce legibilidad.
- **Hecho**: `tsconfig.app.json` línea 8-10: `"paths": { "@/*": ["./src/*"] }`. Componentes como `kpi-card.tsx` ya importan con `@/components/ui/card`.
- **Regla**: Todos los imports de archivos dentro de `frontend/src/` deben usar el alias `@/`. Prohibidos los imports relativos que suban más de un nivel (p.ej., `../../lib/`).

### Regla DX-03: No hacer commit de `package-lock.json` obsoleto ni node_modules
- **Convención existente**: `.gitignore` excluye `frontend/node_modules/` y `*.local`.
- **Riesgo**: Subir `package-lock.json` generado con otra versión de Node/npm causa discrepancias en CI.
- **Hecho**: `frontend/package-lock.json` existe en el repo (156KB). `frontend/Dockerfile` usa `node:24-alpine`.
- **Regla**: Si cambias dependencias, regenera `package-lock.json` localmente y haz commit del cambio. No edites `package-lock.json` manualmente.

---

## 🔷 DEPENDENCIAS Y CONFIGURACIÓN

### Regla DEP-01: Mantener las versiones de los Dockerfiles sincronizadas con docker-compose
- **Convención existente**: `docker-compose.yml` orquesta `frontend` y `backend` con sus Dockerfiles.
- **Riesgo**: `python:3.13-slim` y `node:24-alpine` son etiquetas flotantes. Una actualización de seguridad puede cambiar el comportamiento de la imagen sin cambiar el código.
- **Hecho**: `backend/Dockerfile` usa `python:3.13-slim`. `frontend/Dockerfile` usa `node:24-alpine`.
- **Regla**: Considera usar SHA256 digests en vez de etiquetas flotantes si necesitas builds reproducibles. Como mínimo, documenta en los Dockerfiles qué SHA se usó en la última build verificada.

### Regla DEP-02: No instalar dependencias que dupliquen funcionalidad existente
- **Convención existente**: El frontend usa `lucide-react` para iconos, `recharts` para gráficos y `tailwindcss` v4 para estilos. shadcn/ui maneja `card.tsx` y `skeleton.tsx` como componentes locales.
- **Riesgo**: Instalar una librería de gráficos alternativa (p.ej., Chart.js) o una de iconos duplica el bundle y fragmenta la experiencia visual.
- **Hecho**: `frontend/package.json` incluye `lucide-react`, `recharts`, `tailwind-merge` y `clsx` — stack completo de shadcn/ui.
- **Regla**: Antes de agregar una nueva dependencia npm, verifica que la funcionalidad no esté ya cubierta por Recharts (gráficos), Lucide (iconos) o Tailwind (estilos). Prefiere siempre componentes shadcn/ui sobre librerías de UI genéricas.

---

## 🔷 ESTILOS Y TEMA

### Regla STY-01: Todas las variables CSS de tema deben definirse en `index.css`
- **Convención existente**: `frontend/src/index.css` centraliza todas las variables de color (`--chart-income`, `--income-badge`, etc.) para los modos claro y oscuro.
- **Riesgo**: Definir variables de color en componentes individuales o en múltiples archivos CSS rompe la consistencia del theming y hace imposible cambiar el tema globalmente.
- **Hecho**: `index.css` define `:root` y `.dark` con oklch para 30+ variables. Componentes como `kpi-card.tsx` referencian `var(--income-badge)`.
- **Regla**: Cualquier nuevo color o variable de tema debe agregarse **exclusivamente** en `frontend/src/index.css`, en ambos bloques `:root` y `.dark`. No uses valores de color hardcodeados en componentes.

### Regla STY-02: Usar siempre la función `cn()` para combinar clases
- **Convención existente**: `frontend/src/lib/utils.ts` exporta `cn()` que combina `clsx` + `tailwind-merge`.
- **Riesgo**: Concatenar clases manualmente con template strings puede generar conflictos de Tailwind que `twMerge` resolvería automáticamente.
- **Hecho**: Todos los componentes de UI (`card.tsx`, `skeleton.tsx`, `kpi-card.tsx`) usan `import { cn } from '@/lib/utils'` para combinar `className`.
- **Regla**: En cualquier componente, usa siempre `cn()` para combinar clases Tailwind. No uses `${}` para concatenar strings de clases.

---

## 🔷 BACKEND — PYTHON

### Regla PY-01: No eliminar el `from __future__ import annotations`
- **Convención existente**: `backend/app/routes.py` línea 1: `from __future__ import annotations`.
- **Riesgo**: Sin esta importación, las anotaciones de tipo se evalúan en tiempo de ejecución, lo que puede causar `NameError` con tipos forward-reference y `Literal` complejos.
- **Hecho**: `routes.py` define tipos como `OperationType = Literal["income", "outcome"]` y los usa en firmas de funciones y Pydantic models.
- **Regla**: Mantén `from __future__ import annotations` como la primera línea de cualquier archivo Python nuevo en `backend/`.

### Regla PY-02: No introducir dependencias nuevas sin aprobación
- **Convención existente**: `backend/requirements.txt` incluye solo `fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov`, `httpx` — mínimo indispensable.
- **Riesgo**: Agregar librerías como SQLAlchemy, Alembic, Pandas o NumPy sin necesidad real infla el tiempo de build del contenedor.
- **Hecho**: El proyecto no tiene base de datos; `requirements.txt` tiene 6 líneas.
- **Regla**: Cualquier nueva dependencia Python debe justificarse en la PR. El stack actual (FastAPI + Uvicorn + httpx) cubre todas las necesidades conocidas.

---

## 🔷 FRONTEND — REACT/TYPESCRIPT

### Regla REACT-01: Los componentes de UI van en `components/ui/` y los de negocio en `components/dashboard/`
- **Convención existente**: `components/ui/` contiene `card.tsx` y `skeleton.tsx` (genéricos, reutilizables). `components/dashboard/` contiene `kpi-card.tsx`, `income-outcome-chart.tsx`, etc. (específicos del dominio).
- **Riesgo**: Mezclar ambos tipos dificulta la reutilización y la adopción de shadcn/ui.
- **Hecho**: `components.json` configura `"ui": "@/components/ui"`. `kpi-card.tsx` importa desde `@/components/ui/card`.
- **Regla**: Los componentes puramente visuales y reutilizables van en `components/ui/`. Los componentes que importan tipos de `financial-types.ts` o llaman a utils de negocio van en `components/dashboard/`.

### Regla REACT-02: Los efectos secundarios de datos pertenecen a `App.tsx`, no a componentes hijos
- **Convención existente**: `App.tsx` contiene el `useEffect` que llama a la API, gestiona el estado (`metrics`, `monthlyData`, `loading`, `error`) y pasa props a hijos.
- **Riesgo**: Dispersar `useEffect` y `fetch` en componentes hijos duplica llamadas a la API y hace el flujo de datos impredecible.
- **Hecho**: `App.tsx` es el único componente con lógica de fetch. `KPIRow`, `IncomeOutcomeChart`, `ProfitPercentChart` reciben `data` y `loading` como props.
- **Regla**: Ningún componente en `components/dashboard/` debe contener un `useEffect` que llame a la API. Toda la obtención de datos debe centralizarse en `App.tsx`.

---

## 🔷 SEGURIDAD Y OPERACIONES

### Regla SEC-01: Mantener CORS abierto solo en desarrollo
- **Convención existente**: `backend/app/main.py` configura CORS con `allow_origins=["*"]`.
- **Riesgo**: En producción, `allow_origins=["*"]` permite que cualquier sitio web haga peticiones a la API.
- **Hecho**: `main.py` línea 7-12: `allow_origins=["*"]`.
- **Regla**: En entornos productivos, reemplaza `["*"]` por la URL del frontend. Mantén `["*"]` solo en desarrollo. Considera usar una variable de entorno para el origen permitido.

---

## 📋 Resumen de reglas propuestas

| ID | Categoría | Archivo/Comportamiento clave | Riesgo principal |
|----|-----------|------------------------------|------------------|
| ARC-01 | Arquitectura | `routes.py` ↔ `financial-utils.ts` | Duplicación de lógica desincronizada |
| ARC-02 | Arquitectura | `generate_mock_movements(seed=42)` | Tests inconsistentes |
| ARC-03 | Arquitectura | `vite.config.ts` proxy + `--reload` | Fricción en desarrollo |
| NAM-01 | Naming | `App.tsx` mensaje en español | Mezcla de idiomas en UI |
| NAM-02 | Naming | `financial-types.ts` snake_case | Inconsistencia si alguien fuerza camelCase |
| NAM-03 | Naming | `financial-utils.test.ts` / `test_routes.py` | Convención de nombres de test rota |
| TST-01 | Testing | `test_routes.py` | Endpoints sin cobertura |
| TST-02 | Testing | `financial-utils.test.ts` | Componentes gráficos sin test |
| DOC-01 | Documentación | `README.md` / `README.es.md` | README desincronizados |
| DOC-02 | Documentación | `AGENTS.md` | Agentes sin reglas visibles |
| DOC-03 | Documentación | `index.html` | Título placeholder en pestaña |
| DX-01 | DX | `docker-compose.yml` puerto 5678 | Pérdida de debug remoto |
| DX-02 | DX | `tsconfig.app.json` alias `@/` | Imports relativos largos |
| DX-03 | DX | `package-lock.json` | Lockfile inconsistente |
| DEP-01 | Dependencias | `Dockerfiles` etiquetas flotantes | Builds no reproducibles |
| DEP-02 | Dependencias | `package.json` | Librerías duplicadas |
| STY-01 | Estilos | `index.css` variables CSS | Theming inconsistente |
| STY-02 | Estilos | `utils.ts` función `cn()` | Conflictos de clases Tailwind |
| PY-01 | Backend | `routes.py` `from __future__ import annotations` | NameError en tipos |
| PY-02 | Backend | `requirements.txt` | Dependencias innecesarias |
| REACT-01 | Frontend | `components/ui/` vs `components/dashboard/` | Componentes mal ubicados |
| REACT-02 | Frontend | `App.tsx` fetch centralizado | Fetch duplicado en hijos |
| SEC-01 | Seguridad | `main.py` CORS `["*"]` | Riesgo en producción |
