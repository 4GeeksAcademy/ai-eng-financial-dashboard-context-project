# Hallazgos de ingeniería y reglas propuestas

Fase 2. Cada hallazgo cita archivos o comportamientos concretos; los que no se pudieron ligar a un archivo se descartan al final. Los que dicen «ejecutado» se comprobaron corriendo el código real (ver `verification.md`). Tipo: **C** = convención ya existente que conviene mantener, **R** = patrón arriesgado para futuros cambios.

## 1. Arquitectura

| Id | Tipo | Hallazgo y evidencia |
|---|---|---|
| F1 | C | Todo el backend vive en un módulo de 391 líneas, `backend/app/routes.py`: modelos pydantic con tipos `Literal` (`:11-14`, `:21-62`) y endpoints que delegan en funciones puras (`filter_movements`, `summarize_movements`, `build_top_categories`, `detect_outcome_alerts`). Todos los endpoints declaran `response_model` (`:248-378`). |
| F2 | R | El filtro por `business_type` está copiado en 4 endpoints (`routes.py:278,296,312,351`) y `/b2b` y `/b2c` repiten el mismo código (`:362-391`); `filter_movements` (`:125`) no tiene ese parámetro. Un endpoint nuevo tendería a pegar una quinta copia. |
| F3 | R | Cada endpoint regenera los datos con `generate_mock_movements(seed=42)` (8 llamadas: `routes.py:255,264,277,295,311,350,370,386`) y esa función reinicia el generador aleatorio global (`:96`; ejecutado: altera `random`). No hay una capa de datos aislada. |
| F4 | R | Las fechas de los datos dependen de hoy (`routes.py:65-68,97`): ejecutado, hoy 2026-10-09 → 2025-10-02 a 2026-09-28. Cualquier test o texto con una fecha fija se desfasa. |
| F5 | R | `build_metrics_facets` falla con una lista vacía (`routes.py:156`, `ordered[0]`; ejecutado: `IndexError`). |
| F6 | C | Frontend en 3 capas: lógica pura en `src/lib/` (`financial-utils.ts`, `financial-types.ts`), componentes de negocio en `src/components/dashboard/` y primitivas shadcn en `src/components/ui/`. El alias `@/` apunta a `src` (`vite.config.ts:19-20`, `tsconfig.app.json` `paths`). |
| F7 | R | La agregación mensual existe dos veces: `/api/metrics/summary` en el backend y `computeMonthlyData` en `frontend/src/lib/financial-utils.ts`. El frontend solo llama a `/api/metrics` (`App.tsx:16`) y agrega en el navegador. |

## 2. Nombres, estilo y tipos

| Id | Tipo | Hallazgo y evidencia |
|---|---|---|
| F8 | C | El JSON de la API es `snake_case` (`routes.py:22-27`: `create_date`, `operation_type`, `business_type`) y su espejo TypeScript `FinancialMovement` también (`financial-types.ts:6-10`). Los tipos derivados en el cliente son `camelCase` (`totalIncome`, `profitPercent`, `financial-types.ts:14-17`). |
| F9 | C | Archivos del frontend en `kebab-case` (`kpi-card.tsx`, `income-outcome-chart.tsx`); componentes exportados en `PascalCase` con su `interface XProps` encima. |
| F10 | R | No hay `.prettierrc` ni `.editorconfig`, y conviven dos estilos: `App.tsx` y `financial-utils.ts` usan comillas dobles y punto y coma; `kpi-card.tsx`, `card.tsx` y `financial-types.ts` usan comillas simples y sin punto y coma (medido). Reformatear en bloque ensuciaría los diffs. |
| F11 | C | `tsconfig.app.json:16,22-24` activa `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals` y `noUnusedParameters`. El código ya importa tipos con `import { type X }` (p. ej. `kpi-row.tsx:2`). |
| F12 | C | Estilos con Tailwind 4 y variables CSS de `src/index.css` (`--chart-income`, `--income-badge`…); los componentes usan `var(--…)` (p. ej. `income-outcome-chart.tsx:104`) y `cn()` de `@/lib/utils`. shadcn configurado como `new-york`/`zinc` (`components.json`). |
| F13 | R | Textos inconsistentes: la UI está en inglés pero el error de `App.tsx:37` está en español y sin tilde; el periodo es `2024 - Full Year` en `App.tsx:49` y `2024 — Full Year` en `dashboard-header.tsx:7`. |
| F14 | R | `financial-utils.ts:42` hace `new Date("YYYY-MM-DD")` (UTC) y lee el mes en hora local (`:8`). Ejecutado: en `America/Bogota` y `America/New_York` 16 de 360 movimientos (día 1) caen en el mes anterior (Oct 2025: 112 375,23 en vez de 106 909,67). |
| F15 | R | La cabecera `2024 - Full Year` (`App.tsx:49`) no corresponde a los datos, que son una ventana móvil de 12 meses (F4). |

## 3. Pruebas

| Id | Tipo | Hallazgo y evidencia |
|---|---|---|
| F16 | C | Backend: `backend/tests/test_routes.py` con `TestClient(app)` compartido (`:9`); `conftest.py:5-7` añade la raíz de `backend/` a `sys.path`, así que `pytest` se lanza desde `backend/`. El test `test_metrics_endpoint_respects_date_filters` toma la fecha de una primera respuesta (`:39`) en vez de fijarla: es el patrón robusto. |
| F17 | R | `test_metrics_comparison_returns_delta_fields` usa 2025-03-01 a 2025-03-31 (`test_routes.py:160`) y solo comprueba claves. Ejecutado: hoy hay 0 movimientos ese mes, así que pasa sin probar nada. |
| F18 | R | Los tests de frontend (5, `financial-utils.test.ts`) solo cubren `src/lib`. `package.json` no tiene `jsdom` ni `@testing-library` y `vite.config.ts` no define bloque `test`, así que no hay entorno para probar componentes. |
| F19 | R | El fallo horario de F14 no tiene test: el test mensual usa fechas a mitad de mes (`financial-utils.test.ts:67,74,81`). |

## 4. Documentación

| Id | Tipo | Hallazgo y evidencia |
|---|---|---|
| F20 | R | `AGENTS.md` remite a `.agents/rules`, `.agents/skills` y `memory-bank`, que no existían al recibir el repo. |
| F21 | R | `README.md:46` y `README.es.md:46` dicen «copia `frontend/.env.example` a `.env`» sin indicar la ruta; y hay dos READMEs con el mismo contenido que deben editarse a la vez. |

## 5. Entorno, Docker y configuración

| Id | Tipo | Hallazgo y evidencia |
|---|---|---|
| F22 | R | `debugpy` escucha en `0.0.0.0:5678` y el puerto se publica (`backend/Dockerfile:12`, `docker-compose.yml:20`) junto con `--reload`. Es una configuración solo para desarrollo y no hay variante de producción. |
| F23 | R | CORS abierto a cualquier origen con credenciales (`backend/app/main.py:9-10`). |
| F24 | R | Dependencias de Python sin versión (`requirements.txt`) y `npm install` en la imagen (`frontend/Dockerfile:6`) aunque existe `frontend/package-lock.json`: las imágenes no son reproducibles. |
| F25 | C | Compose monta el código como volumen (`docker-compose.yml:8-10`), así que los cambios de código se recargan solos; pero las dependencias se instalan al construir la imagen, por lo que un cambio en `requirements.txt` o `package.json` exige `docker compose up --build`. |
| F26 | R | `depends_on` (`docker-compose.yml:11`) solo ordena el arranque y no hay healthcheck, aunque existe `/health` (`routes.py:243`). |

## Reglas propuestas (cada una cita hallazgos)

| Regla (archivo en `.agents/rules/`) | Qué fija | Hallazgos |
|---|---|---|
| `backend-api.md` | Nuevos endpoints: `response_model`, `Query`, `snake_case`, redondeo a 2 decimales, un único filtro de `business_type` reutilizable. | F1, F2, F8 |
| `backend-data.md` | Los datos solo salen de `generate_mock_movements`; no depender de fechas concretas; contemplar listas vacías. | F3, F4, F5 |
| `backend-tests.md` | `pytest` desde `backend/`; fechas derivadas de una respuesta, no fijas; cada endpoint nuevo con su test. | F16, F17 |
| `frontend-code.md` | Capas, alias `@/`, `kebab-case`, `import { type … }`, variables CSS, imitar el estilo del archivo que se edita. | F6, F9, F10, F11, F12, F13 |
| `frontend-dates.md` | Fechas ISO sin `new Date("YYYY-MM-DD")` + getters locales; no escribir años fijos en la UI; no crear una tercera agregación. | F7, F14, F15 |
| `frontend-tests.md` | `vitest` solo para `src/lib`; añadir un caso de día 1 al tocar fechas; no introducir pruebas de componentes sin acordar antes las dependencias. | F18, F19 |
| `docker-env.md` | Cómo arrancar, puertos, cuándo reconstruir, y qué no copiar a producción. | F22, F23, F24, F25, F26 |
| `docs-and-commits.md` | Editar los dos READMEs juntos, citar archivos en las afirmaciones y un commit por tarea con su verificación. | F20, F21 |

## Hallazgos descartados

- «Mejorar la calidad del código» o «añadir más tests»: frases vagas, sin archivo ni comportamiento concreto.
- «TypeScript está sin modo estricto»: `tsconfig.app.json` no declara `strict`, pero no se pudo comprobar qué valor por defecto aplica la versión instalada (`typescript ~6.0.2`) porque no se pudo ejecutar `tsc`. Queda como ❓.
- «El frontend no maneja errores»: falso, `App.tsx:35-39` muestra un mensaje si falla la petición.
