# Reglas del proyecto

Estas reglas se redactan **a posteriori** del desarrollo inicial del dashboard, a partir del análisis realizado en [product-context.md](product-context.md), [architecture.md](architecture.md) y [conventions.md](conventions.md). Su objetivo es fijar como norma los patrones que ya funcionan bien en el código existente y corregir las inconsistencias detectadas, para que cualquier desarrollador o agente de IA que continúe el proyecto lo haga de forma predecible.

## 1. Principios generales

1. **Mantener la separación de capas**: lógica de negocio pura (cálculos, filtros, agregaciones) separada de la capa de transporte (endpoints FastAPI, componentes React que hacen fetch). No mezclar cálculos de negocio dentro de un handler de ruta ni dentro de un componente visual.
2. **Todo dato mock debe ser determinista**: cualquier generador de datos de prueba debe aceptar una semilla (`seed`) y no depender de `datetime.now()`/`Date.now()` para valores que se comparan en tests.
3. **Toda función pública debe tener tipado explícito**: tipos de parámetros y de retorno en Python (`def f(x: int) -> str:`) y en TypeScript (sin `any` implícito).
4. **No añadir dependencias nuevas sin justificarlas**: antes de instalar una librería, verificar si ya existe una utilidad equivalente en `lib/` (frontend) o en las funciones de `routes.py` (backend).
5. **Todo endpoint o componente nuevo debe tener al menos un test** que cubra el caso feliz y un caso borde (lista vacía, filtro sin resultados, etc.).

## 2. Reglas de backend (FastAPI / Python)

1. **Nomenclatura**: `snake_case` para funciones/variables, `PascalCase` para modelos Pydantic y alias de tipo. Los helpers internos no reutilizables fuera del módulo se prefijan con `_` (ver `_build_movement` en [backend/app/routes.py](backend/app/routes.py)).
2. **Modelado de dominio**: los valores enumerados de negocio (tipo de operación, categoría, tipo de negocio) se definen como `Literal[...]`, y los contratos de entrada/salida de la API siempre como `BaseModel` de Pydantic. No usar `dict` sueltos como respuesta de un endpoint.
3. **Uso de sintaxis moderna de tipos**: `from __future__ import annotations`, `X | None` en vez de `Optional[X]`, `list[X]`/`dict[K, V]` en vez de `List`/`Dict` de `typing`.
4. **Los endpoints deben ser una capa delgada**: un endpoint solo orquesta (obtiene datos, llama funciones de filtrado/agregación, arma el modelo de respuesta). La lógica de filtrado/agregación/cálculo vive en funciones independientes y testeables (como `filter_movements`, `summarize_movements`, `detect_outcome_alerts`).
5. **Todo endpoint nuevo bajo `/api/metrics/*` debe**:
   - Documentar sus parámetros de `Query` con tipos y valores por defecto explícitos.
   - Reutilizar `filter_movements`/`generate_mock_movements` en vez de duplicar lógica de filtrado.
   - Tener su contraparte de test en [backend/tests/test_routes.py](backend/tests/test_routes.py) antes de darse por cerrado.
6. **No romper CORS abierto en desarrollo, pero restringirlo antes de producción**: si se despliega fuera de un entorno de desarrollo/demo, `allow_origins=["*"]` en [backend/app/main.py](backend/app/main.py) debe reemplazarse por una lista explícita de orígenes.
7. **Imports**: un único bloque al inicio del archivo, stdlib primero, luego librerías de terceros, sin mezclar imports a mitad de archivo.
8. **Formato**: 4 espacios de indentación. Se recomienda ejecutar un formateador (`black`) antes de cada commit; si no está instalado en el proyecto, debe añadirse como tarea de configuración antes de escalar el equipo (ver sección 5).

## 3. Reglas de frontend (React / TypeScript)

1. **Nomenclatura de archivos**: siempre `kebab-case` (`income-outcome-chart.tsx`), independientemente del nombre del componente exportado (`PascalCase`) o de las funciones utilitarias (`camelCase`).
2. **Componentes**: usar `export function NombreComponente(...)` (named export). Reservar `export default` únicamente para el componente raíz (`App.tsx`).
3. **Props**: definir siempre una `interface NombreComponenteProps` en el mismo archivo del componente, marcando explícitamente las props opcionales con `?`.
4. **Formato de código — regla obligatoria a partir de ahora**: dado que hoy conviven comillas simples/sin punto y coma (`card.tsx`, `kpi-card.tsx`, `dashboard-header.tsx`) con comillas dobles/con punto y coma (`App.tsx`, `financial-utils.ts`, `financial-types.ts`), el proyecto debe:
   - Adoptar **comillas dobles y punto y coma** como estándar único (coherente con la mayoría de la lógica de negocio en `lib/` y el punto de entrada `App.tsx`).
   - Incorporar Prettier con esta configuración al proyecto y ejecutarlo sobre todo el código existente en un PR dedicado de "formato", separado de cambios funcionales.
   - No aceptar nuevos PRs que introduzcan el estilo contrario.
5. **Imports**: usar el alias `@/` para cualquier import fuera de la carpeta actual (`@/components/ui/card`, `@/lib/utils`); usar rutas relativas (`./`) únicamente para imports dentro del mismo directorio (como ya se hace en `lib/`).
6. **Estilos con Tailwind**: toda combinación de clases condicionales debe pasar por el helper `cn()` de [frontend/src/lib/utils.ts](frontend/src/lib/utils.ts), nunca concatenar strings de clases manualmente.
7. **Componentes de UI reutilizables** (`components/ui/`): deben anotar cada elemento con `data-slot="..."` siguiendo el patrón ya establecido en `card.tsx`, para mantener compatibilidad con el enfoque shadcn/ui.
8. **Variantes visuales**: modelar como `Record<TipoUnion, {...}>` (objeto constante), no con cadenas de `if`/`switch`, siguiendo el patrón de `variantStyles` en `kpi-card.tsx`.
9. **Estados de carga y error**: todo componente que consuma datos remotos o recibidos como prop async debe manejar explícitamente `loading` (con `Skeleton`) y el caso de datos vacíos/nulos, replicando el patrón de `income-outcome-chart.tsx` y `profit-percent-chart.tsx`.
10. **Tipos de dominio**: cualquier campo nuevo que exista en `FinancialMovement` (backend) debe reflejarse manualmente en [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts) en el mismo PR; no se debe dejar el frontend con un tipo desactualizado respecto al backend.
11. **Lint**: todo código debe pasar `npm run lint` ([frontend/eslint.config.js](frontend/eslint.config.js)) sin advertencias nuevas antes de mergear.

## 4. Reglas de testing

1. **Backend**: usar `pytest` + `TestClient` de FastAPI. Nombrar los tests como `test_<accion>_<resultado_esperado>` (ej. `test_b2b_endpoint_only_returns_b2b_records`). Cada endpoint público debe tener al menos un test de contrato (status code + forma del payload).
2. **Frontend**: usar Vitest. Los archivos de test viven junto al archivo que prueban con sufijo `.test.ts` (no carpeta `__tests__`). Cubrir casos borde conocidos del dominio (p. ej. `totalIncome === 0` en `computeKPIs`).
3. **Ningún PR se aprueba si reduce la cobertura de tests existente** (`pytest-cov` en backend, `@vitest/coverage-v8` en frontend).

## 5. Reglas de arquitectura y alcance

1. **No conectar el frontend directamente a un backend externo sin pasar por el proxy de Vite en desarrollo** (`/api` → `http://backend:8000` en [frontend/vite.config.ts](frontend/vite.config.ts)); usar `VITE_API_BASE_URL` solo para entornos donde el proxy no aplique (producción/staging).
2. **Antes de construir una nueva pantalla o gráfico**, revisar si el dato ya existe en un endpoint del backend no conectado aún (`/api/metrics/summary`, `/categories/top`, `/comparison`, `/alerts`, `/b2b`, `/b2c`). Priorizar consumir esos endpoints en el frontend en vez de recalcular la misma agregación en cliente.
3. **No introducir persistencia (base de datos) sin actualizar `docker-compose.yml`, `AGENTS.md` y `product-context.md`**, dado que el diseño actual asume datos generados en memoria y sin estado.
4. **Cualquier regla, skill o nota de contexto para agentes de IA debe documentarse en `.agents/rules/<nombre-regla>.md` y `.agents/skills/<nombre-skill>/SKILL.md`**, según la estructura esperada descrita en [README.md](README.md), y mantenerse sincronizada con este archivo y con [product-context.md](product-context.md)/[architecture.md](architecture.md)/[conventions.md](conventions.md) cuando cambien las convenciones reales del código.

## 6. Checklist antes de abrir un Pull Request

- [ ] El código sigue la nomenclatura y el formato definidos en las secciones 2 y 3.
- [ ] Se añadieron o actualizaron tests (backend y/o frontend) para el cambio.
- [ ] `npm run lint` y `pytest` pasan sin errores.
- [ ] Si se tocó `FinancialMovement` u otro contrato de datos, se actualizó en ambos lados (Python y TypeScript).
- [ ] Si se añadió un endpoint o componente, se documentó su propósito en `product-context.md` o `architecture.md` si cambia el alcance del producto o la arquitectura.
