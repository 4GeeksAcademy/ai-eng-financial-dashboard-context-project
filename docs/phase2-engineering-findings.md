# Fase 2 — Hallazgos de ingeniería

## Alcance y clasificación

- ✅ **Hecho verificado:** respaldado por el código, configuración o instrucciones actuales, con referencia a archivo y línea.
- 🧭 **Propuesta de ingeniería:** regla candidata, no convención actualmente establecida.
- ❓ **Pendiente de verificar:** requiere ejecución, evidencia adicional o decisión de producto.

La revisión fue estática. No se ejecutaron servicios ni pruebas. Las prioridades califican el impacto potencial de cada riesgo, no la certeza de que ya haya ocurrido un fallo.

## Convenciones existentes

| Estado | Convención observada (hecho, no recomendación) | Referencias |
|---|---|---|
| ✅ | Las instrucciones de agentes requieren revisar `.agents/rules`, `.agents/skills` y `memory-bank` antes de actuar. En esta revisión no se encontraron archivos en esas ubicaciones; `AGENTS.md` no define otros estándares de código. | [`AGENTS.md:5`](../AGENTS.md#L5), [`AGENTS.md:15`](../AGENTS.md#L15) |
| ✅ | El frontend organiza la pantalla y sus utilidades bajo `src`; el backend separa la aplicación de sus pruebas. Los tests frontend observados prueban utilidades, y los tests backend están en `backend/tests`. | [`App.tsx:2`](../frontend/src/App.tsx#L2), [`financial-utils.test.ts:8`](../frontend/src/lib/financial-utils.test.ts#L8), [`test_routes.py:5`](../backend/tests/test_routes.py#L5) |
| ✅ | TypeScript representa valores de dominio con tipos unión y modelos de datos con interfaces. La configuración también activa `noUnusedLocals` y `noUnusedParameters`, y define el alias `@/*`. | [`financial-types.ts:1`](../frontend/src/lib/financial-types.ts#L1), [`financial-types.ts:5`](../frontend/src/lib/financial-types.ts#L5), [`tsconfig.app.json:13`](../frontend/tsconfig.app.json#L13), [`tsconfig.app.json:22`](../frontend/tsconfig.app.json#L22), [`tsconfig.app.json:23`](../frontend/tsconfig.app.json#L23) |
| ✅ | Los componentes React observados son funciones exportadas con nombre y declaran una interfaz de props. | [`kpi-row.tsx:6`](../frontend/src/components/dashboard/kpi-row.tsx#L6), [`kpi-row.tsx:11`](../frontend/src/components/dashboard/kpi-row.tsx#L11) |
| ✅ | El backend define tipos de dominio con `Literal` y modelos Pydantic; las pruebas observadas usan `TestClient`, funciones `test_...` y aserciones de respuestas. | [`routes.py:11`](../backend/app/routes.py#L11), [`routes.py:22`](../backend/app/routes.py#L22), [`test_routes.py:9`](../backend/tests/test_routes.py#L9), [`test_routes.py:29`](../backend/tests/test_routes.py#L29) |

## Riesgos y reglas candidatas

Las reglas de la columna «Regla candidata» son propuestas nuevas; no se presentan como prácticas vigentes del repositorio.

| Estado / prioridad | Hecho verificado y riesgo concreto | Regla candidata para prevenirlo |
|---|---|---|
| ✅ **Alta** — la etiqueta temporal es visible en el dashboard y puede presentar como 2024 un periodo distinto. | La UI fija `2024 - Full Year` ([`App.tsx:49`](../frontend/src/App.tsx#L49)). El backend calcula el año por mes usando `date.today()` ([`routes.py:65`](../backend/app/routes.py#L65), [`routes.py:66`](../backend/app/routes.py#L66), [`routes.py:68`](../backend/app/routes.py#L68)), construye fechas con esa regla ([`routes.py:75`](../backend/app/routes.py#L75)) y recorre los 12 meses ([`routes.py:97`](../backend/app/routes.py#L97), [`routes.py:99`](../backend/app/routes.py#L99)). A fecha 2026-11-14, el generador produce fechas de noviembre de 2025 a octubre de 2026. El test llamado “full year” solo comprueba 360 movimientos y orden cronológico ([`test_routes.py:12`](../backend/tests/test_routes.py#L12), [`test_routes.py:15`](../backend/tests/test_routes.py#L15), [`test_routes.py:16`](../backend/tests/test_routes.py#L16)); no detecta la diferencia con el título. | **🧭 Propuesta:** derivar etiqueta e intervalo desde una única definición del periodo; añadir pruebas de los límites temporales y de que el título corresponde a los datos. |
| ✅ **Media** — el contrato frontend/backend puede divergir y TypeScript no valida en runtime el JSON recibido. | Hay dominios duplicados en TypeScript ([`financial-types.ts:1`](../frontend/src/lib/financial-types.ts#L1), [`financial-types.ts:5`](../frontend/src/lib/financial-types.ts#L5)) y Python/Pydantic ([`routes.py:11`](../backend/app/routes.py#L11), [`routes.py:22`](../backend/app/routes.py#L22)); `fetchFinancialData` devuelve directamente `response.json()` ([`App.tsx:15`](../frontend/src/App.tsx#L15), [`App.tsx:20`](../frontend/src/App.tsx#L20)). | **🧭 Propuesta:** cuando cambie el esquema API, actualizar ambos lados en el mismo cambio y probar compatibilidad de la respuesta con el modelo que consume el frontend. |
| ✅ **Media** — el generador altera el estado aleatorio global, lo que puede afectar otros usos de `random` y dificultar el aislamiento de llamadas. El efecto bajo concurrencia no se midió. | El módulo importa `random` ([`routes.py:3`](../backend/app/routes.py#L3)) y `generate_mock_movements` invoca `random.seed(seed)` antes de generar datos ([`routes.py:94`](../backend/app/routes.py#L94), [`routes.py:96`](../backend/app/routes.py#L96)). | **🧭 Propuesta:** usar una instancia local de `random.Random` por generación; probar reproducibilidad con semilla y que la generación no dependa del estado aleatorio global. |
| ✅ **Media** — los endpoints B2B y B2C duplican la selección y filtrado; las pruebas cubren filtros combinados para B2B, pero no la prueba espejo para B2C. Un cambio desigual podría dejar comportamientos distintos. | Las implementaciones están en [`routes.py:363`](../backend/app/routes.py#L363) y [`routes.py:379`](../backend/app/routes.py#L379), con selecciones separadas en [`routes.py:370`](../backend/app/routes.py#L370) y [`routes.py:386`](../backend/app/routes.py#L386); los tests básicos están en [`test_routes.py:52`](../backend/tests/test_routes.py#L52) y [`test_routes.py:62`](../backend/tests/test_routes.py#L62). El test de filtros combinados existente es B2B ([`test_routes.py:90`](../backend/tests/test_routes.py#L90), [`test_routes.py:99`](../backend/tests/test_routes.py#L99)). | **🧭 Propuesta:** mantener la lógica de filtros común o exigir pruebas equivalentes para ambos endpoints al cambiar sus filtros o resultados. |
| ✅ **Baja** — las instrucciones remiten a carpetas de reglas, skills y memoria que no tienen archivos en la revisión actual; un agente podría inventar estándares que el proyecto no documenta. | `AGENTS.md` pide revisar esas ubicaciones antes de actuar ([`AGENTS.md:5`](../AGENTS.md#L5), [`AGENTS.md:8`](../AGENTS.md#L8), [`AGENTS.md:11`](../AGENTS.md#L11), [`AGENTS.md:15`](../AGENTS.md#L15)); la búsqueda del repositorio no encontró archivos bajo esas carpetas. | **🧭 Propuesta:** verificar si hay instrucciones adicionales; si no las hay, basarse en `AGENTS.md`, la configuración y patrones observados, sin atribuir convenciones inexistentes al proyecto. |

## Pendiente de verificar

- ❓ No se consultó la API en ejecución en esta fase. La discrepancia temporal está comprobada en el flujo de código: el título está fijo y el backend calcula las fechas en función de la fecha del servidor. La respuesta efectiva de una instancia en ejecución no se volvió a medir.
- ❓ No se ejecutaron pruebas para medir efectos de concurrencia del estado aleatorio ni para validar el comportamiento visual del título. Las prioridades y las reglas propuestas son recomendaciones de ingeniería, no resultados experimentales.
- ❓ No se determinó cuál periodo es el deseado por producto: 2024 fijo o el intervalo dinámico actual.

## Recomendación para la Fase 3

Se recomienda implementar como reglas de agente y probar, en este orden:

1. **Periodo coherente:** una sola fuente para etiqueta e intervalo; pruebas de periodo y límites de fecha. Prioridad alta.
2. **Contrato API sincronizado:** actualizar tipos frontend y modelos backend juntos; añadir prueba de compatibilidad. Prioridad media.
3. **Paridad B2B/B2C:** centralizar filtros o cubrir los dos endpoints con pruebas equivalentes. Prioridad media.
4. **Aleatoriedad aislada:** evitar semilla global y probar determinismo sin efectos sobre el estado compartido. Prioridad media.
5. **Uso de contexto disponible:** comprobar las rutas indicadas por `AGENTS.md` y no inventar reglas ausentes. Prioridad baja.

Estas son recomendaciones para una fase posterior. En esta entrega no se crean `.agents/rules` ni `memory-bank`, y no se modifica código funcional.
