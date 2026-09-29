# Buenas y Malas Prácticas — Agrupadas por Categoría

> Evaluación del proyecto financial-dashboard, organizada por áreas de conocimiento para facilitar la priorización y la toma de decisiones.

---

## 📐 1. Arquitectura y Diseño

### ✅ Buena práctica — Separación de lógica de negocio de los endpoints HTTP

| Atributo | Detalle |
|---|---|
| **¿Dónde?** | `routes.py` — funciones puras: `filter_movements`, `summarize_movements`, `build_top_categories`, `detect_outcome_alerts` |
| **¿Por qué es buena?** | Principio de *Single Responsibility*. Estas funciones no saben que existen HTTP, pueden probarse de forma aislada y reutilizarse en otros contextos (CLI, scripts). |

### ❌ Riesgo — Datos mockeados como única fuente (imposible conectar datos reales)

| Atributo | Detalle |
|---|---|
| **¿Dónde?** | `routes.py`: todas las rutas llaman a `generate_mock_movements(seed=42)`, no hay conexión a BD ni configuración de datasource |
| **Explicación** | Es comprensible para un prototipo, pero actualmente no hay capa de abstracción (repositorio/DAO) que permita intercambiar mock por BD real. Cada request regenera los mismos 360 movimientos sintéticos. |
| **Impacto** | 🟠 **Riesgo arquitectónico** — inutilizable en producción sin reescribir |

---

## 🔒 2. Seguridad

### ❌ Riesgo — CORS completamente abierto (`allow_origins=["*"]`)

| Atributo | Detalle |
|---|---|
| **¿Dónde?** | `backend/app/main.py:7` |
| **Explicación** | Permitir cualquier origen en producción expone la API a *Cross-Site Request Forgery* (CSRF) y permite que cualquier sitio web no autorizado consuma los datos. |
| **Impacto** | 🔴 **Riesgo de seguridad ALTO** |

### ❌ Riesgo — `debugpy` activo y `--reload` en el CMD de producción

| Atributo | Detalle |
|---|---|
| **¿Dónde?** | `backend/Dockerfile:8` — CMD ejecuta `debugpy --listen 0.0.0.0:5678` con `--reload` |
| **Explicación** | Expone un debugger remoto en un puerto abierto (5678) y activa el hot-reload en el contenedor de producción. Cualquiera con acceso a ese puerto puede ejecutar código arbitrario en el proceso. Además `--reload` desperdicia recursos. |
| **Impacto** | 🔴 **Riesgo de seguridad CRÍTICO** |

---

## 🧪 3. Testing

### ✅ Buena práctica — Pruebas unitarias en ambos lados (backend + frontend)

| Atributo | Detalle |
|---|---|
| **¿Dónde?** | `test_routes.py` (12 tests con pytest/httpx) y `financial-utils.test.ts` (tests con vitest) |
| **¿Por qué es buena?** | Cubren *edge cases* relevantes (fechas límite, profit 0 cuando no hay ingresos, filtros combinados, orden cronológico). Garantizan que la lógica de negocio y los endpoints funcionan sin necesidad de entorno real. |

---

## 🏷️ 4. Tipado y Type Safety

### ✅ Buena práctica — Tipos literales estrictos con `Literal`

| Atributo | Detalle |
|---|---|
| **¿Dónde?** | `routes.py` — `OperationType`, `Category`, `BusinessType`, `GroupBy` |
| **¿Por qué es buena?** | Usar `Literal["income", "outcome"]` en los endpoints y modelos Pydantic proporciona *type safety* total: el compilador/linter detecta errores de tipeo al instante, autocompletado en IDEs, y serialización/validación automática en requests. |

---

## 🎨 5. UX / Interfaz de Usuario

### ✅ Buena práctica — Estados visuales completos (loading, empty, error, data)

| Atributo | Detalle |
|---|---|
| **¿Dónde?** | `income-outcome-chart.tsx` y `profit-percent-chart.tsx`: manejan loading, `!hasData` (vacío), y `App.tsx` maneja error con mensaje al usuario |
| **¿Por qué es buena?** | No asumen que los datos siempre estarán disponibles. Muestran *skeletons* mientras carga, mensaje *"No data available to display"* cuando no hay datos, y un error informativo si falla la API. |

### ✅ Buena práctica — Sistema de theming completo con CSS variables y modo oscuro

| Atributo | Detalle |
|---|---|
| **¿Dónde?** | `index.css` — variables `oklch()` bien definidas para ambos modos (`:root` y `.dark`) |
| **¿Por qué es buena?** | El uso de `oklch()` da colores perceptualmente uniformes. Tener todos los tokens en CSS variables (`--chart-income`, `--income-badge`, etc.) permite escalar el diseño sin tocar los componentes de React. |

---

## 📊 6. Observabilidad

### ❌ Riesgo — Sin logging, manejo de errores ni trazabilidad en backend

| Atributo | Detalle |
|---|---|
| **¿Dónde?** | `routes.py`: ninguna ruta tiene try/except, logging o middlewares de registro |
| **Explicación** | Si el servidor falla, no hay logs que permitan depurar. Las excepciones no capturadas devuelven un error 500 genérico sin información útil. No se registra qué endpoints se consultan ni con qué parámetros. |
| **Impacto** | 🟠 **Incapacidad de depurar errores en producción** |

---

## ⚙️ 7. DevOps / Despliegue

### ❌ Riesgo — Docker Compose monta código fuente completo como volumen

| Atributo | Detalle |
|---|---|
| **¿Dónde?** | `docker-compose.yml:4-14` — volumes: `- ./frontend:/app` y `- ./backend:/app` |
| **Explicación** | Sobrescribe el código instalado en la imagen con el código del host. Esto rompe el aislamiento de la imagen Docker: si hay diferencias entre la imagen y el host, el contenedor ejecuta el código del host. Útil para desarrollo, peligroso si se usara este compose en producción. |
| **Impacto** | 🟡 **Riesgo de consistencia y seguridad** si se despliega con este compose |

---

## 📋 Resumen de la evaluación

### Fortalezas principales (por categoría)

| Categoría | Fortaleza |
|---|---|
| 📐 Arquitectura | Buena separación de lógica de negocio y endpoints HTTP |
| 🧪 Testing | Pruebas unitarias en frontend y backend cubriendo *edge cases* |
| 🏷️ Tipado | Types estrictos con `Literal` que previenen errores en tiempo de compilación |
| 🎨 UX | Manejo de estados visuales (loading, empty, error, data) y theming completo con modo oscuro |

### Debilidades principales (por categoría)

| Categoría | Debilidad | Prioridad |
|---|---|---|
| 🔒 Seguridad | **CORS abierto** + **debugpy en producción** | 🔴 Crítica |
| 📐 Arquitectura | Datos mockeados sin capa de abstracción para conectar BD real | 🟠 Alta |
| 📊 Observabilidad | Ausencia total de logging, errores sin trazabilidad | 🟠 Alta |
| ⚙️ DevOps | Volúmenes de Docker Compose que rompen el aislamiento de la imagen | 🟡 Media |

> **Conclusión:** El proyecto está claramente orientado a desarrollo/prototipo. El mayor riesgo inmediato es la combinación de `debugpy` + CORS abierto, que expone el backend a ataques. Para producción, las prioridades son: cerrar la seguridad, añadir logging, y crear una capa de abstracción de datos que permita reemplazar los mocks por una base de datos real.

---

## 📜 Reglas del Proyecto

> Conjunto de reglas accionables derivadas de la evaluación anterior. Cada regla está vinculada a una categoría, especifica **qué hacer** (o evitar), **dónde aplica** y **cómo verificarla**. Sirven como guía para el desarrollo diario y las revisiones de código.

---

### 📐 Reglas de Arquitectura y Diseño

| # | Regla | Motivación | Verificación |
|---|---|---|---|
| **ARQ-01** | Toda función que contenga lógica de negocio debe ser una **función pura** (sin efectos secundarios, sin depender del request/response HTTP). | Preserva la separación de responsabilidades y permite testear la lógica aisladamente. | En code review: las rutas HTTP solo deben llamar funciones y devolver su resultado. |
| **ARQ-02** | Los datos mockeados deben aislarse tras una **capa de abstracción** (interfaz/clase repositorio). El código de negocio nunca debe importar `generate_mock_movements` directamente. | Permite intercambiar mocks por BD real sin reescribir las rutas. | Buscar imports de `generate_mock_movements` en `routes.py`. Deben desaparecer. |
| **ARQ-03** | Prohibido mezclar lógica de negocio con lógica de presentación. Los componentes React no deben contener transformaciones de datos complejas. | Mantiene el frontend desacoplado y facilita el testing. | En code review: si un componente tiene más de 5 líneas de lógica de transformación, debe moverse a `lib/`. |

### 🔒 Reglas de Seguridad

| # | Regla | Motivación | Verificación |
|---|---|---|---|
| **SEC-01** | `allow_origins` debe configurarse con una **lista explícita de orígenes permitidos**. Prohibido usar `["*"]` en configuración que se despliegue a producción. | Previene CSRF y consumo no autorizado de la API. | Buscar `allow_origins=["*"]` en `main.py`. Debe ser una variable de entorno o lista concreta. |
| **SEC-02** | El `CMD` del `Dockerfile` de producción **nunca debe incluir `debugpy` ni `--reload`**. Estas herramientas solo deben estar presentes en un perfil de desarrollo (devcontainer o docker-compose.dev.yml). | Elimina la exposición de un debugger remoto y evita el desperdicio de recursos. | Revisar `backend/Dockerfile`: el CMD debe ser `uvicorn app.main:app --host 0.0.0.0 --port 8000` sin debugpy. |
| **SEC-03** | No exponer puertos de depuración (5678) en el `docker-compose.yml` principal. Si se necesita depuración, usar un archivo `docker-compose.override.yml` local. | Evita que el debugger quede accidentalmente abierto al desplegar. | Verificar que `ports:` no incluya `5678` en el compose principal. |

### 🧪 Reglas de Testing

| # | Regla | Motivación | Verificación |
|---|---|---|---|
| **TST-01** | Todo endpoint nuevo debe tener al menos **un test que verifique el caso feliz** y **un test que verifique un edge case** (datos vacíos, fechas inválidas, filtros extremos). | Mantiene la cobertura de las rutas y previene regresiones. | `pytest --cov=app tests/` — la cobertura de `routes.py` no debe bajar del 80%. |
| **TST-02** | Toda función pura en `lib/` del frontend debe tener su correspondiente test unitario con **Vitest**. | Asegura que la lógica del lado del cliente funciona correctamente. | `npx vitest run` — no debe fallar ningún test y la cobertura debe mantenerse o aumentar. |
| **TST-03** | Prohibido eliminar o modificar tests existentes sin revisión explícita. Los tests son la red de seguridad del proyecto. | Evita que se pierda cobertura accidentalmente. | En code review: señalar cualquier eliminación o modificación de tests. |

### 🏷️ Reglas de Tipado y Type Safety

| # | Regla | Motivación | Verificación |
|---|---|---|---|
| **TYP-01** | Todo endpoint debe usar **modelos Pydantic** con tipos `Literal` para parámetros de tipo enum (OperationType, Category, GroupBy, etc.). Prohibido usar `str` genérico. | Proporciona validación automática, autocompletado y detección de errores en compilación. | Buscar definiciones de rutas que acepten `str` sin restricción de valores. |
| **TYP-02** | En el frontend, los tipos compartidos deben definirse en `financial-types.ts` y reutilizarse. Prohibido definir tipos duplicados en componentes. | Evita la deriva de tipos entre backend y frontend y centraliza los contratos de datos. | En code review: señalar tipos inline duplicados. |
| **TYP-03** | Toda respuesta de API debe tener un modelo Pydantic de respuesta (`response_model`). Prohibido devolver diccionarios sin esquema. | Documenta automáticamente la API (OpenAPI) y valida la estructura de salida. | Verificar que cada ruta tenga `response_model` o que use `Response` de manera explícita. |

### 🎨 Reglas de UX / Interfaz de Usuario

| # | Regla | Motivación | Verificación |
|---|---|---|---|
| **UX-01** | Todo componente que consuma datos asíncronos debe manejar **al menos 3 de 4 estados**: `loading`, `empty`, `error`, `data`. | Evita pantallas en blanco o errores silenciosos para el usuario. | En code review: comprobar que el componente tenga `if (loading)`, `if (!hasData)` y `if (error)`. |
| **UX-02** | Los colores y tokens de diseño deben definirse como **CSS variables** en `index.css`. No se permiten valores de color hardcodeados en componentes. | Mantiene la consistencia visual y facilita el modo oscuro. | Buscar valores de color literales (`#...`, `rgb(...)`) en archivos `.tsx`. |
| **UX-03** | Todo nuevo componente visual debe heredar los tokens existentes. Si se necesita un nuevo token, debe agregarse en `index.css` para ambos modos (`:root` y `.dark`). | Escala el sistema de diseño sin duplicación ni inconsistencias. | En code review: verificar que no se introduzcan variables no declaradas en `index.css`. |

### 📊 Reglas de Observabilidad

| # | Regla | Motivación | Verificación |
|---|---|---|---|
| **OBS-01** | Toda ruta del backend debe tener **logging estructurado** que registre: método, ruta, parámetros, status code y tiempo de respuesta. | Permite depurar errores en producción y trazar el uso de la API. | Verificar que `routes.py` importe `logging` y registre en cada endpoint. |
| **OBS-02** | Las excepciones no capturadas deben ser manejadas por un **middleware global de errores** que devuelva un JSON estructurado y registre el error completo en logs. | Evita errores 500 genéricos sin información y facilita la depuración. | Buscar un `@app.exception_handler` o middleware similar en `main.py`. |
| **OBS-03** | Prohibido usar `print()` para depuración. Usar el módulo `logging` de Python con niveles adecuados (`INFO`, `WARNING`, `ERROR`). | `print()` no ofrece control de niveles, ni formato estructurado, ni es fácil de desactivar en producción. | Buscar `print(` en archivos Python del backend. |

### ⚙️ Reglas de DevOps / Despliegue

| # | Regla | Motivación | Verificación |
|---|---|---|---|
| **DEV-01** | El `docker-compose.yml` principal debe reflejar la configuración de producción. Los volúmenes que montan código fuente (`./backend:/app`, `./frontend:/app`) deben moverse a `docker-compose.override.yml`. | Mantiene el compose principal desplegable tal cual, y separa las herramientas de desarrollo. | Verificar que `docker-compose.yml` no tenga volúmenes que monten código fuente. |
| **DEV-02** | Los `Dockerfile` deben tener un **multi-stage build**: una etapa de `development` (con debugpy, reload, herramientas) y una etapa `production` (optimizada, sin herramientas de dev). | Produce imágenes de producción ligeras y seguras sin cambiar de Dockerfile. | Verificar que el Dockerfile tenga `FROM ... AS development` y `FROM ... AS production`. |
| **DEV-03** | Las variables de entorno sensibles (CORS origins, secrets de DB, API keys) deben pasarse al contenedor vía archivo `.env` o variables de entorno del orquestador. Prohibido hardcodearlas. | Evita exponer credenciales en el código fuente y facilita la configuración por entorno. | Buscar valores sensibles hardcodeados en `main.py`, `docker-compose.yml` o `Dockerfile`. |

---

### 📋 Tabla de trazabilidad: Riesgo → Regla

Cada regla mitiga uno o más de los riesgos identificados en la evaluación:

| Riesgo original | Regla(s) que lo mitigan |
|---|---|
| CORS abierto `["*"]` | SEC-01, DEV-03 |
| `debugpy` + `--reload` en producción | SEC-02, SEC-03, DEV-02 |
| Datos mockeados sin capa de abstracción | ARQ-02 |
| Sin logging ni trazabilidad | OBS-01, OBS-02, OBS-03 |
| Volúmenes que rompen aislamiento Docker | DEV-01, DEV-02 |
| _Buena práctica preservada_ | _Regla que la protege_ |
| Separación lógica ↔ HTTP | ARQ-01 |
| Pruebas unitarias en frontend y backend | TST-01, TST-02, TST-03 |
| Tipos literales estrictos con `Literal` | TYP-01, TYP-02, TYP-03 |
| Estados visuales completos | UX-01 |
| Theming con CSS variables y modo oscuro | UX-02, UX-03 |