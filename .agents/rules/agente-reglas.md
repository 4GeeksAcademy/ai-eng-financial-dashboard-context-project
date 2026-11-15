# Reglas del Agente — Financial Metrics Dashboard

> Reglas extraídas del código fuente del proyecto.
> Estas reglas son vinculantes para cualquier agente de IA que trabaje en este repositorio.
> Fecha: 2026-11-12

---

## 📐 ARQUITECTURA

### A1. Separación de capas en el backend
- Los **modelos Pydantic** (`BaseModel`) deben definirse al inicio de un archivo de módulo, separados de la lógica de negocio y de los endpoints.
- Las **funciones de negocio** (filtrado, sumarización, detección de alertas) deben ser funciones puras sin efectos secundarios.
- Los **endpoints FastAPI** se declaran después de modelos y funciones.
- ❌ No mezclar modelos, lógica y endpoints en un solo archivo gigante (`routes.py`). Si el archivo supera 250 líneas, refactorizar en módulos separados (`models.py`, `services.py`, `router.py`).

### A2. Estructura de carpetas del frontend
| Carpeta | Contenido |
|---|---|
| `src/components/dashboard/` | Componentes específicos del dominio financiero (KPI, charts, header) |
| `src/components/ui/` | Componentes genéricos reutilizables (Card, Skeleton) |
| `src/lib/` | Utilidades, tipos compartidos, datos mock, funciones helper |

### A3. Responsabilidad única por archivo
- `financial-types.ts` → **solo** tipos e interfaces TypeScript.
- `financial-utils.ts` → **solo** funciones de cómputo y formateo.
- `utils.ts` → **solo** utilidades transversales (como `cn()`).
- Un archivo debe tener una única responsabilidad documentada en su cabecera.

### A4. Estados de componente
Todo componente que muestre datos debe manejar TRES estados:
1. **Loading** → mostrar `Skeleton` mientras se resuelve la promesa.
2. **Error** → mostrar mensaje de error legible al usuario.
3. **Data vacía** → mostrar placeholder "No data available to display".
4. **Éxito** → mostrar datos correctamente formateados.

### A5. Proxy de desarrollo
- Usar el proxy de Vite (`vite.config.ts` → `proxy: { "/api": { target: "http://backend:8000" } }`) para desarrollo local.
- No exponer CORS innecesariamente: `allow_origins=["*"]` solo está permitido si no hay proxy o si es estrictamente necesario.
- En producción, la lista de orígenes CORS debe ser explícita y restringida.

---

## 🏷️ NOMENCLATURA

### N1. Archivos
| Contexto | Formato | Ejemplo |
|---|---|---|
| Componentes React | `kebab-case.tsx` | `kpi-row.tsx`, `income-outcome-chart.tsx` |
| Utilidades/libs | `kebab-case.ts` | `financial-utils.ts`, `mock-data.ts` |
| Tests | `kebab-case.test.ts` | `financial-utils.test.ts` |

### N2. Código
| Contexto | Formato | Ejemplos |
|---|---|---|
| Funciones JS/TS | `camelCase` | `computeKPIs()`, `formatCurrency()`, `fetchFinancialData()` |
| Funciones Python | `snake_case` | `generate_mock_movements()`, `filter_movements_by_date()` |
| Clases/Modelos Pydantic | `PascalCase` | `FinancialMovement`, `MetricsSummaryItem`, `TopCategoryItem` |
| Interfaces/Types TS | `PascalCase` | `KPIMetrics`, `MonthlyDataPoint`, `OperationType` |
| Variables CSS | `kebab-case` | `--chart-income`, `--color-border`, `--income-badge-fg` |

### N3. Parámetros de API
- Parámetros Query en endpoints FastAPI → `snake_case`: `start_date`, `end_date`, `operation_type`, `business_type`, `group_by`.

### N4. Tipos literales estrictos
- Usar `Literal` de Python o TypeScript para valores fijos como `OperationType = Literal["income", "outcome"]`.
- No usar `str` genérico donde un literal sea suficiente.

---

## 💻 CÓDIGO

### C1. Patrón fetch con estados (frontend)
```typescript
// 👎 No hacer:
fetch("/api/metrics").then(setData);

// 👍 Hacer:
useEffect(() => {
  setLoading(true);
  fetch("/api/metrics")
    .then((res) => { if (!res.ok) throw Error(...); return res.json(); })
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

### C2. Variantes con objeto tipado
Para componentes que varían su apariencia según un tipo (ej. `KPICard` con variantes `income`/`outcome`/`profit`/`profitPercent`):
```typescript
const variantStyles: Record<VariantType, { badge: string; icon: string }> = { ... }
```
✅ Esto escala mejor que una cadena de `if/switch`.

### C3. Manejo de clases CSS condicionales
- Usar **siempre** la función `cn()` de `src/lib/utils.ts` (combina `clsx` + `tailwind-merge`).
- Esto evita conflictos entre clases Tailwind y permite composición.

### C4. Atributos `data-slot` para componentes shadcn/ui
- Los componentes UI genéricos (Card, Skeleton) deben incluir atributos `data-slot="..."` semánticos.
- No usar clases como identificadores de propósito.

### C5. Funciones puras en el backend
- Toda función de lógica de negocio debe ser pura: recibir datos como argumento, devolver datos transformados.
- No depender de estado global, variables de módulo ni efectos secundarios.
- Esto hace que las funciones sean directamente testeables.

### C6. Seed fijo para datos deterministas
- `generate_mock_movements(seed=42)` → usar siempre un seed fijo para que tests y desarrollo tengan datos predecibles.
- No usar `date.today()` dentro de funciones con seed fijo, ya que rompe la deterministidad.

### C7. Cachear datos mock en endpoints
- Si los datos mock son siempre los mismos (seed fijo), **cachearlos** con `functools.lru_cache` o variable global perezosa en lugar de regenerarlos en cada request.

### C8. Modo oscuro responsivo
- No hardcodear la clase `dark` en el HTML raíz.
- Leer la preferencia del usuario con `@media (prefers-color-scheme: dark)` o un toggle explícito en la UI.

---

## 🧪 TESTING

### T1. Frameworks
| Capa | Framework | Herramienta |
|---|---|---|
| Backend | pytest + `TestClient` (httpx) | `backend/tests/test_routes.py` |
| Frontend | Vitest | `frontend/src/lib/financial-utils.test.ts` |

### T2. Nombres descriptivos
- Los nombres de tests deben leerse como especificaciones: `test_metrics_endpoint_respects_date_filters`, `test_b2b_endpoint_only_returns_b2b_records`.
- Usar el patrón `test_<componente>_<condición>_<resultado_esperado>`.

### T3. Casos obligatorios por función
Toda función de lógica de negocio debe tener al menos:
1. **Caso feliz** — datos normales producen resultado esperado.
2. **Caso borde** — valores extremos (array vacío, valores cero, fechas límite).
3. **Caso de error** — división por cero, datos ausentes, valores negativos.

### T4. Datos de test
- Los datos de ejemplo deben ser **inline** y autocontenidos dentro del test o `describe`.
- No depender de datos generados por `generate_mock_movements()` para tests unitarios de funciones puras.
- Si un test usa fechas fijas (ej. `"2025-03-01"`), asegurarse de que serán válidas durante todo el ciclo de vida del proyecto. Preferir fechas relativas o un año fijo documentado.

### T5. Tests de endpoints
- Usar `TestClient` de FastAPI (httpx) para tests de integración.
- Probar al menos: status code, forma del payload, y una aserción semántica sobre los datos.

---

## 📝 DOCUMENTACIÓN

### D1. README
- Mantener README.md y README.es.md sincronizados.
- Incluir: propósito, tecnologías, cómo ejecutar (Docker y local), URL de servicios, documentación API.

### D2. Archivos de agente
- Todo agente debe leer `AGENTS.md` al inicio de su ejecución.
- Las reglas van en `./.agents/rules/<nombre>.md`.
- Los skills van en `./.agents/skills/<skill-name>/SKILL.md`.
- El memory bank del proyecto va en `./memory-bank/`.

### D3. Documentación de API
- La API expone Swagger automáticamente en `http://localhost:8000/docs`.
- Documentar endpoints con `response_model` y type hints en FastAPI.

### D4. `.env.example`
- Si el código usa variables de entorno (`import.meta.env.*`, `os.environ`), debe existir un archivo `.env.example` en la raíz del módulo correspondiente con todas las variables documentadas y un valor por defecto.

---

## ⚡ DX (EXPERIENCIA DE DESARROLLO)

### DX1. Comandos principales
| Comando | Descripción |
|---|---|
| `docker compose up --build` | Iniciar todo el proyecto |
| `npm run dev` | Iniciar frontend (puerto 5173) |
| `uvicorn app.main:app --reload` | Iniciar backend (puerto 8000) |
| `npm test` o `npm run test` | Tests Vitest del frontend |
| `pytest` | Tests del backend |

### DX2. Hot-reload
- Docker Compose monta volúmenes `./frontend:/app` y `./backend:/app`.
- Los cambios en código fuente se reflejan inmediatamente sin rebuild.
- No ejecutar `docker compose build` a menos que cambien dependencias (`requirements.txt`, `package.json`).

### DX3. Depuración remota
- El backend expone `debugpy` en el puerto `5678`.
- Configurar el debugger de VS Code para attach a `localhost:5678`.
- No eliminar `debugpy` de `requirements.txt`.

### DX4. Dependencias no utilizadas
- No declarar dependencias que no se importen en ningún archivo del proyecto.
- Antes de añadir una dependencia, verificar que no exista ya una que cubra la misma necesidad.
- Revisar periódicamente con herramientas como `depcheck` o `pip-check` para detectar dependencias huérfanas.

---

## 🔒 SEGURIDAD

### S1. CORS
- En producción: **nunca** usar `allow_origins=["*"]`. Especificar el dominio exacto del frontend.
- En desarrollo: usar el Vite Proxy para evitar exponer CORS innecesariamente.

### S2. Variables de entorno
- No hardcodear URL de backend, API keys, tokens o secretos.
- Usar `import.meta.env.*` en frontend y variables de entorno en backend.

### S3. Validación de entrada
- Todos los parámetros Query deben tener tipo y validación (ej. `Query(ge=0, le=20)` para límites).
- Usar modelos Pydantic para cuerpos de petición.

---

## 🚀 RENDIMIENTO

### R1. Cachear datos mock
- Los datos generados con `seed=42` son siempre idénticos. Aplicar `@functools.lru_cache` a `generate_mock_movements()`.
- Alternativa: mover la generación a un evento `startup` y almacenar en una variable global.

### R2. Bundle frontend
- No importar librerías completas si solo se usa una función/componente.
- Verificar que `class-variance-authority` (u otras dependencias) no estén declaradas si no se usan.
- Usar importaciones específicas: `import { LineChart, Line } from "recharts"` en lugar de `import *`.

---

## ♻️ MANTENIMIENTO

### M1. Fechas y portabilidad temporal
- Los datos mock no deben depender de `date.today()` si se usa un seed fijo.
- Si se necesita la fecha actual para cierta lógica, moverla a un parámetro con valor por defecto sobreescribible en tests.
- Los tests con fechas hardcodeadas deben usar un año que sea válido para el ciclo de vida del proyecto (ej. 2024 si los datos mock son de 2024).

### M2. Dead code
- No mantener archivos que no se importen ni usen en ningún punto del proyecto (ej. `mock-data.ts` que no es referenciado).
- Si un archivo es útil como referencia, moverlo a `docs/` o `examples/` con nota explicativa.

### M3. `sys.path` en tests
- Preferir `pip install -e .` o configurar `PYTHONPATH` en `pyproject.toml`/`pytest.ini` en lugar de modificar `sys.path` en `conftest.py`.
- Si se usa `conftest.py` para path, que sea la ÚNICA fuente de modificación de path en el proyecto.

---

## 📋 VALIDACIÓN DE REGLAS

Cada vez que un agente complete una tarea (modificar archivos, añadir funcionalidad, escribir tests), debe verificar:

- [ ] **A1–A5**: ¿La arquitectura respeta la separación de capas y responsabilidades?
- [ ] **N1–N4**: ¿Los nombres siguen las convenciones del proyecto?
- [ ] **C1–C8**: ¿El código sigue los patrones establecidos (estados, variantes, clases, funciones puras)?
- [ ] **T1–T5**: ¿Hay tests para los casos feliz, borde y error? ¿Los nombres son descriptivos?
- [ ] **D1–D4**: ¿La documentación está actualizada? ¿Hay `.env.example`?
- [ ] **DX1–DX4**: ¿Los comandos de desarrollo funcionan? ¿Hay dependencias huérfanas?
- [ ] **S1–S3**: ¿CORS está correctamente configurado? ¿No hay secretos hardcodeados?
- [ ] **R1–R2**: ¿Los datos mock están cacheados? ¿El bundle está limpio?
- [ ] **M1–M3**: ¿Las fechas son portables? ¿No hay dead code?

---

*Reglas generadas a partir del análisis del código fuente del proyecto.*